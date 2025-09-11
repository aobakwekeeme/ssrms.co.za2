import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import SignInPage from './components/SignInPage';
import ShopOwnerDashboard from './components/ShopOwnerDashboard';
import GovernmentDashboard from './components/GovernmentDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import ShopProfile from './components/ShopProfile';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import SupportPage from './pages/SupportPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import CompliancePage from './pages/CompliancePage';
import ContactPage from './pages/ContactPage';
import FeedbackPage from './pages/FeedbackPage';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/compliance" element={<CompliancePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {user.role === 'shop-owner' && (
        <>
          <Route path="/dashboard" element={<ShopOwnerDashboard />} />
          <Route path="/shop-profile" element={<ShopProfile />} />
        </>
      )}
      {user.role === 'government' && (
        <>
          <Route path="/dashboard" element={<GovernmentDashboard />} />
        </>
      )}
      {user.role === 'customer' && (
        <>
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/shop-profile" element={<ShopProfile />} />
        </>
      )}
      {/* Make these pages available to all users */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} />
      <Route path="/compliance" element={<CompliancePage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;