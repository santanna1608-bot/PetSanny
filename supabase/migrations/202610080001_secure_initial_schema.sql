-- PetSanny: estrutura inicial para projeto vazio. Sem dados de demonstração.
-- Executar no SQL Editor como postgres. Falhas revertem toda a transação.
BEGIN;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') THEN
    RAISE EXCEPTION 'Esta migração exige um schema public vazio. Não apaga tabelas existentes.';
  END IF;
END $$;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE TABLE private.platform_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON private.platform_admins FROM PUBLIC, anon, authenticated;
GRANT ALL ON private.platform_admins TO service_role;

CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 2 AND 255),
  location text CHECK (length(location) <= 500),
  primary_color text NOT NULL DEFAULT 'olive',
  plan text NOT NULL DEFAULT 'Bronze' CHECK (plan IN ('Bronze','Silver','Gold')),
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('active','trial','suspended','canceled')),
  price numeric(12,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  renewal_date date,
  payment_method text CHECK (payment_method IN ('credit_card','pix','boleto')),
  owner_name text,
  owner_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.tenant_memberships (
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner','admin','staff','viewer')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id,user_id)
);
CREATE INDEX tenant_memberships_user_idx ON public.tenant_memberships(user_id);
CREATE UNIQUE INDEX one_owned_tenant_per_user ON public.tenant_memberships(user_id) WHERE role = 'owner';

CREATE FUNCTION private.is_platform_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM private.platform_admins WHERE user_id = (SELECT auth.uid()));
$$;
CREATE FUNCTION private.has_tenant_access(p_tenant uuid, p_write boolean DEFAULT false, p_admin boolean DEFAULT false)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT private.is_platform_admin() OR EXISTS (
    SELECT 1 FROM public.tenant_memberships m JOIN public.tenants t ON t.id = m.tenant_id
    WHERE m.tenant_id = p_tenant AND m.user_id = (SELECT auth.uid()) AND m.active
      AND (NOT p_admin OR m.role IN ('owner','admin'))
      AND (NOT p_write OR (m.role IN ('owner','admin','staff') AND
        (t.status = 'active' OR (t.status = 'trial' AND t.renewal_date >= current_date))))
  );
