import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthModal from './AuthModal';

export default function SignInPage() {
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <Link to="/" className="flex items-center justify-center space-x-2 text-3xl font-bold text-gray-900 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="SSRMS Logo" className="w-12 h-12 rounded-lg" />
          <span>SSRMS</span>
        </Link>
        <p className="mt-4 text-gray-600">Redirecting to sign in...</p>
      </div>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  );
}