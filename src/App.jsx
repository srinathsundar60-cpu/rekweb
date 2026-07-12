import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import CustomCursor from './components/CustomCursor';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';

import AdminDashboard from './pages/admin/AdminDashboard';
import Employees from './pages/admin/Employees';
import AdminEmployeeProfile from './pages/admin/AdminEmployeeProfile';
import Clients from './pages/admin/Clients';
import ProjectRequests from './pages/admin/ProjectRequests';
import PortfolioManagement from './pages/admin/PortfolioManagement';

import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import SubmitProject from './pages/employee/SubmitProject';
import EmployeeClients from './pages/employee/EmployeeClients';
import MyProjects from './pages/employee/MyProjects';

import Profile from './pages/shared/Profile';

function App() {
  return (
    <>
      <CustomCursor />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      
      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route path="/admin" element={<DashboardLayout><AdminDashboard /></DashboardLayout>} />
        <Route path="/admin/employees" element={<DashboardLayout><Employees /></DashboardLayout>} />
        <Route path="/admin/employees/:id" element={<DashboardLayout><AdminEmployeeProfile /></DashboardLayout>} />
        <Route path="/admin/clients" element={<DashboardLayout><Clients /></DashboardLayout>} />
        <Route path="/admin/requests" element={<DashboardLayout><ProjectRequests /></DashboardLayout>} />
        <Route path="/admin/portfolio" element={<DashboardLayout><PortfolioManagement /></DashboardLayout>} />
        <Route path="/admin/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />
      </Route>

      {/* Employee Routes */}
      <Route element={<ProtectedRoute allowedRoles={['Developer', 'Designer', 'Project Manager', 'QA Tester', 'Marketing', 'POC', 'Custom Role']} />}>
        <Route path="/employee" element={<DashboardLayout><EmployeeDashboard /></DashboardLayout>} />
        <Route path="/employee/clients" element={<DashboardLayout><EmployeeClients /></DashboardLayout>} />
        <Route path="/employee/submit-project" element={<DashboardLayout><SubmitProject /></DashboardLayout>} />
        <Route path="/employee/my-projects" element={<DashboardLayout><MyProjects /></DashboardLayout>} />
        <Route path="/employee/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />
      </Route>
    </Routes>
    </>
  );
}

export default App;