$$;
REVOKE ALL ON FUNCTION private.is_platform_admin(), private.has_tenant_access(uuid,boolean,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_platform_admin(), private.has_tenant_access(uuid,boolean,boolean) TO authenticated, service_role;

CREATE TABLE public.tutors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 2 AND 255),
  email text, phone text,
  crm_stage text NOT NULL DEFAULT 'lead' CHECK (length(crm_stage) <= 100),
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,id)
);
CREATE TABLE public.pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  tutor_id uuid NOT NULL, name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 255),
  species text NOT NULL, breed text, birth_date date, notes text,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,id),
  FOREIGN KEY(tenant_id,tutor_id) REFERENCES public.tutors(tenant_id,id)
);
CREATE INDEX pets_tutor_idx ON public.pets(tenant_id,tutor_id);
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  tutor_id uuid, pet_id uuid, tutor_name text NOT NULL, pet_name text NOT NULL,
  pet_species text NOT NULL, tutor_email text NOT NULL,
  service_type text NOT NULL CHECK (service_type IN ('vet','aesthetic')),
  service_name text NOT NULL, professional_name text NOT NULL,
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  appointment_date date NOT NULL, appointment_time time NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','canceled')),
  confirmed_at timestamptz, critical_notes text, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id,id),
  FOREIGN KEY(tenant_id,tutor_id) REFERENCES public.tutors(tenant_id,id),
  FOREIGN KEY(tenant_id,pet_id) REFERENCES public.pets(tenant_id,id)
);
CREATE INDEX appointments_schedule_idx ON public.appointments(tenant_id,appointment_date,appointment_time);
CREATE TABLE public.pet_weights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  pet_id uuid NOT NULL, weight numeric(7,2) NOT NULL CHECK (weight > 0), recorded_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(tenant_id,pet_id) REFERENCES public.pets(tenant_id,id)
);
CREATE TABLE public.medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  pet_id uuid NOT NULL, record_date date NOT NULL,
  record_type text NOT NULL CHECK (record_type IN ('consultation','vaccine','medication','exam','surgery','grooming','observation')),
  title text NOT NULL, description text NOT NULL, professional text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(tenant_id,pet_id) REFERENCES public.pets(tenant_id,id)
);
CREATE TABLE public.pet_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  pet_id uuid NOT NULL, title text NOT NULL, reminder_date date NOT NULL,
  reminder_type text NOT NULL CHECK (reminder_type IN ('vaccine','medication','exam','grooming')),
  done boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(tenant_id,pet_id) REFERENCES public.pets(tenant_id,id)
);
CREATE TABLE public.pet_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  pet_id uuid NOT NULL, name text NOT NULL, document_date date NOT NULL,
  size text NOT NULL, file_type text NOT NULL, storage_path text NOT NULL, file_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (split_part(storage_path,'/',1) = tenant_id::text),
  FOREIGN KEY(tenant_id,pet_id) REFERENCES public.pets(tenant_id,id)
);
CREATE TABLE public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  name text NOT NULL, category text NOT NULL CHECK (category IN ('medicine','vaccine','product','shampoo','equipment')),
  provider text, batch text, barcode text,
  qty integer NOT NULL DEFAULT 0 CHECK (qty >= 0),
  min_qty integer NOT NULL DEFAULT 0 CHECK (min_qty >= 0),
  max_qty integer NOT NULL DEFAULT 100 CHECK (max_qty >= min_qty),
  expiry_date date, buy_price numeric(12,2) NOT NULL DEFAULT 0 CHECK (buy_price >= 0),
  sell_price numeric(12,2) NOT NULL CHECK (sell_price >= 0),
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,id)
);
CREATE TABLE public.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  inventory_id uuid NOT NULL, quantity_delta integer NOT NULL CHECK (quantity_delta <> 0),
  reason text NOT NULL, created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(tenant_id,inventory_id) REFERENCES public.inventory(tenant_id,id)
);
CREATE TABLE public.financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  appointment_id uuid, transaction_date date NOT NULL, description text NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('revenue','expense')),
  category text NOT NULL, value numeric(12,2) NOT NULL CHECK (value > 0),
  payment_method text NOT NULL CHECK (payment_method IN ('pix','credit_card','cash','boleto')),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(tenant_id,appointment_id) REFERENCES public.appointments(tenant_id,id)
);
CREATE INDEX financial_transactions_date_idx ON public.financial_transactions(tenant_id,transaction_date);
CREATE TABLE public.automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  name text NOT NULL, description text, trigger text NOT NULL,
  actions text[] NOT NULL, active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.crm_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  tutor_id uuid, channel text NOT NULL CHECK (channel IN ('whatsapp','email','internal')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id,id),
  FOREIGN KEY(tenant_id,tutor_id) REFERENCES public.tutors(tenant_id,id)
);
CREATE TABLE public.crm_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  conversation_id uuid NOT NULL, direction text NOT NULL CHECK (direction IN ('incoming','outgoing')),
  body text NOT NULL, delivery_status text NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending','sent','delivered','read','failed')),
  provider_message_id text, created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(tenant_id,conversation_id) REFERENCES public.crm_conversations(tenant_id,id)
);
CREATE INDEX crm_messages_conversation_idx ON public.crm_messages(tenant_id,conversation_id,created_at);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tenants, public.tenant_memberships FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.tenants, public.tenant_memberships TO authenticated;
GRANT UPDATE(name,location,primary_color) ON public.tenants TO authenticated;
GRANT ALL ON public.tenants, public.tenant_memberships TO service_role;
CREATE POLICY tenant_read ON public.tenants FOR SELECT TO authenticated USING (private.has_tenant_access(id));
CREATE POLICY tenant_edit ON public.tenants FOR UPDATE TO authenticated USING (private.has_tenant_access(id,true,true)) WITH CHECK (private.has_tenant_access(id,true,true));
CREATE POLICY membership_read ON public.tenant_memberships FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()) OR private.has_tenant_access(tenant_id,false,true));

