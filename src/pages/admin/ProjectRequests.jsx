import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';

const ProjectRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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

      <div className="card">
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
                  <td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--grey-text)' }}>No pending requests.</td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: 500 }}>{req.title}</td>
                    <td>{req.employee?.name}</td>
                    <td>{req.client?.company_name || req.client?.client_name}</td>
                    <td>{req.nature}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleApprove(req.id)}
                          style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', padding: '0.25rem' }}
                          title="Approve"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button 
                          onClick={() => handleReject(req.id)}
                          style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', padding: '0.25rem' }}
                          title="Reject"
                        >
                          <XCircle size={20} />
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
    </div>
  );
};

export default ProjectRequests;
