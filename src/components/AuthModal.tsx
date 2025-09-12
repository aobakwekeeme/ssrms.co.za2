import React, { useState } from 'react';
import { X, Eye, EyeOff, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
  defaultRole?: 'customer' | 'shop_owner' | 'government_official';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onModeChange, defaultRole = 'customer' }) => {
  const { signIn, signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: defaultRole,
    name: '',
    phone: '',
    address: '',
    businessName: '',
    department: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const success = await signIn(formData.email, formData.password);
        if (success) {
          onClose();
        } else {
          setError('The email or password you entered is incorrect. Please try again.');
        }
      } else {
        // Enhanced password validation for Supabase requirements
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
          setError(passwordValidation.message);
          return;
        }
        
        // Prepare user data based on role
        const userData = {
          full_name: formData.name,
          role: formData.userType as 'customer' | 'shop_owner' | 'government_official',
          phone_number: formData.phone || undefined,
          address: formData.address || undefined,
          business_name: formData.userType === 'shop_owner' ? formData.businessName : undefined,
          department: formData.userType === 'government_official' ? formData.department : undefined,
          jurisdiction: formData.userType === 'government_official' ? formData.address : undefined,
        };

        const success = await signUp(formData.email, formData.password, userData);
        if (success) {
          setEmailConfirmationSent(true);
        } else {
          setError('We could not create your account. This email might already be registered. Please try a different email or sign in instead.');
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(getErrorMessage(err.message));
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Password validation function
  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return {
        isValid: false,
        message: 'Your password must be at least 8 characters long.'
      };
    }

    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);

    if (!hasLowercase || !hasUppercase || !hasNumbers || !hasSpecialChar) {
      return {
        isValid: false,
        message: 'Your password must include: at least one lowercase letter (a-z), one uppercase letter (A-Z), one number (0-9), and one special character (!@#$%^&* etc.).'
      };
    }

    return { isValid: true, message: '' };
  };

  // Error message converter
  const getErrorMessage = (errorMessage: string): string => {
    if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
      return 'This email is already registered. Please sign in instead or use a different email.';
    }
    
    if (errorMessage.includes('invalid email')) {
      return 'Please enter a valid email address.';
    }
    
    if (errorMessage.includes('weak_password') || errorMessage.includes('Password should contain')) {
      return 'Your password must include: at least one lowercase letter (a-z), one uppercase letter (A-Z), one number (0-9), and one special character (!@#$%^&* etc.).';
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return 'Please check your internet connection and try again.';
    }
    
    return 'Something went wrong. Please try again.';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetModal = () => {
    setFormData({
      email: '',
      password: '',
      userType: defaultRole,
      name: '',
      phone: '',
      address: '',
      businessName: '',
      department: ''
    });
    setError('');
    setShowPassword(false);
    setEmailConfirmationSent(false);
  };

  // Update userType when defaultRole changes
  React.useEffect(() => {
    if (mode === 'signup') {
      setFormData(prev => ({ ...prev, userType: defaultRole }));
    }
  }, [defaultRole, mode]);
  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleModeChange = (newMode: 'signin' | 'signup') => {
    resetModal();
    onModeChange(newMode);
  };

  if (!isOpen) return null;

  // Email confirmation screen
  if (emailConfirmationSent) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirmation Email Sent
              </h3>
              
              <p className="text-gray-600 mb-6">
                We've sent a confirmation link to <strong>{formData.email}</strong>. 
                Please click the link in your email to activate your account.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-blue-900">What happens next?</p>
                    <ul className="text-sm text-blue-800 mt-1 space-y-1">
                      <li>• Check your email inbox and spam folder</li>
                      <li>• Click the confirmation link in the email</li>
                      <li>• Come back here and sign in with your email and password</li>
                      <li>• Start using your account</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center text-white">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <img src="/logo.png" alt="SSRMS Logo" className="w-10 h-10 rounded-lg" />
                <h2 className="text-2xl font-bold">
                  {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h2>
              </div>
              <p className="text-white/90 mt-1">
                {mode === 'signin' 
                  ? 'Sign in to access your dashboard' 
                  : 'Join the Spaza Shop Registry community'
                }
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-2">
                I am a *
              </label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
              >
                <option value="customer">Customer - Find and review spaza shops</option>
                <option value="shop_owner">Shop Owner - Register and manage my spaza shop</option>
                <option value="government_official">Government Official - Monitor and inspect shops</option>
              </select>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
              placeholder="Enter your email address"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                placeholder="Enter your phone number"
              />
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                placeholder="Enter your address"
              />
            </div>
          )}

          {mode === 'signup' && formData.userType === 'shop_owner' && (
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                placeholder="Enter your business name"
              />
            </div>
          )}

          {mode === 'signup' && formData.userType === 'government_official' && (
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                placeholder="Enter your department"
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all pr-12"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {mode === 'signup' && (
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:from-teal-700 hover:to-blue-700 focus:ring-4 focus:ring-teal-200 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
              </div>
            ) : (
              <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => handleModeChange(mode === 'signin' ? 'signup' : 'signin')}
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              {mode === 'signin' 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>

          {mode === 'signup' && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-1">Email Confirmation Required</p>
              <p className="text-sm text-blue-700">After creating your account, we'll send you an email with a confirmation link. Click the link to activate your account, then come back here to sign in.</p>
            </div>
          )}

          {mode === 'signin' && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h3>
              <div className="space-y-2 text-xs text-blue-800">
                <p className="text-blue-700">
                  You can create a new account above, or sign in if you already have an account.
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthModal;