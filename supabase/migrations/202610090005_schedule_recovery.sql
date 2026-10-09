BEGIN;
ALTER TABLE public.appointments ADD COLUMN duration_minutes integer NOT NULL DEFAULT 60 CHECK(duration_minutes BETWEEN 5 AND 480),
  ADD COLUMN cancellation_reason text CHECK(length(cancellation_reason)<=500);

CREATE TABLE public.appointment_waitlist(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES public.tenants(id),
 tutor_id uuid NOT NULL, pet_id uuid NOT NULL, service_name text NOT NULL CHECK(length(btrim(service_name)) BETWEEN 1 AND 255),
 service_type text NOT NULL CHECK(service_type IN('vet','aesthetic')), professional_name text,
 earliest_date date NOT NULL, latest_date date NOT NULL CHECK(latest_date>=earliest_date),
 earliest_time time NOT NULL DEFAULT '08:00', latest_time time NOT NULL DEFAULT '18:00',
 duration_minutes integer NOT NULL DEFAULT 60 CHECK(duration_minutes BETWEEN 5 AND 480),
 price numeric(12,2) NOT NULL CHECK(price>=0),
 status text NOT NULL DEFAULT 'waiting' CHECK(status IN('waiting','booked','withdrawn')),
 appointment_id uuid, created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(latest_time>earliest_time), CHECK((status='booked')=(appointment_id IS NOT NULL)),
 FOREIGN KEY(tenant_id,tutor_id) REFERENCES public.tutors(tenant_id,id),
 FOREIGN KEY(tenant_id,pet_id) REFERENCES public.pets(tenant_id,id),
 FOREIGN KEY(tenant_id,appointment_id) REFERENCES public.appointments(tenant_id,id)
);
CREATE INDEX appointment_waitlist_tenant_idx ON public.appointment_waitlist(tenant_id,status);
CREATE TABLE public.appointment_events(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES public.tenants(id),appointment_id uuid NOT NULL,
 event_type text NOT NULL, previous_date date,previous_time time,new_date date,new_time time,
 previous_status text,new_status text,reason text,created_by uuid REFERENCES auth.users(id),created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(tenant_id,appointment_id) REFERENCES public.appointments(tenant_id,id) ON DELETE CASCADE
);
ALTER TABLE public.appointment_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.appointment_events FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.appointment_events TO authenticated;
GRANT ALL ON public.appointment_events TO service_role;
CREATE POLICY events_read ON public.appointment_events FOR SELECT TO authenticated USING(private.has_tenant_access(tenant_id));
CREATE FUNCTION private.record_schedule_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NEW.appointment_date<>OLD.appointment_date OR NEW.appointment_time<>OLD.appointment_time OR NEW.duration_minutes<>OLD.duration_minutes OR NEW.status<>OLD.status THEN
 INSERT INTO public.appointment_events(tenant_id,appointment_id,event_type,previous_date,previous_time,new_date,new_time,previous_status,new_status,reason,created_by)
 VALUES(NEW.tenant_id,NEW.id,CASE WHEN NEW.status='canceled' THEN 'canceled' WHEN NEW.appointment_date<>OLD.appointment_date OR NEW.appointment_time<>OLD.appointment_time OR NEW.duration_minutes<>OLD.duration_minutes THEN 'rescheduled' ELSE 'status_changed' END,OLD.appointment_date,OLD.appointment_time,NEW.appointment_date,NEW.appointment_time,OLD.status,NEW.status,NEW.cancellation_reason,auth.uid());
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.record_schedule_event() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER record_schedule_event AFTER UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION private.record_schedule_event();
ALTER TABLE public.appointment_waitlist ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.appointment_waitlist FROM PUBLIC,anon;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.appointment_waitlist TO authenticated;
GRANT ALL ON public.appointment_waitlist TO service_role;
CREATE POLICY waitlist_read ON public.appointment_waitlist FOR SELECT TO authenticated USING(private.has_tenant_access(tenant_id));
CREATE POLICY waitlist_insert ON public.appointment_waitlist FOR INSERT TO authenticated WITH CHECK(private.has_tenant_access(tenant_id,true));
CREATE POLICY waitlist_update ON public.appointment_waitlist FOR UPDATE TO authenticated USING(private.has_tenant_access(tenant_id,true)) WITH CHECK(private.has_tenant_access(tenant_id,true));
CREATE POLICY waitlist_delete ON public.appointment_waitlist FOR DELETE TO authenticated USING(private.has_tenant_access(tenant_id,true));

-- Regras também valem para gravações diretas, não somente pela interface.
CREATE FUNCTION private.guard_schedule() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF TG_OP='UPDATE' AND NEW.tenant_id<>OLD.tenant_id THEN RAISE EXCEPTION 'Clínica do atendimento não pode mudar'; END IF;
 IF TG_OP='UPDATE' AND NEW.status='canceled' AND OLD.status='completed' THEN RAISE EXCEPTION 'Atendimento concluído não pode ser cancelado'; END IF;
 IF TG_OP='UPDATE' AND NEW.status='canceled' AND OLD.status<>'canceled' AND nullif(btrim(NEW.cancellation_reason),'') IS NULL THEN RAISE EXCEPTION 'Informe o motivo do cancelamento'; END IF;
 IF NEW.status IN('pending','confirmed') THEN
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.tenant_id::text,0));
  -- Alteração somente de confirmação não revalida conflitos históricos.
  IF TG_OP='UPDATE' AND OLD.status IN('pending','confirmed') AND NEW.appointment_date=OLD.appointment_date AND NEW.appointment_time=OLD.appointment_time AND NEW.duration_minutes=OLD.duration_minutes AND NEW.professional_name=OLD.professional_name THEN RETURN NEW; END IF;
  IF EXISTS(SELECT 1 FROM public.appointments a WHERE a.tenant_id=NEW.tenant_id AND a.id<>NEW.id AND a.status IN('pending','confirmed')
    AND lower(btrim(a.professional_name))=lower(btrim(NEW.professional_name))
    AND tsrange(a.appointment_date+a.appointment_time,a.appointment_date+a.appointment_time+make_interval(mins=>a.duration_minutes),'[)') &&
      tsrange(NEW.appointment_date+NEW.appointment_time,NEW.appointment_date+NEW.appointment_time+make_interval(mins=>NEW.duration_minutes),'[)'))
  THEN RAISE EXCEPTION 'Profissional já tem atendimento nesse horário'; END IF;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.guard_schedule() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER guard_schedule BEFORE INSERT OR UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION private.guard_schedule();

