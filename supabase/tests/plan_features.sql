-- Run after migration 012; all fixtures roll back.
BEGIN;
INSERT INTO auth.users(id,email,email_confirmed_at) VALUES('60000000-0000-4000-8000-000000000001','plans@example.invalid',now());
INSERT INTO public.tenants(id,name,plan,status,renewal_date) VALUES
 ('60000000-0000-4000-8000-000000000011','Teste Essencial','Bronze','active',current_date+14),
 ('60000000-0000-4000-8000-000000000012','Teste Crescer','Silver','active',current_date+14),
 ('60000000-0000-4000-8000-000000000013','Teste Profissional','Gold','active',current_date+14),
 ('60000000-0000-4000-8000-000000000014','Teste gratuito','Bronze','trial',current_date+14);
INSERT INTO public.tenant_memberships(tenant_id,user_id,role)
 SELECT id,'60000000-0000-4000-8000-000000000001','admin' FROM public.tenants WHERE id IN
 ('60000000-0000-4000-8000-000000000011','60000000-0000-4000-8000-000000000012','60000000-0000-4000-8000-000000000013','60000000-0000-4000-8000-000000000014');
INSERT INTO public.tutors(id,tenant_id,name) VALUES('60000000-0000-4000-8000-000000000021','60000000-0000-4000-8000-000000000011','Tutor teste');
INSERT INTO public.appointments(id,tenant_id,tutor_name,pet_name,pet_species,tutor_email,service_type,service_name,professional_name,price,appointment_date,appointment_time)
 VALUES('60000000-0000-4000-8000-000000000031','60000000-0000-4000-8000-000000000011','Tutor teste','Pet teste','dog','test@example.invalid','vet','Consulta','Teste',0,current_date+1,'10:00');
SELECT set_config('request.jwt.claim.sub','60000000-0000-4000-8000-000000000001',true);
INSERT INTO public.appointments(id,tenant_id,tutor_name,pet_name,pet_species,tutor_email,service_type,service_name,professional_name,price,appointment_date,appointment_time)
 VALUES('60000000-0000-4000-8000-000000000032','60000000-0000-4000-8000-000000000013','Tutor teste','Pet teste','dog','test@example.invalid','vet','Consulta','Teste',0,current_date+1,'10:00');
SET LOCAL ROLE authenticated;
DO $$ DECLARE blocked boolean; BEGIN
 IF private.has_plan_feature('60000000-0000-4000-8000-000000000011','recovery') OR
    NOT private.has_plan_feature('60000000-0000-4000-8000-000000000012','recovery') OR
    private.has_plan_feature('60000000-0000-4000-8000-000000000012','crm') OR
    NOT private.has_plan_feature('60000000-0000-4000-8000-000000000013','crm') OR
    NOT private.has_plan_feature('60000000-0000-4000-8000-000000000014','crm') OR
    private.has_plan_feature('60000000-0000-4000-8000-000000000013','unknown') THEN RAISE EXCEPTION 'Matriz de planos incorreta'; END IF;
 blocked:=false;
 BEGIN INSERT INTO public.integration_connections(tenant_id,channel,provider,display_name) VALUES('60000000-0000-4000-8000-000000000012','whatsapp','meta','Bloqueada'); EXCEPTION WHEN insufficient_privilege THEN blocked:=true; END;
 IF NOT blocked THEN RAISE EXCEPTION 'Crescer acessa recurso Profissional'; END IF;
 blocked:=false;
 BEGIN UPDATE public.tutors SET crm_stage='customer' WHERE id='60000000-0000-4000-8000-000000000021'; EXCEPTION WHEN insufficient_privilege THEN blocked:=true; END;
 IF NOT blocked THEN RAISE EXCEPTION 'CRM direto sem plano aceito'; END IF;
 blocked:=false;
 BEGIN UPDATE public.appointments SET care_stage='received' WHERE id='60000000-0000-4000-8000-000000000031'; EXCEPTION WHEN insufficient_privilege THEN blocked:=true; END;
 IF NOT blocked THEN RAISE EXCEPTION 'Etapa direta sem plano aceita'; END IF;
 blocked:=false;
 BEGIN PERFORM public.issue_appointment_link('60000000-0000-4000-8000-000000000031'); EXCEPTION WHEN insufficient_privilege THEN blocked:=true; END;
 IF NOT blocked THEN RAISE EXCEPTION 'Emissão de link sem plano aceita'; END IF;
END $$;
INSERT INTO public.integration_connections(tenant_id,channel,provider,display_name) VALUES('60000000-0000-4000-8000-000000000013','whatsapp','meta','Permitida');
SELECT set_config('test.portal_token',public.issue_appointment_link('60000000-0000-4000-8000-000000000032'),true);
DO $$ BEGIN
 PERFORM public.read_tutor_appointment(current_setting('test.portal_token'));
END $$;
RESET ROLE;
UPDATE public.tenants SET plan='Bronze' WHERE id='60000000-0000-4000-8000-000000000013';
UPDATE public.tenants SET renewal_date=current_date-1 WHERE id='60000000-0000-4000-8000-000000000014';
SET LOCAL ROLE authenticated;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.integration_connections WHERE tenant_id='60000000-0000-4000-8000-000000000013') THEN RAISE EXCEPTION 'Downgrade não protege conexões'; END IF;
 IF private.has_plan_feature('60000000-0000-4000-8000-000000000014','crm') THEN RAISE EXCEPTION 'Teste expirado concede extras'; END IF;
END $$;
SET LOCAL ROLE anon;
DO $$ DECLARE blocked boolean:=false; BEGIN
 BEGIN PERFORM public.read_tutor_appointment(current_setting('test.portal_token')); EXCEPTION WHEN raise_exception THEN blocked:=true; END;
 IF NOT blocked THEN RAISE EXCEPTION 'Link antigo funciona após downgrade'; END IF;
END $$;
RESET ROLE;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.integration_connections WHERE tenant_id='60000000-0000-4000-8000-000000000013') THEN RAISE EXCEPTION 'Downgrade apagou dados'; END IF;
END $$;
SELECT 'PASS: planos, escrita direta, RPC, trial, downgrade e preservação' AS resultado;
ROLLBACK;
