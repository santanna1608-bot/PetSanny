import React, { useState, useEffect } from 'react';
import { useAppointments } from '../contexts/AppointmentsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { tutorsService, petsService } from '../lib/supabaseClient';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Scissors, 
  Stethoscope, 
  Syringe, 
  Activity, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export const DashboardPremium: React.FC = () => {
  const { appointments, currentTenant } = useAppointments();
  const { t, language } = useLanguage();
  
  
  const [loading, setLoading] = useState(true);
  const [tutorCount, setTutorCount] = useState(0);
  const [petCount, setPetCount] = useState(0);

  // Simula o carregamento inicial (Skeleton Loading)
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 700);

    // Carrega estatísticas de tutores e pets
    const fetchStats = async () => {
      try {
        const tutors = await tutorsService.list(currentTenant.id);
        const pets = await petsService.list(currentTenant.id);
        setTutorCount(tutors.length);
        setPetCount(pets.length);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();

    return () => clearTimeout(timer);
  }, [currentTenant]);

  // Processamento de dados reais de agendamento do Tenant Ativo
  const todayStr = new Date().toISOString().split('T')[0];

  const todayApps = appointments.filter(app => app.appointment_date === todayStr);
  const totalPetsScheduledToday = todayApps.length;
  
  // Receita prevista de hoje (todos de hoje)
  const revenueExpectedToday = todayApps.reduce((sum, app) => sum + Number(app.price), 0);

  // Contadores detalhados de hoje
  const todayVet = todayApps.filter(app => app.service_type === 'vet').length;
  
  // Detalhando serviços por palavra-chave para hoje
  const todayBanhos = todayApps.filter(app => app.service_name.toLowerCase().includes('banho')).length;
  const todayTosas = todayApps.filter(app => app.service_name.toLowerCase().includes('tosa')).length;
  const todayVacinas = todayApps.filter(app => app.service_name.toLowerCase().includes('vacina') || app.service_name.toLowerCase().includes('v10') || app.service_name.toLowerCase().includes('antirrábica')).length;
  const todayCirurgias = todayApps.filter(app => app.service_name.toLowerCase().includes('cirurgia') || app.service_name.toLowerCase().includes('castração')).length;

  const criticalAlertsToday = todayApps.filter(app => app.critical_notes && app.critical_notes.trim() !== '').length;

  // Receita Geral (Confirmados e Concluídos)
  const revenueTotal = appointments
    .filter(app => app.status === 'confirmed' || app.status === 'completed')
    .reduce((sum, app) => sum + Number(app.price), 0);

  // Ticket Médio
  const paidAppsCount = appointments.filter(app => app.status === 'confirmed' || app.status === 'completed').length;
  const averageTicket = paidAppsCount > 0 ? revenueTotal / paidAppsCount : 0;

  // Faturamento Previsto Geral (Todos os pendentes/confirmados/concluídos)
  const revenueForecast = appointments.reduce((sum, app) => sum + Number(app.price), 0);

  // Taxa de ocupação da agenda (Simulada baseada em slots ocupados: máximo 12 slots por dia por padrão)
  const totalSlots = 12;
  const occupancyRate = Math.min(Math.round((todayApps.length / totalSlots) * 100), 100);

  // Formatação de Moeda
  const formatCurrency = (val: number) => {
    if (language === 'en') {
      return `$ ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (language === 'es') {
      return `€ ${val.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Render do esqueleto de carregamento
  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Painel Boas Vindas Skeleton */}
        <div className="bg-stone-200 dark:bg-stone-900 h-28 rounded-2xl animate-pulse" />
        {/* Grid de Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-stone-200 dark:bg-stone-900 h-32 rounded-2xl animate-pulse" />
          ))}
        </div>
        {/* Gráficos Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-stone-200 dark:bg-stone-900 h-80 rounded-2xl animate-pulse" />
          <div className="bg-stone-200 dark:bg-stone-900 h-80 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-stone-850 dark:text-stone-150">
      
      {/* 1. Painel Inicial de Boas Vindas */}
      <div className="relative bg-gradient-to-br from-white via-stone-50/80 to-stone-100 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 text-stone-800 dark:text-white p-6 md:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm dark:shadow-xl overflow-hidden group transition-all duration-300">
        {/* Detalhes de Background Modernos */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 dark:group-hover:bg-emerald-500/20 transition-colors duration-500" />
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {t('dashboard.premium_active')}
            </div>
            <h3 className="text-xl md:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
              {t('header.welcome')}
            </h3>
            <p className="text-xs md:text-sm text-stone-500 dark:text-stone-400 max-w-xl font-medium">
              {t('dashboard.welcome_desc')}
            </p>
           {/* Mini Indicadores Inline */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-4 bg-stone-100/50 dark:bg-stone-955/30 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800/40">
            <div className="px-3 py-1 border-r border-stone-200 dark:border-stone-800 flex flex-col">
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase">{t('dashboard.pets_today')}</span>
              <span className="text-sm font-extrabold text-stone-800 dark:text-stone-200">{totalPetsScheduledToday} {t('dashboard.scheduled')}</span>
            </div>
            <div className="px-3 py-1 border-r border-stone-200 dark:border-stone-800 flex flex-col">
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase">{t('dashboard.forecasted_revenue')}</span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(revenueExpectedToday)}</span>
            </div>
            <div className="px-3 py-1 border-r border-stone-200 dark:border-stone-800 flex flex-col">
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase">{t('dashboard.occupancy_agenda')}</span>
              <span className="text-sm font-extrabold text-amber-600 dark:text-amber-500">{occupancyRate}%</span>
            </div>
            <div className="px-3 py-1 flex flex-col">
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase">{t('dashboard.alerts')}</span>
              <span className={`text-sm font-extrabold ${criticalAlertsToday > 0 ? 'text-rose-500 dark:text-rose-400 animate-pulse' : 'text-stone-750 dark:text-stone-300'}`}>
                {criticalAlertsToday} {criticalAlertsToday === 1 ? t('dashboard.critical_singular') : t('dashboard.critical_plural')}
              </span>
            </div>           </div>
          </div>
        </div>

        {/* Linha de Status Operacional Hoje */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-stone-200 dark:border-stone-800/45 text-[10px] font-bold text-stone-600 dark:text-stone-400 tracking-wider">
          <div className="flex items-center gap-2 bg-white dark:bg-stone-950/20 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
            <Stethoscope className="w-4 h-4 text-blue-550 dark:text-blue-400" />
            <span>{todayVet} {t('dashboard.vet_consultations')}</span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-stone-950/20 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
            <Scissors className="w-4 h-4 text-orange-500 dark:text-orange-400" />
            <span>{todayBanhos} {t('dashboard.baths')}</span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-stone-950/20 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
            <Scissors className="w-4 h-4 text-amber-655 dark:text-amber-400" />
            <span>{todayTosas} {t('dashboard.haircuts')}</span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-stone-950/20 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
            <Syringe className="w-4 h-4 text-purple-555 dark:text-purple-400" />
            <span>{todayVacinas} {t('dashboard.vaccines')}</span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-stone-950/20 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
            <Activity className="w-4 h-4 text-rose-555 dark:text-rose-400" />
            <span>{todayCirurgias} {t('dashboard.surgeries')}</span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-stone-950/20 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
            <AlertCircle className="w-4 h-4 text-rose-555 dark:text-rose-400" />
            <span>{criticalAlertsToday} {t('dashboard.restrictions')}</span>
          </div>
        </div>
      </div>

      {/* 2. Grid de Cards de Métricas Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* CARD 1: RECEITA DO MÊS */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-stone-400 dark:text-stone-400 font-bold uppercase tracking-wider block mb-1">
                {t('dashboard.revenue_est')}
              </span>
              <h3 className="text-2xl font-black text-stone-855 dark:text-stone-100 tracking-tight">
                {formatCurrency(revenueTotal)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-555/20 text-emerald-600 dark:text-emerald-450 flex items-center justify-center group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-655 dark:text-emerald-500">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.8%</span>
              <span className="text-stone-400 dark:text-stone-400 font-medium">{t('dashboard.vs_previous_month')}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: RECEITA PREVISTA */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-stone-400 dark:text-stone-400 font-bold uppercase tracking-wider block mb-1">
                {t('dashboard.forecasted_revenue')}
              </span>
              <h3 className="text-2xl font-black text-stone-850 dark:text-stone-100 tracking-tight">
                {formatCurrency(revenueForecast)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-555/20 text-amber-600 dark:text-amber-450 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-655 dark:text-emerald-500">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+23.1%</span>
              <span className="text-stone-400 dark:text-stone-400 font-medium">{t('dashboard.vs_previous_week')}</span>
            </div>
          </div>
        </div>

        {/* CARD 3: TICKET MÉDIO */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-stone-400 dark:text-stone-400 font-bold uppercase tracking-wider block mb-1">
                {t('dashboard.arpu')}
              </span>
              <h3 className="text-2xl font-black text-stone-850 dark:text-stone-100 tracking-tight">
                {formatCurrency(averageTicket)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-555/20 text-blue-600 dark:text-blue-450 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-655 dark:text-emerald-500">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+3.2%</span>
              <span className="text-stone-400 dark:text-stone-400 font-medium">{t('dashboard.vs_yesterday')}</span>
            </div>
          </div>
        </div>

        {/* CARD 4: CLIENTES E PETS ATIVOS */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-stone-400 dark:text-stone-400 font-bold uppercase tracking-wider block mb-1">
                {t('dashboard.active_clients')}
              </span>
              <h3 className="text-2xl font-black text-stone-855 dark:text-stone-100 tracking-tight">
                {tutorCount} / {petCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-550/20 text-purple-600 dark:text-purple-450 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-655 dark:text-emerald-500">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t('dashboard.new_today_desc')}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Seção de Gráficos SVG Premium */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRÁFICO 1: FATURAMENTO ÚLTIMOS 30 DIAS */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/85 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-extrabold text-sm text-stone-850 dark:text-stone-100">{t('dashboard.daily_revenue')}</h4>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">{t('dashboard.daily_revenue_desc')}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-450">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                {t('dashboard.aesthetic_pet_label')}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-blue-605 dark:text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                {t('dashboard.vet_care')}
              </span>
            </div>
          </div>

          {/* Canvas do Gráfico de Linha em SVG */}
          <div className="relative w-full h-56 pt-2">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#78716c" strokeOpacity="0.1" strokeDasharray="3" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#78716c" strokeOpacity="0.1" strokeDasharray="3" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#78716c" strokeOpacity="0.1" strokeDasharray="3" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#78716c" strokeOpacity="0.1" strokeDasharray="3" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="#78716c" strokeOpacity="0.25" />

              {/* Rótulos Eixo Y */}
              <text x="30" y="25" textAnchor="end" className="text-[9px] fill-stone-450 dark:fill-stone-500 font-bold font-sans">R$ 2k</text>
              <text x="30" y="65" textAnchor="end" className="text-[9px] fill-stone-450 dark:fill-stone-500 font-bold font-sans">R$ 1.5k</text>
              <text x="30" y="105" textAnchor="end" className="text-[9px] fill-stone-450 dark:fill-stone-500 font-bold font-sans">R$ 1k</text>
              <text x="30" y="145" textAnchor="end" className="text-[9px] fill-stone-450 dark:fill-stone-500 font-bold font-sans">R$ 500</text>
              <text x="30" y="175" textAnchor="end" className="text-[9px] fill-stone-450 dark:fill-stone-500 font-bold font-sans">0</text>

              {/* Curva Linha 1: Estética Pet (Emerald) */}
              <path
                d="M 40 170 Q 110 140 150 110 T 260 120 T 370 80 T 480 50"
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-500"
              />
              {/* Sombra Preenchida sob a linha */}
              <path
                d="M 40 170 Q 110 140 150 110 T 260 120 T 370 80 T 480 50 L 480 170 Z"
                fill="url(#gradient-emerald)"
                opacity="0.12"
              />

              {/* Curva Linha 2: Veterinária (Blue) */}
              <path
                d="M 40 150 Q 110 130 180 80 T 320 90 T 410 40 T 480 20"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-500"
              />
              <path
                d="M 40 150 Q 110 130 180 80 T 320 90 T 410 40 T 480 20 L 480 170 Z"
                fill="url(#gradient-blue)"
                opacity="0.1"
              />

              {/* Pontos de Destaque com Popups Hover */}
              <circle cx="150" cy="110" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" className="hover:scale-150 transition-all cursor-pointer" style={{ transformOrigin: 'center', transformBox: 'fill-box' }} />
              <circle cx="370" cy="80" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" className="hover:scale-150 transition-all cursor-pointer" style={{ transformOrigin: 'center', transformBox: 'fill-box' }} />
              <circle cx="180" cy="80" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" className="hover:scale-150 transition-all cursor-pointer" style={{ transformOrigin: 'center', transformBox: 'fill-box' }} />
              <circle cx="410" cy="40" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" className="hover:scale-150 transition-all cursor-pointer" style={{ transformOrigin: 'center', transformBox: 'fill-box' }} />

              {/* Rótulos Eixo X */}
              <text x="40" y="190" textAnchor="middle" className="text-[9px] fill-stone-450 dark:fill-stone-500 font-bold font-sans">{language === 'en' ? 'Day 01' : language === 'es' ? 'Día 01' : 'Dia 01'}</text>
              <text x="150" y="190" textAnchor="middle" className="text-[9px] fill-stone-450 dark:fill-stone-500 font-bold font-sans">{language === 'en' ? 'Day 08' : language === 'es' ? 'Día 08' : 'Dia 08'}</text>
              <text x="260" y="190" textAnchor="middle" className="text-[9px] fill-stone-450 dark:fill-stone-500 font-bold font-sans">{language === 'en' ? 'Day 15' : language === 'es' ? 'Día 15' : 'Dia 15'}</text>
              <text x="370" y="190" textAnchor="middle" className="text-[9px] fill-stone-450 dark:fill-stone-500 font-bold font-sans">{language === 'en' ? 'Day 22' : language === 'es' ? 'Día 22' : 'Dia 22'}</text>
              <text x="480" y="190" textAnchor="middle" className="text-[9px] fill-stone-450 dark:fill-stone-500 font-bold font-sans">{language === 'en' ? 'Day 30' : language === 'es' ? 'Día 30' : 'Dia 30'}</text>

              {/* Definições de Gradientes */}
              <defs>
                <linearGradient id="gradient-emerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* GRÁFICO 2: DISTRIBUIÇÃO DOS SERVIÇOS */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/85 dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-sm text-stone-850 dark:text-stone-100 mb-1">{t('dashboard.service_distribution')}</h4>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">{t('dashboard.service_distribution_desc')}</p>
          </div>

          <div className="flex justify-center my-4 relative">
            <svg width="150" height="150" viewBox="0 0 36 36" className="w-36 h-36">
              {/* Background Circle */}
              <circle cx="18" cy="18" r="15.915" fill="none" strokeWidth="3" className="stroke-stone-150 dark:stroke-stone-800" />
              
              {/* Banho (40%) - Emerald */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="4.2" strokeDasharray="40 60" strokeDashoffset="100" />
              {/* Tosa (25%) - Terracotta */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#d97706" strokeWidth="4.2" strokeDasharray="25 75" strokeDashoffset="60" />
              {/* Consultas (20%) - Blue */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2563eb" strokeWidth="4.2" strokeDasharray="20 80" strokeDashoffset="35" />
              {/* Vacinas e Outros (15%) - Purple */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#7c3aed" strokeWidth="4.2" strokeDasharray="15 85" strokeDashoffset="15" />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-[10px] text-stone-450 dark:text-stone-300 block font-bold leading-none">{t('dashboard.total')}</span>
              <span className="text-lg font-black text-stone-800 dark:text-stone-100 leading-none">428</span>
            </div>
          </div>

          {/* Legenda Detalhada */}
          <div className="space-y-1.5 text-[10px] font-bold">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> {t('dashboard.bath')}
              </span>
              <span>40% (171)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> {t('dashboard.haircut')}
              </span>
              <span>25% (107)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                <span className="w-2 h-2 rounded-full bg-blue-600" /> {t('dashboard.consultations')}
              </span>
              <span>20% (85)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> {t('dashboard.vaccines_others')}
              </span>
              <span>15% (65)</span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* GRÁFICO 3: DIAS MAIS MOVIMENTADOS */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/85 dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-sm text-stone-850 dark:text-stone-100 mb-1">{t('dashboard.busy_days')}</h4>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">{t('dashboard.busy_days_desc')}</p>
          </div>

          <div className="h-44 flex items-end justify-between pt-6 px-2">
            {[
              { day: t('day.mon'), val: 32, max: 100, color: 'bg-stone-300 dark:bg-stone-800' },
              { day: t('day.tue'), val: 55, max: 100, color: 'bg-stone-300 dark:bg-stone-800' },
              { day: t('day.wed'), val: 80, max: 100, color: 'bg-stone-400 dark:bg-stone-700' },
              { day: t('day.thu'), val: 65, max: 100, color: 'bg-stone-400 dark:bg-stone-700' },
              { day: t('day.fri'), val: 95, max: 100, color: 'bg-emerald-600 dark:bg-emerald-500' },
              { day: t('day.sat'), val: 100, max: 100, color: 'bg-emerald-700 dark:bg-emerald-600' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 group w-full">
                <div className="relative w-7 bg-stone-100 dark:bg-stone-950 rounded-t-lg h-32 flex items-end">
                  <div 
                    style={{ height: `${item.val}%` }} 
                    className={`w-full rounded-t-lg transition-all duration-500 group-hover:opacity-90 ${item.color}`}
                  />
                  {/* Tooltip */}
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] bg-stone-850 text-white rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity font-bold pointer-events-none">
                    {item.val}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-stone-500 dark:text-stone-300">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* GRÁFICO 4: NOVOS CLIENTES */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/85 dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-sm text-stone-850 dark:text-stone-100 mb-1">{t('dashboard.new_tutors')}</h4>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">{t('dashboard.new_tutors_desc')}</p>
          </div>

          <div className="relative w-full h-32 mt-4">
            <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
              <path
                d="M 10 90 L 45 75 L 80 50 L 115 65 L 150 40 L 190 20"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 10 90 L 45 75 L 80 50 L 115 65 L 150 40 L 190 20 L 190 95 L 10 95 Z"
                fill="url(#gradient-purple)"
                opacity="0.08"
              />
              {[
                { x: 10, y: 90, label: t('month.jan') },
                { x: 45, y: 75, label: t('month.feb') },
                { x: 80, y: 50, label: t('month.mar') },
                { x: 115, y: 65, label: t('month.apr') },
                { x: 150, y: 40, label: t('month.may') },
                { x: 190, y: 20, label: t('month.jun') }
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="3" fill="#7c3aed" stroke="#ffffff" strokeWidth="1" />
                  <text x={pt.x} y="100" textAnchor="middle" className="text-[8px] fill-stone-450 dark:fill-stone-300 font-bold font-sans">{pt.label}</text>
                </g>
              ))}
              <defs>
                <linearGradient id="gradient-purple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* GRÁFICO 5: RETORNO DE CLIENTES */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/85 dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-sm text-stone-850 dark:text-stone-100 mb-1">{t('dashboard.loyalty_returns')}</h4>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">{t('dashboard.loyalty_returns_desc')}</p>
          </div>

          <div className="relative w-full h-32 mt-4">
            <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
              <path
                d="M 10 60 Q 45 40 80 30 T 150 50 T 190 25"
                fill="none"
                stroke="#d97706"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 10 60 Q 45 40 80 30 T 150 50 T 190 25 L 190 95 L 10 95 Z"
                fill="url(#gradient-orange)"
                opacity="0.08"
              />
              {[
                { x: 10, y: 60, label: 'W1' },
                { x: 55, y: 38, label: 'W2' },
                { x: 100, y: 32, label: 'W3' },
                { x: 145, y: 48, label: 'W4' },
                { x: 190, y: 25, label: 'W5' }
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="3" fill="#d97706" stroke="#ffffff" strokeWidth="1" />
                  <text x={pt.x} y="100" textAnchor="middle" className="text-[8px] fill-stone-450 dark:fill-stone-300 font-bold font-sans">{pt.label}</text>
                </g>
              ))}
              <defs>
                <linearGradient id="gradient-orange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

      </div>

    </div>
  );
};
