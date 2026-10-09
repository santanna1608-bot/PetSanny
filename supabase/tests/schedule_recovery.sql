-- Executar no SQL Editor como postgres. Todos os fixtures terminam em ROLLBACK.
BEGIN;
INSERT INTO auth.users(id,email,email_confirmed_at) VALUES('20000000-0000-4000-8000-000000000001','schedule-a@example.invalid',now()),('20000000-0000-4000-8000-000000000002','schedule-b@example.invalid',now());
INSERT INTO public.tenants(id,name,status) VALUES('20000000-0000-4000-8000-000000000011','Teste agenda A','active'),('20000000-0000-4000-8000-000000000012','Teste agenda B','active');
INSERT INTO public.tenant_memberships(tenant_id,user_id,role) VALUES('20000000-0000-4000-8000-000000000011','20000000-0000-4000-8000-000000000001','owner'),('20000000-0000-4000-8000-000000000012','20000000-0000-4000-8000-000000000002','owner');
INSERT INTO public.tutors(id,tenant_id,name,email) VALUES('20000000-0000-4000-8000-000000000021','20000000-0000-4000-8000-000000000011','Tutor A','a@example.invalid'),('20000000-0000-4000-8000-000000000022','20000000-0000-4000-8000-000000000012','Tutor B','b@example.invalid');
INSERT INTO public.pets(id,tenant_id,tutor_id,name,species) VALUES('20000000-0000-4000-8000-000000000031','20000000-0000-4000-8000-000000000011','20000000-0000-4000-8000-000000000021','Pet A','Cão'),('20000000-0000-4000-8000-000000000032','20000000-0000-4000-8000-000000000012','20000000-0000-4000-8000-000000000022','Pet B','Cão');
SELECT set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000001',true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE a public.appointments; b public.appointments; w public.appointment_waitlist; blocked boolean; p jsonb;
BEGIN
 p:=jsonb_build_object('tenant_id','20000000-0000-4000-8000-000000000011','tutor_id','20000000-0000-4000-8000-000000000021','pet_id','20000000-0000-4000-8000-000000000031','tutor_name','Tutor A','pet_name','Pet A','pet_species','Cão','tutor_email','a@example.invalid','service_type','aesthetic','service_name','Banho','professional_name','Ana','price',10,'appointment_date','2030-01-10','appointment_time','10:00','status','pending');
 SELECT * INTO a FROM public.save_appointment_with_contacts(p);
 blocked:=false;BEGIN PERFORM public.save_appointment_with_contacts(p||jsonb_build_object('appointment_time','10:30'));EXCEPTION WHEN raise_exception THEN blocked:=true;END;
 IF NOT blocked THEN RAISE EXCEPTION 'Sobreposição aceita';END IF;
 SELECT * INTO b FROM public.save_appointment_with_contacts(p||jsonb_build_object('appointment_time','11:00'));
 blocked:=false;BEGIN PERFORM public.reschedule_appointment(b.id,'2030-01-10','10:30',60);EXCEPTION WHEN raise_exception THEN blocked:=true;END;
 IF NOT blocked OR (SELECT appointment_time FROM public.appointments WHERE id=b.id)<>'11:00'::time THEN RAISE EXCEPTION 'Reagendamento conflitante não foi revertido';END IF;
 PERFORM public.reschedule_appointment(b.id,'2030-01-10','12:00',60);
 IF (SELECT count(*) FROM public.appointment_events WHERE appointment_id=b.id AND event_type='rescheduled')<>1 THEN RAISE EXCEPTION 'Histórico de reagendamento ausente';END IF;
 PERFORM public.cancel_appointment(a.id,'Tutor solicitou');
 INSERT INTO public.appointment_waitlist(tenant_id,tutor_id,pet_id,service_name,service_type,earliest_date,latest_date,price)
 VALUES('20000000-0000-4000-8000-000000000011','20000000-0000-4000-8000-000000000021','20000000-0000-4000-8000-000000000031','Banho','aesthetic','2030-01-10','2030-01-10',20) RETURNING * INTO w;
 SELECT * INTO a FROM public.book_waitlist_entry(w.id,a.id);
 IF a.pet_id<>w.pet_id OR a.price<>20 OR (SELECT status FROM public.appointment_waitlist WHERE id=w.id)<>'booked' THEN RAISE EXCEPTION 'Reserva não vinculada';END IF;
 blocked:=false;BEGIN PERFORM public.book_waitlist_entry(w.id,a.id);EXCEPTION WHEN raise_exception THEN blocked:=true;END;
 IF NOT blocked THEN RAISE EXCEPTION 'Reserva repetida aceita';END IF;
 blocked:=false;BEGIN INSERT INTO public.appointment_waitlist(tenant_id,tutor_id,pet_id,service_name,service_type,earliest_date,latest_date,price)
 VALUES('20000000-0000-4000-8000-000000000012','20000000-0000-4000-8000-000000000022','20000000-0000-4000-8000-000000000032','Banho','aesthetic','2030-01-10','2030-01-10',20);
 EXCEPTION WHEN insufficient_privilege OR raise_exception THEN blocked:=true;END;
 IF NOT blocked THEN RAISE EXCEPTION 'Inclusão em clínica estrangeira aceita';END IF;
END $$;
SELECT set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000002',true);
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.appointment_waitlist) OR EXISTS(SELECT 1 FROM public.appointment_events) THEN RAISE EXCEPTION 'Vazamento entre clínicas';END IF;
END $$;
SELECT 'PASS: conflitos bloqueados, reagendamento revertido, histórico, reserva atômica sem repetição e isolamento' AS resultado;
ROLLBACK;
