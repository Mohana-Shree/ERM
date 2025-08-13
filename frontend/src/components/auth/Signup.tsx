import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUpWithEmail } from '../../services/auth';
import { FormInput } from '../ui/FormInput';

export function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    console.log('Starting signup process...');

    try {
      console.log('Calling signUpWithEmail...');
      const result = await signUpWithEmail({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });
      
      console.log('Signup result:', result);
      
      // Always redirect to login page after successful signup
      console.log('Account created successfully, redirecting to login page');
      
      // Use window.location for guaranteed redirect
      navigate('/login', {
        state: {
          message: 'Account created successfully! Please sign in with your new credentials.',
          email: formData.email
        }
      });
      
    } catch (err: any) {
      console.error('Signup error details:', err);
      console.error('Error message:', err.message);
      console.error('Error code:', err.code);
      console.error('Error status:', err.status);
      
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.error_description) {
        errorMessage = err.error_description;
      } else if (err.code) {
        switch (err.code) {
          case 'INVALID_EMAIL':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'WEAK_PASSWORD':
            errorMessage = 'Password is too weak. Please use a stronger password.';
            break;
          case 'EMAIL_TAKEN':
            errorMessage = 'An account with this email already exists.';
            break;
          default:
            errorMessage = `Error: ${err.code}`;
        }
      }
      
      setError(errorMessage);
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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          
          <div className="space-y-4">
            <FormInput
              label="Full name"
              name="name"
              type="text"
              value={formData.name}
              onChange={(value) => handleInputChange('name', value)}
              placeholder="Enter your full name"
              required
            />
            
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
              placeholder="Create a password"
              required
            />
            
            <FormInput
              label="Confirm password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(value) => handleInputChange('confirmPassword', value)}
              placeholder="Confirm your password"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
          
          {/* Additional login link at bottom */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
