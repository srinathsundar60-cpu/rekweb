import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Briefcase, FolderGit2, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    employees: 0,
    clients: 0,
    projects: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [empRes, cliRes, projRes, pendRes] = await Promise.all([
        supabase.from('employee').select('id', { count: 'exact', head: true }),
        supabase.from('client').select('id', { count: 'exact', head: true }),
        supabase.from('project').select('id', { count: 'exact', head: true }),
        supabase.from('project').select('id', { count: 'exact', head: true }).eq('approval_status', 'pending')
      ]);

      setStats({
        employees: empRes.count || 0,
        clients: cliRes.count || 0,
        projects: projRes.count || 0,
        pending: pendRes.count || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="dashboard-title">Dashboard Overview</h1>
      <p className="dashboard-subtitle">Welcome back. Here's what's happening today.</p>

      {loading ? (
        <p>Loading stats...</p>
      ) : (
        <div className="stat-grid">
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="stat-title">Total Employees</p>
                <p className="stat-value">{stats.employees}</p>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--grey-bg)', borderRadius: '12px', color: 'var(--black)' }}>
                <Users size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="stat-title">Total Clients</p>
                <p className="stat-value">{stats.clients}</p>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--grey-bg)', borderRadius: '12px', color: 'var(--black)' }}>
                <Briefcase size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="stat-title">Total Projects</p>
                <p className="stat-value">{stats.projects}</p>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--grey-bg)', borderRadius: '12px', color: 'var(--black)' }}>
                <FolderGit2 size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="stat-title">Pending Requests</p>
                <p className="stat-value">{stats.pending}</p>
              </div>
              <div style={{ padding: '0.75rem', background: '#fef9c3', borderRadius: '12px', color: '#854d0e' }}>
                <AlertCircle size={24} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
