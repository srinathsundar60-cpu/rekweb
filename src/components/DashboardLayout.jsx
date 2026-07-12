import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogoImage } from './LogoImage';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FolderGit2, 
  Settings, 
  LogOut,
  Menu,
  X,
  UserCircle
} from 'lucide-react';
import '../styles/dashboard.css';

const DashboardLayout = ({ children }) => {
  const { employee, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = employee?.role === 'Admin';
  const prefix = isAdmin ? '/admin' : '/employee';

  useEffect(() => {
    document.body.classList.add('dashboard-active');
    return () => {
      document.body.classList.remove('dashboard-active');
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = isAdmin ? [
    { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/admin/employees', icon: <Users size={20} />, label: 'Employees' },
    { to: '/admin/clients', icon: <Briefcase size={20} />, label: 'Clients' },
    { to: '/admin/requests', icon: <FolderGit2 size={20} />, label: 'Project Requests' },
    { to: '/admin/portfolio', icon: <UserCircle size={20} />, label: 'Portfolio' },
    { to: '/admin/profile', icon: <UserCircle size={20} />, label: 'Profile' },
  ] : [
    { to: '/employee', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/employee/clients', icon: <Briefcase size={20} />, label: 'Clients' },
    { to: '/employee/submit-project', icon: <FolderGit2 size={20} />, label: 'Submit Project' },
    { to: '/employee/my-projects', icon: <FolderGit2 size={20} />, label: 'My Projects' },
    { to: '/employee/profile', icon: <UserCircle size={20} />, label: 'Profile' },
  ];

  return (
    <div className="dashboard-container">
      {/* Mobile Header */}
      <div className="mobile-header">
        <LogoImage theme="dark" />
        <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <LogoImage theme="dark" />
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <div className="sidebar-user">
          <div className="user-avatar">
            {employee?.photo ? (
              <img src={employee.photo} alt={employee?.name} />
            ) : (
              <span>{employee?.name?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div className="user-info">
            <p className="user-name">{employee?.name}</p>
            <p className="user-role">{employee?.role}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/employee'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
