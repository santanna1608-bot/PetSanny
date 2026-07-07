import React from 'react';
import { useAppointments } from '../contexts/AppointmentsContext';
import { ShieldCheck, Database, Key, CheckCircle, Users } from 'lucide-react';

export const DatabaseInfo: React.FC = () => {
  const { isMock } = useAppointments();

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-8 animate-fade-in text-stone-800 dark:text-stone-100">
      {/* Cabeçalho */}
      <div className="border-b border-stone-150 dark:border-stone-800 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-olive-500/10 text-olive-600 dark:text-olive-400">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-extrabold text-stone-850 dark:text-stone-100 font-sans tracking-tight">
            Arquitetura SaaS Multi-Tenant & Segurança RLS
          </h2>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
          Entenda como a segurança e o isolamento dos dados de cada clínica (tenant) funcionam nos bastidores no banco de dados Supabase (PostgreSQL) usando Row Level Security (RLS).
        </p>
      </div>

      {/* Grid de Conceitos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-955 border border-stone-150 dark:border-stone-800 shadow-inner flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-955 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-xs text-stone-850 dark:text-stone-200 uppercase tracking-wider">Isolamento Multi-Tenant</h4>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
            Cada registro de agendamento possui a coluna <code className="bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-300 px-1 py-0.5 rounded text-[10px]">tenant_id</code>. Toda e qualquer consulta ao banco de dados aplica obrigatoriamente esta cláusula de filtro, isolando a Clínica A da Clínica B.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-955 border border-stone-150 dark:border-stone-800 shadow-inner flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-955 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-xs text-stone-850 dark:text-stone-200 uppercase tracking-wider">Row Level Security (RLS)</h4>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
            Em vez de fazer o isolamento no backend da aplicação, o PostgreSQL bloqueia acessos indevidos no próprio banco de dados, servindo como uma camada extra de segurança contra vazamento de dados de clientes.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-955 border border-stone-150 dark:border-stone-800 shadow-inner flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-955 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-xs text-stone-850 dark:text-stone-200 uppercase tracking-wider">Metadados de Auth JWT</h4>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
            Quando um funcionário da clínica faz login, o Supabase anexa seu <code className="bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-300 px-1 py-0.5 rounded text-[10px]">tenant_id</code> ao Token JWT. O banco de dados valida esse JWT de forma nativa e automática em todas as operações.
          </p>
        </div>
      </div>

      {/* RLS Query Demonstration */}
      <div className="bg-stone-900 text-stone-300 rounded-2xl p-6 border border-stone-800 font-mono text-xs overflow-hidden shadow-lg relative">
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-stone-800 text-stone-400 px-3 py-1 rounded-lg text-[10px]">
          <Database className="w-3.5 h-3.5" />
          <span>PostgreSQL RLS Rule</span>
        </div>
        <h4 className="font-bold text-stone-100 text-sm mb-4 font-sans flex items-center gap-2">
          <span>Como a Política RLS é declarada no Supabase:</span>
        </h4>
        <pre className="overflow-x-auto text-[10px] leading-relaxed p-4 bg-stone-950 rounded-xl border border-stone-800/80">
{`-- Cole este trecho no seu Editor SQL do Supabase
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso Restrito por Clínica (Tenant)" ON appointments
  FOR SELECT
  TO authenticated
  USING (
    -- Permite acesso total se o usuário for Super Admin
    ((auth.jwt() -> 'user_metadata' ->> 'is_super_admin')::boolean = true) OR
    -- Caso contrário, restringe ao tenant_id correspondente
    (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid)
  );`}
        </pre>
        <p className="mt-4 text-[10px] text-stone-400 font-sans leading-relaxed">
          🛡️ <strong>Segurança Absoluta:</strong> Mesmo se um hacker tentar consultar os dados via Javascript client sem passar filtros de tenant, o banco de dados filtrará automaticamente os registros baseado no token do usuário, retornando somente o que pertence à sua clínica (ou permitindo acesso completo caso seja o Super Admin do sistema).
        </p>
      </div>

      {/* Tabela de Tenants e Assinaturas no Supabase */}
      <div className="bg-stone-900 text-stone-300 rounded-2xl p-6 border border-stone-800 font-mono text-xs overflow-hidden shadow-lg relative">
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-stone-800 text-stone-400 px-3 py-1 rounded-lg text-[10px]">
          <Database className="w-3.5 h-3.5" />
          <span>PostgreSQL Table & RLS</span>
        </div>
        <h4 className="font-bold text-stone-100 text-sm mb-4 font-sans flex items-center gap-2">
          <span>Modelagem da Tabela de Clientes/Assinaturas (tenants):</span>
        </h4>
        <pre className="overflow-x-auto text-[10px] leading-relaxed p-4 bg-stone-950 rounded-xl border border-stone-800/80">
{`CREATE TABLE tenants (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- 1. Políticas para Clientes comuns (só leem seus próprios dados)
CREATE POLICY "Clientes visualizam apenas o seu próprio tenant" ON tenants
  FOR SELECT TO authenticated USING (
    id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  );

-- 2. Políticas para Super Admin (acesso e edição total)
CREATE POLICY "Super Admin possui controle total sobre os tenants" ON tenants
  FOR ALL TO authenticated USING (
    ((auth.jwt() -> 'user_metadata' ->> 'is_super_admin')::boolean = true)
  );`}
        </pre>
        <p className="mt-4 text-[10px] text-stone-400 font-sans leading-relaxed">
          💼 <strong>Gestão Centralizada de Clientes:</strong> Com esta política RLS, o Super Admin tem permissão para listar e editar as informações de faturamento e planos de todas as clínicas contratantes, enquanto as clínicas comuns conseguem apenas ler seus próprios dados de assinatura ao consultar o endpoint `/tenants`.
        </p>
      </div>

      {/* Como conectar ao Supabase real */}
      <div className="p-6 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/20 flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="p-3 bg-white dark:bg-stone-900 rounded-xl shadow-sm shrink-0 border border-stone-150 dark:border-stone-800">
          <Database className="w-6 h-6 text-olive-600 dark:text-olive-400" />
        </div>
        <div className="space-y-2 flex-1">
          <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">Conectando o MVP ao seu Supabase Real</h4>
          <p className="text-[11px] text-stone-550 dark:text-stone-400 leading-relaxed">
            Atualmente o sistema está em <strong>{isMock ? 'Modo de Demonstração (Fallback Local)' : 'Modo Conectado (Supabase Real)'}</strong>.
            Para conectar e testar o multi-tenant real com persistência no Supabase, crie o arquivo <code className="bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-300 px-1 py-0.5 rounded text-[10px] font-mono">.env.local</code> na raiz do projeto com as chaves reais:
          </p>
          <div className="bg-stone-100 dark:bg-stone-950 p-3 rounded-lg border border-stone-200/80 dark:border-stone-800 font-mono text-[9px] text-stone-700 dark:text-stone-300 w-fit select-all">
            VITE_SUPABASE_URL=https://seuid-suaurl.supabase.co<br />
            VITE_SUPABASE_ANON_KEY=sua-chave-anonima-jwt
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold pt-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>O client do PetSanny já possui a lógica de reconectar automaticamente ao detectar as variáveis.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
