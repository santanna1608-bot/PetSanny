import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { requireSupabase } from "../lib/supabaseClient";

interface Clinic {
  id: string;
  name: string;
  plan: string;
  status: string;
}
export function PlatformAdminPanel() {
  const { user, logout } = useAuth();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let canceled = false;
    if (!user?.is_super_admin) return;
    setLoading(true);
    setError("");
    void (async () => {
      try {
        const { data, error: queryError } = await requireSupabase()
          .from("tenants")
          .select("id,name,plan,status")
          .order("created_at", { ascending: false });
        if (queryError) throw queryError;
        if (!canceled) setClinics(data as Clinic[]);
      } catch {
        if (!canceled) {
          setClinics([]);
          setError("Não foi possível consultar as clínicas. Tente novamente.");
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [user?.id, user?.is_super_admin, revision]);
  if (!user?.is_super_admin) return null;
  return (
    <main className="min-h-screen bg-stone-100 p-6 text-stone-900">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="bg-white rounded-2xl p-6 flex flex-wrap justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Administração geral do SaaS</h1>
            <p className="text-sm text-stone-600">{user.email}</p>
            <p className="mt-2 text-sm">
              Acesso de administrador confirmado pelo servidor.
            </p>
          </div>
          <button
            className="border rounded-lg px-4 py-2"
            onClick={() => {
              void logout().catch(() =>
                setError(
                  "Não foi possível encerrar a sessão. Tente novamente.",
                ),
              );
            }}
          >
            Sair
          </button>
        </header>
        <section className="bg-white rounded-2xl p-6 space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Clínicas cadastradas</h2>
            <button
              disabled={loading}
              onClick={() => setRevision((value) => value + 1)}
            >
              Atualizar
            </button>
          </div>
          {error && (
            <p role="alert" className="text-red-700">
              {error}
            </p>
          )}
          {loading ? (
            <p role="status">Carregando clínicas...</p>
          ) : !error && !clinics.length ? (
            <p>Nenhuma clínica cadastrada. A base está vazia.</p>
          ) : (
            !error && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th>Clínica</th>
                      <th>Plano</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clinics.map((clinic) => (
                      <tr key={clinic.id}>
                        <td className="py-3">{clinic.name}</td>
                        <td>{clinic.plan}</td>
                        <td>{clinic.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
          <p className="text-sm text-stone-600">
            Consulta administrativa. Cobrança e alteração de assinaturas ainda
            estão em preparação.
          </p>
        </section>
      </div>
    </main>
  );
}
