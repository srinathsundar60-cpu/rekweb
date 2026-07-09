import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { LogoImage } from '../components/LogoImage';
import { supabase } from '../lib/supabase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, employee } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const authData = await login(email, password);
      toast.success('Logged in successfully!');
      
      // Fetch role directly to guarantee immediate correct routing
      const { data: empData } = await supabase
        .from('employee')
        .select('role')
        .eq('id', authData.user.id)
        .single();
        
      if (empData?.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--grey-bg)',
      padding: 'var(--px)'
    }}>
      <div style={{
        background: 'var(--white)',
        padding: '3rem 2.5rem',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid var(--grey-mid)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
             <LogoImage />
          </div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--black)' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--grey-text)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Sign in to access your dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--black)' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                border: '1.5px solid var(--grey-mid)',
                background: 'var(--white)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--orange)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--grey-mid)'}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--black)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                border: '1.5px solid var(--grey-mid)',
                background: 'var(--white)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--orange)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--grey-mid)'}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--grey-text)', fontSize: '0.85rem', textDecoration: 'underline', cursor: 'pointer' }}>
            Return to Website
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
