// Vercel serverless function — mirrors adminPlugin.ts for production
const SUPABASE_URL = 'https://dshtyziehvtghcrmypow.supabase.co';
const PROFESSIONAL_ROLES = new Set(['admin', 'dietician', 'nutritionist']);

async function supabaseGet(path, serviceKey) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!res.ok) return null;
  return res.json();
}

async function supabasePost(table, body, serviceKey) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, status: res.status, data: await res.json().catch(() => null) };
}

async function getCaller(authHeader, serviceKey) {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const jwt = authHeader.slice(7);
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${jwt}` },
    });
    if (!res.ok) return null;
    const user = await res.json();
    if (!user?.id) return null;
    const rows = await supabaseGet(`profiles?select=role,name&id=eq.${user.id}&limit=1`, serviceKey);
    const row = Array.isArray(rows) ? rows[0] : null;
    return row ? { id: user.id, role: row.role, name: row.name } : null;
  } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return res.status(500).json({ error: 'Not configured' });

  const caller = await getCaller(req.headers['authorization'], serviceKey);
  if (!caller) return res.status(401).json({ error: 'Unauthorized' });

  const isPro = PROFESSIONAL_ROLES.has(caller.role);

  // Derive resource + param from Vercel's routing
  // vercel.json rewrites /admin-api/:path* → /api/admin
  // Vercel injects path segments into req.query if we set up [path] params,
  // but with a catch-all rewrite we rely on the path query param or x-invoke-path header
  const invokedPath = req.headers['x-invoke-path'] || '';
  const cleaned = invokedPath.replace(/^\/admin-api\/?/, '').replace(/^\/api\/admin\/?/, '');
  const parts = cleaned.split('/').filter(Boolean);
  const resource = parts[0] || String(req.query.resource || '');
  const param = parts[1] || String(req.query.id || '');

  // ── GET /users ─────────────────────────────────────────────────────────────
  if (req.method === 'GET' && resource === 'users') {
    if (!isPro) return res.status(403).json({ error: 'Forbidden' });
    const role = req.query.role;
    let filter = '';
    if (role === 'patient') filter = '&role=eq.patient';
    else if (role === 'professional') filter = '&role=in.(dietician,nutritionist)';
    else if (role === 'admin') filter = '&role=eq.admin';
    const data = await supabaseGet(`profiles?select=*,health_profiles(*)&order=created_at.desc${filter}`, serviceKey);
    return res.status(200).json(data ?? []);
  }

  // ── GET /logs/:userId ──────────────────────────────────────────────────────
  if (req.method === 'GET' && resource === 'logs' && param) {
    if (caller.id !== param && !isPro) return res.status(403).json({ error: 'Forbidden' });
    const data = await supabaseGet(`daily_logs?user_id=eq.${param}&order=date.desc`, serviceKey);
    return res.status(200).json(data ?? []);
  }

  // ── GET /health-profile/:userId ────────────────────────────────────────────
  if (req.method === 'GET' && resource === 'health-profile' && param) {
    if (caller.id !== param && !isPro) return res.status(403).json({ error: 'Forbidden' });
    const data = await supabaseGet(`health_profiles?user_id=eq.${param}&limit=1`, serviceKey);
    return res.status(200).json(Array.isArray(data) ? (data[0] ?? null) : null);
  }

  // ── GET /notes/:patientId ──────────────────────────────────────────────────
  if (req.method === 'GET' && resource === 'notes' && param) {
    if (!isPro) return res.status(403).json({ error: 'Forbidden' });
    const data = await supabaseGet(`dietician_notes?patient_id=eq.${param}&order=created_at.desc`, serviceKey);
    return res.status(200).json(data ?? []);
  }

  // ── POST /notes ────────────────────────────────────────────────────────────
  if (req.method === 'POST' && resource === 'notes') {
    if (!isPro) return res.status(403).json({ error: 'Forbidden' });
    const result = await supabasePost('dietician_notes', req.body, serviceKey);
    return res.status(result.ok ? 201 : 400).json(result.data);
  }

  // ── GET /assigned-plans/:patientId ─────────────────────────────────────────
  if (req.method === 'GET' && resource === 'assigned-plans' && param) {
    if (caller.id !== param && !isPro) return res.status(403).json({ error: 'Forbidden' });
    const data = await supabaseGet(`assigned_meal_plans?patient_id=eq.${param}&status=eq.active&select=*,meal_plans(*)`, serviceKey);
    return res.status(200).json(data ?? []);
  }

  // ── POST /assigned-plans ───────────────────────────────────────────────────
  if (req.method === 'POST' && resource === 'assigned-plans') {
    if (!isPro) return res.status(403).json({ error: 'Forbidden' });
    const result = await supabasePost('assigned_meal_plans', req.body, serviceKey);
    return res.status(result.ok ? 201 : 400).json(result.data);
  }

  // ── GET /professional-plans/:professionalId ────────────────────────────────
  if (req.method === 'GET' && resource === 'professional-plans' && param) {
    if (caller.id !== param && !isPro) return res.status(403).json({ error: 'Forbidden' });
    const data = await supabaseGet(`assigned_meal_plans?or=(dietician_id.eq.${param},nutritionist_id.eq.${param})&status=eq.active&select=*,meal_plans(*)`, serviceKey);
    return res.status(200).json(data ?? []);
  }

  return res.status(404).json({ error: 'Not found' });
}
