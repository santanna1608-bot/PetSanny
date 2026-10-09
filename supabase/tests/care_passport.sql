BEGIN;
INSERT INTO auth.users(id,email,email_confirmed_at) VALUES('30000000-0000-4000-8000-000000000001','care-a@example.invalid',now()),('30000000-0000-4000-8000-000000000002','care-b@example.invalid',now());
INSERT INTO public.tenants(id,name,status) VALUES('30000000-0000-4000-8000-000000000011','Teste cuidados A','active'),('30000000-0000-4000-8000-000000000012','Teste cuidados B','active');
INSERT INTO public.tenant_memberships(tenant_id,user_id,role) VALUES('30000000-0000-4000-8000-000000000011','30000000-0000-4000-8000-000000000001','owner'),('30000000-0000-4000-8000-000000000012','30000000-0000-4000-8000-000000000002','owner');
INSERT INTO public.tutors(id,tenant_id,name) VALUES('30000000-0000-4000-8000-000000000021','30000000-0000-4000-8000-000000000011','Tutor A'),('30000000-0000-4000-8000-000000000022','30000000-0000-4000-8000-000000000012','Tutor B');
INSERT INTO public.pets(id,tenant_id,tutor_id,name,species) VALUES('30000000-0000-4000-8000-000000000031','30000000-0000-4000-8000-000000000011','30000000-0000-4000-8000-000000000021','Pet A','Cão'),('30000000-0000-4000-8000-000000000032','30000000-0000-4000-8000-000000000012','30000000-0000-4000-8000-000000000022','Pet B','Cão');
SELECT set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000001',true);
SET LOCAL ROLE authenticated;
INSERT INTO public.pet_care_profiles(tenant_id,pet_id,information_source,recorded_by,restrictions) VALUES('30000000-0000-4000-8000-000000000011','30000000-0000-4000-8000-000000000031','tutor','Profissional teste','Preferência informada pelo tutor');
DO $$ DECLARE blocked boolean:=false;BEGIN
 BEGIN INSERT INTO public.pet_care_profiles(tenant_id,pet_id,information_source,recorded_by) VALUES('30000000-0000-4000-8000-000000000011','30000000-0000-4000-8000-000000000032','tutor','Profissional teste'); EXCEPTION WHEN foreign_key_violation THEN blocked:=true;END;
 IF NOT blocked THEN RAISE EXCEPTION 'Pet estrangeiro aceito';END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000002',true);
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.pet_care_profiles) THEN RAISE EXCEPTION 'Passaporte estrangeiro visível';END IF;
 UPDATE public.pet_care_profiles SET restrictions='Alteração estrangeira';
 IF FOUND THEN RAISE EXCEPTION 'Passaporte estrangeiro alterado';END IF;
END $$;
SELECT 'PASS: passaporte isolado, pet estrangeiro rejeitado e alteração estrangeira bloqueada' AS resultado;
ROLLBACK;
