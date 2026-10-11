-- Additive protections: no records are deleted on downgrade.
BEGIN;
CREATE FUNCTION private.has_plan_feature(p_tenant uuid,p_feature text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM public.tenants t WHERE t.id=p_tenant AND
  CASE WHEN p_feature IN('recovery','tutorPortal','careStages','recoveryMetrics','crm','connections') THEN
   (t.status='trial' AND t.renewal_date>=current_date) OR
   (CASE t.plan WHEN 'Gold' THEN 3 WHEN 'Silver' THEN 2 WHEN 'Bronze' THEN 1 ELSE 0 END >=
    CASE WHEN p_feature IN('crm','connections','recoveryMetrics') THEN 3 ELSE 2 END)
  ELSE false END);
$$;
REVOKE ALL ON FUNCTION private.has_plan_feature(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION private.has_plan_feature(uuid,text) TO authenticated,service_role;
DO $$ DECLARE tbl text; feature text; BEGIN
 FOR tbl,feature IN SELECT * FROM (VALUES
  ('appointment_waitlist','recovery'),('appointment_requests','tutorPortal'),
  ('crm_conversations','crm'),('crm_messages','crm'),('integration_connections','connections')) AS v(tbl,feature)
 LOOP
  -- Restrictive policies intersect existing membership/role policies.
  EXECUTE format('CREATE POLICY plan_feature ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING(private.has_plan_feature(tenant_id,%L)) WITH CHECK(private.has_plan_feature(tenant_id,%L))',tbl,feature,feature);
 END LOOP;
END $$;
CREATE FUNCTION private.guard_plan_fields() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF TG_TABLE_NAME='appointments' THEN
  IF (TG_OP='INSERT' AND NEW.care_stage<>'scheduled') OR
     (TG_OP='UPDATE' AND NEW.care_stage IS DISTINCT FROM OLD.care_stage) THEN
   IF NOT private.has_plan_feature(NEW.tenant_id,'careStages') THEN RAISE EXCEPTION 'Etapas do atendimento exigem plano Crescer' USING ERRCODE='42501'; END IF;
  END IF;
 ELSIF TG_TABLE_NAME='tutors' THEN
  IF (TG_OP='INSERT' AND NEW.crm_stage<>'lead') OR
     (TG_OP='UPDATE' AND NEW.crm_stage IS DISTINCT FROM OLD.crm_stage) THEN
   IF NOT private.has_plan_feature(NEW.tenant_id,'crm') THEN RAISE EXCEPTION 'CRM exige plano Profissional' USING ERRCODE='42501'; END IF;
  END IF;
 ELSE
  IF NOT private.has_plan_feature(NEW.tenant_id,'tutorPortal') THEN RAISE EXCEPTION 'Portal do tutor exige plano Crescer' USING ERRCODE='42501'; END IF;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.guard_plan_fields() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER guard_plan_fields BEFORE INSERT OR UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION private.guard_plan_fields();
CREATE TRIGGER guard_plan_fields BEFORE INSERT OR UPDATE ON public.tutors FOR EACH ROW EXECUTE FUNCTION private.guard_plan_fields();
CREATE TRIGGER guard_plan_fields BEFORE INSERT ON private.appointment_links FOR EACH ROW EXECUTE FUNCTION private.guard_plan_fields();
-- Existing public links must stop working after a downgrade as well.
CREATE OR REPLACE FUNCTION private.valid_appointment_link(p_token text) RETURNS private.appointment_links LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE l private.appointment_links;
BEGIN
 IF p_token IS NULL OR p_token !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'Link inválido ou expirado';END IF;
 SELECT * INTO l FROM private.appointment_links WHERE token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') AND NOT revoked AND expires_at>now() FOR UPDATE;
 IF NOT FOUND OR NOT private.has_plan_feature(l.tenant_id,'tutorPortal') OR NOT EXISTS(SELECT 1 FROM public.tenant_memberships m JOIN public.tenants t ON t.id=m.tenant_id WHERE m.user_id=l.created_by AND m.tenant_id=l.tenant_id AND m.active AND m.role IN('owner','admin','staff') AND (t.status='active' OR(t.status='trial' AND t.renewal_date>=current_date))) THEN RAISE EXCEPTION 'Link inválido ou expirado';END IF;
 RETURN l;
END $$;
INSERT INTO private.schema_migrations(version) VALUES('202610110012_plan_features');
COMMIT;
