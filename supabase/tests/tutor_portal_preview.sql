-- Portal: nenhuma tabela é liberada ao usuário anônimo; somente RPCs com token limitado.
BEGIN;
CREATE TABLE private.appointment_links(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES public.tenants(id),appointment_id uuid NOT NULL,
 token_hash text NOT NULL UNIQUE,expires_at timestamptz NOT NULL,revoked boolean NOT NULL DEFAULT false,
 created_by uuid NOT NULL REFERENCES auth.users(id),created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(tenant_id,appointment_id) REFERENCES public.appointments(tenant_id,id) ON DELETE CASCADE
);
REVOKE ALL ON private.appointment_links FROM PUBLIC,anon,authenticated;
ALTER TABLE private.appointment_links ENABLE ROW LEVEL SECURITY;
GRANT ALL ON private.appointment_links TO service_role;
CREATE TABLE public.appointment_requests(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES public.tenants(id),appointment_id uuid NOT NULL,
 link_id uuid NOT NULL REFERENCES private.appointment_links(id),action text NOT NULL CHECK(action IN('cancel','reschedule')),
 desired_date date,desired_time time,reason text NOT NULL DEFAULT '' CHECK(length(reason)<=500),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN('pending','handled','declined')),
 created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(link_id,action),
 CHECK(action<>'reschedule' OR (desired_date IS NOT NULL AND desired_time IS NOT NULL)),
 FOREIGN KEY(tenant_id,appointment_id) REFERENCES public.appointments(tenant_id,id) ON DELETE CASCADE
);
ALTER TABLE public.appointment_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.appointment_requests FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.appointment_requests TO authenticated;
GRANT UPDATE(status) ON public.appointment_requests TO authenticated;
GRANT ALL ON public.appointment_requests TO service_role;
CREATE POLICY request_read ON public.appointment_requests FOR SELECT TO authenticated USING(private.has_tenant_access(tenant_id));
CREATE POLICY request_update ON public.appointment_requests FOR UPDATE TO authenticated USING(private.has_tenant_access(tenant_id,true)) WITH CHECK(private.has_tenant_access(tenant_id,true));

CREATE FUNCTION public.issue_appointment_link(p_appointment uuid) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE a public.appointments; token text;
BEGIN
 SELECT * INTO a FROM public.appointments WHERE id=p_appointment;
 IF NOT FOUND OR NOT private.has_tenant_access(a.tenant_id,true) THEN RAISE EXCEPTION 'Atendimento não encontrado ou acesso não permitido';END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('link:'||p_appointment::text,0));
 token:=replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','');
 UPDATE private.appointment_links SET revoked=true WHERE appointment_id=a.id;
 INSERT INTO private.appointment_links(tenant_id,appointment_id,token_hash,expires_at,created_by)
 VALUES(a.tenant_id,a.id,encode(sha256(convert_to(token,'UTF8')),'hex'),now()+interval '48 hours',auth.uid());
 RETURN token;
END $$;
CREATE FUNCTION public.revoke_appointment_links(p_appointment uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE tenant uuid;
BEGIN
 SELECT tenant_id INTO tenant FROM public.appointments WHERE id=p_appointment;
 IF tenant IS NULL OR NOT private.has_tenant_access(tenant,true) THEN RAISE EXCEPTION 'Acesso não permitido';END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('link:'||p_appointment::text,0));
 UPDATE private.appointment_links SET revoked=true WHERE appointment_id=p_appointment;
END $$;
CREATE FUNCTION private.valid_appointment_link(p_token text) RETURNS private.appointment_links LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE l private.appointment_links;
BEGIN
 IF p_token IS NULL OR p_token !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'Link inválido ou expirado';END IF;
 SELECT * INTO l FROM private.appointment_links WHERE token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') AND NOT revoked AND expires_at>now() FOR UPDATE;
 IF NOT FOUND OR NOT EXISTS(SELECT 1 FROM public.tenant_memberships m JOIN public.tenants t ON t.id=m.tenant_id WHERE m.user_id=l.created_by AND m.tenant_id=l.tenant_id AND m.active AND m.role IN('owner','admin','staff') AND (t.status='active' OR(t.status='trial' AND t.renewal_date>=current_date))) THEN RAISE EXCEPTION 'Link inválido ou expirado';END IF;
 RETURN l;
