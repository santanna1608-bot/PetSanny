-- Script SQL para Configuração do Banco de Dados no Supabase
-- Cole este script no painel de SQL Editor do seu projeto Supabase

-- 1. Criação da Tabela de Agendamentos (Appointments)
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, -- Identificador único da Clínica/Petshop (Multi-Tenant)
  tutor_name VARCHAR(255) NOT NULL,
  pet_name VARCHAR(255) NOT NULL,
  pet_species VARCHAR(255) NOT NULL,
  tutor_email VARCHAR(255) NOT NULL,
  service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('vet', 'aesthetic')),
  service_name VARCHAR(255) NOT NULL,
  professional_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed')),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  critical_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Índices para Otimização de Consultas por Tenant e Data
CREATE INDEX idx_appointments_tenant ON appointments(tenant_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- 3. Habilitando Segurança em Nível de Linha (Row Level Security - RLS)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 4. Criação de Políticas de Segurança Multi-Tenant baseadas nos metadados do JWT do Supabase Auth
-- Esta política garante que a Clínica A (com tenant_id X) só possa ver/criar registros que tenham o mesmo tenant_id X.
-- Os administradores das clínicas devem ter o 'tenant_id' configurado no 'raw_user_meta_data' de seus usuários do Supabase Auth.

-- Política para Leitura (Select)
CREATE POLICY "Clínicas só visualizam seus próprios agendamentos" ON appointments
  FOR SELECT
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata' ->> 'is_super_admin')::boolean = true) OR
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );

-- Política para Inserção (Insert)
CREATE POLICY "Clínicas só inserem agendamentos para si mesmas" ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    ((auth.jwt() -> 'user_metadata' ->> 'is_super_admin')::boolean = true) OR
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );

-- Política para Atualização (Update)
CREATE POLICY "Clínicas só editam seus próprios agendamentos" ON appointments
  FOR UPDATE
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata' ->> 'is_super_admin')::boolean = true) OR
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  )
  WITH CHECK (
    ((auth.jwt() -> 'user_metadata' ->> 'is_super_admin')::boolean = true) OR
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );

-- Política para Exclusão (Delete)
CREATE POLICY "Clínicas só excluem seus próprios agendamentos" ON appointments
  FOR DELETE
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata' ->> 'is_super_admin')::boolean = true) OR
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );

-- 5. Criação da Tabela de Tutores (tutors)
CREATE TABLE tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, -- Identificador único da Clínica/Petshop (Multi-Tenant)
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices e RLS para tutors
CREATE INDEX idx_tutors_tenant ON tutors(tenant_id);
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clínicas só visualizam seus próprios tutores" ON tutors
  FOR SELECT
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata' ->> 'is_super_admin')::boolean = true) OR
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );

CREATE POLICY "Clínicas só inserem tutores para si mesmas" ON tutors
  FOR INSERT
  TO authenticated
  WITH CHECK (
    ((auth.jwt() -> 'user_metadata' ->> 'is_super_admin')::boolean = true) OR
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );

CREATE POLICY "Clínicas só editam seus próprios tutores" ON tutors
  FOR UPDATE
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata' ->> 'is_super_admin')::boolean = true) OR
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  )
  WITH CHECK (
    ((auth.jwt() -> 'user_metadata' ->> 'is_super_admin')::boolean = true) OR
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );

CREATE POLICY "Clínicas só excluem seus próprios tutores" ON tutors
  FOR DELETE
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata' ->> 'is_super_admin')::boolean = true) OR
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );


-- 6. Criação da Tabela de Pets (pets)
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, -- Identificador único da Clínica/Petshop (Multi-Tenant)
  tutor_id UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  species VARCHAR(255) NOT NULL,
  breed VARCHAR(255),
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices e RLS para pets
CREATE INDEX idx_pets_tenant ON pets(tenant_id);
CREATE INDEX idx_pets_tutor ON pets(tutor_id);
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clínicas só visualizam seus próprios pets" ON pets
  FOR SELECT
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata' ->> 'is_super_admin')::boolean = true) OR
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );

CREATE POLICY "Clínicas só inserem pets para si mesmas" ON pets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    ((auth.jwt() -> 'user_metadata' ->> 'is_super_admin')::boolean = true) OR
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );

CREATE POLICY "Clínicas só editam seus próprios pets" ON pets
  FOR UPDATE
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata' ->> 'is_super_admin')::boolean = true) OR
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  )
  WITH CHECK (
    ((auth.jwt() -> 'user_metadata' ->> 'is_super_admin')::boolean = true) OR
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );

CREATE POLICY "Clínicas só excluem seus próprios pets" ON pets
  FOR DELETE
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata' ->> 'is_super_admin')::boolean = true) OR
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );


-- 7. Criação da Tabela de Clientes/Assinaturas (tenants)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  primary_color VARCHAR(50) DEFAULT 'olive',
  plan VARCHAR(50) CHECK (plan IN ('Bronze', 'Silver', 'Gold')),
  status VARCHAR(50) DEFAULT 'trial' CHECK (status IN ('active', 'trial', 'suspended', 'canceled')),
  price DECIMAL(10, 2) DEFAULT 0,
  renewal_date DATE,
  payment_method VARCHAR(50),
  owner_name VARCHAR(255),
  owner_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitando Segurança em Nível de Linha (RLS) para tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Política para leitura de clientes normais (só visualizam a própria clínica)
CREATE POLICY "Clientes visualizam apenas o seu próprio tenant" ON tenants
  FOR SELECT
  TO authenticated
  USING (
    id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );

