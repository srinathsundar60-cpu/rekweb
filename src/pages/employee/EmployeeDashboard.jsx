import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Briefcase, FolderGit2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EmployeeDashboard = () => {
  const { employee } = useAuth();
  const [stats, setStats] = useState({ clients: 0, projects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employee?.id) {
      fetchData();
    }
  }, [employee]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cliRes, projRes] = await Promise.all([
        supabase.from('client').select('id', { count: 'exact', head: true }).eq('employee_id', employee.id),
        supabase.from('project').select('id', { count: 'exact', head: true }).eq('employee_id', employee.id)
      ]);

      setStats({
        clients: cliRes.count || 0,
        projects: projRes.count || 0
      });
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
        <Link to="/employee/submit-project" className="btn-primary" style={{ padding: '0.6rem 1.25rem', minHeight: 'auto', textDecoration: 'none' }}>
          <Plus size={18} />
          Submit Project
        </Link>
      </div>

      {loading ? (
        <p>Loading your dashboard...</p>
      ) : (
        <div className="stat-grid">
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="stat-title">My Clients</p>
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
                <p className="stat-title">Submitted Projects</p>
                <p className="stat-value">{stats.projects}</p>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--grey-bg)', borderRadius: '12px', color: 'var(--black)' }}>
                <FolderGit2 size={24} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
