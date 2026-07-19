import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Search, Plus, X, Edit2, Trash2 } from 'lucide-react';

const ClientRow = React.memo(({ client, onEdit, onDelete }) => {
  return (
    <tr>
      <td style={{ fontWeight: 500 }}>{client.company_name}</td>
      <td>{client.client_name}</td>
      <td>{client.project_name}</td>
      <td>{client.employee?.name || 'Unassigned'}</td>
      <td>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => onEdit(client)} className="btn-icon" title="Edit"><Edit2 size={16} /></button>
          <button onClick={() => onDelete(client)} className="btn-icon" title="Delete" style={{ color: 'var(--status-error)' }}><Trash2 size={16} /></button>
        </div>
      </td>
    </tr>
  );
});

ClientRow.displayName = 'ClientRow';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [modalType, setModalType] = useState(null); // 'add', 'edit', 'delete'
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    client_name: '', company_name: '', project_name: '', budget: '', email: '', phone: '', linkedin: '', location: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchValue);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchValue]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('client')
        .select('*, employee:employee_id(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleOpenEdit = useCallback((client) => {
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
  }, []);

  const handleOpenDelete = useCallback((client) => {
    setSelectedClient(client);
    setModalType('delete');
  }, []);

  const handleChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const validateLinkedIn = useCallback((url) => {
    if (!url) return true;
    return url.startsWith('https://www.linkedin.com/') || url.startsWith('https://linkedin.com/');
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateLinkedIn(formData.linkedin)) {
      toast.error("Please provide a valid LinkedIn URL (https://linkedin.com/...)");
      return;
    }
    
    setSubmitting(true);
    try {
      if (modalType === 'edit') {
        const { error } = await supabase.from('client').update(formData).eq('id', selectedClient.id);
        if (error) throw error;
        toast.success('Client updated successfully');
      }
      setModalType(null);
      fetchClients();
    } catch (error) {
      toast.error(error.message || 'Failed to update client');
    } finally {
      setSubmitting(false);
    }
  }, [formData, selectedClient, modalType, validateLinkedIn, fetchClients]);

  const handleDelete = useCallback(async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from('client').delete().eq('id', selectedClient.id);
      if (error) throw error;
      toast.success('Client deleted successfully');
      setModalType(null);
      fetchClients();
    } catch (error) {
      toast.error(error.message || 'Failed to delete client. They might have active projects.');
    } finally {
      setSubmitting(false);
    }
  }, [selectedClient, fetchClients]);

  const filteredClients = clients.filter(c => 
    (c.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.company_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="dashboard-title">All Clients</h1>
          <p className="dashboard-subtitle" style={{ marginBottom: 0 }}>View and manage all company clients.</p>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="dashboard-search-container">
            <div className="dashboard-search-wrapper">
              <input
                type="text"
                className="dashboard-search-input"
                placeholder="Search clients by name, company..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <Search className="dashboard-search-icon" size={20} />
              {searchValue && (
                <button 
                  type="button" 
                  className="dashboard-search-clear"
                  onClick={() => {
                    setSearchValue('');
                    setSearchTerm('');
                  }}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Client Name</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--dash-text-muted)' }}>Loading...</td></tr>
              ) : filteredClients.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--dash-text-muted)' }}>No clients found.</td></tr>
              ) : (
                filteredClients.map((c) => (
                  <ClientRow key={c.id} client={c} onEdit={handleOpenEdit} onDelete={handleOpenDelete} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {modalType === 'edit' && (
        <div className="modal-overlay" onClick={() => !submitting && setModalType(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Client</h3>
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

export default Clients;
