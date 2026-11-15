import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return res.status(401).json({ error: 'Entre novamente.' });

  const { VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: key, SUPABASE_SERVICE_ROLE_KEY: serviceKey } = process.env;
  if (!url || !key || !serviceKey) return res.status(503).json({ error: 'Configuração do servidor indisponível.' });

  const userDb = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const admin = await userDb.rpc('current_platform_admin');
  if (admin.error || admin.data !== true) {
    return res.status(403).json({ error: 'Acesso reservado à administração geral.' });
  }

  const { tenantId, status, plan, price, renewalDate } = req.body || {};
  if (typeof tenantId !== 'string' || !/^\w{8}(-\w{4}){3}-\w{12}$/.test(tenantId)) {
    return res.status(400).json({ error: 'Identificador de clínica inválido.' });
  }

  const allowedStatuses = ['active', 'trial', 'suspended', 'canceled'];
  const allowedPlans = ['Bronze', 'Silver', 'Gold'];

  const updates = {};
  if (status !== undefined) {
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Situação de assinatura inválida.' });
    }
    updates.status = status;
  }

  if (plan !== undefined) {
    if (!allowedPlans.includes(plan)) {
      return res.status(400).json({ error: 'Plano inválido. Escolha Bronze, Silver ou Gold.' });
    }
    updates.plan = plan;
  }

  if (price !== undefined) {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ error: 'Valor de mensalidade inválido.' });
    }
    updates.price = numPrice;
  }

  if (renewalDate !== undefined) {
    if (renewalDate === null || renewalDate === '') {
      updates.renewal_date = null;
    } else if (typeof renewalDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(renewalDate)) {
      updates.renewal_date = renewalDate;
    } else {
      return res.status(400).json({ error: 'Data de renovação inválida. Use o formato AAAA-MM-DD.' });
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Nenhuma alteração informada para salvar.' });
  }

  const adminDb = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: updatedClinic, error: updateError } = await adminDb
    .from('tenants')
    .update(updates)
    .eq('id', tenantId)
    .select('id,name,plan,status,owner_name,owner_email,price,renewal_date,created_at,location,trial_duration_days,trial_extended_at')
    .maybeSingle();

  if (updateError || !updatedClinic) {
    return res.status(500).json({ error: updateError?.message || 'Não foi possível atualizar a clínica no banco de dados.' });
  }

  return res.json({ success: true, clinic: updatedClinic });
}
