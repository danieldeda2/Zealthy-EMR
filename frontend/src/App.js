import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import AdminLayout from './components/layout/AdminLayout';
import PortalLayout from './components/layout/PortalLayout';

import LoginPage from './pages/portal/LoginPage';
import PatientDashboard from './pages/portal/PatientDashboard';
import PatientAppointments from './pages/portal/PatientAppointments';
import PatientPrescriptions from './pages/portal/PatientPrescriptions';

import PatientList from './pages/admin/PatientList';
import PatientDetail from './pages/admin/PatientDetail';
import PatientForm from './pages/admin/PatientForm';

import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="app-loading"><div className="spinner spinner-md" /></div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function AuthRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="app-loading"><div className="spinner spinner-md" /></div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontFamily: '"DM Sans", sans-serif',
            },
            success: { iconTheme: { primary: '#17b37a', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />

        <Routes>
          <Route path="/" element={<AuthRoute><LoginPage /></AuthRoute>} />

          <Route element={<ProtectedRoute><PortalLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<PatientDashboard />} />
            <Route path="/appointments" element={<PatientAppointments />} />
            <Route path="/prescriptions" element={<PatientPrescriptions />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<PatientList />} />
            <Route path="patients/new" element={<PatientForm />} />
            <Route path="patients/:id" element={<PatientDetail />} />
            <Route path="patients/:id/edit" element={<PatientForm />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}