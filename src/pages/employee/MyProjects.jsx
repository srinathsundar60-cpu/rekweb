import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const MyProjects = () => {
  const { employee } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employee?.id) {
      fetchMyProjects();
    }
  }, [employee]);

  const fetchMyProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project')
        .select('*, client:client_id(client_name, company_name)')
        .eq('employee_id', employee.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      toast.error('Failed to load your projects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="dashboard-title">My Projects</h1>
        <p className="dashboard-subtitle">Track the status of your submitted projects.</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Client</th>
                <th>Nature</th>
                <th>Approval Status</th>
                <th>Visibility</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--grey-text)' }}>You haven't submitted any projects yet.</td>
                </tr>
              ) : (
                projects.map((proj) => (
                  <tr key={proj.id}>
                    <td style={{ fontWeight: 500 }}>
                      {proj.website_link ? (
                        <a href={proj.website_link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                          {proj.title}
                        </a>
                      ) : (
                        proj.title
                      )}
                    </td>
                    <td>{proj.client?.company_name || proj.client?.client_name}</td>
                    <td>{proj.nature}</td>
                    <td>
                      <span className={`badge ${
                        proj.approval_status === 'approved' ? 'badge-success' : 
                        proj.approval_status === 'rejected' ? 'badge-neutral' : 
                        'badge-warning'
                      }`}>
                        {proj.approval_status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${proj.visibility ? 'badge-success' : 'badge-neutral'}`}>
                        {proj.visibility ? 'Visible' : 'Hidden'}
                      </span>
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

export default MyProjects;
