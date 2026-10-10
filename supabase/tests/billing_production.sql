-- Executar após 009 e 010. Todas as alterações de teste são revertidas.
BEGIN;
DO $$
DECLARE tenant_a uuid:=gen_random_uuid(); tenant_b uuid:=gen_random_uuid(); order_a uuid; order_b uuid; due date:=current_date; BEGIN
 INSERT INTO public.tenants(id,name,status,plan,price,renewal_date) VALUES(tenant_a,'Teste transacional Asaas A','trial','Gold',0,current_date+14),(tenant_b,'Teste transacional Asaas B','trial','Gold',0,current_date+14);
 order_a:=public.reserve_production_checkout(tenant_a,'essencial');
 order_b:=public.reserve_production_checkout(tenant_b,'crescer');
 PERFORM public.process_asaas_payment('production','test-paid-a','PAYMENT_CONFIRMED',order_a,'test-pay-a','test-sub-a',97,'CONFIRMED',due);
 IF NOT EXISTS(SELECT 1 FROM public.tenants WHERE id=tenant_a AND status='active' AND plan='Bronze' AND price=97 AND renewal_date=(due+interval '1 month')::date) THEN RAISE EXCEPTION 'Ativação incorreta'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.tenants WHERE id=tenant_b AND status='trial') THEN RAISE EXCEPTION 'Misturou clínicas'; END IF;
 -- Duplicação do mesmo evento não reprocessa nem estorna o pagamento.
 PERFORM public.process_asaas_payment('production','test-paid-a','PAYMENT_CONFIRMED',order_a,'test-pay-a','test-sub-a',97,'REFUNDED',due);
 IF NOT EXISTS(SELECT 1 FROM public.billing_payments WHERE payment_id='test-pay-a' AND status='CONFIRMED') THEN RAISE EXCEPTION 'Falha na idempotência'; END IF;
 -- Segundo mês pago, seguido do estorno do primeiro mês.
 PERFORM public.process_asaas_payment('production','test-paid-a2','PAYMENT_RECEIVED',order_a,'test-pay-a2','test-sub-a',97,'RECEIVED',(due+interval '1 month')::date);
 PERFORM public.process_asaas_payment('production','test-refund-a','PAYMENT_REFUNDED',order_a,'test-pay-a','test-sub-a',97,'REFUNDED',due);
 IF NOT EXISTS(SELECT 1 FROM public.tenants WHERE id=tenant_a AND status='active' AND renewal_date=((due+interval '1 month')::date+interval '1 month')::date) THEN RAISE EXCEPTION 'Estorno antigo removeu mês posterior'; END IF;
 -- Suspensão administrativa prevalece mesmo após receber pagamento.
 UPDATE public.tenants SET status='suspended' WHERE id=tenant_a;
 PERFORM public.process_asaas_payment('production','test-again-a2','PAYMENT_RECEIVED',order_a,'test-pay-a2','test-sub-a',97,'RECEIVED',(due+interval '1 month')::date);
 IF NOT EXISTS(SELECT 1 FROM public.tenants WHERE id=tenant_a AND status='suspended') THEN RAISE EXCEPTION 'Pagamento removeu suspensão'; END IF;
 -- Valor incorreto deve falhar sem ativar a segunda clínica.
 BEGIN
  PERFORM public.process_asaas_payment('production','test-wrong-b','PAYMENT_CONFIRMED',order_b,'test-pay-b','test-sub-b',1,'CONFIRMED',due);
  RAISE EXCEPTION 'Aceitou valor incorreto' USING ERRCODE='ZX001';
 EXCEPTION WHEN SQLSTATE 'ZX001' THEN RAISE; WHEN OTHERS THEN NULL; END;
 BEGIN
  PERFORM public.reserve_production_checkout(tenant_a,'profissional');
  RAISE EXCEPTION 'Aceitou assinatura duplicada' USING ERRCODE='ZX001';
 EXCEPTION WHEN SQLSTATE 'ZX001' THEN RAISE; WHEN OTHERS THEN NULL; END;
 IF has_function_privilege('authenticated','public.process_asaas_payment(text,text,text,uuid,text,text,numeric,text,date)','EXECUTE') OR has_function_privilege('anon','public.reserve_production_checkout(uuid,text)','EXECUTE') THEN RAISE EXCEPTION 'RPC financeira acessível no cliente'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.tenants WHERE id=tenant_b AND status='trial') THEN RAISE EXCEPTION 'Valor incorreto alterou clínica'; END IF;
END $$;
ROLLBACK;
