-- Consulta apenas o privilégio do usuário autenticado. Não concede acesso.
BEGIN;
CREATE FUNCTION public.current_platform_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT (SELECT auth.uid()) IS NOT NULL AND private.is_platform_admin();
$$;
REVOKE ALL ON FUNCTION public.current_platform_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_platform_admin() TO authenticated;
INSERT INTO private.schema_migrations(version) VALUES('202610080003_platform_access');
COMMIT;
