import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmail } from '../../services/auth';
import { FormInput } from '../ui/FormInput';
import { useAuth } from '../../contexts/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: location.state?.email || new URLSearchParams(window.location.search).get('email') || '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Display success message from signup if available (from URL params or state)
  const successMessage = location.state?.message || new URLSearchParams(window.location.search).get('message');

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      redirectBasedOnRole(user);
    }
  }, [user, navigate]);

  const redirectBasedOnRole = (user: any) => {
    console.log('Redirecting user based on role:', user.role);
    
    // Determine redirect path based on user role
    if (user.role === 'admin') {
      console.log('User is admin, redirecting to /admin');
      navigate('/admin');
    } else if (user.role === 'user' || !user.role) {
      console.log('User is regular user, redirecting to /dashboard');
      // Default to user dashboard for regular users or if role is undefined
      navigate('/dashboard');
    } else {
      console.log('Unknown role, fallback to dashboard');
      // Fallback to dashboard
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user } = await signInWithEmail(formData);
      if (user) {
        // Navigation will be handled by the useEffect above when user context updates
        // Or handle it immediately if the auth context doesn't update automatically
        // Note: The user object from signInWithEmail might not have the full profile data
        // The useEffect will handle the redirect once the AuthContext updates
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Success message from signup */}
          {successMessage && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{successMessage}</div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          
          <div className="space-y-4">
            <FormInput
              label="Email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              required
            />
            
            <FormInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}