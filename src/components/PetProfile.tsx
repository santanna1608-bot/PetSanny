import React, { useState, useEffect } from 'react';
import { Pet, Tutor } from '../lib/supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppointments } from '../contexts/AppointmentsContext';
import { 
  ArrowLeft, 
  Smile, 
  User, 
  Phone, 
  Calendar, 
  Scale, 
  FileText, 
  ShieldAlert, 
  Clock, 
  Plus, 
  Upload, 
  Check, 
  Trash2,
  DollarSign,
  Scissors,
  Stethoscope,
  Syringe,
  Activity,
  Heart
} from 'lucide-react';

interface PetProfileProps {
  pet: Pet;
  tutor: Tutor;
  onBack: () => void;
}

interface MedicalRecord {
  id: string;
  date: string;
  type: 'consultation' | 'vaccine' | 'medication' | 'exam' | 'surgery' | 'grooming' | 'observation';
  title: string;
  description: string;
  professional: string;
}

interface PetDocument {
  id: string;
  name: string;
  date: string;
  size: string;
  type: string;
}

interface WeightRecord {
  date: string;
  weight: number;
}

interface PetReminder {
  id: string;
  title: string;
  date: string;
  type: 'vaccine' | 'medication' | 'exam' | 'grooming';
  done: boolean;
}

