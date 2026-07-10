import { createClient } from '@supabase/supabase-js';

// Chaves do Supabase vindas do Vite (.env.local)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// Tipo para os agendamentos correspondente ao banco
export interface Appointment {
  id: string;
  tenant_id: string;
  tutor_name: string;
  pet_name: string;
  pet_species: string;
  tutor_email: string;
  service_type: 'vet' | 'aesthetic';
  service_name: string;
  professional_name: string;
  price: number;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed';
  confirmed_at: string | null;
  critical_notes: string | null;
  created_at?: string;
}

export interface Tutor {
  id: string;
  tenant_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at?: string;
}

export interface Pet {
  id: string;
  tenant_id: string;
  tutor_id: string;
  name: string;
  species: string;
  breed: string | null;
  birth_date: string | null;
  created_at?: string;
}

// Dados iniciais de teste (Seed Data)
const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    tenant_id: 'tenant-clinica-sanny-1',
    tutor_name: 'Ana Souza',
    pet_name: 'Toby',
    pet_species: 'Cão (Golden Retriever)',
    tutor_email: 'ana.souza@gmail.com',
    service_type: 'aesthetic',
    service_name: 'Banho, Tosa Higiênica e Hidratação',
    professional_name: 'Cleiton (Esteticista)',
    price: 120.00,
    appointment_date: new Date().toISOString().split('T')[0], // hoje
    appointment_time: '09:00',
    status: 'pending',
    confirmed_at: null,
    critical_notes: 'Cão reativo/bravo com soprador de vento quente.'
  },
  {
    id: '2',
    tenant_id: 'tenant-clinica-sanny-1',
    tutor_name: 'Bruno Lima',
    pet_name: 'Mel',
    pet_species: 'Cão (Lhasa Apso)',
    tutor_email: 'bruno.lima@outlook.com',
    service_type: 'aesthetic',
    service_name: 'Banho e Tosa Completa na Máquina',
    professional_name: 'Mariana (Esteticista)',
    price: 90.00,
    appointment_date: new Date().toISOString().split('T')[0], // hoje
    appointment_time: '14:30',
    status: 'confirmed',
    confirmed_at: new Date().toISOString(),
    critical_notes: 'Alergia severa a shampoos com perfume. Usar somente neutro/hipoalergênico.'
  },
  {
    id: '3',
    tenant_id: 'tenant-clinica-sanny-1',
    tutor_name: 'Carla Dias',
    pet_name: 'Alfredo',
    pet_species: 'Gato (Persa)',
    tutor_email: 'carla.dias@yahoo.com.br',
    service_type: 'vet',
    service_name: 'Consulta Veterinária de Rotina + Vacina V10',
    professional_name: 'Dra. Julia (Veterinária)',
    price: 180.00,
    appointment_date: new Date().toISOString().split('T')[0], // hoje
    appointment_time: '11:00',
    status: 'confirmed',
    confirmed_at: new Date().toISOString(),
    critical_notes: 'Pet idoso (14 anos) com grave problema de coluna. Manusear com extremo cuidado.'
  },
  {
    id: '4',
    tenant_id: 'tenant-clinica-sanny-1',
    tutor_name: 'Daniel Alves',
    pet_name: 'Thor',
    pet_species: 'Cão (Rottweiler)',
    tutor_email: 'daniel.alves@gmail.com',
    service_type: 'vet',
    service_name: 'Exame de Sangue e Hemograma Completo',
    professional_name: 'Dr. Ricardo (Veterinário)',
    price: 150.00,
    appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // amanhã
    appointment_time: '10:00',
    status: 'pending',
    confirmed_at: null,
    critical_notes: 'Cão de grande porte. Necessário uso de focinheira na sala de coleta.'
  },
  {
    id: '5',
    tenant_id: 'tenant-clinica-sanny-2', // CLINICA B
    tutor_name: 'Eliana Costa',
    pet_name: 'Luna',
    pet_species: 'Gata (SRD)',
    tutor_email: 'eliana.costa@hotmail.com',
    service_type: 'vet',
    service_name: 'Vacina Antirrábica + Check-up geral',
    professional_name: 'Dr. Fábio (Veterinário)',
    price: 130.00,
    appointment_date: new Date().toISOString().split('T')[0], // hoje
    appointment_time: '16:00',
    status: 'pending',
    confirmed_at: null,
    critical_notes: 'Muito assustada. Tende a tentar fugir da mesa.'
  },
  {
    id: '6',
    tenant_id: 'tenant-clinica-sanny-2', // CLINICA B
    tutor_name: 'Felipe Mota',
    pet_name: 'Pipoca',
    pet_species: 'Cão (Poodle)',
    tutor_email: 'felipe.mota@gmail.com',
    service_type: 'aesthetic',
    service_name: 'Banho simples e Limpeza de Ouvido',
    professional_name: 'Cleiton (Esteticista)',
    price: 70.00,
    appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // amanhã
    appointment_time: '08:30',
    status: 'completed',
    confirmed_at: new Date().toISOString(),
    critical_notes: null
  }
];

