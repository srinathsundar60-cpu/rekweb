import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Briefcase, FolderGit2, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ employees: 0, clients: 0, projects: 0, pending: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, cliRes, projRes, pendRes, recentRes] = await Promise.all([
        supabase.from('employee').select('id', { count: 'exact', head: true }),
        supabase.from('client').select('id', { count: 'exact', head: true }),
        supabase.from('project').select('id', { count: 'exact', head: true }),
        supabase.from('project').select('id', { count: 'exact', head: true }).eq('approval_status', 'pending'),
        supabase.from('project').select('*, employee:employee_id(name)').eq('approval_status', 'pending').order('created_at', { ascending: false }).limit(4)
      ]);

      setStats({
        employees: empRes.count || 0,
        clients: cliRes.count || 0,
        projects: projRes.count || 0,
        pending: pendRes.count || 0
      });
      setRecentRequests(recentRes.data || []);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="dashboard-title">Dashboard Overview</h1>
      <p className="dashboard-subtitle">Welcome back to REK Admin. Here's what's happening today.</p>

      {loading ? (
        <p style={{ color: 'var(--dash-text-muted)' }}>Loading stats...</p>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div>
                <p className="stat-title">Total Employees</p>
                <p className="stat-value">{stats.employees}</p>
              </div>
              <div className="stat-icon"><Users size={24} /></div>
            </div>

            <div className="stat-card">
              <div>
                <p className="stat-title">Total Clients</p>
                <p className="stat-value">{stats.clients}</p>
              </div>
              <div className="stat-icon"><Briefcase size={24} /></div>
            </div>

            <div className="stat-card">
              <div>
                <p className="stat-title">Total Projects</p>
                <p className="stat-value">{stats.projects}</p>
              </div>
              <div className="stat-icon"><FolderGit2 size={24} /></div>
            </div>

            <div className="stat-card">
              <div>
                <p className="stat-title">Pending Requests</p>
                <p className="stat-value">{stats.pending}</p>
              </div>
              <div className="stat-icon" style={{ color: 'var(--status-warning)' }}><AlertCircle size={24} /></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            <div className="glass-card">
              <div className="card-header">
                <h3 className="card-title" style={{ fontSize: '1.4rem' }}>Recent Pending Requests</h3>
                <Link to="/admin/requests" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--rek-orange)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
                  View All <ArrowRight size={16} />
                </Link>
              </div>
              {recentRequests.length === 0 ? (
                <p style={{ color: 'var(--dash-text-muted)' }}>No pending requests right now.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recentRequests.map(req => (
                    <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--dash-border)' }}>
                      <div>
                        <p style={{ fontWeight: 600, margin: '0 0 0.3rem' }}>{req.title}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-muted)', margin: 0 }}>By {req.employee?.name}</p>
                      </div>
                      <span className="badge badge-warning">Pending</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
