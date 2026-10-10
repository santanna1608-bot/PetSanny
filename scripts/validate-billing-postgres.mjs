// Validação isolada em PostgreSQL/WASM; não usa credenciais nem conecta ao Supabase.
// Preparação: npm install --no-save --package-lock=false @electric-sql/pglite
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const db=new PGlite();
try {
 await db.exec(`
 CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
 CREATE SCHEMA private; CREATE SCHEMA auth;
 CREATE TABLE private.schema_migrations(version text PRIMARY KEY);
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('app.user',true),'')::uuid $$;
 CREATE FUNCTION private.is_platform_admin() RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
 CREATE FUNCTION private.has_tenant_access(uuid,boolean DEFAULT false,boolean DEFAULT false) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
 CREATE TABLE public.tenants(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),name text NOT NULL,status text NOT NULL DEFAULT 'trial',plan text NOT NULL DEFAULT 'Gold',price numeric NOT NULL DEFAULT 0,renewal_date date DEFAULT current_date+14);
 CREATE TABLE public.tenant_memberships(tenant_id uuid REFERENCES public.tenants(id),user_id uuid,role text,active boolean);
 `);
 for(const name of ['202610090009_billing_sandbox.sql','202610100010_billing_production.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+name,import.meta.url),'utf8'));
 await db.exec(await readFile(new URL('../supabase/tests/billing_production.sql',import.meta.url),'utf8'));
 await db.exec(`
 BEGIN;
 INSERT INTO public.tenants(id,name,status) VALUES('10000000-0000-4000-8000-000000000001','Clínica isolada A','trial'),('10000000-0000-4000-8000-000000000002','Clínica isolada B','trial');
 INSERT INTO public.tenant_memberships VALUES('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','owner',true);
 INSERT INTO public.billing_orders(id,tenant_id,plan_id,amount,environment) VALUES('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','essencial',97,'production'),('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','essencial',97,'production');
 SELECT public.process_asaas_payment('production','expiry-a','PAYMENT_CONFIRMED','30000000-0000-4000-8000-000000000001','expiry-pay-a','expiry-sub-a',97,'CONFIRMED',(current_date-interval '2 months')::date);
 SELECT public.process_asaas_payment('production','active-b','PAYMENT_CONFIRMED','30000000-0000-4000-8000-000000000002','active-pay-b','active-sub-b',97,'CONFIRMED',current_date);
 SELECT set_config('app.user','20000000-0000-4000-8000-000000000001',true);
 GRANT USAGE ON SCHEMA private,auth TO authenticated;
 SET LOCAL ROLE authenticated;
 `);
 const access=await db.query(`SELECT private.has_tenant_access('10000000-0000-4000-8000-000000000001',true,true) AS write,private.has_tenant_access('10000000-0000-4000-8000-000000000001',false,true) AS read`);
 assert.equal(access.rows[0].write,false);assert.equal(access.rows[0].read,true);
 const rows=await db.query('SELECT tenant_id FROM public.billing_payments');assert.equal(rows.rows.length,1);assert.equal(rows.rows[0].tenant_id,'10000000-0000-4000-8000-000000000001');
 await db.exec('RESET ROLE; ROLLBACK;');
 console.log('PASS: migrações PostgreSQL, ativação, renovação, estorno, idempotência, suspensão, duplicação, permissões RPC, expiração e isolamento RLS.');
} finally {await db.close();}
