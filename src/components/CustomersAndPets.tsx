import React, { useState, useEffect } from 'react';
import { useAppointments } from '../contexts/AppointmentsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { tutorsService, petsService } from '../lib/supabaseClient';
import type { Tutor, Pet } from '../lib/supabaseClient';
import { 
  Users, 
  Plus, 
  Trash2, 
  Mail, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  Smile, 
  Calendar, 
  UserPlus
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { PetProfile } from './PetProfile';

export const CustomersAndPets: React.FC = () => {
  const { currentTenant, addToast } = useAppointments();
  const { t } = useLanguage();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de seleção de Pet
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [selectedTutorForPet, setSelectedTutorForPet] = useState<Tutor | null>(null);

  // Estados dos formulários
  const [isTutorFormOpen, setIsTutorFormOpen] = useState(false);
  const [tutorName, setTutorName] = useState('');
  const [tutorEmail, setTutorEmail] = useState('');
  const [tutorPhone, setTutorPhone] = useState('');

  const [expandedTutorId, setExpandedTutorId] = useState<string | null>(null);
  
  const [isPetFormOpen, setIsPetFormOpen] = useState(false);
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('Cão (Golden Retriever)');
  const [petBreed, setPetBreed] = useState('');
  const [petBirthDate, setPetBirthDate] = useState('');

  // Estados do Modal de Confirmação
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const tutorsData = await tutorsService.list(currentTenant.id);
      const petsData = await petsService.list(currentTenant.id);
      setTutors(tutorsData);
      setPets(petsData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      addToast(t('customers.toast_connection_error'), t('customers.toast_connection_error_desc'), 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant]);

  const handleAddTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorName) {
      alert(t('customers.tutor_mandatory'));
      return;
    }

    try {
      const newTutor = await tutorsService.create({
        tenant_id: currentTenant.id,
        name: tutorName,
        email: tutorEmail || null,
        phone: tutorPhone || null
      });

      setTutors((prev) => [...prev, newTutor]);
      setTutorName('');
      setTutorEmail('');
      setTutorPhone('');
      setIsTutorFormOpen(false);
      addToast(t('customers.toast_tutor_saved'), t('customers.toast_tutor_saved_desc').replace('{name}', tutorName));
    } catch (err) {
      console.error('Erro ao cadastrar tutor:', err);
      addToast(t('customers.toast_error'), t('customers.toast_error_save_tutor'), 'warning');
    }
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName || !expandedTutorId) {
      alert(t('customers.pet_mandatory'));
      return;
    }

    try {
      const newPet = await petsService.create({
        tenant_id: currentTenant.id,
        tutor_id: expandedTutorId,
        name: petName,
        species: petSpecies,
        breed: petBreed || null,
        birth_date: petBirthDate || null
      });

      setPets((prev) => [...prev, newPet]);
      setPetName('');
      setPetBreed('');
      setPetBirthDate('');
      setIsPetFormOpen(false);
      addToast(t('customers.toast_pet_saved'), t('customers.toast_pet_saved_desc').replace('{name}', petName));
    } catch (err) {
      console.error('Erro ao cadastrar pet:', err);
      addToast(t('customers.toast_error'), t('customers.toast_error_save_pet'), 'warning');
    }
  };

  const executeDeleteTutor = async (id: string) => {
    try {
      await tutorsService.delete(id);
      setTutors((prev) => prev.filter((t) => t.id !== id));
      setPets((prev) => prev.filter((p) => p.tutor_id !== id)); // Remove pets localmente também
      if (expandedTutorId === id) setExpandedTutorId(null);
      addToast(t('customers.toast_tutor_removed'), t('customers.toast_tutor_removed_desc'), 'info');
    } catch (err) {
      console.error('Erro ao excluir tutor:', err);
      addToast(t('customers.toast_error'), t('customers.toast_error_delete_tutor'), 'warning');
    }
  };

  const handleDeleteTutor = (id: string, name: string) => {
    setConfirmModalConfig({
      title: 'Excluir Tutor',
      message: t('customers.alert_delete_tutor').replace('{name}', name),
      onConfirm: () => executeDeleteTutor(id)
    });
    setConfirmModalOpen(true);
  };

  const executeDeletePet = async (id: string, name: string) => {
    try {
      await petsService.delete(id);
      setPets((prev) => prev.filter((p) => p.id !== id));
      addToast(t('customers.toast_pet_removed'), t('customers.toast_pet_removed_desc').replace('{name}', name), 'info');
    } catch (err) {
      console.error('Erro ao excluir pet:', err);
      addToast(t('customers.toast_error'), t('customers.toast_error_delete_pet'), 'warning');
    }
  };

  const handleDeletePet = (id: string, name: string) => {
    setConfirmModalConfig({
      title: 'Excluir Pet',
      message: t('customers.alert_delete_pet').replace('{name}', name),
      onConfirm: () => executeDeletePet(id, name)
    });
    setConfirmModalOpen(true);
  };

  const toggleExpandTutor = (tutorId: string) => {
    if (expandedTutorId === tutorId) {
      setExpandedTutorId(null);
      setIsPetFormOpen(false);
    } else {
      setExpandedTutorId(tutorId);
      setIsPetFormOpen(false);
    }
  };

  // Se houver um pet selecionado, exibe o prontuário ao invés da listagem
  if (selectedPet && selectedTutorForPet) {
    return (
      <PetProfile 
        pet={selectedPet} 
        tutor={selectedTutorForPet} 
        onBack={() => {
          setSelectedPet(null);
          setSelectedTutorForPet(null);
        }} 
      />
    );
  }

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 text-xs text-stone-850 dark:text-stone-100">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-150 dark:border-stone-850 pb-5">
        <div>
          <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-olive-600" />
            {t('customers.title')}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {t('customers.desc')}
          </p>
        </div>
        <button
          onClick={() => setIsTutorFormOpen(!isTutorFormOpen)}
          className="flex items-center gap-1.5 bg-olive-600 hover:bg-olive-750 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-olive-900/10 transition-all cursor-pointer self-start sm:self-center"
        >
          <UserPlus className="w-4 h-4" />
          {isTutorFormOpen ? t('customers.close_form') : t('customers.new_tutor_btn')}
        </button>
      </div>

      {/* Formulário de Novo Tutor */}
      {isTutorFormOpen && (
        <form onSubmit={handleAddTutor} className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-950/45 border border-stone-150/80 dark:border-stone-850 space-y-4 animate-fade-in">
          <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">Cadastrar Novo Tutor</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase">Nome Completo *</label>
              <input
                type="text"
                required
                placeholder="Ex: Carlos Silva"
                value={tutorName}
                onChange={(e) => setTutorName(e.target.value)}
                className="w-full bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 text-xs rounded-xl px-3 py-2.5 border border-stone-200 dark:border-stone-800 focus:border-olive-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase">E-mail</label>
              <input
                type="email"
                placeholder="Ex: carlos@email.com"
                value={tutorEmail}
                onChange={(e) => setTutorEmail(e.target.value)}
                className="w-full bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 text-xs rounded-xl px-3 py-2.5 border border-stone-200 dark:border-stone-800 focus:border-olive-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase">Telefone</label>
              <input
                type="text"
                placeholder="Ex: (11) 99999-8888"
                value={tutorPhone}
                onChange={(e) => setTutorPhone(e.target.value)}
                className="w-full bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 text-xs rounded-xl px-3 py-2.5 border border-stone-200 dark:border-stone-800 focus:border-olive-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsTutorFormOpen(false)}
              className="bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-950 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-olive-600 hover:bg-olive-750 text-white font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Salvar Cliente
            </button>
          </div>
        </form>
      )}

      {/* Lista de Tutores */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 gap-3 bg-stone-50 dark:bg-stone-950/40 rounded-xl border border-stone-150 dark:border-stone-800">
          <div className="w-8 h-8 border-3 border-olive-500/20 border-t-olive-600 rounded-full animate-spin" />
          <span className="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase">Buscando Clientes...</span>
        </div>
      ) : tutors.length === 0 ? (
        <div className="p-8 text-center text-stone-450 italic bg-stone-50 dark:bg-stone-950/40 rounded-xl border border-stone-150 dark:border-stone-800">
          Nenhum cliente cadastrado nesta clínica ainda.
        </div>
      ) : (
        <div className="space-y-3.5">
          {tutors.map((tutor) => {
            const isExpanded = expandedTutorId === tutor.id;
            const tutorPets = pets.filter((p) => p.tutor_id === tutor.id);

            return (
              <div 
                key={tutor.id} 
                className={`border rounded-2xl transition-all duration-200 ${
                  isExpanded 
                    ? 'border-stone-300 dark:border-stone-700 shadow-md bg-stone-50/20 dark:bg-stone-950/20' 
                    : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50/30 dark:hover:bg-stone-950/10'
                }`}
              >
                {/* Cabeçalho do Cartão de Tutor */}
                <div 
                  onClick={() => toggleExpandTutor(tutor.id)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-950 flex items-center justify-center text-stone-600 dark:text-stone-400 shrink-0 font-bold border dark:border-stone-850">
                      {tutor.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-stone-800 dark:text-stone-100 text-sm">{tutor.name}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[10px] text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                        {tutor.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-stone-450 dark:text-stone-500" />
                            {tutor.email}
                          </span>
                        )}
                        {tutor.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-stone-450 dark:text-stone-500" />
                            {tutor.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-stone-100 dark:bg-stone-950 text-stone-550 dark:text-stone-400 rounded-full border border-stone-200 dark:border-stone-800">
                      {tutorPets.length} {tutorPets.length === 1 ? t('customers.pet_singular') : t('customers.pet_plural')}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTutor(tutor.id, tutor.name);
                      }}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-450 dark:text-stone-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title={t('customers.delete_tutor_title')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                  </div>
                </div>

                {/* Sub-área expandida com Pets */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-b-2xl space-y-4">
                    
                    {/* Linha de Título e Novo Pet */}
                    <div className="flex items-center justify-between gap-4">
                      <h5 className="font-bold text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wider flex items-center gap-1">
                        <Smile className="w-3.5 h-3.5 text-stone-400" />
                        {t('customers.associated_pets')}
                      </h5>
                      <button
                        onClick={() => setIsPetFormOpen(!isPetFormOpen)}
                        className="flex items-center gap-1 text-[10px] text-olive-600 dark:text-olive-400 font-bold hover:text-olive-750 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {isPetFormOpen ? t('customers.cancel') : t('customers.add_pet')}
                      </button>
                    </div>

                    {/* Formulário de Novo Pet */}
                    {isPetFormOpen && (
                      <form onSubmit={handleAddPet} className="p-4 rounded-xl bg-stone-50/50 dark:bg-stone-950/40 border border-stone-150 dark:border-stone-800 space-y-3 animate-fade-in">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="col-span-1">
                            <label className="block text-[9px] text-stone-500 dark:text-stone-400 font-bold uppercase mb-1">{t('customers.pet_name_label')}</label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: Toby, Mel"
                              value={petName}
                              onChange={(e) => setPetName(e.target.value)}
                              className="w-full bg-white dark:bg-stone-900 text-stone-850 dark:text-stone-100 text-xs rounded-lg p-2 border border-stone-200 dark:border-stone-800 focus:border-olive-500 outline-none transition-all"
                            />
                          </div>

                          <div className="col-span-1">
                            <label className="block text-[9px] text-stone-500 dark:text-stone-400 font-bold uppercase mb-1">{t('customers.species_label')}</label>
                            <select
                              value={petSpecies}
                              onChange={(e) => setPetSpecies(e.target.value)}
                              className="w-full bg-white dark:bg-stone-900 text-stone-850 dark:text-stone-100 text-xs rounded-lg p-2 border border-stone-200 dark:border-stone-800 focus:border-olive-500 outline-none transition-all font-semibold"
                            >
                              <option value="Cão (Golden Retriever)">Cão (Golden Retriever)</option>
                              <option value="Cão (Poodle)">Cão (Poodle)</option>
                              <option value="Cão (Shih Tzu)">Cão (Shih Tzu)</option>
                              <option value="Cão (SRD)">Cão (Vira-lata)</option>
                              <option value="Gato (Persa)">Gato (Persa)</option>
                              <option value="Gato (SRD)">Gato (SRD)</option>
                              <option value="Outros">Outros</option>
                            </select>
                          </div>

                          <div className="col-span-1">
                            <label className="block text-[9px] text-stone-500 dark:text-stone-400 font-bold uppercase mb-1">{t('customers.breed_label')}</label>
                            <input
                              type="text"
                              placeholder="Ex: Golden, Siames"
                              value={petBreed}
                              onChange={(e) => setPetBreed(e.target.value)}
                              className="w-full bg-white dark:bg-stone-900 text-stone-850 dark:text-stone-100 text-xs rounded-lg p-2 border border-stone-200 dark:border-stone-800 focus:border-olive-500 outline-none transition-all"
                            />
                          </div>

                          <div className="col-span-1">
                            <label className="block text-[9px] text-stone-500 dark:text-stone-400 font-bold uppercase mb-1">{t('customers.birth_date_label')}</label>
                            <input
                              type="date"
                              value={petBirthDate}
                              onChange={(e) => setPetBirthDate(e.target.value)}
                              className="w-full bg-white dark:bg-stone-900 text-stone-850 dark:text-stone-100 text-xs rounded-lg p-2 border border-stone-200 dark:border-stone-800 focus:border-olive-500 outline-none transition-all cursor-pointer"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="bg-olive-600 hover:bg-olive-750 text-white font-bold px-3 py-1.5 rounded-lg transition-all text-[10px] cursor-pointer"
                          >
                            {t('customers.save_pet')}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Sub-lista de Pets */}
                    {tutorPets.length === 0 ? (
                      <div className="text-center text-stone-400 py-3 italic bg-stone-50 dark:bg-stone-950/40 rounded-xl border border-dashed border-stone-150 dark:border-stone-800 animate-fade-in">
                        {t('customers.no_pets')}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in">
                        {tutorPets.map((pet) => (
                          <div 
                            key={pet.id} 
                            className="flex items-center justify-between p-3 border border-stone-150 dark:border-stone-800 hover:border-stone-250 dark:hover:border-stone-700 bg-stone-50/30 dark:bg-stone-950/20 hover:bg-white dark:hover:bg-stone-900 rounded-xl transition-all"
                          >
                            <div 
                              onClick={() => {
                                setSelectedPet(pet);
                                setSelectedTutorForPet(tutor);
                              }}
                              className="flex items-center gap-2.5 min-w-0 cursor-pointer group/pet"
                            >
                              <div className="w-8 h-8 rounded-lg bg-olive-500/10 dark:bg-olive-950/40 text-olive-650 dark:text-olive-400 flex items-center justify-center shrink-0 group-hover/pet:scale-105 transition-transform">
                                <Smile className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h6 className="font-extrabold text-stone-800 dark:text-stone-200 text-[11px] leading-tight group-hover/pet:text-olive-600 dark:group-hover/pet:text-olive-400 group-hover/pet:underline">{pet.name}</h6>
                                <p className="text-[9px] text-stone-450 dark:text-stone-500 mt-0.5 truncate font-medium">
                                  {pet.species} {pet.breed ? `• ${pet.breed}` : ''}
                                </p>
                                {pet.birth_date && (
                                  <div className="flex items-center gap-1 text-[8px] text-stone-400 dark:text-stone-550 font-semibold mt-0.5">
                                    <Calendar className="w-3 h-3 text-stone-400 dark:text-stone-500" />
                                    {t('customers.birth_prefix')} {pet.birth_date.split('-').reverse().join('/')}
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeletePet(pet.id, pet.name)}
                              className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-400 dark:text-stone-500 hover:text-rose-600 dark:hover:text-rose-455 rounded transition-colors cursor-pointer shrink-0"
                              title={t('customers.delete_pet_title')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmação Customizado */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        title={confirmModalConfig?.title || 'Confirmação'}
        message={confirmModalConfig?.message || ''}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmModalConfig?.onConfirm || (() => {})}
        onClose={() => {
          setConfirmModalOpen(false);
          setConfirmModalConfig(null);
        }}
        isDanger={true}
      />
    </div>
  );
};
