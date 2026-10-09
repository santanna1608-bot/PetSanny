BEGIN;
CREATE TABLE public.integration_connections (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
 channel text NOT NULL CHECK(channel IN ('whatsapp','email','calendar','payments')),
 provider text NOT NULL CHECK(provider IN ('meta','gupshup','twilio','360dialog')),
 display_name text NOT NULL CHECK(char_length(display_name) BETWEEN 2 AND 80),
 status text NOT NULL DEFAULT 'not_configured' CHECK(status IN ('not_configured','connected','disconnected','error')),
 last_verified_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,channel),
 CHECK(channel='whatsapp')
);
ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.integration_connections FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.integration_connections TO authenticated;
GRANT INSERT(tenant_id,channel,provider,display_name),UPDATE(provider,display_name) ON public.integration_connections TO authenticated;
GRANT ALL ON public.integration_connections TO service_role;
CREATE POLICY connections_read ON public.integration_connections FOR SELECT TO authenticated USING(private.has_tenant_access(tenant_id,false,true));
CREATE POLICY connections_insert ON public.integration_connections FOR INSERT TO authenticated WITH CHECK(private.has_tenant_access(tenant_id,true,true));
CREATE POLICY connections_update ON public.integration_connections FOR UPDATE TO authenticated USING(private.has_tenant_access(tenant_id,true,true)) WITH CHECK(private.has_tenant_access(tenant_id,true,true) AND status='not_configured');
INSERT INTO private.schema_migrations(version) VALUES('202610090008_connections');
COMMIT;
