BEGIN;
INSERT INTO auth.users(id,email,email_confirmed_at) VALUES('40000000-0000-4000-8000-000000000001','portal-a@example.invalid',now()),('40000000-0000-4000-8000-000000000002','portal-b@example.invalid',now());
INSERT INTO public.tenants(id,name,status) VALUES('40000000-0000-4000-8000-000000000011','Teste portal A','active'),('40000000-0000-4000-8000-000000000012','Teste portal B','active');
INSERT INTO public.tenant_memberships(tenant_id,user_id,role) VALUES('40000000-0000-4000-8000-000000000011','40000000-0000-4000-8000-000000000001','owner'),('40000000-0000-4000-8000-000000000012','40000000-0000-4000-8000-000000000002','owner');
INSERT INTO public.appointments(id,tenant_id,tutor_name,pet_name,pet_species,tutor_email,service_type,service_name,professional_name,price,appointment_date,appointment_time)
VALUES('40000000-0000-4000-8000-000000000031','40000000-0000-4000-8000-000000000011','Tutor privado','Pet A','Cão','nao-compartilhar@example.invalid','aesthetic','Banho','Ana',10,'2030-01-10','10:00');
SELECT set_config('request.jwt.claim.sub','40000000-0000-4000-8000-000000000001',true);
SET LOCAL ROLE authenticated;
SELECT set_config('test.portal_token',public.issue_appointment_link('40000000-0000-4000-8000-000000000031'),true) IS NOT NULL AS token_preparado;
SET LOCAL ROLE anon;
DO $$ DECLARE p jsonb;blocked boolean:=false;BEGIN
 p:=public.read_tutor_appointment(current_setting('test.portal_token'));
 IF p->>'pet_name'<>'Pet A' OR p ? 'tutor_email' OR p ? 'price' OR p ? 'tutor_name' OR p ? 'critical_notes' THEN RAISE EXCEPTION 'Resposta do portal expõe dados excessivos';END IF;
 BEGIN PERFORM 1 FROM public.appointments;EXCEPTION WHEN insufficient_privilege THEN blocked:=true;END;
 IF NOT blocked THEN RAISE EXCEPTION 'Anônimo acessa tabela de atendimentos';END IF;
 blocked:=false;BEGIN PERFORM public.read_tutor_appointment(repeat('0',64));EXCEPTION WHEN raise_exception THEN blocked:=true;END;
 IF NOT blocked THEN RAISE EXCEPTION 'Token inválido aceito';END IF;
 PERFORM public.respond_tutor_appointment(current_setting('test.portal_token'),'confirm');
 PERFORM public.respond_tutor_appointment(current_setting('test.portal_token'),'reschedule','2030-01-11','11:00','Pedido do tutor');
 PERFORM public.respond_tutor_appointment(current_setting('test.portal_token'),'reschedule','2030-01-11','11:00','Pedido repetido');
END $$;
SET LOCAL ROLE authenticated;
DO $$ DECLARE r uuid;BEGIN
 IF (SELECT status FROM public.appointments WHERE id='40000000-0000-4000-8000-000000000031')<>'confirmed' THEN RAISE EXCEPTION 'Confirmação não salva';END IF;
 IF (SELECT count(*) FROM public.appointment_requests)<>1 THEN RAISE EXCEPTION 'Solicitação duplicada';END IF;
 SELECT id INTO r FROM public.appointment_requests LIMIT 1;
 PERFORM public.handle_appointment_request(r,true);
 IF (SELECT appointment_date FROM public.appointments WHERE id='40000000-0000-4000-8000-000000000031')<>'2030-01-11'::date THEN RAISE EXCEPTION 'Aceite não atualizou agenda';END IF;
 PERFORM public.revoke_appointment_links('40000000-0000-4000-8000-000000000031');
END $$;
SET LOCAL ROLE anon;
DO $$ DECLARE blocked boolean:=false;BEGIN
 BEGIN PERFORM public.read_tutor_appointment(current_setting('test.portal_token'));EXCEPTION WHEN raise_exception THEN blocked:=true;END;
 IF NOT blocked THEN RAISE EXCEPTION 'Token revogado aceito';END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','40000000-0000-4000-8000-000000000002',true);
RESET ROLE;
SELECT set_config('request.jwt.claim.sub','40000000-0000-4000-8000-000000000001',true);
SET LOCAL ROLE authenticated;
SELECT set_config('test.portal_token',public.issue_appointment_link('40000000-0000-4000-8000-000000000031'),true) IS NOT NULL AS novo_token_preparado;
RESET ROLE;
UPDATE private.appointment_links SET expires_at=now()-interval '1 minute' WHERE appointment_id='40000000-0000-4000-8000-000000000031';
SET LOCAL ROLE anon;
DO $$ DECLARE blocked boolean:=false;BEGIN
 BEGIN PERFORM public.read_tutor_appointment(current_setting('test.portal_token'));EXCEPTION WHEN raise_exception THEN blocked:=true;END;
 IF NOT blocked THEN RAISE EXCEPTION 'Token expirado aceito';END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','40000000-0000-4000-8000-000000000002',true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE blocked boolean:=false;BEGIN
 BEGIN PERFORM public.issue_appointment_link('40000000-0000-4000-8000-000000000031');EXCEPTION WHEN raise_exception THEN blocked:=true;END;
 IF NOT blocked OR EXISTS(SELECT 1 FROM public.appointment_requests) THEN RAISE EXCEPTION 'Acesso da clínica estrangeira aceito';END IF;
END $$;
SELECT 'PASS: portal limitado, token inválido e revogado bloqueados, solicitações sem duplicação e aceite autenticado' AS resultado;
ROLLBACK;
