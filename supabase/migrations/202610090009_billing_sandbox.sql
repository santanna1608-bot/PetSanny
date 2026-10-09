BEGIN;
CREATE TABLE public.billing_orders(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES public.tenants(id),
 plan_id text NOT NULL CHECK(plan_id IN('essencial','crescer','profissional')),
 amount numeric(12,2) NOT NULL CHECK(amount>0),environment text NOT NULL DEFAULT 'sandbox' CHECK(environment='sandbox'),
 checkout_id text UNIQUE,checkout_link text,
 status text NOT NULL DEFAULT 'creating' CHECK(status IN('creating','active','paid','canceled','expired','failed','unknown')),
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX billing_one_open_order ON public.billing_orders(tenant_id) WHERE status IN('creating','active','unknown');
ALTER TABLE public.billing_orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.billing_orders FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.billing_orders TO authenticated;
GRANT ALL ON public.billing_orders TO service_role;
CREATE POLICY billing_order_read ON public.billing_orders FOR SELECT TO authenticated USING(private.has_tenant_access(tenant_id,false,true));
CREATE TABLE private.billing_events(event_id text PRIMARY KEY,order_id uuid NOT NULL REFERENCES public.billing_orders(id),event text NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE private.billing_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.billing_events FROM PUBLIC,anon,authenticated;
GRANT ALL ON private.billing_events TO service_role;
CREATE FUNCTION public.process_sandbox_checkout_event(p_event_id text,p_checkout_id text,p_event text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE o public.billing_orders;BEGIN
 IF p_event NOT IN('CHECKOUT_PAID','CHECKOUT_CANCELED','CHECKOUT_EXPIRED') THEN RAISE EXCEPTION 'Evento inválido';END IF;
 SELECT * INTO o FROM public.billing_orders WHERE checkout_id=p_checkout_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Checkout ainda não associado';END IF;
 INSERT INTO private.billing_events(event_id,order_id,event) VALUES(p_event_id,o.id,p_event) ON CONFLICT DO NOTHING;
 IF NOT FOUND THEN RETURN;END IF;
 UPDATE public.billing_orders SET status=CASE p_event WHEN 'CHECKOUT_PAID' THEN 'paid' WHEN 'CHECKOUT_CANCELED' THEN 'canceled' ELSE 'expired' END,updated_at=now() WHERE id=o.id AND status<>'paid';
 -- Sandbox não altera acesso, plano, renovação ou dados financeiros reais da clínica.
END $$;
REVOKE ALL ON FUNCTION public.process_sandbox_checkout_event(text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.process_sandbox_checkout_event(text,text,text) TO service_role;
INSERT INTO private.schema_migrations(version) VALUES('202610090009_billing_sandbox');
COMMIT;
