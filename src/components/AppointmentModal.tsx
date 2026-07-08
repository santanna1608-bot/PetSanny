import React, { useState, useEffect } from 'react';
import { useAppointments } from '../contexts/AppointmentsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Calendar, DollarSign, Stethoscope, Scissors } from 'lucide-react';
import { tutorsService, petsService } from '../lib/supabaseClient';
import type { Tutor, Pet } from '../lib/supabaseClient';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose }) => {
  const { addAppointment, currentTenant } = useAppointments();
  const { t } = useLanguage();

  const [tutorsList, setTutorsList] = useState<Tutor[]>([]);
  const [petsList, setPetsList] = useState<Pet[]>([]);
  const [selectedTutorId, setSelectedTutorId] = useState<string>('custom');
  const [selectedPetId, setSelectedPetId] = useState<string>('custom');

  const [tutorName, setTutorName] = useState('');
  const [tutorEmail, setTutorEmail] = useState('');
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('Cão (Golden Retriever)');
  const [isCustomSpecies, setIsCustomSpecies] = useState(false);
  const [customSpecies, setCustomSpecies] = useState('');
  const [serviceType, setServiceType] = useState<'vet' | 'aesthetic'>('aesthetic');
  const [serviceName, setServiceName] = useState('');
  const [professionalName, setProfessionalName] = useState('');
  const [price, setPrice] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('09:00');
  const [status, setStatus] = useState<'pending' | 'confirmed'>('pending');
  const [criticalNotes, setCriticalNotes] = useState('');

  // Define alguns valores padrão automáticos ao mudar de categoria de serviço para facilitar o teste
  useEffect(() => {
    if (serviceType === 'vet') {
      setServiceName('Consulta Geral de Rotina');
      setProfessionalName('Dra. Julia (Veterinária)');
      setPrice('180.00');
    } else {
      setServiceName('Banho & Tosa Higiênica');
      setProfessionalName('Cleiton (Esteticista)');
      setPrice('100.00');
    }
  }, [serviceType]);

  // Carrega tutores e pets ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const t = await tutorsService.list(currentTenant.id);
          const p = await petsService.list(currentTenant.id);
          setTutorsList(t);
          setPetsList(p);
        } catch (e) {
          console.error('Erro ao buscar tutores e pets no modal:', e);
        }
      };
      fetchData();
      setAppointmentDate(new Date().toISOString().split('T')[0]);

      setSelectedTutorId('custom');
      setSelectedPetId('custom');
      setTutorName('');
      setTutorEmail('');
      setPetName('');
      setPetSpecies('Cão (Golden Retriever)');
      setIsCustomSpecies(false);
      setCustomSpecies('');
      setCriticalNotes('');
    }
  }, [isOpen, currentTenant]);

  const handleTutorChange = (tutorId: string) => {
    setSelectedTutorId(tutorId);
    setSelectedPetId('custom'); // Reseta pet selecionado ao trocar tutor
    setPetName('');
    
    if (tutorId === 'custom') {
      setTutorName('');
      setTutorEmail('');
    } else {
      const matched = tutorsList.find(t => t.id === tutorId);
      if (matched) {
        setTutorName(matched.name);
        setTutorEmail(matched.email || '');
      }
    }
  };

  const handlePetChange = (petId: string) => {
    setSelectedPetId(petId);
    if (petId === 'custom') {
      setPetName('');
      setPetSpecies('Cão (Golden Retriever)');
      setIsCustomSpecies(false);
      setCustomSpecies('');
    } else {
      const matched = petsList.find(p => p.id === petId);
      if (matched) {
        setPetName(matched.name);
        setPetSpecies(matched.species);
        
        // Verifica se a espécie já é uma das opções padrão ou se deve abrir o campo customizado
        const standardOptions = [
          "Cão (Golden Retriever)",
          "Cão (Poodle)",
          "Cão (Shih Tzu)",
          "Cão (SRD)",
          "Gato (Persa)",
          "Gato (SRD)"
        ];
        if (standardOptions.includes(matched.species)) {
          setIsCustomSpecies(false);
          setCustomSpecies('');
        } else {
          setIsCustomSpecies(true);
          setCustomSpecies(matched.species);
        }
      }
    }
  };

  const handleSelectSpeciesChange = (value: string) => {
    if (value === 'Outros') {
      setIsCustomSpecies(true);
      setPetSpecies('Outros');
      setCustomSpecies('');
    } else {
      setIsCustomSpecies(false);
      setPetSpecies(value);
      setCustomSpecies('');
    }
  };

  const filteredPets = petsList.filter(p => p.tutor_id === selectedTutorId);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorName || !petName || !serviceName || !appointmentDate || !appointmentTime) {
      alert(t('modal.validation_error'));
      return;
    }

    const finalPetSpecies = isCustomSpecies 
      ? (customSpecies.trim() || 'Outros') 
      : petSpecies;

    await addAppointment({
      tutor_name: tutorName,
      tutor_email: tutorEmail || `${petName.toLowerCase()}@tutor.com`, // fallback de email
      pet_name: petName,
      pet_species: finalPetSpecies,
      service_type: serviceType,
      service_name: serviceName,
      professional_name: professionalName,
      price: Number(price) || 0,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      status: status,
      critical_notes: criticalNotes.trim() === '' ? null : criticalNotes
    });

    // Limpar campos
    setTutorName('');
    setTutorEmail('');
    setPetName('');
    setPetSpecies('Cão (Golden Retriever)');
    setIsCustomSpecies(false);
    setCustomSpecies('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-stone-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Cabeçalho */}
        <div className="p-6 border-b border-stone-150 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
          <div>
            <h3 className="font-bold text-lg text-stone-850 dark:text-stone-100">{t('modal.new_title')}</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">{t('modal.new_desc')}</p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-850 p-2 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Seletor Categoria de Serviço */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setServiceType('aesthetic')}
              className={`p-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                serviceType === 'aesthetic'
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-850 dark:text-orange-300'
                  : 'border-stone-200 dark:border-stone-800 text-stone-550 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-950/40'
              }`}
            >
              <Scissors className="w-4 h-4" />
              {t('operational.aesthetic_orange')}
            </button>
            <button
              type="button"
              onClick={() => setServiceType('vet')}
              className={`p-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                serviceType === 'vet'
                  ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300'
                  : 'border-stone-200 dark:border-stone-800 text-stone-550 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-950/40'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              {t('operational.vet_blue')}
            </button>
          </div>

          <div className="border-t border-stone-150 dark:border-stone-800 my-2 pt-2" />

          {/* Dados do Tutor */}
          <div>
            <h4 className="font-bold text-stone-400 dark:text-stone-500 uppercase text-[9px] tracking-wider mb-2">{t('modal.tutor_info')}</h4>
            
            <div className="mb-3">
              <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-bold mb-1">{t('modal.tutor_linked')}</label>
              <select
                value={selectedTutorId}
                onChange={(e) => handleTutorChange(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-955 text-stone-850 dark:text-stone-100 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 rounded-lg p-2.5 outline-none transition-all font-semibold cursor-pointer"
              >
                <option value="custom">{t('modal.tutor_manual')}</option>
                {tutorsList.map(t => (
                  <option key={t.id} value={t.id}>{t.name} {t.phone ? `(${t.phone})` : ''}</option>
                ))}
              </select>
            </div>

            {selectedTutorId === 'custom' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-bold mb-1">{t('modal.tutor_name_label')}</label>
                  <input
                    type="text"
                    required
                    placeholder={t('modal.tutor_name_placeholder')}
                    value={tutorName}
                    onChange={(e) => setTutorName(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-955 text-stone-850 dark:text-stone-100 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 rounded-lg p-2.5 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-bold mb-1">{t('modal.tutor_email_label')}</label>
                  <input
                    type="email"
                    placeholder={t('modal.tutor_email_placeholder')}
                    value={tutorEmail}
                    onChange={(e) => setTutorEmail(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-955 text-stone-850 dark:text-stone-100 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 rounded-lg p-2.5 outline-none transition-all"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-stone-55/60 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-800 rounded-xl flex items-center justify-between animate-fade-in">
                <div>
                  <span className="font-extrabold text-stone-855 dark:text-stone-100">{tutorName}</span>
                  {tutorEmail && <span className="block text-[10px] text-stone-500 dark:text-stone-400 font-medium">{tutorEmail}</span>}
                </div>
                <span className="text-[9px] uppercase font-bold text-olive-650 px-2 py-0.5 bg-olive-50 dark:bg-olive-950/30 border border-olive-100 dark:border-olive-900/50 rounded-full select-none">
                  {t('modal.active_client')}
                </span>
              </div>
            )}
          </div>

          {/* Dados do Pet */}
          <div>
            <h4 className="font-bold text-stone-400 dark:text-stone-500 uppercase text-[9px] tracking-wider mb-2">{t('modal.pet_info')}</h4>
            
            {selectedTutorId !== 'custom' && (
              <div className="mb-3">
                <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-bold mb-1">{t('modal.pet_of_tutor')}</label>
                <select
                  value={selectedPetId}
                  onChange={(e) => handlePetChange(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-955 text-stone-850 dark:text-stone-100 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 rounded-lg p-2.5 outline-none transition-all font-semibold cursor-pointer"
                >
                  <option value="custom">{t('modal.pet_manual')}</option>
                  {filteredPets.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
                  ))}
                </select>
              </div>
            )}

            {selectedPetId === 'custom' ? (
              <div className="space-y-3 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-bold mb-1">{t('modal.pet_name_label')}</label>
                    <input
                      type="text"
                      required
                      placeholder={t('modal.pet_name_placeholder')}
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-955 text-stone-850 dark:text-stone-100 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 rounded-lg p-2.5 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-bold mb-1">{t('modal.pet_species_label')}</label>
                    <select
                      value={isCustomSpecies ? 'Outros' : petSpecies}
                      onChange={(e) => handleSelectSpeciesChange(e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-955 text-stone-850 dark:text-stone-100 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 rounded-lg p-2.5 outline-none transition-all font-semibold cursor-pointer"
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
                </div>

                {isCustomSpecies && (
                  <div className="animate-slide-down">
                    <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-bold mb-1">
                      Descreva a Espécie / Raça
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Cão (Pastor Alemão) ou Calopsita"
                      value={customSpecies}
                      onChange={(e) => setCustomSpecies(e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-955 text-stone-850 dark:text-stone-100 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 rounded-lg p-2.5 outline-none transition-all"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-stone-55/60 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-800 rounded-xl flex items-center justify-between animate-fade-in">
                <div>
                  <span className="font-extrabold text-stone-855 dark:text-stone-100">{petName}</span>
                  <span className="block text-[10px] text-stone-500 dark:text-stone-400 font-medium">{petSpecies}</span>
                </div>
                <span className="text-[9px] uppercase font-bold text-olive-650 px-2 py-0.5 bg-olive-50 dark:bg-olive-950/30 border border-olive-100 dark:border-olive-900/50 rounded-full select-none">
                  {t('modal.pet_linked')}
                </span>
              </div>
            )}
          </div>

          {/* Dados do Serviço */}
          <div>
            <h4 className="font-bold text-stone-400 dark:text-stone-500 uppercase text-[9px] tracking-wider mb-2">{t('modal.service_values')}</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-bold mb-1">{t('modal.service_desc_label')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('modal.service_desc_placeholder')}
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-955 text-stone-850 dark:text-stone-100 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 rounded-lg p-2.5 outline-none transition-all font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-bold mb-1">{t('modal.price_label')}</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="120.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-955 text-stone-850 dark:text-stone-100 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 rounded-lg pl-6 pr-2.5 p-2.5 outline-none transition-all font-bold text-stone-800 dark:text-stone-100"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-stone-400">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-bold mb-1">{t('modal.professional_label')}</label>
              <input
                type="text"
                placeholder={t('modal.professional_placeholder')}
                value={professionalName}
                onChange={(e) => setProfessionalName(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-955 text-stone-850 dark:text-stone-100 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 rounded-lg p-2.5 outline-none transition-all"
              />
            </div>
          </div>

          {/* Agenda & Data */}
          <div>
            <h4 className="font-bold text-stone-400 dark:text-stone-500 uppercase text-[9px] tracking-wider mb-2">{t('modal.date_status')}</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-bold mb-1">{t('modal.date_label')}</label>
                <input
                  type="date"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-955 text-stone-850 dark:text-stone-100 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 rounded-lg p-2.5 outline-none transition-all font-semibold cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-bold mb-1">{t('modal.time_label')}</label>
                <input
                  type="time"
                  required
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-955 text-stone-850 dark:text-stone-100 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 rounded-lg p-2.5 outline-none transition-all font-semibold cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-bold mb-1">{t('modal.status_label')}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'pending' | 'confirmed')}
                  className="w-full bg-stone-50 dark:bg-stone-955 text-stone-850 dark:text-stone-100 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 rounded-lg p-2.5 outline-none transition-all font-bold text-stone-850 dark:text-stone-250 cursor-pointer"
                >
                  <option value="pending">{t('status.pending')}</option>
                  <option value="confirmed">{t('status.confirmed')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Alertas Críticos */}
          <div>
            <label className="block text-[10px] text-rose-600 dark:text-rose-400 font-bold mb-1 uppercase tracking-wider">
              {t('modal.critical_label')}
            </label>
            <textarea
              placeholder={t('modal.critical_placeholder')}
              value={criticalNotes}
              onChange={(e) => setCriticalNotes(e.target.value)}
              className="w-full bg-rose-50/30 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 focus:border-rose-400 focus:bg-white dark:focus:bg-stone-900 rounded-lg p-2.5 outline-none transition-all min-h-[60px] text-stone-800 dark:text-stone-200 font-medium"
            />
          </div>

          {/* Botão de Envio */}
          <div className="pt-4 border-t border-stone-150 dark:border-stone-800 flex items-center justify-end gap-3 bg-stone-50 dark:bg-stone-950 -mx-6 -mb-6 p-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-850 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all"
            >
              {t('modal.cancel')}
            </button>
            <button
              type="submit"
              className="bg-olive-600 hover:bg-olive-750 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-md shadow-olive-900/10 transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              {t('modal.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
