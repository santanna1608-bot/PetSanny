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
