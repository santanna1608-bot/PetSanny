import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
export function TenantSetup() {
  const { user, createTenant, logout } = useAuth();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-100 p-6">
      <form
        className="bg-white rounded-2xl p-8 space-y-4 w-full max-w-md"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          try {
            await createTenant({
              tenantName: name,
              tenantLocation: location,
              name: user?.user_metadata.name || "",
              plan: "Bronze",
            });
          } catch {
            setError("Não foi possível criar a clínica. Tente novamente.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <h1 className="text-xl font-bold">Cadastre sua clínica</h1>
        <p>
          Seu acesso foi confirmado. Complete os dados para iniciar os 14 dias
          de teste.
        </p>
        <label className="block">
          Nome da clínica
          <input
            className="block border rounded p-2 w-full"
            required
            minLength={2}
            maxLength={255}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block">
          Endereço
          <input
            className="block border rounded p-2 w-full"
            maxLength={500}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button
          disabled={busy}
          className="bg-olive-600 text-white rounded p-3 w-full"
        >
          {busy ? "Salvando…" : "Criar clínica"}
        </button>
        <button
          type="button"
          onClick={() => {
            void logout().catch(() =>
              setError("Não foi possível sair. Tente novamente."),
            );
          }}
        >
          Sair
        </button>
      </form>
    </main>
  );
}
