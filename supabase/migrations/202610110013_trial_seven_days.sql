BEGIN;
ALTER TABLE public.tenants ADD COLUMN trial_duration_days integer NOT NULL DEFAULT 14 CHECK(trial_duration_days IN(7,14)), ADD COLUMN trial_extended_at timestamptz, ADD COLUMN trial_extended_by uuid REFERENCES auth.users(id);
CREATE OR REPLACE FUNCTION public.bootstrap_tenant(p_name text, p_location text DEFAULT '', p_owner_name text DEFAULT '', p_plan text DEFAULT 'Bronze')
RETURNS public.tenants LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE uid uuid := auth.uid(); owner_email text; result public.tenants;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Autenticação necessária' USING ERRCODE = '42501'; END IF;
  SELECT u.email INTO owner_email FROM auth.users u WHERE u.id = uid AND u.email_confirmed_at IS NOT NULL AND NOT coalesce(u.is_anonymous,false);
  IF owner_email IS NULL THEN RAISE EXCEPTION 'Confirme seu e-mail antes de criar a clínica' USING ERRCODE = '42501'; END IF;
  IF p_plan NOT IN ('Bronze','Silver','Gold') OR p_plan IS NULL THEN RAISE EXCEPTION 'Plano inválido' USING ERRCODE = '22023'; END IF;
  IF p_owner_name IS NULL OR length(p_owner_name) > 255 THEN RAISE EXCEPTION 'Nome do responsável inválido' USING ERRCODE = '22023'; END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(uid::text,0));
  IF EXISTS (SELECT 1 FROM public.tenant_memberships WHERE user_id = uid AND role = 'owner') THEN RAISE EXCEPTION 'Usuário já possui uma clínica'; END IF;
  INSERT INTO public.tenants(name,location,owner_name,owner_email,plan,status,price,renewal_date,trial_duration_days)
    VALUES(btrim(p_name),p_location,p_owner_name,owner_email,p_plan,'trial',0,current_date + 7,7) RETURNING * INTO result;
  INSERT INTO public.tenant_memberships(tenant_id,user_id,role) VALUES(result.id,uid,'owner');
  RETURN result;
END $$;
CREATE FUNCTION public.extend_tenant_trial(p_tenant uuid) RETURNS date
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE t public.tenants;
BEGIN
 IF NOT private.is_platform_admin() THEN RAISE EXCEPTION 'Acesso administrativo necessário' USING ERRCODE='42501'; END IF;
 SELECT * INTO t FROM public.tenants WHERE id=p_tenant FOR UPDATE;
 IF NOT FOUND OR t.status<>'trial' OR t.trial_duration_days<>7 OR t.renewal_date IS NULL THEN
  RAISE EXCEPTION 'Somente novos testes de 7 dias podem receber extensão';
 END IF;
 IF t.trial_extended_at IS NOT NULL THEN RETURN t.renewal_date; END IF;
 UPDATE public.tenants SET renewal_date=greatest(current_date,t.renewal_date)+7,
  trial_extended_at=now(),trial_extended_by=auth.uid() WHERE id=t.id RETURNING renewal_date INTO t.renewal_date;
 RETURN t.renewal_date;
END $$;
REVOKE ALL ON FUNCTION public.extend_tenant_trial(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.extend_tenant_trial(uuid) TO authenticated;
INSERT INTO private.schema_migrations(version) VALUES('202610110013_trial_seven_days');
COMMIT;
