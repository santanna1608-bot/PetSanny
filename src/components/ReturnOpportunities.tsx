import { useEffect, useState } from "react";
import { useAppointments } from "../contexts/AppointmentsContext";
import { careService, overdueReturns } from "../lib/carePassport";
import type { CareProfile } from "../lib/carePassport";
import { petsService } from "../lib/supabaseClient";
import type { Pet } from "../lib/supabaseClient";
import { localDate } from "../lib/dates";
export function ReturnOpportunities() {
  const { currentTenant, appointments } = useAppointments();
  const [profiles, setProfiles] = useState<CareProfile[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let stale = false;
    setProfiles([]);
    setPets([]);
    setError("");
    setLoading(true);
    void Promise.all([
      careService.list(currentTenant.id),
      petsService.list(currentTenant.id),
    ])
      .then(([p, a]) => {
        if (!stale) {
          setProfiles(p);
          setPets(a);
        }
      })
      .catch(() => {
        if (!stale) setError("Não foi possível carregar os retornos.");
      })
      .finally(() => {
        if (!stale) setLoading(false);
      });
    return () => {
      stale = true;
    };
  }, [currentTenant.id]);
  const opportunities = overdueReturns(profiles, appointments, localDate());
  return (
    <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-3">
      <h3 className="font-bold text-lg">Retornos para acompanhar</h3>
      <p className="text-sm text-stone-500">
        Datas combinadas no passaporte de cuidados que venceram e ainda não têm
        agendamento futuro. A lista não dispara mensagens.
      </p>
      {loading ? (
        <p>Carregando...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : opportunities.length === 0 ? (
        <p>Nenhum retorno pendente registrado.</p>
      ) : (
        opportunities.map((p) => (
          <div key={p.id} className="border-b py-2">
            <strong>
              {pets.find((a) => a.id === p.pet_id)?.name ?? "Pet"}
            </strong>{" "}
            · retorno combinado para{" "}
            {p.next_return_date?.split("-").reverse().join("/")}
            <p className="text-sm">
              Responsável pelo registro: {p.recorded_by}
            </p>
          </div>
        ))
      )}
    </section>
  );
}
