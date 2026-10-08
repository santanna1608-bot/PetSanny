import { requireSupabase } from './supabaseClient';
export async function requestPasswordRecovery(email: string, origin: string) {
  const { error } = await requireSupabase().auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${origin}/?flow=recovery`,
  });
  if (error) throw error;
}
export async function saveRecoveredPassword(password: string, confirmation: string) {
  if (password.length < 8) throw new Error('Use uma senha com pelo menos 8 caracteres.');
  if (password !== confirmation) throw new Error('As senhas não coincidem.');
  const { error } = await requireSupabase().auth.updateUser({ password });
  if (error) throw error;
}