-- Políticas para Super Admin (controle total sobre a gestão de assinantes)
CREATE POLICY "Super Admin possui controle total sobre os tenants" ON tenants
  FOR ALL
  TO authenticated
  USING (
    ((auth.jwt() -> 'user_metadata' ->> 'is_super_admin')::boolean = true)
  );

-- Política para permitir que novos cadastros criem seus tenants de forma pública
CREATE POLICY "Permite inserção pública de tenants no cadastro" ON tenants
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);


-- ========================================================
-- 8. EXTENSÕES PARA O PETSANNY 2.0 (MÓDULOS PREMIUM)
-- ========================================================

-- Tabela de Histórico de Peso dos Pets
CREATE TABLE IF NOT EXISTS pet_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  weight DECIMAL(5, 2) NOT NULL,
  recorded_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Prontuários Médicos & Estéticos (medical_records)
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  record_type VARCHAR(50) NOT NULL CHECK (record_type IN ('consultation', 'vaccine', 'medication', 'exam', 'surgery', 'grooming', 'observation')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  professional VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Lembretes dos Pets (reminders)
CREATE TABLE IF NOT EXISTS pet_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  reminder_date DATE NOT NULL,
  reminder_type VARCHAR(50) NOT NULL CHECK (reminder_type IN ('vaccine', 'medication', 'exam', 'grooming')),
  done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Documentos / Laudos dos Pets (documents)
CREATE TABLE IF NOT EXISTS pet_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  document_date DATE NOT NULL,
  size VARCHAR(50) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Insumos & Estoque (inventory)
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('medicine', 'vaccine', 'product', 'shampoo', 'equipment')),
  provider VARCHAR(255),
  batch VARCHAR(100),
  barcode VARCHAR(100),
  qty INTEGER NOT NULL DEFAULT 0,
  min_qty INTEGER NOT NULL DEFAULT 5,
  max_qty INTEGER NOT NULL DEFAULT 100,
  expiry_date DATE,
  buy_price DECIMAL(10, 2) DEFAULT 0.00,
  sell_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Transações Financeiras (financial_transactions)
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  transaction_date DATE NOT NULL,
  description VARCHAR(255) NOT NULL,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('revenue', 'expense')),
  category VARCHAR(100) NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('pix', 'credit_card', 'cash', 'boleto')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Automações Configuradas (automation_rules)
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger VARCHAR(255) NOT NULL,
  actions TEXT[] NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar coluna de estágio do CRM (crm_stage) na tabela de Tutores
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS crm_stage VARCHAR(50) DEFAULT 'lead';

-- Habilitar RLS para todas as tabelas novas
ALTER TABLE pet_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para novas tabelas (Multi-Tenant)
CREATE POLICY "RLS Select para pet_weights" ON pet_weights FOR SELECT TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
CREATE POLICY "RLS Insert para pet_weights" ON pet_weights FOR INSERT TO authenticated WITH CHECK (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
CREATE POLICY "RLS Update para pet_weights" ON pet_weights FOR UPDATE TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
CREATE POLICY "RLS Delete para pet_weights" ON pet_weights FOR DELETE TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY "RLS Select para medical_records" ON medical_records FOR SELECT TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
CREATE POLICY "RLS Insert para medical_records" ON medical_records FOR INSERT TO authenticated WITH CHECK (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
CREATE POLICY "RLS Update para medical_records" ON medical_records FOR UPDATE TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
CREATE POLICY "RLS Delete para medical_records" ON medical_records FOR DELETE TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY "RLS Select para pet_reminders" ON pet_reminders FOR SELECT TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
CREATE POLICY "RLS Insert para pet_reminders" ON pet_reminders FOR INSERT TO authenticated WITH CHECK (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
CREATE POLICY "RLS Update para pet_reminders" ON pet_reminders FOR UPDATE TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
CREATE POLICY "RLS Delete para pet_reminders" ON pet_reminders FOR DELETE TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY "RLS Select para pet_documents" ON pet_documents FOR SELECT TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
CREATE POLICY "RLS Insert para pet_documents" ON pet_documents FOR INSERT TO authenticated WITH CHECK (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
CREATE POLICY "RLS Update para pet_documents" ON pet_documents FOR UPDATE TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
CREATE POLICY "RLS Delete para pet_documents" ON pet_documents FOR DELETE TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY "RLS Select para inventory" ON inventory FOR SELECT TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
CREATE POLICY "RLS Insert para inventory" ON inventory FOR INSERT TO authenticated WITH CHECK (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
CREATE POLICY "RLS Update para inventory" ON inventory FOR UPDATE TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
CREATE POLICY "RLS Delete para inventory" ON inventory FOR DELETE TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY "RLS Select para financial_transactions" ON financial_transactions FOR SELECT TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
CREATE POLICY "RLS Insert para financial_transactions" ON financial_transactions FOR INSERT TO authenticated WITH CHECK (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
CREATE POLICY "RLS Update para financial_transactions" ON financial_transactions FOR UPDATE TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
CREATE POLICY "RLS Delete para financial_transactions" ON financial_transactions FOR DELETE TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY "RLS Select para automation_rules" ON automation_rules FOR SELECT TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
CREATE POLICY "RLS Insert para automation_rules" ON automation_rules FOR INSERT TO authenticated WITH CHECK (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
CREATE POLICY "RLS Update para automation_rules" ON automation_rules FOR UPDATE TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
CREATE POLICY "RLS Delete para automation_rules" ON automation_rules FOR DELETE TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
