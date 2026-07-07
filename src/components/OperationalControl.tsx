import React, { useState } from 'react';
import { useAppointments } from '../contexts/AppointmentsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Search, 
  Trash2, 
  Check, 
  SlidersHorizontal,
  RefreshCw,
  Plus
} from 'lucide-react';

interface OperationalControlProps {
  onOpenAddModal: () => void;
}

export const OperationalControl: React.FC<OperationalControlProps> = ({ onOpenAddModal }) => {
  const { appointments, changeAppointmentStatus, deleteAppointment } = useAppointments();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filtragem dos dados
  const filteredAppointments = appointments.filter((app) => {
    // Busca por texto
    const matchesSearch = 
      app.pet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.tutor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.professional_name.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro de Status
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    // Filtro de Categoria
    const matchesCategory = categoryFilter === 'all' || app.service_type === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm mb-8">
      {/* Topo com Título e Botão Novo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-olive-600" />
            {t('operational.title')}
          </h3>
          <p className="text-xs text-stone-500">
            {t('operational.desc')}
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 bg-olive-600 hover:bg-olive-750 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-olive-900/10 transition-all cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          {t('operational.new_btn')}
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Campo Pesquisa */}
        <div className="relative">
          <input
            type="text"
            placeholder={t('operational.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-50 text-stone-800 text-xs rounded-xl pl-9 pr-4 py-3 border border-stone-200 focus:border-olive-500 focus:bg-white outline-none transition-all"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
        </div>

        {/* Filtro Categoria */}
        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
          <label className="text-[10px] text-stone-400 font-bold uppercase shrink-0">{t('operational.category_label')}</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-transparent text-stone-700 text-xs font-semibold outline-none cursor-pointer"
          >
            <option value="all">{t('operational.all_categories')}</option>
            <option value="vet">{t('operational.vet_blue')}</option>
            <option value="aesthetic">{t('operational.aesthetic_orange')}</option>
          </select>
        </div>

        {/* Filtro Status */}
        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
          <label className="text-[10px] text-stone-400 font-bold uppercase shrink-0">{t('operational.status_label')}</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-transparent text-stone-700 text-xs font-semibold outline-none cursor-pointer"
          >
            <option value="all">{t('operational.all_status')}</option>
            <option value="pending">{t('operational.pending_plural')}</option>
            <option value="confirmed">{t('operational.confirmed_plural')}</option>
            <option value="completed">{t('operational.completed_plural')}</option>
          </select>
        </div>
      </div>

      {/* Tabela de Agendamentos */}
      <div className="overflow-x-auto rounded-xl border border-stone-150 shadow-inner bg-stone-50/50">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-100 text-stone-500 border-b border-stone-200 font-bold">
              <th className="p-4">{t('operational.th_pet')}</th>
              <th className="p-4">{t('operational.th_tutor')}</th>
              <th className="p-4">{t('operational.th_service')}</th>
              <th className="p-4">{t('operational.th_datetime')}</th>
              <th className="p-4">{t('operational.th_category')}</th>
              <th className="p-4">{t('operational.th_status')}</th>
              <th className="p-4 text-center">{t('operational.th_actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-150">
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-stone-450 italic bg-white">
                  {t('operational.no_results')}
                </td>
              </tr>
            ) : (
              filteredAppointments.map((app) => {
                const isVet = app.service_type === 'vet';
                return (
                  <tr key={app.id} className="bg-white hover:bg-stone-50/50 transition-colors">
                    {/* Pet */}
                    <td className="p-4 font-bold text-stone-800">
                      <div>
                        {app.pet_name}
                        <div className="text-[10px] text-stone-400 font-medium">{app.pet_species}</div>
                      </div>
                    </td>

                    {/* Tutor */}
                    <td className="p-4 text-stone-600 font-medium">
                      <div>
                        {app.tutor_name}
                        <div className="text-[10px] text-stone-400 truncate max-w-[150px]">{app.tutor_email}</div>
                      </div>
                    </td>

                    {/* Serviço */}
                    <td className="p-4">
                      <div className="font-semibold text-stone-750">{app.service_name}</div>
                      <div className="text-[10px] text-stone-500 font-bold">R$ {Number(app.price).toFixed(2)}</div>
                    </td>

                    {/* Data / Hora */}
                    <td className="p-4 text-stone-600 font-medium">
                      <div>{app.appointment_date.split('-').reverse().join('/')}</div>
                      <div className="text-[10px] text-stone-400 font-bold">{app.appointment_time}h</div>
                    </td>

                    {/* Categoria */}
                    <td className="p-4">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isVet 
                          ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                          : 'bg-orange-50 text-orange-750 border border-orange-100'
                      }`}>
                        {isVet ? t('service.vet') : t('service.aesthetic')}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        app.status === 'completed'
                          ? 'bg-stone-100 text-stone-600'
                          : app.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {app.status === 'completed' ? t('status.completed') : app.status === 'confirmed' ? t('status.confirmed') : t('status.pending')}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Ação: Confirmar se Pendente */}
                        {app.status === 'pending' && (
                          <button
                            onClick={() => changeAppointmentStatus(app.id, 'confirmed')}
                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                            title={t('action.confirm')}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {/* Ação: Concluir se Confirmado */}
                        {app.status === 'confirmed' && (
                          <button
                            onClick={() => changeAppointmentStatus(app.id, 'completed')}
                            className="p-1.5 bg-stone-100 text-stone-600 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                            title={t('action.finalize')}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {/* Ação: Voltar para Pendente se Confirmado/Concluído */}
                        {app.status !== 'pending' && (
                          <button
                            onClick={() => changeAppointmentStatus(app.id, 'pending')}
                            className="p-1.5 bg-stone-100 text-stone-400 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                            title={t('status.pending')}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Ação: Excluir */}
                        <button
                          onClick={() => {
                            if (confirm(t('operational.confirm_delete').replace('{pet_name}', app.pet_name))) {
                              deleteAppointment(app.id);
                            }
                          }}
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                          title={t('operational.th_actions')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
