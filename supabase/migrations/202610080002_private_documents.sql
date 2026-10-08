BEGIN;
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('pet-documents','pet-documents',false,10485760,ARRAY['application/pdf','image/jpeg','image/png','image/webp']);
CREATE FUNCTION private.document_tenant(path text) RETURNS uuid
LANGUAGE sql IMMUTABLE SET search_path='' AS $$
  SELECT CASE WHEN split_part(path,'/',1) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN split_part(path,'/',1)::uuid ELSE NULL END;
$$;
REVOKE ALL ON FUNCTION private.document_tenant(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION private.document_tenant(text) TO authenticated;
CREATE POLICY pet_documents_read ON storage.objects FOR SELECT TO authenticated
USING(bucket_id='pet-documents' AND private.has_tenant_access(private.document_tenant(name)));
CREATE POLICY pet_documents_insert ON storage.objects FOR INSERT TO authenticated
WITH CHECK(bucket_id='pet-documents' AND private.has_tenant_access(private.document_tenant(name),true));
CREATE POLICY pet_documents_delete ON storage.objects FOR DELETE TO authenticated
USING(bucket_id='pet-documents' AND private.has_tenant_access(private.document_tenant(name),true));
INSERT INTO private.schema_migrations(version) VALUES('202610080002_private_documents');
COMMIT;
