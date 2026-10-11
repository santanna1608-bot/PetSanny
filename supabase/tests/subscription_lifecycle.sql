BEGIN;
DO $$
DECLARE t uuid:=gen_random_uuid(); o uuid; BEGIN
 INSERT INTO public.tenants(id,name,status,renewal_date) VALUES(t,'Teste isolado de assinatura','trial',current_date+14);
 INSERT INTO public.billing_orders(tenant_id,plan_id,amount,environment) VALUES(t,'essencial',97,'sandbox') RETURNING id INTO o;
 PERFORM public.process_asaas_payment('sandbox','sandbox-paid','PAYMENT_RECEIVED',o,'sandbox-payment','sandbox-subscription',97,'RECEIVED',current_date);
 IF NOT EXISTS(SELECT 1 FROM public.tenants WHERE id=t AND status='trial' AND renewal_date=current_date+14) THEN RAISE EXCEPTION 'Sandbox alterou clínica'; END IF;
 PERFORM public.process_asaas_subscription('sandbox','subscription-deleted','SUBSCRIPTION_DELETED','sandbox-subscription','DELETED');
 PERFORM public.process_asaas_subscription('sandbox','subscription-late','SUBSCRIPTION_UPDATED','sandbox-subscription','ACTIVE');
 IF NOT EXISTS(SELECT 1 FROM public.billing_orders WHERE id=o AND subscription_status='DELETED') THEN RAISE EXCEPTION 'Evento atrasado reativou assinatura'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.billing_payments WHERE order_id=o AND paid_until=(current_date+interval '1 month')::date) THEN RAISE EXCEPTION 'Cancelamento removeu período pago'; END IF;
 IF has_function_privilege('authenticated','public.process_asaas_subscription(text,text,text,text,text)','EXECUTE') THEN RAISE EXCEPTION 'Cliente pode alterar assinatura'; END IF;
 PERFORM public.process_asaas_payment('sandbox','sandbox-refund','PAYMENT_REFUNDED',o,'sandbox-payment','sandbox-subscription',97,'REFUNDED',current_date);
 IF NOT EXISTS(SELECT 1 FROM public.billing_payments WHERE order_id=o AND status='REFUNDED' AND paid_until IS NULL) THEN RAISE EXCEPTION 'Estorno não removeu cobertura do pagamento'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.tenants WHERE id=t AND status='trial') THEN RAISE EXCEPTION 'Estorno Sandbox alterou clínica'; END IF;
 INSERT INTO public.billing_orders(tenant_id,plan_id,amount,environment) VALUES(t,'essencial',97,'production') RETURNING id INTO o;
 PERFORM public.process_asaas_payment('production','lifecycle-paid','PAYMENT_RECEIVED',o,'lifecycle-payment','lifecycle-subscription',97,'RECEIVED',current_date);
 PERFORM public.process_asaas_subscription('production','lifecycle-cancel','SUBSCRIPTION_DELETED','lifecycle-subscription','DELETED');
 IF NOT EXISTS(SELECT 1 FROM public.tenants WHERE id=t AND status='active' AND renewal_date=(current_date+interval '1 month')::date) THEN RAISE EXCEPTION 'Cancelamento removeu acesso já pago'; END IF;
 PERFORM public.process_asaas_payment('production','lifecycle-refund','PAYMENT_REFUNDED',o,'lifecycle-payment','lifecycle-subscription',97,'REFUNDED',current_date);
 IF NOT EXISTS(SELECT 1 FROM public.tenants WHERE id=t AND status='canceled') THEN RAISE EXCEPTION 'Estorno total manteve acesso ativo'; END IF;
END $$;
ROLLBACK;
