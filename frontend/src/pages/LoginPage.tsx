import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [abhaId, setAbhaId] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(abhaId, phone);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to NAMASTE</h1>
          <p className="text-gray-600">Sign in to access your medical code translation platform</p>
        </div>

        {/* Login Form */}
        <div className="card animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="abhaId" className="block text-sm font-medium text-gray-700 mb-2">
                ABHA ID
              </label>
              <input
                id="abhaId"
                type="text"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value)}
                className="input-field"
                placeholder="Enter your ABHA ID"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder="Enter your phone number"
                required
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg animate-slide-up">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>ABHA ID:</strong> ABHA001 | <strong>Phone:</strong> 9876543210</p>
            <p><strong>ABHA ID:</strong> ABHA002 | <strong>Phone:</strong> 9876543211</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

export default LoginPage