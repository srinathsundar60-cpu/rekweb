import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, ExternalLink, X } from 'lucide-react';

const PortfolioManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewModal, setPreviewModal] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project')
        .select('*, employee:employee_id(name), client:client_id(company_name, client_name)')
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
      
      if (previewModal && previewModal.id === id) {
        setPreviewModal({ ...previewModal, visibility: !currentVisibility });
      }
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

      <div className="glass-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Client</th>
                <th>Nature</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--dash-text-muted)' }}>Loading...</td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--dash-text-muted)' }}>No approved projects found.</td>
                </tr>
              ) : (
                projects.map((proj) => (
                  <tr key={proj.id}>
                    <td data-label="Project Title" style={{ fontWeight: 500 }}>{proj.title}</td>
                    <td data-label="Client">{proj.client?.company_name || proj.client?.client_name}</td>
                    <td data-label="Nature">{proj.nature}</td>
                    <td data-label="Visibility">
                      <span className={`badge ${proj.visibility ? 'badge-success' : 'badge-neutral'}`}>
                        {proj.visibility ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                         <button 
                          onClick={() => setPreviewModal(proj)}
                          className="btn-icon"
                          title="Preview"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => toggleVisibility(proj.id, proj.visibility)}
                          className={proj.visibility ? "btn-secondary" : "btn-primary"}
                          style={{ padding: '0.4rem 0.8rem', minHeight: 'auto', fontSize: '0.8rem' }}
                        >
                          {proj.visibility ? <><EyeOff size={14}/> Hide</> : <><Eye size={14}/> Show</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewModal && (
        <div className="modal-overlay" onClick={() => setPreviewModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Project Details: {previewModal.title}</h3>
              <button className="btn-icon" onClick={() => setPreviewModal(null)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Client</label>
                  <div style={{ color: 'var(--dash-text)' }}>{previewModal.client?.company_name}</div>
                </div>
                <div>
                  <label className="form-label">Nature</label>
                  <div style={{ color: 'var(--dash-text)' }}>{previewModal.nature}</div>
                </div>
                <div>
                  <label className="form-label">Submitted By</label>
                  <div style={{ color: 'var(--dash-text)' }}>{previewModal.employee?.name}</div>
                </div>
                <div>
                  <label className="form-label">Approved On</label>
                  <div style={{ color: 'var(--dash-text)' }}>{new Date(previewModal.approved_date).toLocaleDateString()}</div>
                </div>
              </div>

              <div>
                <label className="form-label">Description</label>
                <div style={{ color: 'var(--dash-text)', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                  {previewModal.description || 'No description provided.'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label className="form-label">Links & Media</label>
                {previewModal.thumbnail && (
                  <div style={{ marginBottom: '1rem' }}>
                    <img src={previewModal.thumbnail} alt="Thumbnail" style={{ maxWidth: '200px', borderRadius: '8px' }} />
                  </div>
                )}
                {previewModal.demo_video ? (
                  <a href={previewModal.demo_video} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--rek-orange)', textDecoration: 'none' }}>
                    <ExternalLink size={16} /> View Demo Video (Google Drive)
                  </a>
                ) : (
                  <span style={{ color: 'var(--dash-text-muted)', fontSize: '0.9rem' }}>No demo video provided.</span>
                )}

                {previewModal.website_link && (
                  <a href={previewModal.website_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', textDecoration: 'none' }}>
                    <ExternalLink size={16} /> Live Website
                  </a>
                )}

                {previewModal.github_link && (
                  <a href={previewModal.github_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#F59E0B', textDecoration: 'none' }}>
                    <ExternalLink size={16} /> GitHub Repository
                  </a>
                )}
              </div>

            </div>
            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button type="button" className="btn-secondary" onClick={() => setPreviewModal(null)}>Close</button>
              <button 
                type="button" 
                className={previewModal.visibility ? "btn-secondary" : "btn-primary"} 
                onClick={() => toggleVisibility(previewModal.id, previewModal.visibility)}
              >
                {previewModal.visibility ? 'Hide from Portfolio' : 'Show on Portfolio'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PortfolioManagement;