// Dados iniciais de teste para Tutores e Pets
const SEED_TUTORS: Tutor[] = [
  {
    id: 'tutor-1',
    tenant_id: 'tenant-clinica-sanny-1',
    name: 'Ana Souza',
    email: 'ana.souza@gmail.com',
    phone: '(11) 98888-7777'
  },
  {
    id: 'tutor-2',
    tenant_id: 'tenant-clinica-sanny-1',
    name: 'Bruno Lima',
    email: 'bruno.lima@outlook.com',
    phone: '(11) 97777-6666'
  },
  {
    id: 'tutor-3',
    tenant_id: 'tenant-clinica-sanny-2',
    name: 'Eliana Costa',
    email: 'eliana.costa@hotmail.com',
    phone: '(21) 96666-5555'
  }
];

const SEED_PETS: Pet[] = [
  {
    id: 'pet-1',
    tenant_id: 'tenant-clinica-sanny-1',
    tutor_id: 'tutor-1',
    name: 'Toby',
    species: 'Cão (Golden Retriever)',
    breed: 'Golden Retriever',
    birth_date: '2021-05-10'
  },
  {
    id: 'pet-2',
    tenant_id: 'tenant-clinica-sanny-1',
    tutor_id: 'tutor-2',
    name: 'Mel',
    species: 'Cão (Lhasa Apso)',
    breed: 'Lhasa Apso',
    birth_date: '2023-01-15'
  },
  {
    id: 'pet-3',
    tenant_id: 'tenant-clinica-sanny-2',
    tutor_id: 'tutor-3',
    name: 'Luna',
    species: 'Gata (SRD)',
    breed: 'SRD',
    birth_date: '2020-08-20'
  }
];

// Verifica se deve usar o cliente real ou o mock
export const isMockClient = !supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL';

// Se for real, cria; se for mock, mantemos null e usaremos a API de mock
const realSupabase = isMockClient ? null : createClient(supabaseUrl, supabaseAnonKey);

// Implementação do Mock Local Storage para o MVP
const getLocalAppointments = (): Appointment[] => {
  const data = localStorage.getItem('petsanny_appointments');
  if (!data) {
    localStorage.setItem('petsanny_appointments', JSON.stringify(SEED_APPOINTMENTS));
    return SEED_APPOINTMENTS;
  }
  return JSON.parse(data);
};

const saveLocalAppointments = (appointments: Appointment[]) => {
  localStorage.setItem('petsanny_appointments', JSON.stringify(appointments));
};

const getLocalTutors = (): Tutor[] => {
  const data = localStorage.getItem('petsanny_tutors');
  if (!data) {
    localStorage.setItem('petsanny_tutors', JSON.stringify(SEED_TUTORS));
    return SEED_TUTORS;
  }
  return JSON.parse(data);
};

const saveLocalTutors = (tutors: Tutor[]) => {
  localStorage.setItem('petsanny_tutors', JSON.stringify(tutors));
};

const getLocalPets = (): Pet[] => {
  const data = localStorage.getItem('petsanny_pets');
  if (!data) {
    localStorage.setItem('petsanny_pets', JSON.stringify(SEED_PETS));
    return SEED_PETS;
  }
  return JSON.parse(data);
};

const saveLocalPets = (pets: Pet[]) => {
  localStorage.setItem('petsanny_pets', JSON.stringify(pets));
};

