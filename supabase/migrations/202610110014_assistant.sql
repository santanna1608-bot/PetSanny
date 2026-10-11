BEGIN;
CREATE TABLE private.assistant_usage (
 tenant_id uuid NOT NULL REFERENCES public.tenants(id), period text NOT NULL,
 used integer NOT NULL DEFAULT 0 CHECK(used>=0), PRIMARY KEY(tenant_id,period)
);
ALTER TABLE private.assistant_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.assistant_usage FROM PUBLIC,anon,authenticated;
CREATE FUNCTION public.reserve_assistant_use(p_tenant uuid,p_user uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE t public.tenants; period_key text; quota integer; consumed integer;
BEGIN
 SELECT * INTO t FROM public.tenants WHERE id=p_tenant FOR UPDATE;
 IF NOT FOUND OR NOT EXISTS(SELECT 1 FROM public.tenant_memberships WHERE tenant_id=p_tenant AND user_id=p_user AND active AND role IN('owner','admin','staff')) THEN
  RETURN jsonb_build_object('allowed',false,'reason','access');
 END IF;
 IF t.status='trial' AND t.renewal_date>=current_date THEN
  quota:=10; period_key:='trial';
 ELSIF t.status='active' AND t.plan='Gold' AND t.renewal_date>=current_date THEN
  quota:=100; period_key:=to_char(current_date,'YYYY-MM');
 ELSE RETURN jsonb_build_object('allowed',false,'reason','plan'); END IF;
 INSERT INTO private.assistant_usage(tenant_id,period,used) VALUES(p_tenant,period_key,1)
 ON CONFLICT(tenant_id,period) DO UPDATE SET used=private.assistant_usage.used+1 WHERE private.assistant_usage.used<quota
 RETURNING used INTO consumed;
 IF consumed IS NULL THEN RETURN jsonb_build_object('allowed',false,'reason','quota'); END IF;
 RETURN jsonb_build_object('allowed',true,'remaining',quota-consumed,'limit',quota);
END $$;
REVOKE ALL ON FUNCTION public.reserve_assistant_use(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_assistant_use(uuid,uuid) TO service_role;
INSERT INTO private.schema_migrations(version) VALUES('202610110014_assistant');
COMMIT;
