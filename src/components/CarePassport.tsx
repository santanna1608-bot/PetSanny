import { useEffect, useState } from "react";
import type { Pet } from "../lib/supabaseClient";
import { careService } from "../lib/carePassport";
import type { CareProfile } from "../lib/carePassport";
export function CarePassport({ pet }: { pet: Pet }) {
  const [profile, setProfile] = useState<CareProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState({
    grooming_preferences: "",
    products_used: "",
    behavior_observed: "",
    restrictions: "",
    information_source: "tutor" as "tutor" | "professional",
    recorded_by: "",
    next_return_date: "",
  });
  useEffect(() => {
    let stale = false;
    setLoading(true);
    setError("");
    setProfile(null);
    setNotice("");
    setDraft({
      grooming_preferences: "",
      products_used: "",
      behavior_observed: "",
      restrictions: "",
      information_source: "tutor",
      recorded_by: "",
      next_return_date: "",
    });
    void careService
      .list(pet.tenant_id, { pet_id: pet.id })
      .then((rows) => {
        if (stale) return;
        const row = rows[0];
        if (row) {
          setProfile(row);
          setDraft({ ...row, next_return_date: row.next_return_date ?? "" });
        }
      })
      .catch(() => {
        if (!stale) setError("Não foi possível carregar o passaporte.");
      })
      .finally(() => {
        if (!stale) setLoading(false);
      });
    return () => {
      stale = true;
    };
  }, [pet.id, pet.tenant_id]);
  const input = "block border rounded-lg p-3 w-full bg-white dark:bg-stone-950";
  if (loading) return <p role="status">Carregando passaporte...</p>;
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        setError("");
        setNotice("");
        try {
          const value = {
            ...draft,
            next_return_date: draft.next_return_date || null,
          };
          const row = profile
            ? await careService.update(profile.id, value, pet.tenant_id)
            : await careService.create({
                ...value,
                tenant_id: pet.tenant_id,
                pet_id: pet.id,
              });
          setProfile(row);
          setNotice("Passaporte salvo.");
        } catch {
          setError(
            "Não foi possível salvar. Confira os campos e tente novamente.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3 className="font-bold text-lg">Passaporte de cuidados</h3>
      <p className="text-sm text-stone-500">
        Preferências e observações registradas pela equipe. Informe a origem;
        este cadastro não substitui o prontuário.
      </p>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      {(
        [
          ["grooming_preferences", "Preferências de banho e tosa"],
          ["products_used", "Produtos utilizados"],
          ["behavior_observed", "Comportamento observado"],
          ["restrictions", "Restrições informadas"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="block">
          {label}
          <textarea
            className={input}
            maxLength={2000}
            value={draft[key]}
            onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
            disabled={busy}
          />
        </label>
      ))}
      <label className="block">
        Origem das informações
        <select
          className={input}
          value={draft.information_source}
          onChange={(e) =>
            setDraft({
              ...draft,
              information_source: e.target.value as "tutor" | "professional",
            })
          }
        >
          <option value="tutor">Informado pelo tutor</option>
          <option value="professional">Registrado pelo profissional</option>
        </select>
      </label>
      <label className="block">
        Responsável pelo registro
        <input
          className={input}
          minLength={2}
          maxLength={255}
          required
          value={draft.recorded_by}
          onChange={(e) => setDraft({ ...draft, recorded_by: e.target.value })}
        />
      </label>
      <label className="block">
        Próximo retorno combinado (opcional)
        <input
          className={input}
          type="date"
          value={draft.next_return_date}
          onChange={(e) =>
            setDraft({ ...draft, next_return_date: e.target.value })
          }
        />
      </label>
      <button
        className="bg-olive-600 text-white px-4 py-2 rounded-lg"
        disabled={busy}
      >
        {busy ? "Salvando..." : "Salvar passaporte"}
      </button>
      {profile?.updated_at && (
        <p className="text-xs text-stone-500">
          Atualizado em {new Date(profile.updated_at).toLocaleString("pt-BR")}
        </p>
      )}
    </form>
  );
}
