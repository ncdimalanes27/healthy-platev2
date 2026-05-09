import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

const SUPABASE_URL = 'https://dshtyziehvtghcrmypow.supabase.co';

async function supabaseAdminFetch(path: string, serviceKey: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
  });
  return res.json();
}

async function verifyAdmin(authHeader: string | undefined, serviceKey: string): Promise<boolean> {
  if (!authHeader?.startsWith('Bearer ')) return false;
  const jwt = authHeader.slice(7);
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${jwt}` },
    });
    if (!res.ok) return false;
    const user = await res.json();
    if (!user?.id) return false;
    const profile = await supabaseAdminFetch(
      `profiles?select=role&id=eq.${user.id}&limit=1`,
      serviceKey
    );
    return Array.isArray(profile) && profile[0]?.role === 'admin';
  } catch {
    return false;
  }
}

export function adminApiPlugin(): Plugin {
  return {
    name: 'admin-api',
    configureServer(server) {
      server.middlewares.use('/admin-api', async (req: IncomingMessage, res: ServerResponse) => {
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceKey) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY not set' }));
          return;
        }

        const isAdmin = await verifyAdmin(req.headers['authorization'], serviceKey);
        if (!isAdmin) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Forbidden' }));
          return;
        }

        const url = new URL(req.url || '/', 'http://localhost');

        if (url.pathname === '/users' || url.pathname === '/') {
          const role = url.searchParams.get('role');
          let filter = '';
          if (role === 'patient') filter = '&role=eq.patient';
          else if (role === 'professional') filter = '&role=in.(dietician,nutritionist)';
          else if (role === 'admin') filter = '&role=eq.admin';

          const data = await supabaseAdminFetch(
            `profiles?select=*,health_profiles(*)&order=created_at.desc${filter}`,
            serviceKey
          );
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return;
        }

        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Not found' }));
      });
    },
  };
}
