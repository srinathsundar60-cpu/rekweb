import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Edit2, X } from 'lucide-react';

const MyProjects = () => {
  const { employee } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  
  const [editModal, setEditModal] = useState(null);
  const [formData, setFormData] = useState({
    title: '', client_id: '', nature: '', description: '', website_link: '', github_link: '', demo_video: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  useEffect(() => {
    if (employee?.id) {
      fetchMyProjects();
      fetchMyClients();
    }
  }, [employee]);

  const fetchMyClients = async () => {
    try {
      const { data } = await supabase.from('client').select('id, company_name, client_name').eq('employee_id', employee.id);
      setClients(data || []);
    } catch (e) {}
  };

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

  const handleOpenEdit = (proj) => {
    setFormData({
      title: proj.title || '',
      client_id: proj.client_id || '',
      nature: proj.nature || 'Website',
      description: proj.description || '',
      website_link: proj.website_link || '',
      github_link: proj.github_link || '',
      demo_video: proj.demo_video || ''
    });
    setThumbnailFile(null);
    setEditModal(proj);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.demo_video && !formData.demo_video.includes('drive.google.com')) {
      toast.error('Demo Video must be a Google Drive link.');
      return;
    }

    setSubmitting(true);
    try {
      let thumbnailUrl = editModal.thumbnail;

      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `thumbnails/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('rek-storage').upload(filePath, thumbnailFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('rek-storage').getPublicUrl(filePath);
        thumbnailUrl = publicUrl;
      }

      // Record old project as previous version if needed? No, just update existing project.
      const { error } = await supabase.from('project').update({
        ...formData,
        thumbnail: thumbnailUrl,
        approval_status: 'pending', // Revert to pending when edited
        original_project_id: editModal.id // keep track if this was a revision, but actually just updating in place is requested by prompt for simplicity if not specified otherwise. Wait, prompt says: "If a project is edited, its status resets to pending."
      }).eq('id', editModal.id);

      if (error) throw error;

      toast.success('Project updated and submitted for re-approval');
      setEditModal(null);
      fetchMyProjects();
    } catch (error) {
      toast.error(error.message || 'Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="dashboard-title">My Projects</h1>
        <p className="dashboard-subtitle">Track and manage your submitted projects.</p>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Client</th>
                <th>Nature</th>
                <th>Status</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--dash-text-muted)' }}>Loading...</td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--dash-text-muted)' }}>You haven't submitted any projects yet.</td></tr>
              ) : (
                projects.map((proj) => (
                  <tr key={proj.id}>
                    <td data-label="Project Title" style={{ fontWeight: 500 }}>
                      {proj.website_link ? (
                        <a href={proj.website_link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--rek-orange)', textDecoration: 'none' }}>
                          {proj.title}
                        </a>
                      ) : (
                        proj.title
                      )}
                    </td>
                    <td data-label="Client">{proj.client?.company_name || proj.client?.client_name}</td>
                    <td data-label="Nature">{proj.nature}</td>
                    <td data-label="Status">
                      <span className={`badge ${
                        proj.approval_status === 'approved' ? 'badge-success' : 
                        proj.approval_status === 'rejected' ? 'badge-error' : 
                        'badge-warning'
                      }`}>
                        {proj.approval_status}
                      </span>
                    </td>
                    <td data-label="Visibility">
                      <span className={`badge ${proj.visibility ? 'badge-success' : 'badge-neutral'}`}>
                        {proj.visibility ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleOpenEdit(proj)} className="btn-icon" title="Edit Project">
                          <Edit2 size={16} />
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

      {/* Edit Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={() => !submitting && setEditModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Project: {editModal.title}</h3>
              <button className="btn-icon" onClick={() => setEditModal(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Project Title *</label>
                    <input type="text" name="title" className="form-input" required value={formData.title} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Client *</label>
                    <select name="client_id" className="form-select" required value={formData.client_id} onChange={handleChange}>
                      <option value="" disabled>Select a client</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.company_name} ({c.client_name})</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nature of Project *</label>
                    <select name="nature" className="form-select" required value={formData.nature} onChange={handleChange}>
                      <option value="Website">Website</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="Automation">Automation</option>
                      <option value="AI Solution">AI Solution</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Update Thumbnail Image (Optional)</label>
                    <input type="file" accept="image/*" className="form-input" onChange={e => setThumbnailFile(e.target.files[0])} style={{ padding: '0.6rem 1rem' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea name="description" className="form-textarea" value={formData.description} onChange={handleChange}></textarea>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Website Link</label>
                    <input type="url" name="website_link" className="form-input" placeholder="https://" value={formData.website_link} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GitHub Repository</label>
                    <input type="url" name="github_link" className="form-input" placeholder="https://github.com/..." value={formData.github_link} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Demo Video (Google Drive Link)</label>
                    <input type="url" name="demo_video" className="form-input" placeholder="https://drive.google.com/..." value={formData.demo_video} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditModal(null)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Submit Changes for Approval'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProjects;
