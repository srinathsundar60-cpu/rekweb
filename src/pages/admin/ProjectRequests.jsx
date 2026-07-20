import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Eye, ExternalLink, X } from 'lucide-react';

const ProjectRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewModal, setPreviewModal] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project')
        .select('*, employee:employee_id(name), client:client_id(client_name, company_name)')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      toast.error('Failed to load project requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from('project')
        .update({ 
          approval_status: 'approved', 
          approved_date: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Project approved');
      setRequests(requests.filter(req => req.id !== id));
      if (previewModal?.id === id) setPreviewModal(null);
    } catch (error) {
      toast.error('Failed to approve project');
    }
  };

  const handleReject = async (id) => {
    try {
      const { error } = await supabase
        .from('project')
        .update({ approval_status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      toast.success('Project rejected');
      setRequests(requests.filter(req => req.id !== id));
      if (previewModal?.id === id) setPreviewModal(null);
    } catch (error) {
      toast.error('Failed to reject project');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="dashboard-title">Project Requests</h1>
        <p className="dashboard-subtitle">Review and approve submitted projects.</p>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Submitted By</th>
                <th>Client</th>
                <th>Nature</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--dash-text-muted)' }}>Loading...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--dash-text-muted)' }}>No pending requests.</td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id}>
                    <td data-label="Project Title" style={{ fontWeight: 500 }}>{req.title}</td>
                    <td data-label="Submitted By">{req.employee?.name}</td>
                    <td data-label="Client">{req.client?.company_name || req.client?.client_name}</td>
                    <td data-label="Nature">{req.nature}</td>
                    <td data-label="Actions">
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => setPreviewModal(req)}
                          className="btn-icon"
                          title="Review Project"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleApprove(req.id)}
                          className="btn-icon"
                          style={{ color: 'var(--status-success)' }}
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleReject(req.id)}
                          className="btn-icon"
                          style={{ color: 'var(--status-error)' }}
                          title="Reject"
                        >
                          <XCircle size={18} />
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
              <h3 className="modal-title">Review Project: {previewModal.title}</h3>
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
                  <label className="form-label">Submitted On</label>
                  <div style={{ color: 'var(--dash-text)' }}>{new Date(previewModal.created_at).toLocaleDateString()}</div>
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
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn-danger" onClick={() => handleReject(previewModal.id)}>Reject</button>
                <button type="button" className="btn-primary" onClick={() => handleApprove(previewModal.id)}>Approve</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectRequests;
