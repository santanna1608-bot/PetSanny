BEGIN;
INSERT INTO auth.users(id,email,email_confirmed_at) VALUES('50000000-0000-4000-8000-000000000001','connections@example.invalid',now());
INSERT INTO public.tenants(id,name,status) VALUES('50000000-0000-4000-8000-000000000011','Teste conexoes A','active'),('50000000-0000-4000-8000-000000000012','Teste conexoes B','active');
INSERT INTO public.tenant_memberships(tenant_id,user_id,role) VALUES('50000000-0000-4000-8000-000000000011','50000000-0000-4000-8000-000000000001','owner');
INSERT INTO public.integration_connections(tenant_id,channel,provider,display_name) VALUES('50000000-0000-4000-8000-000000000012','whatsapp','meta','Outra clinica');
SELECT set_config('request.jwt.claim.sub','50000000-0000-4000-8000-000000000001',true);
SET LOCAL ROLE authenticated;
INSERT INTO public.integration_connections(tenant_id,channel,provider,display_name) VALUES('50000000-0000-4000-8000-000000000011','whatsapp','meta','Minha clinica');
DO $$ DECLARE blocked boolean:=false; BEGIN
 IF (SELECT count(*) FROM public.integration_connections)<>1 THEN RAISE EXCEPTION 'Isolamento falhou';END IF;
 BEGIN UPDATE public.integration_connections SET status='connected' WHERE tenant_id='50000000-0000-4000-8000-000000000011'; EXCEPTION WHEN insufficient_privilege THEN blocked:=true;END;
 IF NOT blocked THEN RAISE EXCEPTION 'Cliente falsifica conexao';END IF;
 blocked:=false;
 BEGIN INSERT INTO public.integration_connections(tenant_id,channel,provider,display_name) VALUES('50000000-0000-4000-8000-000000000012','whatsapp','meta','Invasao'); EXCEPTION WHEN insufficient_privilege THEN blocked:=true;END;
 IF NOT blocked THEN RAISE EXCEPTION 'Escrita estrangeira aceita';END IF;
END $$;
UPDATE public.integration_connections SET display_name='Preferencia atualizada' WHERE tenant_id='50000000-0000-4000-8000-000000000011';
SET LOCAL ROLE anon;
DO $$ DECLARE blocked boolean:=false;BEGIN
 BEGIN PERFORM 1 FROM public.integration_connections;EXCEPTION WHEN insufficient_privilege THEN blocked:=true;END;
 IF NOT blocked THEN RAISE EXCEPTION 'Anonimo acessa conexoes';END IF;
END $$;
SELECT 'PASS: isolamento, preferencia persistente e status protegido no servidor' AS resultado;
ROLLBACK;
