BEGIN;
ALTER TABLE public.billing_orders DROP CONSTRAINT billing_orders_environment_check;
ALTER TABLE public.billing_orders ADD CONSTRAINT billing_orders_environment_check CHECK(environment IN('sandbox','production'));
ALTER TABLE public.billing_orders ADD COLUMN subscription_id text;
CREATE UNIQUE INDEX billing_subscription_unique ON public.billing_orders(environment,subscription_id) WHERE subscription_id IS NOT NULL;
CREATE FUNCTION public.reserve_production_checkout(p_tenant_id uuid,p_plan_id text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE amount numeric; order_id uuid; BEGIN
 amount:=CASE p_plan_id WHEN 'essencial' THEN 97 WHEN 'crescer' THEN 197 WHEN 'profissional' THEN 297 ELSE NULL END;
 IF amount IS NULL THEN RAISE EXCEPTION 'Plano inválido'; END IF;
 PERFORM 1 FROM public.tenants WHERE id=p_tenant_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Clínica inválida'; END IF;
 IF EXISTS(SELECT 1 FROM public.billing_orders WHERE tenant_id=p_tenant_id AND environment='production' AND (status IN('creating','active','unknown') OR subscription_id IS NOT NULL)) THEN RAISE EXCEPTION 'Checkout ou assinatura existente; conferir no Asaas'; END IF;
 INSERT INTO public.billing_orders(tenant_id,plan_id,amount,environment) VALUES(p_tenant_id,p_plan_id,amount,'production') RETURNING id INTO order_id;
 RETURN order_id;
END $$;
REVOKE ALL ON FUNCTION public.reserve_production_checkout(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_production_checkout(uuid,text) TO service_role;
CREATE TABLE public.billing_payments(
 environment text NOT NULL CHECK(environment IN('sandbox','production')),
 payment_id text NOT NULL,order_id uuid NOT NULL REFERENCES public.billing_orders(id),
 tenant_id uuid NOT NULL REFERENCES public.tenants(id),subscription_id text,
 amount numeric(12,2) NOT NULL CHECK(amount>0),status text NOT NULL,
 due_date date NOT NULL,paid_until date,updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(environment,payment_id)
);
ALTER TABLE public.billing_payments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.billing_payments FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.billing_payments TO authenticated;
GRANT ALL ON public.billing_payments TO service_role;
CREATE POLICY billing_payment_read ON public.billing_payments FOR SELECT TO authenticated USING(private.has_tenant_access(tenant_id,false,true));
CREATE TABLE private.billing_notifications(
 environment text NOT NULL,event_id text NOT NULL,event text NOT NULL,
 order_id uuid REFERENCES public.billing_orders(id),created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(environment,event_id)
);
ALTER TABLE private.billing_notifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.billing_notifications FROM PUBLIC,anon,authenticated;
GRANT ALL ON private.billing_notifications TO service_role;
CREATE FUNCTION public.process_asaas_payment(p_environment text,p_event_id text,p_event text,p_order_id uuid,p_payment_id text,p_subscription_id text,p_amount numeric,p_status text,p_due_date date)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE o public.billing_orders; expires date; paid_order public.billing_orders; BEGIN
 SELECT * INTO o FROM public.billing_orders WHERE id=p_order_id AND environment=p_environment FOR UPDATE;
 IF NOT FOUND OR p_amount<>o.amount OR length(p_payment_id) NOT BETWEEN 1 AND 200 OR p_due_date IS NULL THEN RAISE EXCEPTION 'Pagamento inconsistente'; END IF;
 -- Serializa também ordens diferentes da mesma clínica.
 PERFORM 1 FROM public.tenants WHERE id=o.tenant_id FOR UPDATE;
 IF o.subscription_id IS NOT NULL AND o.subscription_id IS DISTINCT FROM p_subscription_id THEN RAISE EXCEPTION 'Assinatura inconsistente'; END IF;
 IF EXISTS(SELECT 1 FROM public.billing_payments WHERE environment=p_environment AND payment_id=p_payment_id AND order_id<>o.id) THEN RAISE EXCEPTION 'Pagamento já associado'; END IF;
 -- Estorno total é irreversível. Uma confirmação concorrente/atrasada não pode reativá-lo.
 IF p_status IN('CONFIRMED','RECEIVED') AND EXISTS(SELECT 1 FROM public.billing_payments WHERE environment=p_environment AND payment_id=p_payment_id AND status='REFUNDED') THEN RETURN; END IF;
 INSERT INTO private.billing_notifications(environment,event_id,event,order_id) VALUES(p_environment,p_event_id,p_event,o.id) ON CONFLICT DO NOTHING;
 IF NOT FOUND THEN RETURN; END IF;
 UPDATE public.billing_orders SET subscription_id=COALESCE(subscription_id,p_subscription_id),updated_at=now() WHERE id=o.id;
 INSERT INTO public.billing_payments(environment,payment_id,order_id,tenant_id,subscription_id,amount,status,due_date,paid_until)
 VALUES(p_environment,p_payment_id,o.id,o.tenant_id,p_subscription_id,p_amount,p_status,p_due_date,
 CASE WHEN p_status IN('CONFIRMED','RECEIVED') THEN (p_due_date+interval '1 month')::date ELSE NULL END)
 ON CONFLICT(environment,payment_id) DO UPDATE SET status=EXCLUDED.status,paid_until=EXCLUDED.paid_until,updated_at=now();
 IF p_status IN('CONFIRMED','RECEIVED') THEN UPDATE public.billing_orders SET status='paid' WHERE id=o.id; END IF;
 IF p_environment='production' THEN
  SELECT max(paid_until) INTO expires FROM public.billing_payments WHERE tenant_id=o.tenant_id AND environment='production';
  -- Suspensão manual prevalece; estorno de um mês antigo não remove meses posteriores pagos.
  IF expires IS NOT NULL THEN
   SELECT bo.* INTO paid_order FROM public.billing_orders bo JOIN public.billing_payments bp ON bp.order_id=bo.id
   WHERE bp.tenant_id=o.tenant_id AND bp.environment='production' AND bp.paid_until=expires ORDER BY bp.updated_at DESC LIMIT 1;
   UPDATE public.tenants SET status='active',renewal_date=expires,price=paid_order.amount,
   plan=CASE paid_order.plan_id WHEN 'essencial' THEN 'Bronze' WHEN 'crescer' THEN 'Silver' ELSE 'Gold' END
   WHERE id=o.tenant_id AND status<>'suspended';
  ELSE
   UPDATE public.tenants SET status='canceled' WHERE id=o.tenant_id AND status='active';
  END IF;
 END IF;
END $$;
REVOKE ALL ON FUNCTION public.process_asaas_payment(text,text,text,uuid,text,text,numeric,text,date) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.process_asaas_payment(text,text,text,uuid,text,text,numeric,text,date) TO service_role;
CREATE FUNCTION public.process_asaas_checkout(p_environment text,p_event_id text,p_checkout_id text,p_event text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE o public.billing_orders; BEGIN
 IF p_event NOT IN('CHECKOUT_PAID','CHECKOUT_CANCELED','CHECKOUT_EXPIRED') THEN RAISE EXCEPTION 'Evento inválido'; END IF;
 SELECT * INTO o FROM public.billing_orders WHERE checkout_id=p_checkout_id AND environment=p_environment FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Checkout não associado'; END IF;
 INSERT INTO private.billing_notifications(environment,event_id,event,order_id) VALUES(p_environment,p_event_id,p_event,o.id) ON CONFLICT DO NOTHING;
 IF NOT FOUND THEN RETURN; END IF;
 UPDATE public.billing_orders SET status=CASE p_event WHEN 'CHECKOUT_PAID' THEN 'paid' WHEN 'CHECKOUT_CANCELED' THEN 'canceled' ELSE 'expired' END,updated_at=now() WHERE id=o.id AND status<>'paid';
 -- Acesso depende de cobrança reconciliada; CHECKOUT_PAID sozinho não concede acesso.
END $$;
REVOKE ALL ON FUNCTION public.process_asaas_checkout(text,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.process_asaas_checkout(text,text,text,text) TO service_role;
CREATE FUNCTION public.record_unmatched_asaas_event(p_environment text,p_event_id text,p_event text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$
 INSERT INTO private.billing_notifications(environment,event_id,event) VALUES(p_environment,p_event_id,p_event) ON CONFLICT DO NOTHING;
$$;
REVOKE ALL ON FUNCTION public.record_unmatched_asaas_event(text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_unmatched_asaas_event(text,text,text) TO service_role;
CREATE OR REPLACE FUNCTION private.has_tenant_access(p_tenant uuid,p_write boolean DEFAULT false,p_admin boolean DEFAULT false)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT private.is_platform_admin() OR EXISTS(
  SELECT 1 FROM public.tenant_memberships m JOIN public.tenants t ON t.id=m.tenant_id
  WHERE m.tenant_id=p_tenant AND m.user_id=(SELECT auth.uid()) AND m.active
   AND (NOT p_admin OR m.role IN('owner','admin'))
   AND (NOT p_write OR (m.role IN('owner','admin','staff') AND
    ((t.status='trial' AND t.renewal_date>=current_date) OR
     (t.status='active' AND (NOT EXISTS(SELECT 1 FROM public.billing_payments b WHERE b.tenant_id=t.id AND b.environment='production') OR t.renewal_date>current_date)))))
 );
$$;
INSERT INTO private.schema_migrations(version) VALUES('202610100010_billing_production');
COMMIT;
