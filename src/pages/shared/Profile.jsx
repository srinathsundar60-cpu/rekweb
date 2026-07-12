import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Briefcase, FolderGit2, CheckCircle, Calendar, Phone, Mail, User } from 'lucide-react';

const Profile = () => {
  const { employee } = useAuth();
  const [stats, setStats] = useState({ clients: 0, projects: 0, approvedProjects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employee?.id) {
      fetchStats();
    }
  }, [employee]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [cliRes, projRes, appProjRes] = await Promise.all([
        supabase.from('client').select('id', { count: 'exact', head: true }).eq('employee_id', employee.id),
        supabase.from('project').select('id', { count: 'exact', head: true }).eq('employee_id', employee.id),
        supabase.from('project').select('id', { count: 'exact', head: true }).eq('employee_id', employee.id).eq('approval_status', 'approved')
      ]);

      setStats({
        clients: cliRes.count || 0,
        projects: projRes.count || 0,
        approvedProjects: appProjRes.count || 0
      });
    } catch (error) {
      toast.error('Failed to load profile stats');
    } finally {
      setLoading(false);
    }
  };

  if (!employee) return <div>Loading profile...</div>;

  const joinedDate = employee.created_at ? new Date(employee.created_at).toLocaleDateString() : 'Unknown';

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="dashboard-title">My Profile</h1>
        <p className="dashboard-subtitle">Manage your personal information and view your stats.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>
        <div className="glass-card" style={{ textAlign: 'center', marginBottom: 0 }}>
          <div 
            className="user-avatar" 
            style={{ 
              width: '120px', 
              height: '120px', 
              margin: '0 auto 1.5rem',
              fontSize: '3rem'
            }}
          >
            {employee.photo ? <img src={employee.photo} alt={employee.name} /> : employee.name.charAt(0)}
          </div>
          <h2 style={{ fontFamily: 'var(--font-brand)', fontSize: '2rem', margin: '0 0 0.5rem', color: 'var(--dash-text)' }}>{employee.name}</h2>
          <p style={{ color: 'var(--rek-orange)', fontWeight: 600, margin: '0 0 1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{employee.role}</p>
          <span className={`badge ${employee.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
            {employee.status || 'Active'}
          </span>
          
          <div style={{ marginTop: '2rem', textAlign: 'left', borderTop: '1px solid var(--dash-border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--dash-text-muted)' }}>
              <Mail size={18} />
              <span style={{ fontSize: '0.9rem' }}>{employee.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--dash-text-muted)' }}>
              <Phone size={18} />
              <span style={{ fontSize: '0.9rem' }}>{employee.phone || 'N/A'}</span>
            </div>
            {employee.username && (
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--dash-text-muted)' }}>
               <User size={18} />
               <span style={{ fontSize: '0.9rem' }}>@{employee.username}</span>
             </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--dash-text-muted)' }}>
              <Calendar size={18} />
              <span style={{ fontSize: '0.9rem' }}>Joined {joinedDate}</span>
            </div>
          </div>
        </div>

        <div className="stat-grid" style={{ marginBottom: 0 }}>
          <div className="stat-card">
            <div>
              <p className="stat-title">Total Clients</p>
              <p className="stat-value">{loading ? '-' : stats.clients}</p>
            </div>
            <div className="stat-icon">
              <Briefcase size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <p className="stat-title">Projects Submitted</p>
              <p className="stat-value">{loading ? '-' : stats.projects}</p>
            </div>
            <div className="stat-icon">
              <FolderGit2 size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <p className="stat-title">Approved Projects</p>
              <p className="stat-value">{loading ? '-' : stats.approvedProjects}</p>
            </div>
            <div className="stat-icon" style={{ color: 'var(--status-success)' }}>
              <CheckCircle size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