// Interface unificada para acessar os dados (Client Wrapper ou Mock)
export const appointmentsService = {
  async list(tenantId: string): Promise<Appointment[]> {
    if (!isMockClient && realSupabase && isUUID(tenantId)) {
      const { data, error } = await realSupabase
        .from('appointments')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar dados do Supabase, usando fallback local:', error);
      } else {
        return data as Appointment[];
      }
    }
    
    // Mock Fallback
    return getLocalAppointments().filter(app => app.tenant_id === tenantId);
  },

  async create(appointment: Omit<Appointment, 'id' | 'created_at'>): Promise<Appointment> {
    const newApp: Appointment = {
      ...appointment,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };

    if (!isMockClient && realSupabase && isUUID(newApp.tenant_id)) {
      const { data, error } = await realSupabase
        .from('appointments')
        .insert([newApp])
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao inserir no Supabase, salvando localmente:', error);
      } else {
        return data as Appointment;
      }
    }

    // Mock Fallback
    const apps = getLocalAppointments();
    apps.push(newApp);
    saveLocalAppointments(apps);
    return newApp;
  },

  async updateStatus(id: string, status: 'pending' | 'confirmed' | 'completed'): Promise<Appointment> {
    const confirmed_at = status === 'confirmed' ? new Date().toISOString() : null;

    if (!isMockClient && realSupabase && isUUID(id)) {
      const { data, error } = await realSupabase
        .from('appointments')
        .update({ status, confirmed_at })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar status no Supabase, atualizando localmente:', error);
      } else {
        return data as Appointment;
      }
    }

    // Mock Fallback
    const apps = getLocalAppointments();
    const idx = apps.findIndex(app => app.id === id);
    if (idx !== -1) {
      apps[idx] = { ...apps[idx], status, confirmed_at };
      saveLocalAppointments(apps);
      return apps[idx];
    }
    throw new Error('Agendamento não encontrado');
  },

  async delete(id: string): Promise<boolean> {
    if (!isMockClient && realSupabase && isUUID(id)) {
      const { error } = await realSupabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao excluir no Supabase, excluindo localmente:', error);
      } else {
        return true;
      }
    }

    // Mock Fallback
    const apps = getLocalAppointments();
    const filtered = apps.filter(app => app.id !== id);
    saveLocalAppointments(filtered);
    return true;
  }
};

export const tutorsService = {
  async list(tenantId: string): Promise<Tutor[]> {
    if (!isMockClient && realSupabase && isUUID(tenantId)) {
      const { data, error } = await realSupabase
        .from('tutors')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('name', { ascending: true });
      if (error) {
        console.error('Erro ao buscar tutores no Supabase, usando fallback local:', error);
      } else {
        return data as Tutor[];
      }
    }
    return getLocalTutors().filter(t => t.tenant_id === tenantId);
  },

  async create(tutor: Omit<Tutor, 'id' | 'created_at'>): Promise<Tutor> {
    const newTutor: Tutor = {
      ...tutor,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };

    if (!isMockClient && realSupabase && isUUID(newTutor.tenant_id)) {
      const { data, error } = await realSupabase
        .from('tutors')
        .insert([newTutor])
        .select()
        .single();
      if (error) {
        console.error('Erro ao criar tutor no Supabase, salvando localmente:', error);
      } else {
        return data as Tutor;
      }
    }

    const list = getLocalTutors();
    list.push(newTutor);
    saveLocalTutors(list);
    return newTutor;
  },

  async delete(id: string): Promise<boolean> {
    if (!isMockClient && realSupabase && isUUID(id)) {
      const { error } = await realSupabase
        .from('tutors')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Erro ao deletar tutor no Supabase, deletando localmente:', error);
      } else {
        return true;
      }
    }

    const list = getLocalTutors();
    const filtered = list.filter(t => t.id !== id);
    saveLocalTutors(filtered);
    
    // Remover pets do tutor que foi excluído
    const pets = getLocalPets();
    const filteredPets = pets.filter(p => p.tutor_id !== id);
    saveLocalPets(filteredPets);
    return true;
  }
};

export const petsService = {
  async list(tenantId: string): Promise<Pet[]> {
    if (!isMockClient && realSupabase && isUUID(tenantId)) {
      const { data, error } = await realSupabase
        .from('pets')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('name', { ascending: true });
      if (error) {
        console.error('Erro ao buscar pets no Supabase, usando fallback local:', error);
      } else {
        return data as Pet[];
      }
    }
    return getLocalPets().filter(p => p.tenant_id === tenantId);
  },

  async create(pet: Omit<Pet, 'id' | 'created_at'>): Promise<Pet> {
    const newPet: Pet = {
      ...pet,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };

    if (!isMockClient && realSupabase && isUUID(newPet.tenant_id)) {
      const { data, error } = await realSupabase
        .from('pets')
        .insert([newPet])
        .select()
        .single();
      if (error) {
        console.error('Erro ao criar pet no Supabase, salvando localmente:', error);
      } else {
        return data as Pet;
      }
    }

    const list = getLocalPets();
    list.push(newPet);
    saveLocalPets(list);
    return newPet;
  },

  async delete(id: string): Promise<boolean> {
    if (!isMockClient && realSupabase && isUUID(id)) {
      const { error } = await realSupabase
        .from('pets')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Erro ao deletar pet no Supabase, deletando localmente:', error);
      } else {
        return true;
      }
    }

    const list = getLocalPets();
    const filtered = list.filter(p => p.id !== id);
    saveLocalPets(filtered);
    return true;
  }
};

export default realSupabase;
