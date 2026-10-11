BEGIN;
ALTER TABLE public.billing_orders ADD COLUMN subscription_status text
 CHECK(subscription_status IN('ACTIVE','INACTIVE','EXPIRED','DELETED'));
CREATE FUNCTION public.process_asaas_subscription(p_environment text,p_event_id text,p_event text,p_subscription_id text,p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE o public.billing_orders; BEGIN
 IF p_environment NOT IN('sandbox','production') OR p_status NOT IN('ACTIVE','INACTIVE','EXPIRED','DELETED') OR p_event NOT IN('SUBSCRIPTION_CREATED','SUBSCRIPTION_UPDATED','SUBSCRIPTION_INACTIVATED','SUBSCRIPTION_DELETED') THEN RAISE EXCEPTION 'Assinatura inválida'; END IF;
 SELECT * INTO o FROM public.billing_orders WHERE environment=p_environment AND subscription_id=p_subscription_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Assinatura não associada'; END IF;
 INSERT INTO private.billing_notifications(environment,event_id,event,order_id) VALUES(p_environment,p_event_id,p_event,o.id) ON CONFLICT DO NOTHING;
 IF NOT FOUND THEN RETURN; END IF;
 -- Exclusão é definitiva; notificações atrasadas não reativam a recorrência.
 UPDATE public.billing_orders SET subscription_status=p_status,updated_at=now()
 WHERE id=o.id AND subscription_status IS DISTINCT FROM 'DELETED';
 -- Cancelar recorrência preserva o período já pago; acesso expira pela renewal_date.
 -- Sandbox nunca modifica planos ou permissões das clínicas.
END $$;
REVOKE ALL ON FUNCTION public.process_asaas_subscription(text,text,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.process_asaas_subscription(text,text,text,text,text) TO service_role;
INSERT INTO private.schema_migrations(version) VALUES('202610110011_subscription_lifecycle');
COMMIT;
