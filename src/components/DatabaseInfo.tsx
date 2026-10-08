export function DatabaseInfo() {
  return (
    <section className="bg-white dark:bg-stone-900 border rounded-2xl p-6 space-y-3">
      <h2 className="text-xl font-bold">Dados da clínica</h2>
      <p>
        Os cadastros são armazenados no banco do sistema, com acesso restrito às
        pessoas vinculadas à sua clínica.
      </p>
      <p>
        Uma operação só é apresentada como salva após confirmação do servidor.
        Sair da conta preserva os registros e suas preferências.
      </p>
    </section>
  );
}
