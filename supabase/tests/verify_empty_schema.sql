-- Verificação somente leitura, após aplicar a migração e os testes.
DO $$ DECLARE r record; populated boolean; BEGIN
 IF (SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE') <> 15 THEN
  RAISE EXCEPTION 'Número de tabelas inesperado';
 END IF;
 FOR r IN SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' LOOP
  EXECUTE format('SELECT EXISTS(SELECT 1 FROM public.%I)',r.table_name) INTO populated;
  IF populated THEN RAISE EXCEPTION 'Tabela % contém registros',r.table_name; END IF;
 END LOOP;
 IF EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND NOT c.relrowsecurity) THEN
  RAISE EXCEPTION 'Tabela pública sem RLS';
 END IF;
 IF EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND (coalesce(qual,'') LIKE '%user_metadata%' OR coalesce(with_check,'') LIKE '%user_metadata%')) THEN
  RAISE EXCEPTION 'Política depende de metadados editáveis';
 END IF;
 IF EXISTS(SELECT 1 FROM auth.users WHERE id IN ('10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000004')) THEN
  RAISE EXCEPTION 'Fixtures de autenticação não foram revertidos';
 END IF;
END $$;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM storage.buckets WHERE id='pet-documents' AND NOT public AND file_size_limit=10485760) THEN
  RAISE EXCEPTION 'Bucket privado ausente ou configuração inesperada';
 END IF;
 IF (SELECT count(*) FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname IN ('pet_documents_read','pet_documents_insert','pet_documents_delete')) <> 3 THEN
  RAISE EXCEPTION 'Políticas de documentos incompletas';
 END IF;
 IF EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='pet-documents') THEN
  RAISE EXCEPTION 'Bucket contém arquivos';
 END IF;
END $$;
SELECT 'PASS: base vazia, sem fixtures, todas as tabelas protegidas' AS resultado,
 count(*) AS tabelas, count(*) FILTER(WHERE c.relrowsecurity) AS tabelas_com_rls
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r';
