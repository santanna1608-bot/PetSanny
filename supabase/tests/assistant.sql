BEGIN;
INSERT INTO auth.users(id,email) VALUES('71000000-0000-4000-8000-000000000001','assistant@example.invalid'),('71000000-0000-4000-8000-000000000002','other@example.invalid');
INSERT INTO public.tenants(id,name,plan,status,renewal_date) VALUES('71000000-0000-4000-8000-000000000011','Teste assistente','Gold','trial',current_date+7);
INSERT INTO public.tenant_memberships(tenant_id,user_id,role,active) VALUES('71000000-0000-4000-8000-000000000011','71000000-0000-4000-8000-000000000001','owner',true);
DO $$ DECLARE r jsonb; BEGIN
 r:=public.reserve_assistant_use('71000000-0000-4000-8000-000000000011','71000000-0000-4000-8000-000000000002');
 IF (r->>'allowed')::boolean THEN RAISE EXCEPTION 'Outra clínica acessou';END IF;
 FOR i IN 1..10 LOOP
  r:=public.reserve_assistant_use('71000000-0000-4000-8000-000000000011','71000000-0000-4000-8000-000000000001');
  IF NOT (r->>'allowed')::boolean OR (r->>'remaining')::integer<>10-i THEN RAISE EXCEPTION 'Cota de teste inválida';END IF;
 END LOOP;
 r:=public.reserve_assistant_use('71000000-0000-4000-8000-000000000011','71000000-0000-4000-8000-000000000001');
 IF r->>'reason'<>'quota' THEN RAISE EXCEPTION 'Cota ultrapassada';END IF;
 UPDATE public.tenants SET status='active',plan='Bronze' WHERE id='71000000-0000-4000-8000-000000000011';
 r:=public.reserve_assistant_use('71000000-0000-4000-8000-000000000011','71000000-0000-4000-8000-000000000001');
 IF r->>'reason'<>'plan' THEN RAISE EXCEPTION 'Essencial acessou';END IF;
 UPDATE public.tenants SET plan='Gold' WHERE id='71000000-0000-4000-8000-000000000011';
 FOR i IN 1..100 LOOP PERFORM public.reserve_assistant_use('71000000-0000-4000-8000-000000000011','71000000-0000-4000-8000-000000000001');END LOOP;
 r:=public.reserve_assistant_use('71000000-0000-4000-8000-000000000011','71000000-0000-4000-8000-000000000001');
 IF r->>'reason'<>'quota' THEN RAISE EXCEPTION 'Cota mensal ultrapassada';END IF;
 UPDATE public.tenants SET renewal_date=current_date-1 WHERE id='71000000-0000-4000-8000-000000000011';
 r:=public.reserve_assistant_use('71000000-0000-4000-8000-000000000011','71000000-0000-4000-8000-000000000001');
 IF r->>'reason'<>'plan' THEN RAISE EXCEPTION 'Assinatura vencida acessou';END IF;
END $$;
SET LOCAL ROLE authenticated;
DO $$ DECLARE blocked boolean:=false;BEGIN
 BEGIN PERFORM public.reserve_assistant_use('71000000-0000-4000-8000-000000000011','71000000-0000-4000-8000-000000000001');EXCEPTION WHEN insufficient_privilege THEN blocked:=true;END;
 IF NOT blocked THEN RAISE EXCEPTION 'Cliente chamou reserva diretamente';END IF;
END $$;
RESET ROLE;
SELECT 'PASS: isolamento, planos, expiração e cotas do assistente' AS resultado;
ROLLBACK;
