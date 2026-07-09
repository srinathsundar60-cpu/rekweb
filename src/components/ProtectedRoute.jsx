import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, employee, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--white)', color: 'var(--black)' }}>
        <p style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem' }}>Loading...</p>
      </div>
    );
  }

  // If not logged in at all, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the route requires specific roles and the user doesn't have it
  if (allowedRoles && employee && !allowedRoles.includes(employee.role)) {
    // Redirect based on role if they try to access unauthorized areas
    if (employee.role === 'Admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/employee" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
