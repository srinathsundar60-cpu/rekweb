import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Briefcase, FolderGit2, Plus, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EmployeeDashboard = () => {
  const { employee } = useAuth();
  const [stats, setStats] = useState({ clients: 0, projects: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employee?.id) {
      fetchData();
    }
  }, [employee]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cliRes, projRes, recentRes] = await Promise.all([
        supabase.from('client').select('id', { count: 'exact', head: true }).eq('employee_id', employee.id),
        supabase.from('project').select('id', { count: 'exact', head: true }).eq('employee_id', employee.id),
        supabase.from('project').select('*, client:client_id(company_name)').eq('employee_id', employee.id).order('created_at', { ascending: false }).limit(4)
      ]);

      setStats({
        clients: cliRes.count || 0,
        projects: projRes.count || 0
      });
      setRecentProjects(recentRes.data || []);
    } catch (error) {
      console.error("Error fetching employee stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="dashboard-title">Welcome back, {employee?.name}</h1>
          <p className="dashboard-subtitle" style={{ marginBottom: 0 }}>Here's an overview of your work.</p>
        </div>
        <Link to="/employee/submit-project" className="btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={18} />
          Submit Project
        </Link>
      </div>

      {loading ? (
        <p style={{ color: 'var(--dash-text-muted)' }}>Loading your dashboard...</p>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div>
                <p className="stat-title">My Clients</p>
                <p className="stat-value">{stats.clients}</p>
              </div>
              <div className="stat-icon"><Briefcase size={24} /></div>
            </div>

            <div className="stat-card">
              <div>
                <p className="stat-title">Submitted Projects</p>
                <p className="stat-value">{stats.projects}</p>
              </div>
              <div className="stat-icon"><FolderGit2 size={24} /></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            <div className="glass-card">
              <div className="card-header">
                <h3 className="card-title" style={{ fontSize: '1.4rem' }}>Recent Projects</h3>
                <Link to="/employee/my-projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--rek-orange)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
                  View All <ArrowRight size={16} />
                </Link>
              </div>
              {recentProjects.length === 0 ? (
                <p style={{ color: 'var(--dash-text-muted)' }}>You haven't submitted any projects yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recentProjects.map(proj => (
                    <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--dash-border)' }}>
                      <div>
                        <p style={{ fontWeight: 600, margin: '0 0 0.3rem' }}>{proj.title}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-muted)', margin: 0 }}>Client: {proj.client?.company_name}</p>
                      </div>
                      <span className={`badge ${
                        proj.approval_status === 'approved' ? 'badge-success' : 
                        proj.approval_status === 'rejected' ? 'badge-error' : 
                        'badge-warning'
                      }`}>
                        {proj.approval_status}
                      </span>
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

export default EmployeeDashboard;
