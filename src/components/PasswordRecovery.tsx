import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { requestPasswordRecovery, saveRecoveredPassword } from '../lib/passwordRecovery';
export function PasswordRecovery({ reset = false, onBack }: { reset?: boolean; onBack?: () => void }) {
  const { loading, recoveryReady, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saved, setSaved] = useState(false);
  const validReset = reset && recoveryReady;
  const inputClass = 'block border rounded-lg p-3 w-full mt-1';
  return <main className="min-h-screen bg-stone-100 flex items-center justify-center p-6 text-stone-900">
    <section className="bg-white rounded-2xl p-8 max-w-md w-full space-y-4">
      <h1 className="text-2xl font-bold">{validReset ? 'Defina sua nova senha' : 'Recuperar senha'}</h1>
      {reset && loading ? <p role="status">Verificando link...</p> : <>
        {reset && !recoveryReady && !saved && <p role="alert">Link inválido, expirado ou já utilizado. Solicite um novo e-mail de recuperação.</p>}
        {!saved && <form className="space-y-4" onSubmit={async event => {
          event.preventDefault(); if (busy) return; setBusy(true); setError(''); setNotice('');
          try {
            if (validReset) {
              await saveRecoveredPassword(password, confirmation);
              setPassword(''); setConfirmation(''); setSaved(true);
              setNotice('Senha atualizada. Volte ao login e entre com sua nova senha.');
            } else {
              await requestPasswordRecovery(email, window.location.origin);
              setNotice('Se houver uma conta para esse e-mail, você receberá um link para redefinir a senha. Confira também o spam.');
            }
          } catch { setError(validReset ? 'Não foi possível alterar a senha. Confira se as senhas coincidem e se o link ainda é válido.' : 'Não foi possível solicitar a recuperação agora. Tente novamente mais tarde.'); }
          finally { setBusy(false); }
        }}>
          {validReset ? <>
            <label className="block">Nova senha<input className={inputClass} type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} disabled={busy}/></label>
            <label className="block">Confirme a nova senha<input className={inputClass} type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={e => setConfirmation(e.target.value)} disabled={busy}/></label>
          </> : <label className="block">E-mail da conta<input className={inputClass} type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={busy}/></label>}
          <button className="bg-olive-600 text-white rounded-lg p-3 w-full" disabled={busy}>{busy ? 'Aguarde…' : validReset ? 'Salvar nova senha' : 'Enviar link de recuperação'}</button>
        </form>}
        {notice && <p role="status">{notice}</p>}
        {error && <p role="alert" className="text-red-700">{error}</p>}
        <button disabled={busy} onClick={() => {
          if (onBack) { onBack(); return; }
          setBusy(true); void logout().then(() => window.location.replace(`${window.location.origin}/#auth`))
            .catch(() => { setError('Não foi possível encerrar a sessão. Tente voltar ao login novamente.'); setBusy(false); });
        }}>Voltar ao login</button>
      </>}
    </section>
  </main>;
}
