import { localDate } from "./dates";
import { tableService, requireSupabase } from "./supabaseClient";
interface Base {
  id: string;
  tenant_id: string;
  created_at?: string;
}
export interface InventoryRow extends Base {
  name: string;
  category: "medicine" | "vaccine" | "product" | "shampoo" | "equipment";
  provider: string | null;
  batch: string | null;
  barcode: string | null;
  qty: number;
  min_qty: number;
  max_qty: number;
  expiry_date: string | null;
  buy_price: number;
  sell_price: number;
}
export interface FinanceRow extends Base {
  appointment_id?: string | null;
  transaction_date: string;
  description: string;
  transaction_type: "revenue" | "expense";
  category: string;
  value: number;
  payment_method: "pix" | "credit_card" | "cash" | "boleto";
}
export interface WeightRow extends Base {
  pet_id: string;
  weight: number;
  recorded_date: string;
}
export interface MedicalRow extends Base {
  pet_id: string;
  record_date: string;
  record_type:
    | "consultation"
    | "vaccine"
    | "medication"
    | "exam"
    | "surgery"
    | "grooming"
    | "observation";
  title: string;
  description: string;
  professional: string;
}
export interface ReminderRow extends Base {
  pet_id: string;
  title: string;
  reminder_date: string;
  reminder_type: "vaccine" | "medication" | "exam" | "grooming";
  done: boolean;
}
export interface DocumentRow extends Base {
  pet_id: string;
  name: string;
  document_date: string;
  size: string;
  file_type: string;
  storage_path: string;
  file_url?: string | null;
}
export interface AutomationRow extends Base {
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  active: boolean;
}
export interface ConversationRow extends Base {
  tutor_id: string;
  channel: "internal" | "whatsapp" | "email";
  status: "open" | "closed";
}
export interface MessageRow extends Base {
  conversation_id: string;
  direction: "incoming" | "outgoing";
  body: string;
  delivery_status: "pending" | "sent" | "delivered" | "read" | "failed";
}
export const inventoryService = tableService<InventoryRow>("inventory");
export const financeService = tableService<FinanceRow>(
  "financial_transactions",
);
export const weightsService = tableService<WeightRow>("pet_weights");
export const medicalService = tableService<MedicalRow>("medical_records");
export const remindersService = tableService<ReminderRow>("pet_reminders");
export const documentsService = tableService<DocumentRow>("pet_documents");
export const automationService =
  tableService<AutomationRow>("automation_rules");
export const conversationsService =
  tableService<ConversationRow>("crm_conversations");
export const messagesService = tableService<MessageRow>("crm_messages");
const DOCUMENT_BUCKET = "pet-documents";
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
export async function uploadPetDocument(
  tenantId: string,
  petId: string,
  file: File,
) {
  if (
    !ALLOWED_TYPES.includes(file.type) ||
    file.size > 10 * 1024 * 1024 ||
    !file.size
  )
    throw new Error("Envie PDF, JPG, PNG ou WebP com até 10 MB.");
  const extension = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  }[file.type];
  const path = `${tenantId}/${petId}/${crypto.randomUUID()}.${extension}`;
  const bucket = requireSupabase().storage.from(DOCUMENT_BUCKET);
  const { error } = await bucket.upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  try {
    return await documentsService.create({
      tenant_id: tenantId,
      pet_id: petId,
      name: file.name,
      document_date: localDate(),
      size: `${Math.ceil(file.size / 1024)} KB`,
      file_type: file.type,
      storage_path: path,
    });
  } catch (error) {
    await bucket.remove([path]);
    throw error;
  }
}
export async function downloadPetDocument(document: DocumentRow) {
  const { data, error } = await requireSupabase()
    .storage.from(DOCUMENT_BUCKET)
    .createSignedUrl(document.storage_path, 60, { download: document.name });
  if (error) throw error;
  if (!data?.signedUrl) throw new Error("Não foi possível preparar o download. Tente novamente.");
  return data.signedUrl;
}
export async function deletePetDocument(document: DocumentRow) {
  // Metadados permanecem se a remoção do arquivo falhar.
  const { error } = await requireSupabase()
    .storage.from(DOCUMENT_BUCKET)
    .remove([document.storage_path]);
  if (error) throw error;
  await documentsService.delete(document.id, document.tenant_id);
}
