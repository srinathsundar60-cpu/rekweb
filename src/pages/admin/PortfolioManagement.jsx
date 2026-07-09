import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const PortfolioManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project')
        .select('*, employee:employee_id(name), client:client_id(client_name)')
        .eq('approval_status', 'approved')
        .order('approved_date', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      toast.error('Failed to load approved projects');
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (id, currentVisibility) => {
    try {
      const { error } = await supabase
        .from('project')
        .update({ visibility: !currentVisibility })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Project ${!currentVisibility ? 'visible' : 'hidden'} on portfolio`);
      
      setProjects(projects.map(p => 
        p.id === id ? { ...p, visibility: !currentVisibility } : p
      ));
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="dashboard-title">Portfolio Management</h1>
        <p className="dashboard-subtitle">Control which approved projects are displayed on the public portfolio.</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Client</th>
                <th>Nature</th>
                <th>Visibility</th>
                <th>Toggle</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--grey-text)' }}>No approved projects found.</td>
                </tr>
              ) : (
                projects.map((proj) => (
                  <tr key={proj.id}>
                    <td style={{ fontWeight: 500 }}>{proj.title}</td>
                    <td>{proj.client?.client_name}</td>
                    <td>{proj.nature}</td>
                    <td>
                      <span className={`badge ${proj.visibility ? 'badge-success' : 'badge-neutral'}`}>
                        {proj.visibility ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleVisibility(proj.id, proj.visibility)}
                        className={proj.visibility ? "btn-secondary" : "btn-primary"}
                        style={{ padding: '0.4rem 0.8rem', minHeight: 'auto', fontSize: '0.8rem' }}
                      >
                        {proj.visibility ? <><EyeOff size={16}/> Hide</> : <><Eye size={16}/> Show</>}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioManagement;
