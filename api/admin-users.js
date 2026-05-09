const SUPABASE_URL = 'https://dshtyziehvtghcrmypow.supabase.co';

async function supabaseAdminFetch(path, serviceKey) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
  });
  return res.json();
}

async function verifyAdmin(authHeader, serviceKey) {
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' });
  }

  const isAdmin = await verifyAdmin(req.headers['authorization'], serviceKey);
  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden — admin only' });
  }

  const role = req.query.role;
  let filter = '';
  if (role === 'patient') filter = '&role=eq.patient';
  else if (role === 'professional') filter = '&role=in.(dietician,nutritionist)';
  else if (role === 'admin') filter = '&role=eq.admin';

  const data = await supabaseAdminFetch(
    `profiles?select=*,health_profiles(*)&order=created_at.desc${filter}`,
    serviceKey
  );
  return res.status(200).json(data);
}
