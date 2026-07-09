import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SubmitProject = () => {
  const { employee } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    nature: 'Website',
    description: '',
    website_link: '',
    github_link: '',
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);

  useEffect(() => {
    if (employee?.id) {
      fetchMyClients();
    }
  }, [employee]);

  const fetchMyClients = async () => {
    try {
      const { data, error } = await supabase
        .from('client')
        .select('id, company_name, client_name')
        .eq('employee_id', employee.id);
      
      if (error) throw error;
      setClients(data || []);
      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, client_id: data[0].id }));
      }
    } catch (error) {
      toast.error('Failed to load your clients');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let thumbnailUrl = null;

      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `thumbnails/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('rek-storage')
          .upload(filePath, thumbnailFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('rek-storage')
          .getPublicUrl(filePath);

        thumbnailUrl = publicUrl;
      }

      const { error } = await supabase
        .from('project')
        .insert([
          {
            ...formData,
            employee_id: employee.id,
            thumbnail: thumbnailUrl,
            approval_status: 'pending',
            visibility: false
          }
        ]);

      if (error) throw error;

      toast.success('Project submitted successfully for approval');
      navigate('/employee/my-projects');
    } catch (error) {
      toast.error(error.message || 'Failed to submit project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="dashboard-title">Submit Project</h1>
        <p className="dashboard-subtitle">Submit completed work for admin approval.</p>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input 
              type="text" 
              name="title" 
              className="form-input" 
              required 
              value={formData.title} 
              onChange={handleChange} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Client *</label>
              <select 
                name="client_id" 
                className="form-select" 
                required 
                value={formData.client_id} 
                onChange={handleChange}
              >
                <option value="" disabled>Select a client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.company_name} ({c.client_name})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Nature of Project *</label>
              <select 
                name="nature" 
                className="form-select" 
                required 
                value={formData.nature} 
                onChange={handleChange}
              >
                <option value="Website">Website</option>
                <option value="Mobile App">Mobile App</option>
                <option value="Automation">Automation</option>
                <option value="AI Solution">AI Solution</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Thumbnail Image</label>
            <input 
              type="file" 
              accept="image/*" 
              className="form-input" 
              onChange={(e) => setThumbnailFile(e.target.files[0])}
              style={{ padding: '0.5rem 1rem' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              name="description" 
              className="form-textarea" 
              value={formData.description} 
              onChange={handleChange}
            ></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Website Link</label>
              <input 
                type="url" 
                name="website_link" 
                className="form-input" 
                placeholder="https://" 
                value={formData.website_link} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">GitHub Repository</label>
              <input 
                type="url" 
                name="github_link" 
                className="form-input" 
                placeholder="https://github.com/..." 
                value={formData.github_link} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitProject;
