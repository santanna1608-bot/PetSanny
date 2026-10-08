-- SQL Editor (postgres), base de teste vazia. Todos os fixtures são revertidos.
BEGIN;
INSERT INTO auth.users(id,email,email_confirmed_at) VALUES
 ('10000000-0000-4000-8000-000000000001','owner-a@example.invalid',now()),
 ('10000000-0000-4000-8000-000000000002','owner-b@example.invalid',now()),
 ('10000000-0000-4000-8000-000000000003','viewer@example.invalid',now()),
 ('10000000-0000-4000-8000-000000000004','unconfirmed@example.invalid',null);
INSERT INTO public.tenants(id,name,renewal_date) VALUES
 ('20000000-0000-4000-8000-000000000001','Teste A',current_date+14),
 ('20000000-0000-4000-8000-000000000002','Teste B',current_date+14);
INSERT INTO public.tenant_memberships(tenant_id,user_id,role) VALUES
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','owner'),
 ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','owner'),
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000003','viewer');
INSERT INTO public.tutors(id,tenant_id,name) VALUES
 ('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Tutor A'),
 ('30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','Tutor B');

-- Metadados falsificados não concedem acesso à clínica B nem superadmin.
SELECT set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated","user_metadata":{"tenant_id":"20000000-0000-4000-8000-000000000002","is_super_admin":true}}',true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE affected integer; BEGIN
 IF (SELECT count(*) FROM public.tutors) <> 1 THEN RAISE EXCEPTION 'FAIL: isolamento de leitura'; END IF;
 IF private.is_platform_admin() THEN RAISE EXCEPTION 'FAIL: metadados concederam superadmin'; END IF;
 INSERT INTO public.tutors(tenant_id,name) VALUES('20000000-0000-4000-8000-000000000001','Permitido');
 UPDATE public.tutors SET name = 'Editado' WHERE id = '30000000-0000-4000-8000-000000000001';
 GET DIAGNOSTICS affected = ROW_COUNT;
 IF affected <> 1 THEN RAISE EXCEPTION 'FAIL: edição da própria clínica'; END IF;
 UPDATE public.tutors SET name = 'Invasão' WHERE id = '30000000-0000-4000-8000-000000000002';
 GET DIAGNOSTICS affected = ROW_COUNT;
 IF affected <> 0 THEN RAISE EXCEPTION 'FAIL: edição de outra clínica'; END IF;
 DELETE FROM public.tutors WHERE id = '30000000-0000-4000-8000-000000000002';
 GET DIAGNOSTICS affected = ROW_COUNT;
 IF affected <> 0 THEN RAISE EXCEPTION 'FAIL: exclusão de outra clínica'; END IF;
 BEGIN
  INSERT INTO public.tutors(tenant_id,name) VALUES('20000000-0000-4000-8000-000000000002','Invasão');
  RAISE EXCEPTION 'FAIL: inserção em outra clínica';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  UPDATE public.tutors SET tenant_id = '20000000-0000-4000-8000-000000000002' WHERE id = '30000000-0000-4000-8000-000000000001';
  RAISE EXCEPTION 'FAIL: transferência entre clínicas';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  INSERT INTO public.pets(tenant_id,tutor_id,name,species) VALUES('20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','Pet','dog');
  RAISE EXCEPTION 'FAIL: vínculo com tutor de outra clínica';
 EXCEPTION WHEN foreign_key_violation THEN NULL; END;
 BEGIN
  UPDATE public.tenants SET status = 'active', price = 0;
  RAISE EXCEPTION 'FAIL: alteração de assinatura pelo cliente';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  INSERT INTO public.tenant_memberships(tenant_id,user_id,role) VALUES('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','admin');
  RAISE EXCEPTION 'FAIL: concessão de acesso pelo cliente';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

SELECT set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE affected integer; BEGIN
 IF (SELECT count(*) FROM public.tutors) <> 2 THEN RAISE EXCEPTION 'FAIL: leitura viewer'; END IF;
 BEGIN
  INSERT INTO public.tutors(tenant_id,name) VALUES('20000000-0000-4000-8000-000000000001','Viewer');
  RAISE EXCEPTION 'FAIL: gravação viewer';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 UPDATE public.tutors SET name = 'Viewer'; GET DIAGNOSTICS affected = ROW_COUNT;
 IF affected <> 0 THEN RAISE EXCEPTION 'FAIL: edição viewer'; END IF;
 DELETE FROM public.tutors; GET DIAGNOSTICS affected = ROW_COUNT;
 IF affected <> 0 THEN RAISE EXCEPTION 'FAIL: exclusão viewer'; END IF;
END $$;
RESET ROLE;

UPDATE public.tenants SET status = 'suspended' WHERE id = '20000000-0000-4000-8000-000000000001';
SELECT set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
SET LOCAL ROLE authenticated;
DO $$ BEGIN
 IF private.has_tenant_access('20000000-0000-4000-8000-000000000001',true) THEN RAISE EXCEPTION 'FAIL: clínica suspensa pode gravar'; END IF;
END $$;
RESET ROLE;

SELECT set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000004","role":"authenticated"}',true);
SET LOCAL ROLE authenticated;
DO $$ BEGIN
 BEGIN
  PERFORM public.bootstrap_tenant('Não confirmado');
  RAISE EXCEPTION 'FAIL: cadastro sem confirmação de email';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

-- Usuário sem clínica cria somente vínculo próprio, em uma única operação.
SELECT set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE tenant public.tenants; BEGIN
 SELECT * INTO tenant FROM public.bootstrap_tenant('Nova clínica de teste');
 IF tenant.status <> 'trial' OR tenant.price <> 0 OR tenant.renewal_date <> current_date+14 THEN RAISE EXCEPTION 'FAIL: parâmetros de trial'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.tenant_memberships WHERE tenant_id = tenant.id AND user_id = auth.uid() AND role = 'owner') THEN RAISE EXCEPTION 'FAIL: vínculo de proprietário'; END IF;
END $$;
RESET ROLE;

SELECT set_config('request.jwt.claims','{"role":"anon"}',true);
SET LOCAL ROLE anon;
DO $$ BEGIN
 BEGIN PERFORM 1 FROM public.tutors; RAISE EXCEPTION 'FAIL: leitura anônima'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM public.bootstrap_tenant('Anônimo'); RAISE EXCEPTION 'FAIL: cadastro anônimo'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SELECT 'PASS: isolamento CRUD, metadados falsos, vínculos, assinatura, permissões, suspensão, cadastro e acesso anônimo' AS resultado;
ROLLBACK;
