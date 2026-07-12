import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Briefcase, FolderGit2, CheckCircle, Mail, Phone, Calendar, User } from 'lucide-react';

const AdminEmployeeProfile = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [stats, setStats] = useState({ clients: 0, projects: 0, approvedProjects: 0 });
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Employee Details
      const { data: emp, error: empError } = await supabase
        .from('employee')
        .select('*')
        .eq('id', id)
        .single();
      
      if (empError) throw empError;
      setEmployee(emp);

      // 2. Fetch Stats & Related Data
      const [cliRes, projRes, projListRes, cliListRes] = await Promise.all([
        supabase.from('client').select('id', { count: 'exact', head: true }).eq('employee_id', id),
        supabase.from('project').select('id', { count: 'exact', head: true }).eq('employee_id', id),
        supabase.from('project').select('*, client:client_id(company_name)').eq('employee_id', id).order('created_at', { ascending: false }).limit(5),
        supabase.from('client').select('*').eq('employee_id', id).order('created_at', { ascending: false }).limit(5)
      ]);

      const { count: appProjCount } = await supabase.from('project').select('id', { count: 'exact', head: true }).eq('employee_id', id).eq('approval_status', 'approved');

      setStats({
        clients: cliRes.count || 0,
        projects: projRes.count || 0,
        approvedProjects: appProjCount || 0
      });
      setProjects(projListRes.data || []);
      setClients(cliListRes.data || []);

    } catch (error) {
      toast.error('Failed to load employee profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (!employee) return <div>Employee not found.</div>;

  const joinedDate = employee.created_at ? new Date(employee.created_at).toLocaleDateString() : 'Unknown';

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/admin/employees" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--dash-text-muted)', textDecoration: 'none', marginBottom: '1rem', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Employees
        </Link>
        <h1 className="dashboard-title">Employee Profile</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>
        <div className="glass-card" style={{ textAlign: 'center', marginBottom: 0 }}>
          <div 
            className="user-avatar" 
            style={{ 
              width: '120px', 
              height: '120px', 
              margin: '0 auto 1.5rem',
              fontSize: '3rem'
            }}
          >
            {employee.photo ? <img src={employee.photo} alt={employee.name} /> : employee.name.charAt(0)}
          </div>
          <h2 style={{ fontFamily: 'var(--font-brand)', fontSize: '2rem', margin: '0 0 0.5rem', color: 'var(--dash-text)' }}>{employee.name}</h2>
          <p style={{ color: 'var(--rek-orange)', fontWeight: 600, margin: '0 0 1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{employee.role}</p>
          <span className={`badge ${employee.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
            {employee.status || 'Active'}
          </span>
          
          <div style={{ marginTop: '2rem', textAlign: 'left', borderTop: '1px solid var(--dash-border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--dash-text-muted)' }}>
              <Mail size={18} />
              <span style={{ fontSize: '0.9rem' }}>{employee.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--dash-text-muted)' }}>
              <Phone size={18} />
              <span style={{ fontSize: '0.9rem' }}>{employee.phone || 'N/A'}</span>
            </div>
            {employee.username && (
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--dash-text-muted)' }}>
               <User size={18} />
               <span style={{ fontSize: '0.9rem' }}>@{employee.username}</span>
             </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--dash-text-muted)' }}>
              <Calendar size={18} />
              <span style={{ fontSize: '0.9rem' }}>Joined {joinedDate}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="stat-grid" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div>
                <p className="stat-title">Total Clients</p>
                <p className="stat-value">{stats.clients}</p>
              </div>
              <div className="stat-icon"><Briefcase size={24} /></div>
            </div>
            <div className="stat-card">
              <div>
                <p className="stat-title">Projects Submitted</p>
                <p className="stat-value">{stats.projects}</p>
              </div>
              <div className="stat-icon"><FolderGit2 size={24} /></div>
            </div>
            <div className="stat-card">
              <div>
                <p className="stat-title">Approved</p>
                <p className="stat-value">{stats.approvedProjects}</p>
              </div>
              <div className="stat-icon" style={{ color: 'var(--status-success)' }}><CheckCircle size={24} /></div>
            </div>
          </div>

          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Recent Projects</h3>
            {projects.length === 0 ? (
              <p style={{ color: 'var(--dash-text-muted)' }}>No projects submitted yet.</p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Client</th>
                      <th>Status</th>
                      <th>Visibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map(p => (
                      <tr key={p.id}>
                        <td>{p.title}</td>
                        <td>{p.client?.company_name || 'N/A'}</td>
                        <td>
                          <span className={`badge ${p.approval_status === 'approved' ? 'badge-success' : p.approval_status === 'rejected' ? 'badge-error' : 'badge-warning'}`}>
                            {p.approval_status}
                          </span>
                        </td>
                        <td>
                           <span className={`badge ${p.visibility ? 'badge-success' : 'badge-neutral'}`}>
                            {p.visibility ? 'Visible' : 'Hidden'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="glass-card">
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Recent Clients</h3>
            {clients.length === 0 ? (
              <p style={{ color: 'var(--dash-text-muted)' }}>No clients added yet.</p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Contact Name</th>
                      <th>Project</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(c => (
                      <tr key={c.id}>
                        <td>{c.company_name}</td>
                        <td>{c.client_name}</td>
                        <td>{c.project_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminEmployeeProfile;
