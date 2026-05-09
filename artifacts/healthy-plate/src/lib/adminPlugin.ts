import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

const SUPABASE_URL = 'https://dshtyziehvtghcrmypow.supabase.co';
const PROFESSIONAL_ROLES = new Set(['admin', 'dietician', 'nutritionist']);

async function supabaseGet(path: string, serviceKey: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!res.ok) return null;
  return res.json();
}

async function supabasePost(table: string, body: unknown, serviceKey: string) {
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

async function getCaller(authHeader: string | undefined, serviceKey: string) {
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
    return row ? { id: user.id, role: row.role as string, name: row.name as string } : null;
  } catch { return null; }
}

function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); } catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

function json(res: ServerResponse, data: unknown, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export function adminApiPlugin(): Plugin {
  return {
    name: 'admin-api',
    configureServer(server) {
      server.middlewares.use('/admin-api', async (req: IncomingMessage, res: ServerResponse) => {
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceKey) return json(res, { error: 'SUPABASE_SERVICE_ROLE_KEY not set' }, 500);

        const caller = await getCaller(req.headers['authorization'], serviceKey);
        if (!caller) return json(res, { error: 'Unauthorized' }, 401);

        const url = new URL(req.url || '/', 'http://localhost');
        const parts = url.pathname.split('/').filter(Boolean);
        const resource = parts[0];
        const param = parts[1];
        const isPro = PROFESSIONAL_ROLES.has(caller.role);

        // ── GET /admin-api/users?role=... ─────────────────────────────────
        if (req.method === 'GET' && resource === 'users') {
          if (!isPro) return json(res, { error: 'Forbidden' }, 403);
          const role = url.searchParams.get('role');
          let filter = '';
          if (role === 'patient') filter = '&role=eq.patient';
          else if (role === 'professional') filter = '&role=in.(dietician,nutritionist)';
          else if (role === 'admin') filter = '&role=eq.admin';
          const data = await supabaseGet(
            `profiles?select=*,health_profiles(*)&order=created_at.desc${filter}`,
            serviceKey,
          );
          return json(res, data ?? []);
        }

        // ── GET /admin-api/logs/:userId ────────────────────────────────────
        if (req.method === 'GET' && resource === 'logs' && param) {
          if (caller.id !== param && !isPro) return json(res, { error: 'Forbidden' }, 403);
          const data = await supabaseGet(`daily_logs?user_id=eq.${param}&order=date.desc`, serviceKey);
          return json(res, data ?? []);
        }

        // ── GET /admin-api/health-profile/:userId ─────────────────────────
        if (req.method === 'GET' && resource === 'health-profile' && param) {
          if (caller.id !== param && !isPro) return json(res, { error: 'Forbidden' }, 403);
          const data = await supabaseGet(`health_profiles?user_id=eq.${param}&limit=1`, serviceKey);
          return json(res, Array.isArray(data) ? (data[0] ?? null) : null);
        }

        // ── GET /admin-api/notes/:patientId ───────────────────────────────
        if (req.method === 'GET' && resource === 'notes' && param) {
          if (!isPro) return json(res, { error: 'Forbidden' }, 403);
          const data = await supabaseGet(
            `dietician_notes?patient_id=eq.${param}&order=created_at.desc`,
            serviceKey,
          );
          return json(res, data ?? []);
        }

        // ── POST /admin-api/notes ─────────────────────────────────────────
        if (req.method === 'POST' && resource === 'notes') {
          if (!isPro) return json(res, { error: 'Forbidden' }, 403);
          const body = await readBody(req);
          const result = await supabasePost('dietician_notes', body, serviceKey);
          return json(res, result.data, result.ok ? 201 : 400);
        }

        // ── GET /admin-api/assigned-plans/:patientId ──────────────────────
        if (req.method === 'GET' && resource === 'assigned-plans' && param) {
          if (caller.id !== param && !isPro) return json(res, { error: 'Forbidden' }, 403);
          const data = await supabaseGet(
            `assigned_meal_plans?patient_id=eq.${param}&status=eq.active&select=*,meal_plans(*)`,
            serviceKey,
          );
          return json(res, data ?? []);
        }

        // ── POST /admin-api/assigned-plans ────────────────────────────────
        if (req.method === 'POST' && resource === 'assigned-plans') {
          if (!isPro) return json(res, { error: 'Forbidden' }, 403);
          const body = await readBody(req);
          const result = await supabasePost('assigned_meal_plans', body, serviceKey);
          return json(res, result.data, result.ok ? 201 : 400);
        }

        // ── GET /admin-api/professional-plans/:professionalId ─────────────
        if (req.method === 'GET' && resource === 'professional-plans' && param) {
          if (caller.id !== param && !isPro) return json(res, { error: 'Forbidden' }, 403);
          const data = await supabaseGet(
            `assigned_meal_plans?or=(dietician_id.eq.${param},nutritionist_id.eq.${param})&status=eq.active&select=*,meal_plans(*)`,
            serviceKey,
          );
          return json(res, data ?? []);
        }

        return json(res, { error: 'Not found' }, 404);
      });
    },
  };
}