DO $$ DECLARE tbl text; admin_only boolean; BEGIN
  FOREACH tbl IN ARRAY ARRAY['tutors','pets','appointments','pet_weights','medical_records','pet_reminders','pet_documents','inventory','inventory_movements','financial_transactions','automation_rules','crm_conversations','crm_messages'] LOOP
    admin_only := tbl IN ('financial_transactions','automation_rules');
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',tbl);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon, authenticated',tbl);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated',tbl);
    EXECUTE format('GRANT ALL ON public.%I TO service_role',tbl);
    EXECUTE format('CREATE INDEX %I ON public.%I(tenant_id)',tbl || '_tenant_idx',tbl);
    EXECUTE format('CREATE POLICY tenant_select ON public.%I FOR SELECT TO authenticated USING (private.has_tenant_access(tenant_id,false,%L))',tbl,admin_only);
    EXECUTE format('CREATE POLICY tenant_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (private.has_tenant_access(tenant_id,true,%L))',tbl,admin_only);
    EXECUTE format('CREATE POLICY tenant_update ON public.%I FOR UPDATE TO authenticated USING (private.has_tenant_access(tenant_id,true,%L)) WITH CHECK (private.has_tenant_access(tenant_id,true,%L))',tbl,admin_only,admin_only);
    EXECUTE format('CREATE POLICY tenant_delete ON public.%I FOR DELETE TO authenticated USING (private.has_tenant_access(tenant_id,true,%L))',tbl,admin_only);
  END LOOP;
END $$;

-- Somente usuário autenticado com e-mail confirmado cria sua própria clínica.
-- Não aceita tenant_id, permissões, preço ou status enviados pelo navegador.
CREATE FUNCTION public.bootstrap_tenant(p_name text, p_location text DEFAULT '', p_owner_name text DEFAULT '', p_plan text DEFAULT 'Bronze')
RETURNS public.tenants LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE uid uuid := auth.uid(); owner_email text; result public.tenants;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Autenticação necessária' USING ERRCODE = '42501'; END IF;
  SELECT u.email INTO owner_email FROM auth.users u WHERE u.id = uid AND u.email_confirmed_at IS NOT NULL AND NOT coalesce(u.is_anonymous,false);
  IF owner_email IS NULL THEN RAISE EXCEPTION 'Confirme seu e-mail antes de criar a clínica' USING ERRCODE = '42501'; END IF;
  IF p_plan NOT IN ('Bronze','Silver','Gold') OR p_plan IS NULL THEN RAISE EXCEPTION 'Plano inválido' USING ERRCODE = '22023'; END IF;
  IF p_owner_name IS NULL OR length(p_owner_name) > 255 THEN RAISE EXCEPTION 'Nome do responsável inválido' USING ERRCODE = '22023'; END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(uid::text,0));
  IF EXISTS (SELECT 1 FROM public.tenant_memberships WHERE user_id = uid AND role = 'owner') THEN RAISE EXCEPTION 'Usuário já possui uma clínica'; END IF;
  INSERT INTO public.tenants(name,location,owner_name,owner_email,plan,status,price,renewal_date)
    VALUES(btrim(p_name),p_location,p_owner_name,owner_email,p_plan,'trial',0,current_date + 14) RETURNING * INTO result;
  INSERT INTO public.tenant_memberships(tenant_id,user_id,role) VALUES(result.id,uid,'owner');
  RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.bootstrap_tenant(text,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_tenant(text,text,text,text) TO authenticated;

CREATE TABLE private.schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
REVOKE ALL ON private.schema_migrations FROM PUBLIC, anon, authenticated;
INSERT INTO private.schema_migrations(version) VALUES('202610080001_secure_initial_schema');
COMMIT;
