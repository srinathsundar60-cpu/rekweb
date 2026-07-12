import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Search, Plus, X, Edit2, Trash2 } from 'lucide-react';

const EmployeeClients = () => {
  const { employee } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [modalType, setModalType] = useState(null); // 'add', 'edit', 'delete'
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    client_name: '', company_name: '', project_name: '', budget: '', email: '', phone: '', linkedin: '', location: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (employee?.id) fetchClients();
  }, [employee]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('client').select('*').eq('employee_id', employee.id).order('created_at', { ascending: false });
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      toast.error('Failed to load your clients');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({ client_name: '', company_name: '', project_name: '', budget: '', email: '', phone: '', linkedin: '', location: '' });
    setModalType('add');
  };

  const handleOpenEdit = (client) => {
    setSelectedClient(client);
    setFormData({ 
      client_name: client.client_name || '', 
      company_name: client.company_name || '', 
      project_name: client.project_name || '', 
      budget: client.budget || '', 
      email: client.email || '', 
      phone: client.phone || '', 
      linkedin: client.linkedin || '', 
      location: client.location || '' 
    });
    setModalType('edit');
  };

  const handleOpenDelete = (client) => {
    setSelectedClient(client);
    setModalType('delete');
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateLinkedIn = (url) => {
    if (!url) return true; // Optional
    return url.startsWith('https://www.linkedin.com/') || url.startsWith('https://linkedin.com/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateLinkedIn(formData.linkedin)) {
      toast.error("Please provide a valid LinkedIn URL (https://linkedin.com/...)");
      return;
    }
    
    setSubmitting(true);
    try {
      if (modalType === 'add') {
        const { error } = await supabase.from('client').insert([{ ...formData, employee_id: employee.id }]);
        if (error) throw error;
        toast.success('Client added successfully');
      } else if (modalType === 'edit') {
        const { error } = await supabase.from('client').update(formData).eq('id', selectedClient.id);
        if (error) throw error;
        toast.success('Client updated successfully');
      }
      setModalType(null);
      fetchClients();
    } catch (error) {
      toast.error(error.message || 'Failed to save client');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from('client').delete().eq('id', selectedClient.id);
      if (error) throw error; // Will fail if projects are linked and restrict is on
      toast.success('Client deleted successfully');
      setModalType(null);
      fetchClients();
    } catch (error) {
      toast.error(error.message || 'Failed to delete client. They might have active projects.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClients = clients.filter(c => 
    (c.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.company_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="dashboard-title">My Clients</h1>
          <p className="dashboard-subtitle" style={{ marginBottom: 0 }}>Manage the clients assigned to you.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary" style={{ minHeight: 'auto' }}>
          <Plus size={18} /> Add Client
        </button>
      </div>

      <div className="glass-card">
        <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '320px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--dash-text-muted)' }} />
          <input type="text" className="form-input" placeholder="Search clients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: '2.8rem' }} />
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Client Name</th>
                <th>Project</th>
                <th>Email & Phone</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--dash-text-muted)' }}>Loading...</td></tr>
              ) : filteredClients.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--dash-text-muted)' }}>No clients found.</td></tr>
              ) : (
                filteredClients.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.company_name}</td>
                    <td>{c.client_name}</td>
                    <td>{c.project_name}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span>{c.email || '-'}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--dash-text-muted)' }}>{c.phone || '-'}</span>
                      </div>
                    </td>
                    <td>{c.location || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleOpenEdit(c)} className="btn-icon" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleOpenDelete(c)} className="btn-icon" title="Delete" style={{ color: 'var(--status-error)' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(modalType === 'add' || modalType === 'edit') && (
        <div className="modal-overlay" onClick={() => !submitting && setModalType(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modalType === 'add' ? 'Add New Client' : 'Edit Client'}</h3>
              <button className="btn-icon" onClick={() => setModalType(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group"><label className="form-label">Client Name *</label><input type="text" name="client_name" className="form-input" required value={formData.client_name} onChange={handleChange} /></div>
                <div className="form-group"><label className="form-label">Company Name *</label><input type="text" name="company_name" className="form-input" required value={formData.company_name} onChange={handleChange} /></div>
                <div className="form-group"><label className="form-label">Project Name *</label><input type="text" name="project_name" className="form-input" required value={formData.project_name} onChange={handleChange} /></div>
                <div className="form-group"><label className="form-label">Budget</label><input type="text" name="budget" className="form-input" value={formData.budget} onChange={handleChange} /></div>
                <div className="form-group"><label className="form-label">Email</label><input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} /></div>
                <div className="form-group"><label className="form-label">Phone</label><input type="text" name="phone" className="form-input" value={formData.phone} onChange={handleChange} /></div>
                <div className="form-group"><label className="form-label">Location</label><input type="text" name="location" className="form-input" value={formData.location} onChange={handleChange} /></div>
                <div className="form-group"><label className="form-label">LinkedIn (Optional)</label><input type="url" name="linkedin" className="form-input" placeholder="https://linkedin.com/..." value={formData.linkedin} onChange={handleChange} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModalType(null)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Client'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modalType === 'delete' && (
        <div className="modal-overlay" onClick={() => !submitting && setModalType(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Client</h3>
              <button className="btn-icon" onClick={() => setModalType(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{selectedClient?.company_name}</strong>?</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-muted)', marginTop: '0.5rem' }}>This action cannot be undone. It will fail if they have associated projects.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setModalType(null)} disabled={submitting}>Cancel</button>
              <button type="button" className="btn-danger" onClick={handleDelete} disabled={submitting}>{submitting ? 'Deleting...' : 'Confirm Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeClients;
