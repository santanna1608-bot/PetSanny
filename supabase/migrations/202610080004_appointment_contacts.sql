BEGIN;
-- Executa com os privilégios do usuário e RLS. Toda falha reverte os três registros.
CREATE FUNCTION public.save_appointment_with_contacts(p_appointment jsonb, p_existing_id uuid DEFAULT NULL)
RETURNS public.appointments LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE
 a public.appointments; tenant uuid; tutor uuid; pet uuid;
BEGIN
 IF p_existing_id IS NOT NULL THEN
  SELECT * INTO a FROM public.appointments WHERE id=p_existing_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Atendimento não encontrado ou acesso não permitido'; END IF;
  IF a.tutor_id IS NOT NULL AND a.pet_id IS NOT NULL THEN RETURN a; END IF;
  p_appointment := to_jsonb(a);
 END IF;
 tenant := (p_appointment->>'tenant_id')::uuid;
 tutor := (p_appointment->>'tutor_id')::uuid;
 pet := (p_appointment->>'pet_id')::uuid;
 IF tutor IS NULL THEN
  IF pet IS NOT NULL THEN RAISE EXCEPTION 'Selecione o tutor do pet'; END IF;
  INSERT INTO public.tutors(tenant_id,name,email)
  VALUES(tenant,p_appointment->>'tutor_name',p_appointment->>'tutor_email') RETURNING id INTO tutor;
 ELSE
  PERFORM 1 FROM public.tutors WHERE id=tutor AND tenant_id=tenant;
  IF NOT FOUND THEN RAISE EXCEPTION 'Tutor não encontrado nesta clínica'; END IF;
 END IF;
 IF pet IS NULL THEN
  INSERT INTO public.pets(tenant_id,tutor_id,name,species)
  VALUES(tenant,tutor,p_appointment->>'pet_name',p_appointment->>'pet_species') RETURNING id INTO pet;
 ELSE
  PERFORM 1 FROM public.pets WHERE id=pet AND tenant_id=tenant AND tutor_id=tutor;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pet não pertence ao tutor selecionado'; END IF;
 END IF;
 IF p_existing_id IS NOT NULL THEN
  UPDATE public.appointments SET tutor_id=tutor,pet_id=pet WHERE id=p_existing_id RETURNING * INTO a;
 ELSE
  INSERT INTO public.appointments(tenant_id,tutor_id,pet_id,tutor_name,tutor_email,pet_name,pet_species,
    service_type,service_name,professional_name,price,appointment_date,appointment_time,status,confirmed_at,critical_notes)
  VALUES(tenant,tutor,pet,p_appointment->>'tutor_name',p_appointment->>'tutor_email',p_appointment->>'pet_name',p_appointment->>'pet_species',
    p_appointment->>'service_type',p_appointment->>'service_name',p_appointment->>'professional_name',
    (p_appointment->>'price')::numeric,(p_appointment->>'appointment_date')::date,(p_appointment->>'appointment_time')::time,
    p_appointment->>'status',(p_appointment->>'confirmed_at')::timestamptz,p_appointment->>'critical_notes') RETURNING * INTO a;
 END IF;
 RETURN a;
END $$;
REVOKE ALL ON FUNCTION public.save_appointment_with_contacts(jsonb,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.save_appointment_with_contacts(jsonb,uuid) TO authenticated;
INSERT INTO private.schema_migrations(version) VALUES('202610080004_appointment_contacts');
COMMIT;