END $$;
REVOKE ALL ON FUNCTION private.valid_appointment_link(text) FROM PUBLIC,anon,authenticated;
CREATE FUNCTION public.read_tutor_appointment(p_token text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE l private.appointment_links; a public.appointments; name text;
BEGIN
 l:=private.valid_appointment_link(p_token);
 SELECT * INTO a FROM public.appointments WHERE id=l.appointment_id AND tenant_id=l.tenant_id;
 SELECT t.name INTO name FROM public.tenants t WHERE id=l.tenant_id;
 RETURN jsonb_build_object('clinic_name',name,'pet_name',a.pet_name,'service_name',a.service_name,'appointment_date',a.appointment_date,'appointment_time',a.appointment_time,'status',a.status,'care_stage',a.care_stage,'expires_at',l.expires_at);
END $$;
CREATE FUNCTION public.respond_tutor_appointment(p_token text,p_action text,p_date date DEFAULT NULL,p_time time DEFAULT NULL,p_reason text DEFAULT '') RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE l private.appointment_links; a public.appointments;
BEGIN
 l:=private.valid_appointment_link(p_token);
 SELECT * INTO a FROM public.appointments WHERE id=l.appointment_id AND tenant_id=l.tenant_id FOR UPDATE;
 IF a.status NOT IN('pending','confirmed') THEN RAISE EXCEPTION 'Atendimento não aceita mais solicitações';END IF;
 IF p_action='confirm' THEN
  UPDATE public.appointments SET status='confirmed',confirmed_at=coalesce(confirmed_at,now()) WHERE id=a.id;
 ELSIF p_action IN('cancel','reschedule') THEN
  IF p_action='reschedule' AND (p_date IS NULL OR p_time IS NULL OR p_date<current_date) THEN RAISE EXCEPTION 'Informe data e horário futuros';END IF;
  INSERT INTO public.appointment_requests(tenant_id,appointment_id,link_id,action,desired_date,desired_time,reason)
  VALUES(l.tenant_id,a.id,l.id,p_action,p_date,p_time,coalesce(p_reason,'')) ON CONFLICT(link_id,action) DO NOTHING;
 ELSE RAISE EXCEPTION 'Ação inválida';END IF;
END $$;
REVOKE ALL ON FUNCTION public.issue_appointment_link(uuid),public.revoke_appointment_links(uuid),public.read_tutor_appointment(text),public.respond_tutor_appointment(text,text,date,time,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.issue_appointment_link(uuid),public.revoke_appointment_links(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.read_tutor_appointment(text),public.respond_tutor_appointment(text,text,date,time,text) TO anon,authenticated;
CREATE FUNCTION public.handle_appointment_request(p_id uuid,p_accept boolean) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE r public.appointment_requests;a public.appointments;
BEGIN
 SELECT * INTO r FROM public.appointment_requests WHERE id=p_id AND status='pending' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Solicitação indisponível';END IF;
 IF p_accept THEN
  SELECT * INTO a FROM public.appointments WHERE id=r.appointment_id AND tenant_id=r.tenant_id;
  IF r.action='cancel' THEN PERFORM public.cancel_appointment(a.id,coalesce(nullif(btrim(r.reason),''),'Solicitado pelo tutor'));
  ELSE PERFORM public.reschedule_appointment(a.id,r.desired_date,r.desired_time,a.duration_minutes);END IF;
 END IF;
 UPDATE public.appointment_requests SET status=CASE WHEN p_accept THEN 'handled' ELSE 'declined' END WHERE id=r.id;
END $$;
REVOKE ALL ON FUNCTION public.handle_appointment_request(uuid,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.handle_appointment_request(uuid,boolean) TO authenticated;
INSERT INTO private.schema_migrations(version) VALUES('202610090007_tutor_portal');
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