export const PetProfile: React.FC<PetProfileProps> = ({ pet, tutor, onBack }) => {
  const { t } = useLanguage();
  const { addToast } = useAppointments();
  const [activeTab, setActiveTab] = useState<'summary' | 'medical' | 'aesthetics' | 'financial' | 'docs' | 'notes'>('summary');
  
  // Estados para gerenciar registros médicos
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [reminders, setReminders] = useState<PetReminder[]>([]);
  const [documents, setDocuments] = useState<PetDocument[]>([]);
  const [weights, setWeights] = useState<WeightRecord[]>([]);
  const [petNotes, setPetNotes] = useState('');

  // Estados dos formulários de adição
  const [newWeight, setNewWeight] = useState('');
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderType, setNewReminderType] = useState<'vaccine' | 'medication' | 'exam' | 'grooming'>('vaccine');

  const [newRecordTitle, setNewRecordTitle] = useState('');
  const [newRecordDesc, setNewRecordDesc] = useState('');
  const [newRecordType, setNewRecordType] = useState<MedicalRecord['type']>('consultation');
  const [newRecordProf, setNewRecordProf] = useState('');

  // Carrega dados específicos do Pet no LocalStorage
  useEffect(() => {
    const petKey = `petsanny_profile_${pet.id}`;
    const cachedData = localStorage.getItem(petKey);

    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      setMedicalRecords(parsed.medicalRecords || []);
      setReminders(parsed.reminders || []);
      setDocuments(parsed.documents || []);
      setWeights(parsed.weights || []);
      setPetNotes(parsed.petNotes || '');
    } else {
      // Semente de dados padrão (Seed) caso não haja cache
      const defaultWeights: WeightRecord[] = [
        { date: '2026-01-10', weight: 8.5 },
        { date: '2026-03-12', weight: 9.1 },
        { date: '2026-05-18', weight: 9.6 },
        { date: '2026-07-13', weight: 10.2 }
      ];

      const defaultRecords: MedicalRecord[] = [
        {
          id: 'r-1',
          date: '2026-07-13',
          type: 'grooming',
          title: 'Banho & Hidratação de Pelagem',
          description: 'Pelagem limpa e hidratada com shampoo hipoalergênico. Sem nós detectados.',
          professional: 'Mariana'
        },
        {
          id: 'r-2',
          date: '2026-06-25',
          type: 'vaccine',
          title: 'Vacina V10 (Reforço Anual)',
          description: 'Aplicação subcutânea da vacina V10 importada. Sem reações adversas pós-vacinais.',
          professional: 'Dra. Julia'
        },
        {
          id: 'r-3',
          date: '2026-06-10',
          type: 'consultation',
          title: 'Check-up Clínico Geral',
          description: 'Temperatura corporal normal, dentes sem acúmulo de tártaro severo, auscultação cardiopulmonar limpa.',
          professional: 'Dra. Julia'
        }
      ];

      const defaultReminders: PetReminder[] = [
        { id: 'rem-1', title: 'Vacina Antirrábica', date: '2026-08-10', type: 'vaccine', done: false },
        { id: 'rem-2', title: 'Vermífugo (Drontal)', date: '2026-09-15', type: 'medication', done: false },
        { id: 'rem-3', title: 'Banho de manutenção', date: '2026-07-20', type: 'grooming', done: false }
      ];

      const defaultDocs: PetDocument[] = [
        { id: 'doc-1', name: 'Laudo_Hemograma_Julho26.pdf', date: '2026-07-10', size: '240 KB', type: 'pdf' },
        { id: 'doc-2', name: 'Radiografia_Patela.png', date: '2026-05-15', size: '1.2 MB', type: 'image' }
      ];

      setWeights(defaultWeights);
      setMedicalRecords(defaultRecords);
      setReminders(defaultReminders);
      setDocuments(defaultDocs);
      setPetNotes('Paciente super dócil, porém reativo a barulhos agudos de secadores.');

      saveToCache({
        medicalRecords: defaultRecords,
        reminders: defaultReminders,
        documents: defaultDocs,
        weights: defaultWeights,
        petNotes: 'Paciente super dócil, porém reativo a barulhos agudos de secadores.'
      });
    }
  }, [pet.id]);

  const saveToCache = (data: {
    medicalRecords?: MedicalRecord[];
    reminders?: PetReminder[];
    documents?: PetDocument[];
    weights?: WeightRecord[];
    petNotes?: string;
  }) => {
    const petKey = `petsanny_profile_${pet.id}`;
    const current = localStorage.getItem(petKey);
    const base = current ? JSON.parse(current) : {};
    const updated = {
      ...base,
      medicalRecords: data.medicalRecords ?? medicalRecords,
      reminders: data.reminders ?? reminders,
      documents: data.documents ?? documents,
      weights: data.weights ?? weights,
      petNotes: data.petNotes ?? petNotes
    };
    localStorage.setItem(petKey, JSON.stringify(updated));
  };

  // Funções de manipulação de dados
  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;
    const newRecord: WeightRecord = {
      date: newWeightDate,
      weight: parseFloat(newWeight)
    };
    const updated = [...weights, newRecord].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setWeights(updated);
    saveToCache({ weights: updated });
    setNewWeight('');
    addToast('Peso Atualizado', `Novo peso de ${newWeight}kg registrado com sucesso.`, 'success');
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle || !newReminderDate) return;
    const newRem: PetReminder = {
      id: Math.random().toString(36).substring(2, 9),
      title: newReminderTitle,
      date: newReminderDate,
      type: newReminderType,
      done: false
    };
    const updated = [...reminders, newRem].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setReminders(updated);
    saveToCache({ reminders: updated });
    setNewReminderTitle('');
    setNewReminderDate('');
    addToast('Lembrete Adicionado', `O lembrete "${newReminderTitle}" foi agendado.`, 'success');
  };

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, done: !r.done } : r);
    setReminders(updated);
    saveToCache({ reminders: updated });
    addToast('Lembrete Atualizado', 'Status do lembrete alterado com sucesso.', 'info');
  };

  const handleRemoveReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    saveToCache({ reminders: updated });
    addToast('Lembrete Removido', 'Lembrete excluído com sucesso.', 'info');
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecordTitle || !newRecordDesc) return;
    const newRec: MedicalRecord = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString().split('T')[0],
      type: newRecordType,
      title: newRecordTitle,
      description: newRecordDesc,
      professional: newRecordProf || 'Clínica PetSanny'
    };
    const updated = [newRec, ...medicalRecords];
    setMedicalRecords(updated);
    saveToCache({ medicalRecords: updated });
    setNewRecordTitle('');
    setNewRecordDesc('');
    setNewRecordProf('');
    addToast('Registro Clínico Salvo', 'As informações médicas foram gravadas no prontuário do pet.', 'success');
  };

  const handleSaveNotes = () => {
    saveToCache({ petNotes });
    addToast('Notas Salvas', 'As anotações gerais sobre o pet foram salvas.', 'success');
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const newDoc: PetDocument = {
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      date: new Date().toISOString().split('T')[0],
      size: `${(file.size / 1024).toFixed(0)} KB`,
      type: file.type.includes('pdf') ? 'pdf' : 'image'
    };
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    saveToCache({ documents: updated });
    addToast('Upload de Documento', 'Arquivo carregado com sucesso no histórico do pet.', 'success');
  };

  const handleDeleteDocument = (id: string) => {
    const updated = documents.filter(d => d.id !== id);
    setDocuments(updated);
    saveToCache({ documents: updated });
    addToast('Documento Removido', 'Documento excluído com sucesso.', 'info');
  };

  // Cálculo da idade amigável
  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    const diffMs = Date.now() - birth.getTime();
    const ageDate = new Date(diffMs);
    const years = Math.abs(ageDate.getUTCFullYear() - 1970);
    const months = ageDate.getUTCMonth();
    
    if (years === 0) {
      return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    }
    return `${years} ${years === 1 ? 'ano' : 'anos'}${months > 0 ? ` e ${months} ${months === 1 ? 'mês' : 'meses'}` : ''}`;
  };

  const getRecordIcon = (type: MedicalRecord['type']) => {
    switch (type) {
      case 'consultation': return <Stethoscope className="w-4 h-4 text-blue-500" />;
      case 'vaccine': return <Syringe className="w-4 h-4 text-purple-500" />;
      case 'medication': return <Heart className="w-4 h-4 text-rose-500" />;
      case 'exam': return <FileText className="w-4 h-4 text-amber-500" />;
      case 'surgery': return <Activity className="w-4 h-4 text-red-500" />;
      case 'grooming': return <Scissors className="w-4 h-4 text-orange-500" />;
      default: return <Smile className="w-4 h-4 text-stone-500" />;
    }
  };

  const getReminderBadgeColor = (type: PetReminder['type']) => {
    switch (type) {
      case 'vaccine': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'medication': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
      case 'exam': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'grooming': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm text-xs text-stone-850 dark:text-stone-150 animate-fade-in">
      
      {/* Botão Superior Voltar */}
      <div className="p-4 border-b border-stone-150 dark:border-stone-850 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-100 font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Clientes & Pets</span>
        </button>
        <span className="text-[10px] bg-stone-100 dark:bg-stone-950 font-extrabold uppercase px-2.5 py-1 rounded-full border dark:border-stone-850">
          PRONTUÁRIO DIGITAL
        </span>
      </div>

      {/* Header Premium do Pet */}
      <div className="p-6 bg-gradient-to-br from-stone-50/50 via-white to-stone-50/30 dark:from-stone-950/20 dark:via-stone-900 dark:to-stone-950/10 border-b border-stone-150 dark:border-stone-850 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Info Pet */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-olive-500/10 dark:bg-olive-950/40 text-olive-650 dark:text-olive-400 flex items-center justify-center font-bold text-3xl border border-olive-500/20 shadow-inner shrink-0">
            {pet.name[0].toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-stone-800 dark:text-stone-100 tracking-tight">{pet.name}</h3>
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                Plano Premium
              </span>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-450 font-bold uppercase tracking-wider">
              {pet.species} {pet.breed ? `• ${pet.breed}` : ''}
            </p>
            <p className="text-[10px] text-stone-400 font-semibold">
              Idade: {calculateAge(pet.birth_date)}
            </p>
          </div>
        </div>

        {/* Info Clínicas */}
        <div className="grid grid-cols-2 gap-4 border-y md:border-y-0 md:border-x border-stone-150 dark:border-stone-850 py-4 md:py-0 md:px-6">
          <div>
            <span className="text-[9px] text-stone-450 dark:text-stone-500 font-bold uppercase tracking-wider block mb-0.5">Peso Atual</span>
            <div className="flex items-center gap-1.5 text-sm font-extrabold text-stone-800 dark:text-stone-100">
              <Scale className="w-4 h-4 text-stone-450" />
              <span>{weights.length > 0 ? `${weights[weights.length - 1].weight} kg` : 'N/A'}</span>
            </div>
          </div>
          <div>
            <span className="text-[9px] text-stone-450 dark:text-stone-500 font-bold uppercase tracking-wider block mb-0.5">Microchip</span>
            <div className="flex items-center gap-1.5 text-sm font-extrabold text-stone-850 dark:text-stone-200">
              <FileText className="w-4 h-4 text-stone-450" />
              <span className="font-mono">PR-998822</span>
            </div>
          </div>
        </div>

        {/* Tutor & Responsável */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-olive-600 dark:text-olive-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[9px] text-stone-450 dark:text-stone-500 block leading-none font-bold uppercase">Tutor</span>
              <span className="font-bold text-stone-800 dark:text-stone-155 truncate block">{tutor.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-olive-650 dark:text-olive-400 shrink-0" />
            <span className="font-semibold text-stone-500 dark:text-stone-400">{tutor.phone || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap border-b border-stone-150 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-950/20 px-4">
        {[
          { id: 'summary', label: 'Resumo & Gráficos' },
          { id: 'medical', label: 'Histórico Médico' },
          { id: 'aesthetics', label: 'Estética Pet' },
          { id: 'financial', label: 'Financeiro' },
          { id: 'docs', label: 'Documentos & Laudos' },
          { id: 'notes', label: 'Observações Internas' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 font-extrabold text-[10px] uppercase border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id 
                ? 'border-olive-600 text-olive-600 dark:text-olive-400 bg-white dark:bg-stone-900' 
                : 'border-transparent text-stone-450 hover:text-stone-700 dark:hover:text-stone-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo Aba Ativa */}
      <div className="p-6">
        
        {/* ABA 1: RESUMO & GRÁFICOS */}
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Lembretes e Pendências */}
            <div className="lg:col-span-1 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-150 dark:border-stone-800">
                <h4 className="font-extrabold text-sm text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Próximos Lembretes
                </h4>
              </div>

              {/* Formulário rápido de Lembretes */}
              <form onSubmit={handleAddReminder} className="p-3 bg-stone-50 dark:bg-stone-950/30 border dark:border-stone-850 rounded-xl space-y-2">
                <input
                  type="text"
                  required
                  placeholder="Nome do lembrete (Ex: Vacina V10)"
                  value={newReminderTitle}
                  onChange={(e) => setNewReminderTitle(e.target.value)}
                  className="w-full bg-white dark:bg-stone-900 rounded-lg p-2 border border-stone-200 dark:border-stone-800 focus:border-olive-500 outline-none text-[11px]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required
                    value={newReminderDate}
                    onChange={(e) => setNewReminderDate(e.target.value)}
                    className="bg-white dark:bg-stone-900 rounded-lg p-2 border border-stone-200 dark:border-stone-800 outline-none text-[11px]"
                  />
                  <select
                    value={newReminderType}
                    onChange={(e) => setNewReminderType(e.target.value as any)}
                    className="bg-white dark:bg-stone-900 rounded-lg p-2 border border-stone-200 dark:border-stone-800 outline-none text-[11px] font-bold"
                  >
                    <option value="vaccine">Vacina</option>
                    <option value="medication">Remédio</option>
                    <option value="exam">Exame</option>
                    <option value="grooming">Estética</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-olive-600 hover:bg-olive-750 text-white font-bold py-1.5 rounded-lg text-[10px] cursor-pointer"
                >
                  Agendar Lembrete
                </button>
              </form>

              {/* Lista de Lembretes */}
              <div className="space-y-2">
                {reminders.length === 0 ? (
                  <p className="text-stone-450 italic text-center py-4">Sem lembretes futuros.</p>
                ) : (
                  reminders.map((rem) => (
                    <div 
                      key={rem.id} 
                      className={`flex items-center justify-between p-2.5 border rounded-xl transition-all ${
                        rem.done 
                          ? 'bg-stone-50/50 dark:bg-stone-950/10 border-stone-150 dark:border-stone-850 opacity-60' 
                          : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => handleToggleReminder(rem.id)}
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                            rem.done 
                              ? 'bg-emerald-600 border-emerald-600 text-white' 
                              : 'border-stone-300 dark:border-stone-700 hover:border-olive-500'
                          }`}
                        >
                          {rem.done && <Check className="w-3 h-3" />}
                        </button>
                        <div className="min-w-0">
                          <span className={`font-bold text-[11px] block leading-tight ${rem.done ? 'line-through text-stone-450' : 'text-stone-800 dark:text-stone-200'}`}>
                            {rem.title}
                          </span>
                          <span className="text-[9px] text-stone-400 font-semibold">
                            Agendado para: {rem.date.split('-').reverse().join('/')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${getReminderBadgeColor(rem.type)}`}>
                          {rem.type}
                        </span>
                        <button
                          onClick={() => handleRemoveReminder(rem.id)}
                          className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-stone-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Evolução de Peso do Pet */}
            <div className="lg:col-span-2 space-y-6 border-l dark:border-stone-800 lg:pl-8">
              <div className="flex items-center justify-between pb-3 border-b border-stone-150 dark:border-stone-800">
                <h4 className="font-extrabold text-sm text-stone-850 dark:text-stone-100 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-olive-600" />
                  Evolução do Peso
                </h4>
              </div>

              {/* Gráfico de Peso SVG */}
              <div className="relative w-full h-40 pt-2 bg-stone-50/50 dark:bg-stone-950/25 p-3 rounded-2xl border dark:border-stone-850">
                {weights.length < 2 ? (
                  <p className="text-stone-450 italic text-center py-12">Poucos dados para gerar o gráfico.</p>
                ) : (
                  <svg viewBox="0 0 200 80" className="w-full h-full overflow-visible">
                    <line x1="10" y1="70" x2="190" y2="70" stroke="#78716c" strokeOpacity="0.2" />
                    
                    {/* Linha do gráfico */}
                    <path
                      d={`M 10 ${70 - (weights[0]?.weight - 5) * 6} Q 60 ${70 - (weights[1]?.weight - 5) * 6} 120 ${70 - (weights[2]?.weight - 5) * 6} T 190 ${70 - (weights[3]?.weight - 5) * 6}`}
                      fill="none"
                      stroke="#65a30d"
                      strokeWidth="2"
                    />
                    
                    {/* Pontos */}
                    {weights.map((pt, i) => {
                      const x = 10 + i * 60;
                      const y = 70 - (pt.weight - 5) * 6;
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="2.5" fill="#65a30d" stroke="#ffffff" strokeWidth="0.8" />
                          <text x={x} y={y - 5} textAnchor="middle" className="text-[7px] font-bold fill-stone-700 dark:fill-stone-300 font-sans">{pt.weight}kg</text>
                          <text x={x} y="77" textAnchor="middle" className="text-[6px] font-bold fill-stone-400 font-sans">{pt.date.split('-')[1]}/{pt.date.split('-')[2]}</text>
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>

              {/* Adicionar Registro de Peso */}
              <form onSubmit={handleAddWeight} className="flex flex-col sm:flex-row items-end gap-3 p-3.5 bg-stone-50 dark:bg-stone-950/20 border dark:border-stone-850 rounded-xl">
                <div className="flex-1 space-y-1">
                  <label className="block text-[9px] text-stone-500 font-bold uppercase">Data de pesagem</label>
                  <input
                    type="date"
                    required
                    value={newWeightDate}
                    onChange={(e) => setNewWeightDate(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 rounded-lg p-2 border border-stone-200 dark:border-stone-800 outline-none text-[11px]"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="block text-[9px] text-stone-500 font-bold uppercase">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="Ex: 10.5"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 rounded-lg p-2 border border-stone-200 dark:border-stone-800 outline-none text-[11px]"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-olive-600 hover:bg-olive-750 text-white font-bold px-4 py-2.5 rounded-lg text-[10px] cursor-pointer"
                >
                  Registrar Peso
                </button>
              </form>

            </div>
          </div>
        )}

        {/* ABA 2: HISTÓRICO MÉDICO */}
        {activeTab === 'medical' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            
            {/* Lançamento Clínico */}
            <div className="lg:col-span-1 space-y-5">
              <h4 className="font-extrabold text-sm text-stone-800 dark:text-stone-100 pb-2 border-b border-stone-150 dark:border-stone-800">
                Novo Registro Clínico
              </h4>
              <form onSubmit={handleAddRecord} className="p-4 bg-stone-50 dark:bg-stone-950/20 border dark:border-stone-850 rounded-2xl space-y-3">
                <div className="space-y-1">
                  <label className="block text-[9px] text-stone-500 font-bold uppercase">Tipo de Evento</label>
                  <select
                    value={newRecordType}
                    onChange={(e) => setNewRecordType(e.target.value as any)}
                    className="w-full bg-white dark:bg-stone-900 rounded-xl p-2 border border-stone-200 dark:border-stone-800 outline-none text-xs font-semibold"
                  >
                    <option value="consultation">Consulta Médica</option>
                    <option value="vaccine">Vacinação</option>
                    <option value="medication">Medicamento / Dose</option>
                    <option value="exam">Exame Clínico</option>
                    <option value="surgery">Cirurgia / Procedimento</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] text-stone-500 font-bold uppercase">Título *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Vacina V10"
                    value={newRecordTitle}
                    onChange={(e) => setNewRecordTitle(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 rounded-xl p-2.5 border border-stone-200 dark:border-stone-800 outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] text-stone-500 font-bold uppercase">Profissional Responsável</label>
                  <input
                    type="text"
                    placeholder="Ex: Dra. Julia"
                    value={newRecordProf}
                    onChange={(e) => setNewRecordProf(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 rounded-xl p-2.5 border border-stone-200 dark:border-stone-800 outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] text-stone-500 font-bold uppercase">Descrição e Diagnóstico *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Descreva observações, dosagens, reações ou recomendações do procedimento."
                    value={newRecordDesc}
                    onChange={(e) => setNewRecordDesc(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 rounded-xl p-2.5 border border-stone-200 dark:border-stone-800 outline-none text-xs resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-olive-600 hover:bg-olive-750 text-white font-bold py-2 rounded-xl text-xs cursor-pointer"
                >
                  Gravar no Prontuário
                </button>
              </form>
            </div>

            {/* Timeline Vertical */}
            <div className="lg:col-span-2 space-y-5 border-l dark:border-stone-800 lg:pl-8">
              <h4 className="font-extrabold text-sm text-stone-855 dark:text-stone-100 pb-2 border-b border-stone-150 dark:border-stone-800">
                Linha do Tempo Médica e Estética
              </h4>

              {medicalRecords.length === 0 ? (
                <p className="text-stone-450 italic text-center py-12">Nenhum registro clínico cadastrado.</p>
              ) : (
                <div className="relative border-l border-stone-200 dark:border-stone-800 ml-4 pl-6 space-y-6 py-2">
                  {medicalRecords.map((rec) => (
                    <div key={rec.id} className="relative group">
                      {/* Círculo do Ícone */}
                      <span className="absolute -left-10 top-0.5 bg-white dark:bg-stone-950 w-8 h-8 rounded-full border border-stone-200 dark:border-stone-800 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                        {getRecordIcon(rec.type)}
                      </span>
                      
                      <div className="bg-stone-50/50 dark:bg-stone-950/20 border border-stone-150 dark:border-stone-850 p-4 rounded-2xl space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="text-[8px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
                              {rec.date.split('-').reverse().join('/')}
                            </span>
                            <h5 className="font-extrabold text-stone-800 dark:text-stone-200 text-xs">{rec.title}</h5>
                          </div>
                          <span className="text-[8px] bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 font-bold px-2 py-0.5 rounded-full uppercase text-stone-550 dark:text-stone-450">
                            {rec.professional}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-550 dark:text-stone-400 font-medium leading-relaxed">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA 3: ESTÉTICA PET */}
        {activeTab === 'aesthetics' && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="font-extrabold text-sm text-stone-800 dark:text-stone-100 pb-2 border-b border-stone-150 dark:border-stone-800">
              Histórico de Estética (Banhos & Tosas)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {medicalRecords.filter(rec => rec.type === 'grooming').length === 0 ? (
                <div className="col-span-2 text-center text-stone-450 italic py-12">Nenhum procedimento de estética registrado.</div>
              ) : (
                medicalRecords.filter(rec => rec.type === 'grooming').map((rec) => (
                  <div key={rec.id} className="p-4 bg-white dark:bg-stone-955 border border-stone-150 dark:border-stone-800 rounded-2xl flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-655 dark:text-orange-400 flex items-center justify-center shrink-0">
                      <Scissors className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span className="text-[8px] font-bold text-stone-400 block">{rec.date.split('-').reverse().join('/')}</span>
                      <h5 className="font-extrabold text-stone-800 dark:text-stone-200 text-xs truncate">{rec.title}</h5>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-normal">{rec.description}</p>
                      <span className="text-[8px] text-stone-400 font-semibold block pt-1">Atendido por: {rec.professional}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ABA 4: FINANCEIRO */}
        {activeTab === 'financial' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-stone-150 dark:border-stone-800">
              <h4 className="font-extrabold text-sm text-stone-800 dark:text-stone-100">
                Histórico Financeiro do Paciente
              </h4>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500">
                Total Acumulado: {formatCurrency(medicalRecords.length * 120)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-150 dark:border-stone-800 text-[10px] text-stone-500 uppercase font-bold bg-stone-50/50 dark:bg-stone-950/20">
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Serviço / Item</th>
                    <th className="py-2.5 px-3">Profissional</th>
                    <th className="py-2.5 px-3">Método</th>
                    <th className="py-2.5 px-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150 dark:divide-stone-850 font-medium">
                  {medicalRecords.map((rec, i) => (
                    <tr key={i} className="hover:bg-stone-50/30 dark:hover:bg-stone-950/10">
                      <td className="py-3 px-3 text-[10px] text-stone-450">{rec.date.split('-').reverse().join('/')}</td>
                      <td className="py-3 px-3 text-stone-800 dark:text-stone-200 font-bold">{rec.title}</td>
                      <td className="py-3 px-3">{rec.professional}</td>
                      <td className="py-3 px-3">
                        <span className="bg-stone-100 dark:bg-stone-950 text-stone-500 dark:text-stone-400 text-[9px] font-bold px-2 py-0.5 rounded-full border dark:border-stone-800">
                          Pix
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-stone-850 dark:text-stone-100 font-extrabold">
                        {formatCurrency(120.00)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 5: DOCUMENTOS & LAUDOS */}
        {activeTab === 'docs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            
            {/* Upload Area */}
            <div className="lg:col-span-1 space-y-4">
              <h4 className="font-extrabold text-sm text-stone-850 dark:text-stone-100 pb-2 border-b border-stone-150 dark:border-stone-800">
                Carregar Documento
              </h4>
              <div className="p-6 border-2 border-dashed border-stone-300 dark:border-stone-800 hover:border-olive-500 dark:hover:border-olive-500 rounded-2xl text-center bg-stone-50/30 dark:bg-stone-950/20 cursor-pointer transition-colors relative flex flex-col items-center justify-center gap-3">
                <Upload className="w-8 h-8 text-stone-400" />
                <div className="space-y-1">
                  <span className="font-bold text-xs block text-stone-700 dark:text-stone-200">Escolha um arquivo</span>
                  <span className="text-[10px] text-stone-450 block">PDF ou imagem (Máx. 10MB)</span>
                </div>
                <input
                  type="file"
                  onChange={handleSimulateUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title="Selecionar arquivo"
                />
              </div>
            </div>

            {/* Lista de Documentos */}
            <div className="lg:col-span-2 space-y-4 border-l dark:border-stone-800 lg:pl-8">
              <h4 className="font-extrabold text-sm text-stone-850 dark:text-stone-100 pb-2 border-b border-stone-150 dark:border-stone-800">
                Laudos, Exames & Imagens
              </h4>

              {documents.length === 0 ? (
                <p className="text-stone-450 italic text-center py-12">Nenhum documento anexado.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-3 bg-white dark:bg-stone-950/20 border border-stone-200 dark:border-stone-800 rounded-xl flex items-center justify-between gap-3 hover:shadow-xs transition-all">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-950 flex items-center justify-center shrink-0 border dark:border-stone-850 text-stone-500">
                          <FileText className="w-5 h-5 text-stone-450 dark:text-stone-500" />
                        </div>
                        <div className="min-w-0">
                          <h6 className="font-bold text-[11px] text-stone-850 dark:text-stone-100 truncate block leading-tight">{doc.name}</h6>
                          <span className="text-[9px] text-stone-400 font-semibold block mt-0.5">
                            {doc.date.split('-').reverse().join('/')} • {doc.size}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1 hover:bg-rose-50 dark:hover:bg-rose-955/20 text-stone-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Remover documento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA 6: OBSERVAÇÕES INTERNAS */}
        {activeTab === 'notes' && (
          <div className="space-y-5 animate-fade-in max-w-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-150 dark:border-stone-800">
              <h4 className="font-extrabold text-sm text-stone-800 dark:text-stone-100">
                Observações Clínicas e Comportamentais
              </h4>
              <span className="text-[10px] text-stone-450 font-bold uppercase">Restrito para profissionais da clínica</span>
            </div>
            
            <div className="space-y-3">
              <textarea
                rows={8}
                value={petNotes}
                onChange={(e) => setPetNotes(e.target.value)}
                placeholder="Insira notas importantes sobre comportamento, alergias e cuidados no manuseio que serão mostrados nos atendimentos."
                className="w-full bg-stone-50/50 dark:bg-stone-950/20 text-stone-850 dark:text-stone-100 text-xs rounded-2xl p-4 border border-stone-200 dark:border-stone-800 focus:border-olive-500 outline-none transition-all resize-none shadow-inner"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveNotes}
                  className="bg-olive-600 hover:bg-olive-750 text-white font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-olive-900/10 hover:-translate-y-0.5"
                >
                  Salvar Observações
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
