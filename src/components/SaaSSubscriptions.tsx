import React, { useState } from 'react';
import { useAppointments, type Tenant } from '../contexts/AppointmentsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  Edit3, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search,
  Sliders,
  X,
  Trash2
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const SaaSSubscriptions: React.FC = () => {
  const { tenants, updateTenantSubscription, deleteTenantSubscription, addToast, setCurrentTenant } = useAppointments();
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

  // Estados do formulário de edição
  const [editPlan, setEditPlan] = useState<'Bronze' | 'Silver' | 'Gold'>('Silver');
  const [editStatus, setEditStatus] = useState<'active' | 'trial' | 'suspended' | 'canceled'>('trial');
  const [editPrice, setEditPrice] = useState(0);
  const [editRenewalDate, setEditRenewalDate] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState<'credit_card' | 'pix' | 'boleto'>('pix');

  // Cálculos de Métricas
  const activeTenants = tenants.filter(t => t.status === 'active');
  const trialTenants = tenants.filter(t => t.status === 'trial');
  
  const mrr = activeTenants.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const avgTicket = activeTenants.length > 0 ? mrr / activeTenants.length : 0;

  // Filtragem de Tenants
  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setEditPlan(tenant.plan || 'Silver');
    setEditStatus(tenant.status || 'trial');
    setEditPrice(tenant.price || 0);
    setEditRenewalDate(tenant.renewalDate || '');
    setEditPaymentMethod(tenant.paymentMethod || 'pix');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    updateTenantSubscription(editingTenant.id, {
      plan: editPlan,
      status: editStatus,
      price: editPrice,
      renewalDate: editRenewalDate,
      paymentMethod: editPaymentMethod
    });

    setEditingTenant(null);
  };

  const handleSendBillingAlert = (tenant: Tenant) => {
    addToast(
      t('saas.toast_billing_title'),
      t('saas.toast_billing_desc').replace('{email}', tenant.ownerEmail || '-'),
      'info'
    );
  };

  const handleImpersonateTenant = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    addToast(
      t('saas.toast_impersonate_title'),
      t('saas.toast_impersonate_desc').replace('{name}', tenant.name),
      'success'
    );
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1 w-fit bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-250 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-450" />
            {t('status.active')}
          </span>
        );
      case 'trial':
        return (
          <span className="flex items-center gap-1 w-fit bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-800 dark:text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-450" />
            {t('status.trial')}
          </span>
        );
      case 'suspended':
        return (
          <span className="flex items-center gap-1 w-fit bg-amber-50 dark:bg-amber-950/40 border border-amber-250 dark:border-amber-900/50 text-amber-800 dark:text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-450" />
            {t('status.suspended')}
          </span>
        );
      case 'canceled':
        return (
          <span className="flex items-center gap-1 w-fit bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/50 text-rose-850 dark:text-rose-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-455" />
            {t('status.canceled')}
          </span>
        );
      default:
        return null;
    }
  };

  const getPaymentMethodLabel = (method?: string) => {
    switch (method) {
      case 'credit_card': return t('payment.credit_card');
      case 'pix': return t('payment.pix');
      case 'boleto': return t('payment.boleto');
      default: return t('payment.not_informed');
    }
  };

  const getPlanStyle = (plan?: string) => {
    switch (plan) {
      case 'Gold': return 'bg-amber-500/10 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border-amber-500/30 dark:border-amber-900/40';
      case 'Silver': return 'bg-stone-100 dark:bg-stone-955 text-stone-750 dark:text-stone-300 border-stone-300 dark:border-stone-800';
      case 'Bronze': return 'bg-orange-500/10 dark:bg-orange-955 text-orange-850 dark:text-orange-400 border-orange-500/30 dark:border-orange-900/40';
      default: return 'bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-450 border-stone-200 dark:border-stone-850';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-stone-800 dark:text-stone-100 font-sans">
      
      {/* Cards de Métricas SaaS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1: MRR */}
        <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/85 dark:border-stone-800 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider block">{t('dashboard.mrr')}</span>
            <h3 className="text-2xl font-black text-stone-850 dark:text-stone-100">
              R$ {mrr.toLocaleString(language === 'en' ? 'en-US' : (language === 'es' ? 'es-ES' : 'pt-BR'), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold mt-0.5">{t('dashboard.mrr_sub')}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-450 shadow-inner">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Clientes Ativos */}
        <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/85 dark:border-stone-800 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider block">{t('dashboard.active_clients')}</span>
            <h3 className="text-2xl font-black text-stone-850 dark:text-stone-100">{activeTenants.length} {t('dashboard.clinics')}</h3>
            <p className="text-[10px] text-stone-450 dark:text-stone-400 mt-0.5">{t('dashboard.active_clients_sub')}</p>
          </div>
          <div className="w-12 h-12 bg-olive-50 dark:bg-olive-950/40 rounded-2xl flex items-center justify-center text-olive-650 dark:text-olive-400 shadow-inner">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Clientes em Trial */}
        <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/85 dark:border-stone-800 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider block">{t('dashboard.trial_clients')}</span>
            <h3 className="text-2xl font-black text-stone-850 dark:text-stone-100">{trialTenants.length} {t('dashboard.trials')}</h3>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{t('dashboard.trial_clients_sub')}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Ticket Médio */}
        <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/85 dark:border-stone-800 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider block">{t('dashboard.arpu')}</span>
            <h3 className="text-2xl font-black text-stone-850 dark:text-stone-100">
              R$ {avgTicket.toLocaleString(language === 'en' ? 'en-US' : (language === 'es' ? 'es-ES' : 'pt-BR'), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-stone-450 dark:text-stone-400 mt-0.5">{t('dashboard.arpu_sub')}</p>
          </div>
          <div className="w-12 h-12 bg-stone-100 dark:bg-stone-950 rounded-2xl flex items-center justify-center text-stone-600 dark:text-stone-400 shadow-inner">
            <Sliders className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabela de Gerenciamento de Assinaturas */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        {/* Header da Tabela com Busca */}
        <div className="p-6 border-b border-stone-150 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-stone-850 dark:text-stone-100 leading-tight">{t('saas.title')}</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{t('saas.subtitle')}</p>
          </div>
          
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder={t('saas.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-955 text-stone-850 dark:text-stone-100 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 outline-none transition-all shadow-inner"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-950 border-b border-stone-150 dark:border-stone-800 text-[10px] text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider">
                <th className="px-6 py-4">{t('saas.th_clinic')}</th>
                <th className="px-6 py-4">{t('saas.th_owner')}</th>
                <th className="px-6 py-4 text-center">{t('saas.th_plan')}</th>
                <th className="px-6 py-4 text-right">{t('saas.th_price')}</th>
                <th className="px-6 py-4 text-center">{t('saas.th_payment')}</th>
                <th className="px-6 py-4">{t('saas.th_renewal')}</th>
                <th className="px-6 py-4">{t('saas.th_status')}</th>
                <th className="px-6 py-4 text-right">{t('saas.th_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-150 dark:divide-stone-800 text-xs text-stone-700 dark:text-stone-300">
              {filteredTenants.length > 0 ? (
                filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-950/20 transition-colors">
                    {/* Clínica */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-stone-850 dark:text-stone-100">{tenant.name}</div>
                      <div className="text-[10px] text-stone-450 dark:text-stone-500 font-medium truncate mt-0.5 max-w-[200px]">
                        {tenant.location}
                      </div>
                    </td>
                    
                    {/* Proprietário */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-stone-800 dark:text-stone-200">{tenant.ownerName || 'Não cadastrado'}</div>
                      <div className="text-[10px] text-stone-450 dark:text-stone-550 font-mono mt-0.5">{tenant.ownerEmail || '-'}</div>
                    </td>
                    
                    {/* Plano */}
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black border uppercase tracking-wider ${getPlanStyle(tenant.plan)}`}>
                        {tenant.plan || 'Nenhum'}
                      </span>
                    </td>
                    
                    {/* Preço */}
                    <td className="px-6 py-4 text-right font-extrabold text-stone-850 dark:text-stone-100">
                      R$ {(tenant.price || 0).toLocaleString(language === 'en' ? 'en-US' : (language === 'es' ? 'es-ES' : 'pt-BR'), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    
                    {/* Pagamento */}
                    <td className="px-6 py-4 text-center font-medium">
                      {getPaymentMethodLabel(tenant.paymentMethod)}
                    </td>
                    
                    {/* Renovação */}
                    <td className="px-6 py-4 font-mono font-medium">
                      {tenant.renewalDate ? new Date(tenant.renewalDate + 'T00:00:00').toLocaleDateString(language === 'en' ? 'en-US' : (language === 'es' ? 'es-ES' : 'pt-BR')) : '-'}
                    </td>
                    
                    {/* Status */}
                    <td className="px-6 py-4">
                      {getStatusBadge(tenant.status)}
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleImpersonateTenant(tenant)}
                          title={t('saas.impersonate_title')}
                          className="p-1.5 hover:bg-olive-50 dark:hover:bg-olive-950/20 text-olive-650 hover:text-olive-850 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-olive-200"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSendBillingAlert(tenant)}
                          title={t('saas.billing_alert_title')}
                          className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-950 text-stone-500 hover:text-stone-750 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-stone-200 dark:hover:border-stone-800"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(tenant)}
                          title={t('saas.edit_title')}
                          className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-955 text-stone-700 hover:text-stone-900 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-stone-200 dark:hover:border-stone-800"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setTenantToDelete(tenant);
                            setDeleteModalOpen(true);
                          }}
                          title={t('saas.delete_title')}
                          className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-955/35 text-rose-650 hover:text-rose-850 dark:hover:text-rose-455 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-stone-450 font-medium italic">
                    {t('saas.no_results')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edição de Assinatura */}
      {editingTenant && (
        <div className="fixed inset-0 bg-stone-900/60 dark:bg-stone-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-850 shadow-2xl w-full max-w-md p-6 relative animate-scale-up space-y-6">
            {/* Fechar */}
            <button
              onClick={() => setEditingTenant(null)}
              className="absolute top-4 right-4 text-stone-450 hover:text-stone-750 p-1 hover:bg-stone-100 dark:hover:bg-stone-950 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Cabeçalho */}
            <div>
              <h3 className="text-base font-extrabold text-stone-850 dark:text-stone-100">{t('saas.modal_edit_title')}</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{t('saas.modal_edit_clinic')}: <span className="font-bold text-stone-700 dark:text-stone-300">{editingTenant.name}</span></p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Plano */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider">
                    {t('saas.plan_label')}
                  </label>
                  <select
                    value={editPlan}
                    onChange={(e) => {
                      const newPlan = e.target.value as any;
                      setEditPlan(newPlan);
                      if (newPlan === 'Gold') {
                        setEditPrice(97.00);
                      } else if (newPlan === 'Silver') {
                        setEditPrice(199.90);
                      } else if (newPlan === 'Bronze') {
                        setEditPrice(149.90);
                      }
                    }}
                    className="w-full bg-stone-50 dark:bg-stone-955 text-stone-850 dark:text-stone-100 text-xs rounded-xl p-2.5 border border-stone-250 dark:border-stone-800 outline-none cursor-pointer"
                  >
                    <option value="Gold">Assinatura PetSanny (R$ 97,00{t('landing.pricing.per_month')})</option>
                    <option value="Silver">Silver (R$ 199,90{t('landing.pricing.per_month')})</option>
                    <option value="Bronze">Bronze (R$ 149,90{t('landing.pricing.per_month')})</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider">
                    {t('saas.status_label')}
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-stone-50 dark:bg-stone-955 text-stone-850 dark:text-stone-100 text-xs rounded-xl p-2.5 border border-stone-250 dark:border-stone-800 outline-none cursor-pointer"
                  >
                    <option value="active">{t('status.active')}</option>
                    <option value="trial">{t('status.trial')}</option>
                    <option value="suspended">{t('status.suspended')}</option>
                    <option value="canceled">{t('status.canceled')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Preço customizado */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider">
                    {t('saas.price_label')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-stone-50 dark:bg-stone-955 text-stone-850 dark:text-stone-100 text-xs rounded-xl p-2.5 border border-stone-250 dark:border-stone-800 outline-none focus:bg-white dark:focus:bg-stone-900 focus:border-olive-500 transition-all font-semibold"
                  />
                </div>

                {/* Método de pagamento */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider">
                    {t('saas.payment_label')}
                  </label>
                  <select
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value as any)}
                    className="w-full bg-stone-50 dark:bg-stone-955 text-stone-850 dark:text-stone-100 text-xs rounded-xl p-2.5 border border-stone-250 dark:border-stone-800 outline-none cursor-pointer"
                  >
                    <option value="credit_card">{t('payment.credit_card')}</option>
                    <option value="pix">{t('payment.pix')}</option>
                    <option value="boleto">{t('payment.boleto')}</option>
                  </select>
                </div>
              </div>

              {/* Data de Renovação */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider">
                  {t('saas.renewal_label')}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={editRenewalDate}
                    onChange={(e) => setEditRenewalDate(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-955 text-stone-850 dark:text-stone-100 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-stone-250 dark:border-stone-800 outline-none focus:bg-white dark:focus:bg-stone-900 focus:border-olive-500 transition-all font-mono"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-450">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Ações do Modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-150 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="bg-stone-100 dark:bg-stone-950 text-stone-600 dark:text-stone-400 border border-transparent dark:border-stone-800 hover:bg-stone-200 dark:hover:bg-stone-850 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  {t('modal.cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-olive-600 hover:bg-olive-750 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md shadow-olive-900/10 transition-colors"
                >
                  {t('saas.confirm_changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação Customizado para Deletar Assinatura */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title={t('saas.delete_confirm_title')}
        message={t('saas.delete_confirm_msg').replace('{name}', tenantToDelete?.name || '')}
        confirmText={t('saas.delete_title').split(' ')[0]}
        cancelText={t('modal.cancel')}
        onConfirm={() => {
          if (tenantToDelete) {
            deleteTenantSubscription(tenantToDelete.id);
          }
        }}
        onClose={() => {
          setDeleteModalOpen(false);
          setTenantToDelete(null);
        }}
        isDanger={true}
      />
    </div>
  );
};
