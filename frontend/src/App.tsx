import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ModelModeProvider } from './contexts/ModelModeContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import VerificationPending from './pages/VerificationPending';
import Dashboard from './pages/Dashboard';
import UpdateData from './pages/UpdateData';
import ReviewRecords from './pages/ReviewRecords';
import EditRecord from './pages/EditRecord';
import RecordResult from './pages/RecordResult';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verification-pending" element={<VerificationPending />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/update-data" element={<UpdateData />} />
        <Route path="/review-records" element={<ReviewRecords />} />
        <Route path="/edit-record/:id" element={<EditRecord />} />
        <Route path="/record-result/:id" element={<RecordResult />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <ModelModeProvider>
            <div className="min-h-screen bg-gray-50">
              <AppRoutes />
            </div>
          </ModelModeProvider>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;