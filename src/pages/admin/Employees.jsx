import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Search, Plus, X, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [modalType, setModalType] = useState(null); // 'add' or 'edit'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '', username: '', email: '', password: '', phone: '', role: 'Developer', status: 'Active'
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employee')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({ name: '', username: '', email: '', password: '', phone: '', role: 'Developer', status: 'Active' });
    setPhotoFile(null);
    setModalType('add');
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmployee(emp);
    setFormData({ 
      name: emp.name || '', 
      username: emp.username || '', 
      email: emp.email || '', 
      password: '', // blank password unless changing
      phone: emp.phone || '', 
      role: emp.role || 'Developer', 
      status: emp.status || 'Active' 
    });
    setPhotoFile(null);
    setModalType('edit');
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhotoUpload = async () => {
    if (!photoFile) return null;
    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('rek-storage').upload(filePath, photoFile);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('rek-storage').getPublicUrl(filePath);
    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Basic validation
      if (!formData.name || !formData.email || !formData.role) {
        throw new Error("Please fill out required fields.");
      }

      let photoUrl = selectedEmployee?.photo; // default to existing
      if (photoFile) {
        photoUrl = await handlePhotoUpload();
      }

      const endpoint = modalType === 'add' ? '/api/create-employee' : '/api/update-employee';
      const payload = { ...formData, photo: photoUrl };
      if (modalType === 'edit') payload.id = selectedEmployee.id;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Failed to save employee.');

      toast.success(`Employee ${modalType === 'add' ? 'created' : 'updated'} successfully`);
      setModalType(null);
      fetchEmployees();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="dashboard-title">Employees</h1>
          <p className="dashboard-subtitle" style={{ marginBottom: 0 }}>Manage team members and roles.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary" style={{ minHeight: 'auto' }}>
          <Plus size={18} /> Add Employee
        </button>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '320px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--dash-text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.8rem' }}
          />
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--dash-text-muted)' }}>Loading employees...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--dash-text-muted)' }}>No employees found.</td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="user-avatar" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
                          {emp.photo ? <img src={emp.photo} alt="" /> : emp.name.charAt(0)}
                        </div>
                        <div style={{ fontWeight: 500 }}>{emp.name}</div>
                      </div>
                    </td>
                    <td>{emp.role}</td>
                    <td style={{ color: 'var(--dash-text-muted)' }}>{emp.email}</td>
                    <td>
                      <span className={`badge ${emp.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                        {emp.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Link to={`/admin/employees/${emp.id}`} style={{ color: 'var(--rek-orange)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                          View Profile
                        </Link>
                        <button onClick={() => handleOpenEdit(emp)} className="btn-icon" title="Edit Employee">
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

      {/* Modal */}
      {modalType && (
        <div className="modal-overlay" onClick={() => !submitting && setModalType(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modalType === 'add' ? 'Add New Employee' : 'Edit Employee'}</h3>
              <button className="btn-icon" onClick={() => setModalType(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Profile Photo (Optional)</label>
                  <input type="file" className="form-input" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} />
                  {modalType === 'edit' && selectedEmployee?.photo && !photoFile && (
                    <img src={selectedEmployee.photo} alt="Current" style={{ width: '60px', height: '60px', borderRadius: '50%', marginTop: '1rem', objectFit: 'cover' }} />
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input type="text" name="name" className="form-input" required value={formData.name} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input type="text" name="username" className="form-input" value={formData.username} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input type="email" name="email" className="form-input" required value={formData.email} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label className="form-label">{modalType === 'add' ? 'Password *' : 'New Password (Leave blank to keep current)'}</label>
                  <input type="password" name="password" className="form-input" required={modalType === 'add'} value={formData.password} onChange={handleChange} minLength={6} />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="text" name="phone" className="form-input" value={formData.phone} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select name="role" className="form-select" required value={formData.role} onChange={handleChange}>
                    <option value="Admin">Admin</option>
                    <option value="Developer">Developer</option>
                    <option value="Designer">Designer</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="QA Tester">QA Tester</option>
                    <option value="Marketing">Marketing</option>
                    <option value="POC">POC</option>
                    <option value="Custom Role">Custom Role</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Status</label>
                  <select name="status" className="form-select" required value={formData.status} onChange={handleChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModalType(null)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
