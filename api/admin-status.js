import { createClient } from '@supabase/supabase-js';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  const { VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: key } = process.env;
  if (!url || !key) return res.status(503).json({ error: 'Configuração indisponível.' });
  if (!token) return res.status(401).json({ error: 'Entre novamente.' });
  const db = createClient(url, key, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await db.rpc('current_platform_admin');
  if (error || data !== true) return res.status(403).json({ error: 'Acesso reservado à administração geral.' });
  const environment=process.env.ASAAS_ENVIRONMENT||(process.env.ASAAS_PRODUCTION_API_KEY?'production':'sandbox');
  return res.json({ environment, asaasKey: Boolean(environment==='production'?process.env.ASAAS_PRODUCTION_API_KEY:process.env.ASAAS_API_KEY), databaseKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY), webhookToken: Boolean(process.env.ASAAS_WEBHOOK_TOKEN?.length >= 32) });
}
