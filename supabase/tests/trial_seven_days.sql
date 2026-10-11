BEGIN;
INSERT INTO auth.users(id,email,email_confirmed_at) VALUES
 ('70000000-0000-4000-8000-000000000001','trial-owner@example.invalid',now()),
 ('70000000-0000-4000-8000-000000000002','trial-admin@example.invalid',now());
INSERT INTO private.platform_admins(user_id) VALUES('70000000-0000-4000-8000-000000000002');
INSERT INTO public.tenants(id,name,status,renewal_date) VALUES('70000000-0000-4000-8000-000000000011','Teste legado','trial',current_date+14);
SELECT set_config('request.jwt.claim.sub','70000000-0000-4000-8000-000000000001',true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE t public.tenants; blocked boolean:=false; BEGIN
 t:=public.bootstrap_tenant('Teste novo');
 IF t.renewal_date<>current_date+7 OR t.trial_duration_days<>7 THEN RAISE EXCEPTION 'Novo teste não dura 7 dias'; END IF;
 PERFORM set_config('test.new_trial',t.id::text,true);
 BEGIN PERFORM public.extend_tenant_trial(t.id); EXCEPTION WHEN insufficient_privilege THEN blocked:=true; END;
 IF NOT blocked THEN RAISE EXCEPTION 'Cliente estende próprio teste'; END IF;
 blocked:=false;
 BEGIN UPDATE public.tenants SET renewal_date=current_date+100 WHERE id=t.id; EXCEPTION WHEN insufficient_privilege THEN blocked:=true; END;
 IF NOT blocked THEN RAISE EXCEPTION 'Cliente modifica prazo diretamente'; END IF;
END $$;
RESET ROLE;
SELECT set_config('request.jwt.claim.sub','70000000-0000-4000-8000-000000000002',true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE d date; blocked boolean:=false; BEGIN
 d:=public.extend_tenant_trial(current_setting('test.new_trial')::uuid);
 IF d<>current_date+14 THEN RAISE EXCEPTION 'Extensão incorreta'; END IF;
 IF public.extend_tenant_trial(current_setting('test.new_trial')::uuid)<>d THEN RAISE EXCEPTION 'Extensão duplicada'; END IF;
 BEGIN PERFORM public.extend_tenant_trial('70000000-0000-4000-8000-000000000011'); EXCEPTION WHEN raise_exception THEN blocked:=true; END;
 IF NOT blocked THEN RAISE EXCEPTION 'Extensão indevida de teste legado'; END IF;
END $$;
RESET ROLE;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.tenants WHERE id='70000000-0000-4000-8000-000000000011' AND renewal_date=current_date+14 AND trial_duration_days=14) THEN RAISE EXCEPTION 'Prazo legado alterado'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.tenants WHERE id=current_setting('test.new_trial')::uuid AND trial_extended_by='70000000-0000-4000-8000-000000000002' AND trial_extended_at IS NOT NULL) THEN RAISE EXCEPTION 'Extensão sem auditoria'; END IF;
END $$;
SELECT 'PASS: novos 7 dias, legado preservado, extensão única e administrativa' AS resultado;
ROLLBACK;
