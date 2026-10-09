import { useEffect, useState } from "react";
import { ReturnOpportunities } from './ReturnOpportunities';
import { AgendaResults } from './AgendaResults';
import { useAppointments } from "../contexts/AppointmentsContext";
import { tutorsService, petsService } from "../lib/supabaseClient";
import { financeService } from "../lib/domainServices";
import { localDate } from "../lib/dates";
import { Users, Calendar, DollarSign, AlertCircle } from "lucide-react";
export function DashboardPremium() {
  const { appointments, currentTenant } = useAppointments();
  const [tutors, setTutors] = useState(0);
  const [pets, setPets] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [error, setError] = useState("");
  useEffect(() => {
    let canceled = false;
    setTutors(0);
    setPets(0);
    setRevenue(0);
    setExpenses(0);
    setError("");
    void Promise.all([
      tutorsService.list(currentTenant.id),
      petsService.list(currentTenant.id),
      financeService.list(currentTenant.id),
    ])
      .then(([t, p, f]) => {
        if (canceled) return;
        const month = localDate().slice(0, 7);
        const monthly = f.filter((i) => i.transaction_date.startsWith(month));
        setTutors(t.length);
        setPets(p.length);
        setRevenue(
          monthly
            .filter((i) => i.transaction_type === "revenue")
            .reduce((sum, i) => sum + Number(i.value), 0),
        );
        setExpenses(
          monthly
            .filter((i) => i.transaction_type === "expense")
            .reduce((sum, i) => sum + Number(i.value), 0),
        );
      })
      .catch(() => {
        if (!canceled)
          setError(
            "Não foi possível carregar todos os indicadores. Atualize a página para tentar novamente.",
          );
      });
    return () => {
      canceled = true;
    };
  }, [currentTenant.id]);
  const today = localDate();
  const scheduled = appointments
    .filter((a) => a.appointment_date === today && a.status !== 'canceled')
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  const money = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return (
    <section className="space-y-6">
      <header className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
        <h2 className="text-xl font-bold">
          Visão geral de {currentTenant.name}
        </h2>
        <p className="text-sm text-stone-500 mt-2">
          Indicadores calculados a partir dos registros da sua clínica. Valores
          de agendamentos não representam pagamentos recebidos.
        </p>
      </header>
      {error && (
        <p role="alert" className="text-rose-600">
          {error}
        </p>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tutores cadastrados", value: tutors, icon: Users },
          { label: "Pets cadastrados", value: pets, icon: Users },
          {
            label: "Receitas registradas neste mês",
            value: money(revenue),
            icon: DollarSign,
          },
          {
            label: "Despesas registradas neste mês",
            value: money(expenses),
            icon: DollarSign,
          },
        ].map(({ label, value, icon: Icon }) => (
          <article
            key={label}
            className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5"
          >
            <Icon className="text-olive-600" />
            <h3 className="text-sm mt-3">{label}</h3>
            <p className="text-2xl font-bold mt-2">{value}</p>
          </article>
        ))}
      </div>
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-4">
        <h3 className="font-bold flex gap-2">
          <Calendar size={20} />
          Agenda de hoje · {today.split("-").reverse().join("/")}
        </h3>
        <p>
          Valor dos serviços agendados:{" "}
          {money(scheduled.reduce((sum, a) => sum + Number(a.price), 0))}
        </p>
        {!scheduled.length && <p>Nenhum agendamento para hoje.</p>}
        {scheduled.map((a) => (
          <article
            key={a.id}
            className="border rounded-xl p-4 flex flex-wrap items-start gap-4"
          >
            <strong>{a.appointment_time.slice(0, 5)}</strong>
            <div className="flex-1">
              <h4 className="font-bold">
                {a.pet_name} · {a.tutor_name}
              </h4>
              <p>
                {a.service_name} · {a.professional_name}
              </p>
              {a.critical_notes && (
                <p className="text-rose-600 flex gap-2 mt-2">
                  <AlertCircle size={16} />
                  {a.critical_notes}
                </p>
              )}
            </div>
            <span>
              {
                {
                  pending: "Pendente",
                  confirmed: "Confirmado",
                  completed: "Concluído",
                  canceled: "Cancelado",
                }[a.status]
              }
            </span>
          </article>
        ))}
      </div>
      <ReturnOpportunities key={currentTenant.id}/>
      <AgendaResults key={currentTenant.id}/>
    </section>
  );
}
