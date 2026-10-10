import { useEffect, useState } from 'react';
import { Building2, CreditCard, Plug, LayoutDashboard, RefreshCw, LogOut, Search, ShieldCheck, Settings as SettingsIcon } from 'lucide-react';
import { Settings, renderAvatarHelper } from './Settings';
import { useAuth } from '../contexts/AuthContext';
import { requireSupabase } from '../lib/supabaseClient';
interface Clinic {
    id: string;
    name: string;
    plan: string;
    status: string;
    owner_name: string;
    owner_email: string;
    price: number;
    renewal_date: string | null;
    created_at: string;
    location: string;
}
interface Order {
    id: string;
    tenant_id: string;
    plan_id: string;
    amount: number;
    status: string;
    environment: string;
    created_at: string;
}
interface Connection {
    id: string;
    tenant_id: string;
    display_name: string;
    provider: string;
    channel: string;
    status: string;
    last_verified_at: string | null;
}
interface Readiness {
    environment: string;
    asaasKey: boolean;
    databaseKey: boolean;
    webhookToken: boolean;
}
const money = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const date = (v: string | null) => v ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short' }).format(new Date(v.length === 10 ? v + 'T12:00:00Z' : v)) : '—';
const labels: Record<string, string> = { active: 'Ativa', trial: 'Teste gratuito', suspended: 'Suspensa', canceled: 'Cancelada', paid: 'Pago', creating: 'Em preparação', expired: 'Expirada', failed: 'Falhou', unknown: 'Requer conferência', not_configured: 'Configuração pendente', connected: 'Conectada', disconnected: 'Desconectada', error: 'Erro' };
const sections = [{ id: 'overview', label: 'Visão geral', icon: LayoutDashboard }, { id: 'clinics', label: 'Clínicas', icon: Building2 }, { id: 'billing', label: 'Pagamentos', icon: CreditCard }, { id: 'connections', label: 'Conexões', icon: Plug }, { id: 'settings', label: 'Configurações', icon: SettingsIcon }];
async function allRows<T>(table: string, fields: string): Promise<T[]> {
    const rows: T[] = [];
    for (let start = 0;; start += 500) {
        const { data, error } = await requireSupabase().from(table).select(fields).order('id').range(start, start + 499);
        if (error)
            throw error;
        rows.push(...data as T[]);
        if (data.length < 500)
            return rows;
    }
}
export function PlatformAdminPanel() {
    const { user, logout } = useAuth();
    const [clinics, setClinics] = useState<Clinic[]>([]), [orders, setOrders] = useState<Order[]>([]), [connections, setConnections] = useState<Connection[]>([]);
    const [section, setSection] = useState('overview'), [search, setSearch] = useState(''), [status, setStatus] = useState('all'), [selected, setSelected] = useState<Clinic | null>(null);
    const [loading, setLoading] = useState(true), [errors, setErrors] = useState<string[]>([]), [revision, setRevision] = useState(0), [updated, setUpdated] = useState(''), [readiness, setReadiness] = useState<Readiness | null>(null), [serverError, setServerError] = useState('');
    useEffect(() => {
        let canceled = false;
        if (!user?.is_super_admin)
            return;
        setLoading(true);
        setErrors([]);
        setReadiness(null);
        setServerError('');
        void (async () => {
            const db = requireSupabase();
            const check = await db.rpc('current_platform_admin');
            if (check.error || check.data !== true) {
                if (!canceled) {
                    setErrors(['Seu acesso administrativo não pôde ser confirmado. Entre novamente.']);
                    setLoading(false);
                    setClinics([]);
                    setOrders([]);
                    setConnections([]);
                }
                return;
            }
            const results = await Promise.allSettled([allRows<Clinic>('tenants', 'id,name,plan,status,owner_name,owner_email,price,renewal_date,created_at,location'), allRows<Order>('billing_orders', 'id,tenant_id,plan_id,amount,status,environment,created_at'), allRows<Connection>('integration_connections', 'id,tenant_id,display_name,provider,channel,status,last_verified_at')]);
            if (canceled)
                return;
            const failures: string[] = [];
            const names = ['clínicas', 'cobranças', 'conexões'];
            results.forEach((r, i) => { if (r.status === 'rejected')
                failures.push('Não foi possível consultar ' + names[i] + '. Atualize para tentar novamente.'); });
            setClinics(results[0].status === 'fulfilled' ? results[0].value : []);
            setOrders(results[1].status === 'fulfilled' ? results[1].value : []);
            setConnections(results[2].status === 'fulfilled' ? results[2].value : []);
            setErrors(failures);
            setUpdated(new Date().toLocaleTimeString('pt-BR'));
            setLoading(false);
            try {
                const session = await db.auth.getSession();
                const response = await fetch('/api/admin-status', { headers: { Authorization: 'Bearer ' + session.data.session?.access_token } });
                if (!response.ok)
                    throw new Error();
                const body = await response.json();
                if (typeof body.asaasKey !== 'boolean')
                    throw new Error();
                if (!canceled)
                    setReadiness(body);
            }
            catch {
                if (!canceled)
                    setServerError('Não foi possível verificar a configuração do servidor. Na prévia local, essa consulta fica disponível após publicar.');
            }
        })().catch(() => { if (!canceled) {
            setLoading(false);
            setErrors(['Não foi possível carregar o painel. Atualize para tentar novamente.']);
        } });
        return () => { canceled = true; };
    }, [user?.id, user?.is_super_admin, revision]);
    if (!user?.is_super_admin)
        return null;
    const clinicName = (id: string) => clinics.find(c => c.id === id)?.name || 'Clínica indisponível';
    const filtered = clinics.filter(c => (status === 'all' || c.status === status) && [c.name, c.owner_name, c.owner_email].some(v => v?.toLowerCase().includes(search.toLowerCase())));
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
    const expired = clinics.filter(c => c.status === 'trial' && c.renewal_date && c.renewal_date < today);
    const panel = 'rounded-2xl border border-stone-200 bg-white p-5';
    const badge = (value: string) => <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold">{labels[value] || value}</span>;
    return <div className="min-h-screen bg-[#f7f7f2] text-stone-900 lg:flex">
 <aside className="bg-[#211f1b] text-white p-6 lg:w-64 lg:min-h-screen lg:shrink-0"><div className="text-2xl font-bold">PetSanny</div><p className="text-xs text-stone-400 mt-1">ADMINISTRAÇÃO GERAL</p><nav className="mt-8 flex flex-wrap gap-2 lg:flex-col">{sections.map(s => <button key={s.id} onClick={() => { setSection(s.id); setSelected(null); }} className={'flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-left ' + (section === s.id ? 'bg-[#526f39]' : 'hover:bg-white/10')}><s.icon size={18}/>{s.label}</button>)}</nav><div className="mt-10 flex gap-3 items-center">{renderAvatarHelper(user.user_metadata.avatar_url)}<div className="min-w-0 text-xs text-stone-400 break-all"><p className="text-white font-semibold">{user.user_metadata.name || "Administrador"}</p>{user.email}</div></div><button className="mt-4 flex gap-2 items-center text-sm" onClick={() => void logout().catch(() => setErrors(['Não foi possível sair. Tente novamente.']))}><LogOut size={16}/>Sair</button></aside>
 <main className="min-w-0 flex-1 p-5 md:p-8"><header className="flex flex-wrap justify-between items-center gap-4 mb-7"><div><p className="text-xs text-[#526f39] font-semibold flex gap-2 items-center"><ShieldCheck size={16}/>ACESSO VALIDADO PELO SERVIDOR</p><h1 className="text-2xl font-bold mt-2">{sections.find(s => s.id === section)?.label}</h1><p className="text-sm text-stone-500 mt-1">Acompanhe a operação do seu SaaS em um só lugar.</p></div><button disabled={loading} onClick={() => setRevision(v => v + 1)} className="flex items-center gap-2 bg-white border rounded-xl px-4 py-3 disabled:opacity-50"><RefreshCw size={16}/>Atualizar</button></header>
 {errors.map(e => <p key={e} role="alert" className="p-4 mb-4 rounded-xl bg-red-50 text-red-800">{e}</p>)}
 {loading ? <p role="status">Carregando dados administrativos…</p> : <>
 {section === 'settings' && <Settings />}
 {section === 'overview' && <><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">{[['Clínicas cadastradas', clinics.length], ['Clínicas ativas', clinics.filter(c => c.status === 'active').length], ['Em teste gratuito', clinics.filter(c => c.status === 'trial').length], ['Receita mensal contratada', money(clinics.filter(c => c.status === 'active').reduce((sum, c) => sum + Number(c.price), 0))]].map(([label, value]) => <div key={label} className={panel}><p className="text-sm text-stone-500">{label}</p><p className="text-3xl font-bold mt-3">{errors.length ? '—' : value}</p></div>)}</div><div className="grid xl:grid-cols-2 gap-5"><section className={panel}><h2 className="font-bold text-lg mb-3">Atenção necessária</h2><p className="py-2">{expired.length} testes gratuitos com prazo encerrado</p><p className="py-2">{orders.filter(o => ['failed', 'unknown'].includes(o.status)).length} cobranças para conferir</p><p className="py-2">{connections.filter(c => c.status !== 'connected').length} conexões das clínicas pendentes ou desconectadas</p><p className="text-xs text-stone-500 mt-4">A receita contratada usa o valor mensal cadastrado. Não representa dinheiro recebido.</p></section><section className={panel}><h2 className="font-bold text-lg mb-3">Cobrança comercial</h2><p>Asaas · {readiness?.environment==='production'?'Produção':'Sandbox'}</p><p className="text-sm text-stone-600 mt-3">Pagamentos de teste não ativam planos comerciais. Cobrança em produção, renovação automática e limites por pacote ainda precisam ser habilitados e validados.</p><button onClick={() => setSection('connections')} className="mt-4 text-[#526f39] font-semibold">Ver configuração das conexões →</button></section></div></>}
 {section === 'clinics' && <section className={panel}><div className="flex flex-wrap gap-3 mb-5"><label className="flex gap-2 items-center border rounded-xl px-3 py-2 flex-1"><Search size={18}/><input aria-label="Buscar clínica ou responsável" placeholder="Buscar clínica, responsável ou e-mail" className="w-full outline-none" value={search} onChange={e => setSearch(e.target.value)}/></label><select aria-label="Filtrar situação da clínica" className="border rounded-xl px-3 py-2" value={status} onChange={e => setStatus(e.target.value)}><option value="all">Todas as situações</option>{['active', 'trial', 'suspended', 'canceled'].map(s => <option key={s} value={s}>{labels[s]}</option>)}</select></div><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="text-stone-500"><tr>{['Clínica / responsável', 'Plano', 'Situação', 'Mensalidade', 'Prazo / renovação', ''].map((s, i) => <th key={i} className="p-3">{s}</th>)}</tr></thead><tbody>{filtered.map(c => <tr key={c.id} className="border-t"><td className="p-3"><strong>{c.name}</strong><p className="text-xs text-stone-500">{c.owner_email || 'Responsável não informado'}</p></td><td className="p-3">{c.plan}</td><td className="p-3">{badge(c.status)}</td><td className="p-3">{money(Number(c.price))}</td><td className="p-3">{date(c.renewal_date)}</td><td className="p-3"><button className="text-[#526f39] font-semibold" onClick={() => setSelected(c)}>Detalhes</button></td></tr>)}</tbody></table></div>{!filtered.length && <p className="py-6">Nenhuma clínica encontrada.</p>}</section>}
 {section === 'billing' && <section className={panel}><h2 className="font-bold text-lg">Histórico Asaas</h2><p className="text-sm text-stone-500 my-3">Somente cobranças registradas no PetSanny. Não inclui cobranças criadas diretamente no Asaas. Cada registro identifica produção ou teste.</p><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead><tr>{['Clínica', 'Plano solicitado', 'Valor', 'Situação', 'Criada em'].map(s => <th key={s} className="p-3">{s}</th>)}</tr></thead><tbody>{[...orders].sort((a, b) => b.created_at.localeCompare(a.created_at)).map(o => <tr key={o.id} className="border-t"><td className="p-3">{clinicName(o.tenant_id)}</td><td className="p-3 capitalize">{o.plan_id}</td><td className="p-3">{money(Number(o.amount))}</td><td className="p-3">{badge(o.status)}<small className="block mt-1">{o.environment==='production'?'Produção':'Teste'}</small></td><td className="p-3">{date(o.created_at)}</td></tr>)}</tbody></table></div>{!orders.length && <p className="py-6">Nenhuma cobrança registrada.</p>}</section>}
 {section === 'connections' && <><section className={panel + ' mb-5'}><h2 className="font-bold text-lg">Conexão da plataforma • Asaas</h2><p className="text-sm text-stone-500 mt-2">A presença das configurações não confirma conexão com o provedor nem entrega de eventos.</p>{readiness ? <div className="grid md:grid-cols-3 gap-3 mt-5">{[['Chave Asaas', readiness.asaasKey], ['Acesso do servidor ao banco', readiness.databaseKey], ['Segredo do webhook', readiness.webhookToken]].map(([label, ok]) => <div className="bg-stone-50 rounded-xl p-4" key={String(label)}><p className="text-sm">{label}</p><p className="font-semibold mt-2">{ok ? 'Configurado' : 'Pendente'}</p></div>)}</div> : <p className="mt-4 text-sm" role="status">{serverError || 'Verificando servidor…'}</p>}<p className="text-sm mt-4">WhatsApp oficial: ativação pendente. E-mail e calendário: integrações futuras.</p></section><section className={panel}><h2 className="font-bold text-lg mb-4">Conexões das clínicas</h2>{connections.map(c => <div key={c.id} className="border-t py-4 flex flex-wrap gap-4 justify-between"><div><strong>{clinicName(c.tenant_id)}</strong><p className="text-sm text-stone-500">{c.display_name} • {c.provider} • {c.channel}</p><p className="text-xs mt-1">Última verificação: {date(c.last_verified_at)}</p></div>{badge(c.status)}</div>)}{!connections.length && <p>Nenhuma conexão cadastrada.</p>}</section></>}
 {selected && <section className={panel + ' mt-5'}><div className="flex justify-between"><h2 className="text-lg font-bold">{selected.name}</h2><button onClick={() => setSelected(null)}>Fechar detalhes</button></div><p className="mt-3">Responsável: {selected.owner_name || 'Não informado'}</p><p className="text-sm mt-2">{selected.owner_email}</p><p className="text-sm mt-2">Endereço: {selected.location || 'Não informado'}</p><p className="text-sm mt-2">Cadastrada em: {date(selected.created_at)}</p><p className="text-sm mt-2">{orders.filter(o => o.tenant_id === selected.id).length} cobranças de teste • {connections.filter(c => c.tenant_id === selected.id).length} conexões cadastradas</p><p className="text-xs text-stone-500 mt-3">Identificador: {selected.id}</p></section>}
 <p className="text-xs text-stone-500 mt-6">Última consulta: {updated}. Os dados são atualizados ao clicar em Atualizar.</p></>}
 </main></div>;
}
