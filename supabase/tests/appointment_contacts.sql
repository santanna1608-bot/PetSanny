-- Requer uma clínica com proprietário e atendimento existente. Nenhum fixture permanece.
BEGIN;
SELECT set_config('request.jwt.claim.sub',(SELECT user_id::text FROM public.tenant_memberships WHERE role='owner' ORDER BY created_at LIMIT 1),true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE p jsonb; a public.appointments; tc bigint; pc bigint; ac bigint; rejected boolean:=false; BEGIN
 SELECT to_jsonb(x) INTO p FROM public.appointments x LIMIT 1;
 IF p IS NULL THEN RAISE EXCEPTION 'Atendimento de referência ausente'; END IF;
 p:=p || jsonb_build_object('tutor_id',NULL,'pet_id',NULL,'tutor_name','Teste transacional','pet_name','Pet teste','price',-1);
 SELECT count(*) INTO tc FROM public.tutors;
 SELECT count(*) INTO pc FROM public.pets;
 SELECT count(*) INTO ac FROM public.appointments;
 BEGIN
  PERFORM public.save_appointment_with_contacts(p);
 EXCEPTION WHEN check_violation THEN rejected:=true;
 END;
 IF NOT rejected OR (SELECT count(*) FROM public.tutors)<>tc OR (SELECT count(*) FROM public.pets)<>pc OR (SELECT count(*) FROM public.appointments)<>ac THEN
  RAISE EXCEPTION 'Falha não reverteu todos os cadastros';
 END IF;
 SELECT * INTO a FROM public.save_appointment_with_contacts(p || jsonb_build_object('price',10));
 IF a.tutor_id IS NULL OR a.pet_id IS NULL THEN RAISE EXCEPTION 'Vínculos ausentes'; END IF;
 PERFORM public.save_appointment_with_contacts('{}',a.id);
 IF (SELECT count(*) FROM public.tutors)<>tc+1 OR (SELECT count(*) FROM public.pets)<>pc+1 OR (SELECT count(*) FROM public.appointments)<>ac+1 THEN
  RAISE EXCEPTION 'Reparo repetido duplicou cadastros';
 END IF;
END $$;
SELECT 'PASS: criação vinculada, rollback em falha e reparo sem duplicação' AS resultado;
ROLLBACK;
