import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="dashboard-title">Employees</h1>
          <p className="dashboard-subtitle" style={{ marginBottom: 0 }}>Manage team members and roles.</p>
        </div>
        
        {/* Placeholder for Add Employee Modal. Normally we'd use a state for a modal here, but for brevity we'll just have a button that might open a drawer or page. */}
        <button className="btn-primary" style={{ minHeight: 'auto', padding: '0.6rem 1.25rem' }}>
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '320px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--grey-text)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
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
                  <td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--grey-text)' }}>No employees found.</td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
                          {emp.photo ? <img src={emp.photo} alt="" /> : emp.name.charAt(0)}
                        </div>
                        <div style={{ fontWeight: 500 }}>{emp.name}</div>
                      </div>
                    </td>
                    <td>{emp.role}</td>
                    <td style={{ color: 'var(--grey-text)' }}>{emp.email}</td>
                    <td>
                      <span className={`badge ${emp.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/employees/${emp.id}`} style={{ color: 'var(--orange)', textDecoration: 'none', fontWeight: 500, fontSize: '0.85rem' }}>
                        View Profile
                      </Link>
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

export default Employees;
