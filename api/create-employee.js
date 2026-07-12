import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Add CORS headers for local development if needed, though Vercel handles it in prod based on vercel.json usually.
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, name, role, phone, status, username, photo } = req.body;

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server configuration error: missing Supabase credentials' });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Create the Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role }
    });

    if (authError) throw authError;

    // Create or update the Employee Record (handling potential triggers)
    const { data: empData, error: empError } = await supabaseAdmin
      .from('employee')
      .upsert({
        id: authData.user.id,
        email,
        name,
        role,
        phone,
        status: status || 'Active',
        username,
        photo
      })
      .select();

    if (empError) throw empError;

    return res.status(200).json({ user: authData.user, employee: empData[0] });
  } catch (error) {
    console.error('Error in create-employee:', error);
    return res.status(400).json({ error: error.message });
  }
}
