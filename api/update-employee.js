import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
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

  const { id, email, password, name, role, phone, status, username, photo } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Employee ID is required' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Update auth user if email or password changed
    const updateData = {};
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    
    if (Object.keys(updateData).length > 0) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, updateData);
      if (authError) throw authError;
    }

    // Update the Employee Record
    const { data: empData, error: empError } = await supabaseAdmin
      .from('employee')
      .update({
        email,
        name,
        role,
        phone,
        status,
        username,
        photo
      })
      .eq('id', id)
      .select();

    if (empError) throw empError;

    return res.status(200).json({ employee: empData[0] });
  } catch (error) {
    console.error('Error in update-employee:', error);
    return res.status(400).json({ error: error.message });
  }
}
