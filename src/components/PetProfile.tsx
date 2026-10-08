import { useEffect, useState } from "react";
import { petsService, requireSupabase } from "../lib/supabaseClient";
import type { Pet, Tutor } from "../lib/supabaseClient";
import { useAppointments } from "../contexts/AppointmentsContext";
import { localDate } from "../lib/dates";
import {
  weightsService,
  medicalService,
  remindersService,
  documentsService,
  uploadPetDocument,
  downloadPetDocument,
  deletePetDocument,
} from "../lib/domainServices";
import type {
  WeightRow,
  MedicalRow,
  ReminderRow,
  DocumentRow,
} from "../lib/domainServices";
import { ConfirmModal } from "./ConfirmModal";
import { ArrowLeft, FileText, Scale, Calendar, Upload } from "lucide-react";
interface PetProfileProps {
  pet: Pet;
  tutor: Tutor;
  onBack: () => void;
}
export function PetProfile({ pet, tutor, onBack }: PetProfileProps) {
  const { addToast } = useAppointments();
  const [records, setRecords] = useState<MedicalRow[]>([]);
  const [weights, setWeights] = useState<WeightRow[]>([]);
  const [reminders, setReminders] = useState<ReminderRow[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState("medical");
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(localDate());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [professional, setProfessional] = useState("");
  const [recordType, setRecordType] =
    useState<MedicalRow["record_type"]>("consultation");
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderType, setReminderType] =
    useState<ReminderRow["reminder_type"]>("vaccine");
  const [deleteDocument, setDeleteDocument] = useState<DocumentRow | null>(
    null,
  );
  useEffect(() => {
    let canceled = false;
    setLoading(true);
    setLoadError("");
    setRecords([]);
    setWeights([]);
    setReminders([]);
    setDocuments([]);
    setNotes("");
    void Promise.all([
      medicalService.list(pet.tenant_id, { pet_id: pet.id }),
      weightsService.list(pet.tenant_id, { pet_id: pet.id }),
      remindersService.list(pet.tenant_id, { pet_id: pet.id }),
      documentsService.list(pet.tenant_id, { pet_id: pet.id }),
      requireSupabase()
        .from("pets")
        .select("notes")
        .eq("tenant_id", pet.tenant_id)
        .eq("id", pet.id)
        .single(),
    ])
      .then(([r, w, m, d, p]) => {
        if (canceled) return;
        if (p.error) throw p.error;
        setRecords(
          r.sort((a, b) => b.record_date.localeCompare(a.record_date)),
        );
        setWeights(
          w.sort((a, b) => a.recorded_date.localeCompare(b.recorded_date)),
        );
        setReminders(m);
        setDocuments(d);
        setNotes(p.data.notes || "");
      })
      .catch(() => {
        if (!canceled)
          setLoadError(
            "Não foi possível carregar o prontuário. Volte à lista e tente novamente.",
          );
      })
      .finally(() => {
        if (!canceled) setLoading(false);
      });
    return () => {
      canceled = true;
    };
  }, [pet.id, pet.tenant_id]);
  const perform = async (operation: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    try {
      await operation();
    } catch (error) {
      addToast(
        "Operação não concluída",
        error instanceof Error
          ? error.message
          : "Não foi possível salvar. Confira suas permissões e tente novamente.",
        "warning",
      );
    } finally {
      setBusy(false);
    }
  };
  const input =
    "block w-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 rounded-xl p-3 mt-1";
  const button =
    "rounded-xl bg-olive-600 text-white px-4 py-2 disabled:opacity-50";
  return (
    <section className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-6">
      <button onClick={onBack} className="flex gap-2 items-center">
        <ArrowLeft size={16} />
        Voltar para clientes e pets
      </button>
      <header>
        <h2 className="text-xl font-bold">{pet.name}</h2>
        <p>
          {pet.species}
          {pet.breed ? ` · ${pet.breed}` : ""} · Tutor: {tutor.name}
        </p>
        <p>Prontuário da clínica, sem dados de demonstração.</p>
      </header>
      {loadError && (
        <p role="alert" className="text-rose-600">
          {loadError}
        </p>
      )}
      <nav className="flex flex-wrap gap-3">
        {[
          ["medical", "Prontuário"],
          ["weights", "Peso"],
          ["reminders", "Lembretes"],
          ["docs", "Documentos"],
          ["notes", "Observações"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={tab === value ? button : "px-4 py-2"}
          >
            {label}
          </button>
        ))}
      </nav>
      {loading ? (
        <p role="status">Carregando prontuário…</p>
      ) : loadError ? null : (
        <>
          {tab === "medical" && (
            <div className="grid md:grid-cols-2 gap-8">
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void perform(async () => {
                    const row = await medicalService.create({
                      tenant_id: pet.tenant_id,
                      pet_id: pet.id,
                      record_date: localDate(),
                      record_type: recordType,
                      title: title.trim(),
                      description: description.trim(),
                      professional: professional.trim(),
                    });
                    setRecords((prev) => [row, ...prev]);
                    setTitle("");
                    setDescription("");
                    setProfessional("");
                    addToast(
                      "Registro salvo",
                      "As informações foram gravadas no prontuário.",
                    );
                  });
                }}
              >
                <h3 className="font-bold flex gap-2">
                  <FileText size={18} />
                  Novo registro
                </h3>
                <label>
                  Tipo
                  <select
                    className={input}
                    value={recordType}
                    onChange={(e) =>
                      setRecordType(e.target.value as MedicalRow["record_type"])
                    }
                  >
                    {Object.entries({
                      consultation: "Consulta",
                      vaccine: "Vacina",
                      medication: "Medicação",
                      exam: "Exame",
                      surgery: "Cirurgia",
                      grooming: "Estética",
                      observation: "Observação",
                    }).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  Título
                  <input
                    required
                    minLength={2}
                    className={input}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </label>
                <label className="block">
                  Descrição
                  <textarea
                    required
                    className={input}
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </label>
                <label className="block">
                  Profissional responsável
                  <input
                    required
                    minLength={2}
                    className={input}
                    value={professional}
                    onChange={(e) => setProfessional(e.target.value)}
                  />
                </label>
                <button className={button} disabled={busy}>
                  Salvar registro
                </button>
              </form>
              <div className="space-y-4">
                <h3 className="font-bold">Histórico</h3>
                {!records.length && <p>Nenhum registro cadastrado.</p>}
                {records.map((r) => (
                  <article
                    key={r.id}
                    className="border rounded-xl p-4 space-y-2"
                  >
                    <p>
                      {r.record_date.split("-").reverse().join("/")} ·{" "}
                      {r.professional}
                    </p>
                    <h4 className="font-bold">{r.title}</h4>
                    <p className="whitespace-pre-wrap">{r.description}</p>
                  </article>
                ))}
              </div>
            </div>
          )}
          {tab === "weights" && (
            <div className="space-y-4">
              <form
                className="max-w-md space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void perform(async () => {
                    const numeric = Number(weight);
                    if (!Number.isFinite(numeric) || numeric <= 0)
                      throw new Error("Informe um peso maior que zero.");
                    const row = await weightsService.create({
                      tenant_id: pet.tenant_id,
                      pet_id: pet.id,
                      weight: numeric,
                      recorded_date: date,
                    });
                    setWeights((prev) =>
                      [...prev, row].sort((a, b) =>
                        a.recorded_date.localeCompare(b.recorded_date),
                      ),
                    );
                    setWeight("");
                    addToast("Peso salvo", "A pesagem foi registrada.");
                  });
                }}
              >
                <h3 className="font-bold flex gap-2">
                  <Scale size={18} />
                  Registrar peso
                </h3>
                <label className="block">
                  Peso em kg
                  <input
                    className={input}
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </label>
                <label className="block">
                  Data
                  <input
                    className={input}
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>
                <button disabled={busy} className={button}>
                  Salvar peso
                </button>
              </form>
              {!weights.length && <p>Nenhuma pesagem cadastrada.</p>}
              {weights.map((w) => (
                <p key={w.id}>
                  {w.recorded_date.split("-").reverse().join("/")} — {w.weight}{" "}
                  kg
                </p>
              ))}
            </div>
          )}
          {tab === "reminders" && (
            <div className="space-y-4">
              <form
                className="space-y-3 max-w-md"
                onSubmit={(e) => {
                  e.preventDefault();
                  void perform(async () => {
                    const row = await remindersService.create({
                      tenant_id: pet.tenant_id,
                      pet_id: pet.id,
                      title: reminderTitle.trim(),
                      reminder_date: reminderDate,
                      reminder_type: reminderType,
                      done: false,
                    });
                    setReminders((prev) => [...prev, row]);
                    setReminderTitle("");
                    setReminderDate("");
                    addToast(
                      "Lembrete salvo",
                      "Registrado no sistema. Envio automático não está habilitado.",
                    );
                  });
                }}
              >
                <h3 className="font-bold flex gap-2">
                  <Calendar size={18} />
                  Novo lembrete
                </h3>
                <label className="block">
                  Título
                  <input
                    required
                    className={input}
                    value={reminderTitle}
                    onChange={(e) => setReminderTitle(e.target.value)}
                  />
                </label>
                <label className="block">
                  Data
                  <input
                    required
                    type="date"
                    className={input}
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                  />
                </label>
                <label className="block">
                  Tipo
                  <select
                    className={input}
                    value={reminderType}
                    onChange={(e) =>
                      setReminderType(
                        e.target.value as ReminderRow["reminder_type"],
                      )
                    }
                  >
                    {Object.entries({
                      vaccine: "Vacina",
                      medication: "Medicação",
                      exam: "Exame",
                      grooming: "Estética",
                    }).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <button disabled={busy} className={button}>
                  Salvar lembrete
                </button>
              </form>
              {!reminders.length && <p>Nenhum lembrete cadastrado.</p>}
              {reminders.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 border rounded-xl p-3"
                >
                  <input
                    aria-label={`Concluir ${r.title}`}
                    type="checkbox"
                    disabled={busy}
                    checked={r.done}
                    onChange={() => {
                      void perform(async () => {
                        const saved = await remindersService.update(
                          r.id,
                          { done: !r.done },
                          pet.tenant_id,
                        );
                        setReminders((prev) =>
                          prev.map((i) => (i.id === r.id ? saved : i)),
                        );
                      });
                    }}
                  />
                  <span>
                    {r.title} · {r.reminder_date.split("-").reverse().join("/")}
                  </span>
                </div>
              ))}
            </div>
          )}
          {tab === "docs" && (
            <div className="space-y-4">
              <h3 className="font-bold flex gap-2">
                <Upload size={18} />
                Documentos privados
              </h3>
              <p>PDF, JPG, PNG ou WebP, até 10 MB.</p>
              <input
                aria-label="Carregar documento"
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file)
                    void perform(async () => {
                      const row = await uploadPetDocument(
                        pet.tenant_id,
                        pet.id,
                        file,
                      );
                      setDocuments((prev) => [row, ...prev]);
                      addToast(
                        "Documento salvo",
                        "Arquivo armazenado com acesso restrito à clínica.",
                      );
                    });
                }}
              />
              {!documents.length && <p>Nenhum documento cadastrado.</p>}
              {documents.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-wrap gap-3 items-center border rounded-xl p-3"
                >
                  <span className="flex-1">
                    {d.name} · {d.size}
                  </span>
                  <button
                    disabled={busy}
                    onClick={() => {
                      void perform(() => downloadPetDocument(d));
                    }}
                  >
                    Baixar
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => setDeleteDocument(d)}
                    className="text-rose-600"
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          )}
          {tab === "notes" && (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                void perform(async () => {
                  await petsService.update(pet.id, { notes }, pet.tenant_id);
                  addToast(
                    "Observações salvas",
                    "As anotações foram gravadas no prontuário.",
                  );
                });
              }}
            >
              <label className="block">
                Observações clínicas e comportamentais
                <textarea
                  className={input}
                  rows={8}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>
              <button disabled={busy} className={button}>
                Salvar observações
              </button>
            </form>
          )}
        </>
      )}
      <ConfirmModal
        isOpen={!!deleteDocument}
        title="Excluir documento"
        message="O arquivo e seu registro serão excluídos. Confirme somente se não precisar mais deste documento."
        onClose={() => setDeleteDocument(null)}
        onConfirm={() => {
          if (deleteDocument)
            void perform(async () => {
              await deletePetDocument(deleteDocument);
              setDocuments((prev) =>
                prev.filter((d) => d.id !== deleteDocument.id),
              );
              setDeleteDocument(null);
              addToast(
                "Documento excluído",
                "O arquivo e o registro foram removidos.",
                "info",
              );
            });
        }}
      />
    </section>
  );
}
