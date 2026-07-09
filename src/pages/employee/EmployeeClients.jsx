import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Search, Plus } from 'lucide-react';

const EmployeeClients = () => {
  const { employee } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add Client Modal State (Simplified for this example using inline form toggle)
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    company_name: '',
    project_name: '',
    budget: '',
    email: '',
    phone: '',
    linkedin: '',
    location: ''
  });

  useEffect(() => {
    if (employee?.id) {
      fetchClients();
    }
  }, [employee]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('client')
        .select('*')
        .eq('employee_id', employee.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      toast.error('Failed to load your clients');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('client')
        .insert([{ ...formData, employee_id: employee.id }]);

      if (error) throw error;
      
      toast.success('Client added successfully');
      setShowAddForm(false);
      setFormData({
        client_name: '', company_name: '', project_name: '', budget: '', email: '', phone: '', linkedin: '', location: ''
      });
      fetchClients();
    } catch (error) {
      toast.error('Failed to add client');
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="dashboard-title">My Clients</h1>
          <p className="dashboard-subtitle" style={{ marginBottom: 0 }}>Manage the clients assigned to you.</p>
        </div>
        
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={showAddForm ? "btn-secondary" : "btn-primary"} 
          style={{ minHeight: 'auto', padding: '0.6rem 1.25rem' }}
        >
          {showAddForm ? 'Cancel' : <><Plus size={18} /> Add Client</>}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Add New Client</h3>
          <form onSubmit={handleAddClient} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Client Name *</label>
              <input type="text" name="client_name" className="form-input" required value={formData.client_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input type="text" name="company_name" className="form-input" required value={formData.company_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input type="text" name="project_name" className="form-input" required value={formData.project_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Budget</label>
              <input type="number" name="budget" className="form-input" value={formData.budget} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="text" name="phone" className="form-input" value={formData.phone} onChange={handleChange} />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" disabled={loading}>Save Client</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '320px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--grey-text)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Client Name</th>
                <th>Project</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>Loading...</td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--grey-text)' }}>No clients found.</td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td style={{ fontWeight: 500 }}>{client.company_name}</td>
                    <td>{client.client_name}</td>
                    <td>{client.project_name}</td>
                    <td>{client.location || '-'}</td>
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

export default EmployeeClients;
