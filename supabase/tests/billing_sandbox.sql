BEGIN;
INSERT INTO public.tenants(id,name,status) VALUES('60000000-0000-4000-8000-000000000011','Teste cobrança','active');
INSERT INTO public.billing_orders(id,tenant_id,plan_id,amount,checkout_id,status) VALUES('60000000-0000-4000-8000-000000000021','60000000-0000-4000-8000-000000000011','essencial',97,'sandbox-test-checkout','active');
SET LOCAL ROLE authenticated;
DO $$ DECLARE blocked boolean:=false;BEGIN
 BEGIN PERFORM public.process_sandbox_checkout_event('test-evt','sandbox-test-checkout','CHECKOUT_PAID');EXCEPTION WHEN insufficient_privilege THEN blocked:=true;END;
 IF NOT blocked THEN RAISE EXCEPTION 'Cliente confirma pagamento';END IF;
 blocked:=false;
 BEGIN UPDATE public.billing_orders SET status='paid' WHERE checkout_id='sandbox-test-checkout';EXCEPTION WHEN insufficient_privilege THEN blocked:=true;END;
 IF NOT blocked THEN RAISE EXCEPTION 'Cliente altera cobrança';END IF;
 IF EXISTS(SELECT 1 FROM public.billing_orders) THEN RAISE EXCEPTION 'Cobrança estrangeira visível';END IF;
END $$;
RESET ROLE;
SET LOCAL ROLE service_role;
SELECT public.process_sandbox_checkout_event('test-evt','sandbox-test-checkout','CHECKOUT_PAID');
SELECT public.process_sandbox_checkout_event('test-evt','sandbox-test-checkout','CHECKOUT_PAID');
SELECT public.process_sandbox_checkout_event('test-late','sandbox-test-checkout','CHECKOUT_EXPIRED');
RESET ROLE;
DO $$ BEGIN
 IF (SELECT status FROM public.billing_orders WHERE checkout_id='sandbox-test-checkout')<>'paid' THEN RAISE EXCEPTION 'Evento atrasado reverte pagamento';END IF;
 IF (SELECT count(*) FROM private.billing_events WHERE order_id='60000000-0000-4000-8000-000000000021')<>2 THEN RAISE EXCEPTION 'Evento duplicado';END IF;
 IF (SELECT price FROM public.tenants WHERE id='60000000-0000-4000-8000-000000000011')<>0 THEN RAISE EXCEPTION 'Sandbox altera assinatura real';END IF;
END $$;
SELECT 'PASS: cliente sem acesso de escrita, webhook idempotente e Sandbox isolado' AS resultado;
ROLLBACK;
