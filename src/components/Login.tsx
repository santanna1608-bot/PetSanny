import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import logoImg from '../assets/logo.png';
import { 
  Key, 
  Mail, 
  Lock, 
  Database, 
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Building,
  MapPin,
  UserPlus
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login, registerTenant, isMock } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para o fluxo de Novo Cadastro
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [tenantLocation, setTenantLocation] = useState('');
  const [plan, setPlan] = useState<'Bronze' | 'Silver' | 'Gold'>('Silver');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegistering) {
      if (!email || !password || !name || !tenantName || !tenantLocation) {
        setError('Por favor, preencha todos os campos corporativos.');
        return;
      }
      setLoading(true);
      try {
        await registerTenant({
          email,
          password,
          name,
          tenantName,
          tenantLocation,
          plan
        });
      } catch (err: any) {
        setError(err.message || 'Erro ao cadastrar sua clínica. Tente novamente.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!email || !password) {
        setError('Por favor, preencha todos os campos.');
        return;
      }

      setLoading(true);
      try {
        await login(email, password);
      } catch (err: any) {
        setError(err.message || 'Erro ao realizar login. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFillCredentials = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('123456');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-olive-100/40 dark:bg-olive-900/10 blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-terracotta-100/30 dark:bg-terracotta-900/10 blur-3xl -z-10" />

      {/* Card Principal de Login */}
      <div className="w-full max-w-md bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-2xl p-8 space-y-6 transition-all duration-300 hover:shadow-stone-300 dark:hover:shadow-stone-950">
        
        {/* Logotipo e Cabeçalho */}
        <div className="flex flex-col items-center text-center space-y-3">
          <img 
            src={logoImg} 
            alt="PetSanny Logo" 
            className="w-16 h-16 rounded-2xl object-contain shadow-lg shadow-stone-200/50 dark:shadow-stone-950/50" 
          />
          <div>
            <h1 className="text-2xl font-black text-stone-850 dark:text-stone-100 font-sans tracking-tight leading-none mt-2">
              PetSanny
            </h1>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-widest mt-1 block">
              Multi-Tenant SaaS App
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-[280px]">
            {isRegistering 
              ? 'Preencha os dados abaixo para cadastrar sua clínica e iniciar seu período de teste grátis.' 
              : 'Gerencie os agendamentos da sua clínica veterinária ou petshop com segurança absoluta.'}
          </p>
        </div>

        {/* Badge de Modo de Conexão */}
        {isMock && (
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 transition-colors">
              <Database className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Modo de Conexão: Simulação (Demo)</span>
            </div>
          </div>
        )}

        {/* Mensagem de Erro */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-rose-850 dark:text-rose-300 rounded-2xl text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-455 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegistering && (
            <>
              {/* Nome do Gestor */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider">
                  Seu nome completo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dra. Juliana"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="peer w-full bg-stone-50 dark:bg-stone-955 text-stone-900 dark:text-stone-50 text-xs rounded-xl pl-9 pr-4 py-3 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 outline-none transition-all placeholder:text-stone-400 dark:placeholder:text-stone-550"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-400 peer-focus:text-olive-500 dark:peer-focus:text-olive-400 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Nome da Clínica (Tenant) */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider">
                  Nome da Clínica / Petshop
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: PetCare Tatuapé"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    disabled={loading}
                    className="peer w-full bg-stone-50 dark:bg-stone-955 text-stone-900 dark:text-stone-50 text-xs rounded-xl pl-9 pr-4 py-3 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 outline-none transition-all placeholder:text-stone-400 dark:placeholder:text-stone-550"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-400 peer-focus:text-olive-500 dark:peer-focus:text-olive-400 transition-colors">
                    <Building className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Localização da Clínica */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider">
                  Localização / Endereço
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Rua Tuiuti, 1200 - São Paulo"
                    value={tenantLocation}
                    onChange={(e) => setTenantLocation(e.target.value)}
                    disabled={loading}
                    className="peer w-full bg-stone-50 dark:bg-stone-955 text-stone-900 dark:text-stone-50 text-xs rounded-xl pl-9 pr-4 py-3 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 outline-none transition-all placeholder:text-stone-400 dark:placeholder:text-stone-550"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-400 peer-focus:text-olive-500 dark:peer-focus:text-olive-400 transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Escolha do Plano */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider mb-1">
                  Plano Inicial (14 dias grátis)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Bronze', 'Silver', 'Gold'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlan(p)}
                      className={`p-2 rounded-xl text-center border transition-all cursor-pointer font-bold text-[10px] ${
                        plan === p
                          ? 'bg-olive-50 dark:bg-olive-950/20 border-olive-550 text-olive-850 dark:text-olive-300 shadow-sm'
                          : 'bg-stone-50 dark:bg-stone-955 border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-450 hover:border-stone-300 dark:hover:border-stone-700'
                      }`}
                    >
                      <div>{p}</div>
                      <div className="text-[7.5px] font-normal text-stone-450 dark:text-stone-500 mt-0.5">
                        {p === 'Gold' ? 'R$ 299/m' : p === 'Silver' ? 'R$ 199/m' : 'R$ 149/m'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* E-mail */}
          <div className="space-y-1.5">
            <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider">
              {isRegistering ? 'E-mail corporativo de acesso' : 'E-mail corporativo'}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="nome@clinica.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="peer w-full bg-stone-50 dark:bg-stone-955 text-stone-900 dark:text-stone-50 text-xs rounded-xl pl-9 pr-4 py-3 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 outline-none transition-all placeholder:text-stone-400 dark:placeholder:text-stone-550"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-400 peer-focus:text-olive-500 dark:peer-focus:text-olive-400 transition-colors">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-1.5">
            <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider">
              {isRegistering ? 'Crie uma senha de acesso' : 'Senha de acesso'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="peer w-full bg-stone-50 dark:bg-stone-955 text-stone-900 dark:text-stone-50 text-xs rounded-xl pl-9 pr-10 py-3 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 outline-none transition-all font-mono placeholder:text-stone-400 dark:placeholder:text-stone-550"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-400 peer-focus:text-olive-500 dark:peer-focus:text-olive-400 transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 cursor-pointer peer-focus:text-olive-500 dark:peer-focus:text-olive-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-olive-600 hover:bg-olive-750 disabled:bg-olive-400 text-white font-bold text-xs py-3.5 rounded-xl shadow-md shadow-olive-900/10 transition-all cursor-pointer hover:-translate-y-0.5"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isRegistering ? <UserPlus className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                <span>{isRegistering ? 'Registrar e Entrar' : 'Entrar no Painel'}</span>
              </>
            )}
          </button>
        </form>

        {/* Link de alternância */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
            }}
            className="text-xs text-olive-650 hover:text-olive-850 dark:text-olive-400 dark:hover:text-olive-300 font-bold hover:underline cursor-pointer transition-colors"
          >
            {isRegistering 
              ? 'Já possui uma clínica cadastrada? Faça Login' 
              : 'Não tem conta? Cadastre sua clínica (14 dias grátis)'}
          </button>
        </div>

        {/* Dicas / Contas de Teste (Sempre visível no modo demo) */}
        {isMock && !isRegistering && (
          <div className="pt-4 border-t border-stone-150 dark:border-stone-850 space-y-2">
            <span className="text-[10px] text-stone-450 dark:text-stone-500 font-bold uppercase tracking-wider block text-center">
              Acesso Rápido para Teste (Demo)
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-[9px]">
              <button
                type="button"
                onClick={() => handleFillCredentials('matriz@petsanny.com')}
                className="p-2 bg-stone-50 dark:bg-stone-950 hover:bg-olive-50/50 dark:hover:bg-olive-950/20 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-650 dark:text-stone-450 hover:text-olive-800 dark:hover:text-olive-300 transition-all text-left font-medium cursor-pointer truncate"
              >
                <strong>Matriz Centro</strong>
                <span className="block text-[7px] text-stone-400 dark:text-stone-500 font-mono mt-0.5 truncate font-bold">matriz@petsanny.com</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillCredentials('filial@petsanny.com')}
                className="p-2 bg-stone-50 dark:bg-stone-950 hover:bg-terracotta-50/40 dark:hover:bg-terracotta-950/20 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-650 dark:text-stone-450 hover:text-terracotta-850 dark:hover:text-terracotta-300 transition-all text-left font-medium cursor-pointer truncate"
              >
                <strong>Filial Jardins</strong>
                <span className="block text-[7px] text-stone-400 dark:text-stone-500 font-mono mt-0.5 truncate font-bold">filial@petsanny.com</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillCredentials('superadmin@petsanny.com')}
                className="p-2 bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950 border border-amber-200 dark:border-amber-900/50 hover:border-amber-400 dark:hover:border-amber-800 rounded-xl text-amber-900 dark:text-amber-300 transition-all text-left font-medium cursor-pointer truncate"
              >
                <strong className="text-amber-850 dark:text-amber-400">⭐ Super Admin</strong>
                <span className="block text-[7px] text-amber-600 dark:text-amber-500 font-mono mt-0.5 truncate font-bold">superadmin@petsanny.com</span>
              </button>
            </div>
            <p className="text-[9px] text-stone-400 dark:text-stone-500 text-center italic mt-1">
              Senha para todas as contas: <code className="font-mono bg-stone-100 dark:bg-stone-950 px-1 py-0.5 rounded text-stone-600 dark:text-stone-400 font-bold">123456</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
