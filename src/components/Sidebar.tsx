import React from 'react';
import { useAppointments } from '../contexts/AppointmentsContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import logoImg from '../assets/logo.png';
import { renderAvatarHelper } from './Settings';
import { 
  LayoutDashboard, 
  Calendar, 
  Building2, 
  LogOut,
  Users,
  CreditCard,
  Settings as SettingsIcon
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentTenant, setCurrentTenant, tenants } = useAppointments();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const isSuperAdmin = !!user?.user_metadata?.is_super_admin;

  const menuItems = [
    { id: 'dashboard', label: t('menu.dashboard'), icon: LayoutDashboard },
    { id: 'agenda', label: t('menu.agenda'), icon: Calendar },
    { id: 'customers', label: t('menu.customers'), icon: Users },
    ...(isSuperAdmin ? [{ id: 'saas', label: t('menu.saas'), icon: CreditCard }] : []),
    { id: 'settings', label: t('menu.settings'), icon: SettingsIcon },
  ];

  return (
    <aside className="w-72 bg-stone-900 text-stone-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-stone-800 shadow-xl z-20">
      <div className="flex flex-col flex-1">
        {/* Header/Logo */}
        <div className="p-6 border-b border-stone-800 flex items-center gap-3">
          <img 
            src={logoImg} 
            alt="PetSanny Logo" 
            className="w-10 h-10 rounded-full object-contain shadow-md shadow-stone-950/50" 
          />
          <div>
            <h1 className="text-lg font-bold text-stone-100 font-sans tracking-tight leading-none">PetSanny</h1>
            <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">{t('sidebar.tagline')}</span>
          </div>
        </div>

        {/* Tenant Selector */}
        {isSuperAdmin ? (
          <div className="p-5 border-b border-stone-800">
            <label className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block mb-2">
              {t('sidebar.tenant_active')}
            </label>
            <div className="relative">
              <select
                value={currentTenant.id}
                onChange={(e) => {
                  const selected = tenants.find(t => t.id === e.target.value);
                  if (selected) setCurrentTenant(selected);
                }}
                className="w-full bg-stone-800 hover:bg-stone-750 text-stone-100 font-medium text-xs rounded-xl p-3 border border-stone-700 outline-none cursor-pointer transition-colors appearance-none pr-8 shadow-inner"
              >
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-stone-400">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <span className="text-[10px] text-stone-400 mt-2 block italic text-center font-medium leading-none">
              📍 {currentTenant.location}
            </span>
          </div>
        ) : (
          <div className="p-5 border-b border-stone-800 bg-stone-950/20">
            <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider block mb-1.5">
              {t('sidebar.tenant_auth')}
            </span>
            <div className="flex items-center gap-2 text-stone-100 font-extrabold text-xs">
              <Building2 className="w-4 h-4 text-olive-500 shrink-0" />
              <span className="truncate">{currentTenant.name}</span>
            </div>
            <span className="text-[10px] text-stone-400 mt-2 block italic leading-none font-medium text-center">
              📍 {currentTenant.location}
            </span>
          </div>
        )}

        {/* Menu Items */}
        <nav className="p-4 flex-1 flex flex-col gap-1.5">
          <span className="text-[9px] text-stone-500 font-bold uppercase tracking-widest px-3 mb-2 block">
            {t('sidebar.navigation')}
          </span>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            // Cor de destaque dependendo do tenant
            const highlightBg = currentTenant.id === 'tenant-clinica-sanny-1' 
              ? 'bg-olive-500/10 text-olive-400 border-l-2 border-olive-500' 
              : 'bg-terracotta-500/10 text-terracotta-400 border-l-2 border-terracotta-500';

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  isActive 
                    ? highlightBg 
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 border-l-2 border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Database / RLS status */}
      <div className="p-5 border-t border-stone-800 bg-stone-950/40 space-y-3">
        {/* Usuário Logado */}
        {user && (
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-955/20 border border-stone-800/40">
            {renderAvatarHelper(user.user_metadata.avatar_url, 'w-9 h-9 text-base')}
            <div className="min-w-0 flex-1 text-[10px] text-stone-400 font-medium">
              <div className="flex items-center justify-between">
                <span className="truncate block font-bold text-stone-250 leading-tight">
                  {user.user_metadata.name || t('sidebar.my_profile')}
                </span>
                {isSuperAdmin && (
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[7px] font-extrabold px-1 py-0.5 rounded uppercase tracking-wider shrink-0 leading-none">
                    Admin
                  </span>
                )}
              </div>
              <span className="text-[9px] text-stone-500 font-mono truncate block mt-0.5">{user.email}</span>
            </div>
          </div>
        )}



        {/* Botão de Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-stone-850 hover:bg-rose-950/30 text-stone-400 hover:text-rose-455 border border-stone-800 hover:border-rose-950/30 font-bold text-[10px] py-2 rounded-xl transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t('menu.logout')}</span>
        </button>

        <div className="text-center pt-1.5">
          <span className="text-[9px] text-stone-600 font-semibold uppercase tracking-wider block">
            PetSanny SaaS v1.0.0
          </span>
        </div>
      </div>
    </aside>
  );
};
