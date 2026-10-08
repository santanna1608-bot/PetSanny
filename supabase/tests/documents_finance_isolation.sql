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

INSERT INTO public.pets(tenant_id,tutor_id,name,species)
SELECT tenant_id,id,'Pet de isolamento','dog' FROM public.tutors WHERE id IN ('30000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002');
INSERT INTO public.pet_documents(tenant_id,pet_id,name,document_date,size,file_type,storage_path)
SELECT tenant_id,id,'Documento de teste',current_date,'1 KB','application/pdf',tenant_id::text||'/'||id::text||'/test.pdf' FROM public.pets WHERE tenant_id IN ('20000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002');
INSERT INTO public.financial_transactions(tenant_id,transaction_date,description,transaction_type,category,value,payment_method)
VALUES('20000000-0000-4000-8000-000000000001',current_date,'Teste A','revenue','Teste',10,'pix'),
('20000000-0000-4000-8000-000000000002',current_date,'Teste B','expense','Teste',20,'cash');
SET LOCAL ROLE authenticated;
DO $$ DECLARE i integer; own uuid; other uuid; affected integer; BEGIN
 FOR i IN 1..2 LOOP
  own:=('20000000-0000-4000-8000-00000000000'||i)::uuid;
  other:=('20000000-0000-4000-8000-00000000000'||(3-i))::uuid;
  PERFORM set_config('request.jwt.claims',jsonb_build_object('sub','10000000-0000-4000-8000-00000000000'||i,'role','authenticated')::text,true);
  IF (SELECT count(*) FROM public.pet_documents)<>1 OR (SELECT count(*) FROM public.financial_transactions)<>1 THEN RAISE EXCEPTION 'Falha no isolamento de leitura'; END IF;
  IF EXISTS(SELECT 1 FROM public.pet_documents WHERE tenant_id=other) OR EXISTS(SELECT 1 FROM public.financial_transactions WHERE tenant_id=other) THEN RAISE EXCEPTION 'Registro estrangeiro visível'; END IF;
  UPDATE public.pet_documents SET name='Invasão' WHERE tenant_id=other; GET DIAGNOSTICS affected=ROW_COUNT;
  IF affected<>0 THEN RAISE EXCEPTION 'Documento estrangeiro alterado'; END IF;
  DELETE FROM public.pet_documents WHERE tenant_id=other; GET DIAGNOSTICS affected=ROW_COUNT;
  IF affected<>0 THEN RAISE EXCEPTION 'Documento estrangeiro excluído'; END IF;
  UPDATE public.financial_transactions SET value=99 WHERE tenant_id=other; GET DIAGNOSTICS affected=ROW_COUNT;
  IF affected<>0 THEN RAISE EXCEPTION 'Financeiro estrangeiro alterado'; END IF;
  DELETE FROM public.financial_transactions WHERE tenant_id=other; GET DIAGNOSTICS affected=ROW_COUNT;
  IF affected<>0 THEN RAISE EXCEPTION 'Financeiro estrangeiro excluído'; END IF;
  BEGIN
   INSERT INTO public.financial_transactions(tenant_id,transaction_date,description,transaction_type,category,value,payment_method)
   VALUES(other,current_date,'Invasão','expense','Teste',1,'pix');
   RAISE EXCEPTION 'Inclusão financeira estrangeira permitida';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  IF private.has_tenant_access(private.document_tenant(other::text||'/pet/test.pdf')) OR private.has_tenant_access(private.document_tenant(other::text||'/pet/test.pdf'),true) THEN RAISE EXCEPTION 'Caminho estrangeiro autorizado'; END IF;
  IF NOT private.has_tenant_access(private.document_tenant(own::text||'/pet/test.pdf'),true) THEN RAISE EXCEPTION 'Caminho próprio bloqueado'; END IF;
  IF private.document_tenant('invalid/path') IS NOT NULL THEN RAISE EXCEPTION 'Caminho inválido aceito'; END IF;
 END LOOP;
END $$;
RESET ROLE;
SELECT 'PASS: documentos e financeiro isolados nas duas direções; caminhos de Storage conferidos' AS resultado;
ROLLBACK;
