import { z } from 'zod';

// Schema de Agendamento
export const appointmentSchema = z.object({
  tutor_name: z.string().min(3, 'O nome do tutor deve ter no mínimo 3 caracteres'),
  tutor_email: z.string().email('Insira um e-mail válido'),
  pet_name: z.string().min(2, 'O nome do pet deve ter no mínimo 2 caracteres'),
  pet_species: z.string().min(2, 'Informe a espécie/raça do pet'),
  service_type: z.enum(['vet', 'aesthetic']),
  service_name: z.string().min(3, 'Informe o nome do serviço'),
  professional_name: z.string().min(3, 'Selecione o profissional responsável'),
  price: z.number().min(0, 'O valor deve ser maior ou igual a zero'),
  appointment_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Data inválida'),
  appointment_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM'),
  critical_notes: z.string().nullable().optional()
});

// Schema de Tutor
export const tutorSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido').nullable().optional().or(z.literal('')),
  phone: z.string().min(10, 'Telefone inválido (mínimo 10 dígitos)').nullable().optional().or(z.literal(''))
});

// Schema de Pet
export const petSchema = z.object({
  name: z.string().min(2, 'O nome do pet é obrigatório'),
  species: z.string().min(2, 'A espécie é obrigatória'),
  breed: z.string().nullable().optional(),
  birth_date: z.string().nullable().optional()
});

// Schema de Item de Estoque
export const inventoryItemSchema = z.object({
  name: z.string().min(2, 'Nome do item é obrigatório'),
  category: z.string().min(2, 'Categoria é obrigatória'),
  quantity: z.number().min(0, 'Quantidade não pode ser negativa'),
  min_quantity: z.number().min(0, 'Quantidade mínima inválida'),
  unit_price: z.number().min(0, 'Preço deve ser maior que zero')
});

// Utilitários de Máscara
export const formatPhone = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3').replace(/-$/, '');
  }
  return digits.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3').replace(/-$/, '');
};

export const formatCurrency = (amount: number, locale = 'pt-BR', currency = 'BRL') => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};