CREATE FUNCTION private.guard_waitlist() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.pets WHERE id=NEW.pet_id AND tenant_id=NEW.tenant_id AND tutor_id=NEW.tutor_id) THEN RAISE EXCEPTION 'Pet não pertence ao tutor nesta clínica'; END IF;
 IF TG_OP='UPDATE' AND NEW.tenant_id<>OLD.tenant_id THEN RAISE EXCEPTION 'Clínica da fila não pode mudar'; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.guard_waitlist() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER guard_waitlist BEFORE INSERT OR UPDATE ON public.appointment_waitlist FOR EACH ROW EXECUTE FUNCTION private.guard_waitlist();

CREATE FUNCTION public.cancel_appointment(p_id uuid,p_reason text) RETURNS public.appointments LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE a public.appointments;
BEGIN
 IF nullif(btrim(p_reason),'') IS NULL THEN RAISE EXCEPTION 'Informe o motivo'; END IF;
 UPDATE public.appointments SET status='canceled',cancellation_reason=btrim(p_reason) WHERE id=p_id AND status IN('pending','confirmed') RETURNING * INTO a;
 IF NOT FOUND THEN RAISE EXCEPTION 'Atendimento não encontrado ou não pode ser cancelado'; END IF;
 RETURN a;
END $$;
CREATE FUNCTION public.reschedule_appointment(p_id uuid,p_date date,p_time time,p_duration integer) RETURNS public.appointments LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE a public.appointments;
BEGIN
 UPDATE public.appointments SET appointment_date=p_date,appointment_time=p_time,duration_minutes=p_duration,status='pending',confirmed_at=NULL
 WHERE id=p_id AND status IN('pending','confirmed') RETURNING * INTO a;
 IF NOT FOUND THEN RAISE EXCEPTION 'Atendimento não encontrado ou não pode ser reagendado'; END IF;
 RETURN a;
END $$;
CREATE FUNCTION public.book_waitlist_entry(p_entry uuid,p_slot uuid) RETURNS public.appointments LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE w public.appointment_waitlist; s public.appointments; a public.appointments; p public.pets; t public.tutors;
BEGIN
 SELECT * INTO w FROM public.appointment_waitlist WHERE id=p_entry FOR UPDATE;
 IF NOT FOUND OR w.status<>'waiting' THEN RAISE EXCEPTION 'Entrada indisponível'; END IF;
 SELECT * INTO s FROM public.appointments WHERE id=p_slot AND tenant_id=w.tenant_id AND status='canceled' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Vaga cancelada não encontrada'; END IF;
 IF w.service_type<>s.service_type OR lower(btrim(w.service_name))<>lower(btrim(s.service_name)) OR
 (w.professional_name IS NOT NULL AND lower(btrim(w.professional_name))<>lower(btrim(s.professional_name))) OR
 s.appointment_date NOT BETWEEN w.earliest_date AND w.latest_date OR s.appointment_time<w.earliest_time OR
 s.appointment_date+s.appointment_time+make_interval(mins=>w.duration_minutes)>s.appointment_date+w.latest_time OR w.duration_minutes>s.duration_minutes
 THEN RAISE EXCEPTION 'Vaga incompatível com as preferências'; END IF;
 SELECT * INTO p FROM public.pets WHERE id=w.pet_id AND tenant_id=w.tenant_id;
 SELECT * INTO t FROM public.tutors WHERE id=w.tutor_id AND tenant_id=w.tenant_id;
 INSERT INTO public.appointments(tenant_id,tutor_id,pet_id,tutor_name,pet_name,pet_species,tutor_email,service_type,service_name,professional_name,price,appointment_date,appointment_time,duration_minutes,status)
 VALUES(w.tenant_id,t.id,p.id,t.name,p.name,p.species,coalesce(t.email,''),w.service_type,w.service_name,s.professional_name,w.price,s.appointment_date,s.appointment_time,w.duration_minutes,'pending') RETURNING * INTO a;
 UPDATE public.appointment_waitlist SET status='booked',appointment_id=a.id WHERE id=w.id;
 RETURN a;
END $$;
REVOKE ALL ON FUNCTION public.cancel_appointment(uuid,text),public.reschedule_appointment(uuid,date,time,integer),public.book_waitlist_entry(uuid,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.cancel_appointment(uuid,text),public.reschedule_appointment(uuid,date,time,integer),public.book_waitlist_entry(uuid,uuid) TO authenticated;
INSERT INTO private.schema_migrations(version) VALUES('202610090005_schedule_recovery');
COMMIT;
