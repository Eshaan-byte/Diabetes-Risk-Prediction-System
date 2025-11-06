import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';
import { getApiBase } from '../config';

const API_BASE = getApiBase();

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/verify-email?token=${verificationToken}`);
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        setEmail(data.email);

        // Redirect to login after 10 seconds
        setTimeout(() => {
          navigate('/login');
        }, 10000);
      } else {
        setStatus('error');
        setMessage(data.detail || 'Verification failed. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center relative">
                <div className="w-8 h-2 bg-red-500 absolute"></div>
                <div className="w-2 h-8 bg-red-500 absolute"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">DiabetesPredict</h1>
          <p className="text-gray-600">Email Verification</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'loading' && (
              <div className="space-y-4">
                <Loader className="h-16 w-16 text-blue-600 animate-spin mx-auto" />
                <h2 className="text-xl font-semibold text-gray-900">Verifying Your Email</h2>
                <p className="text-gray-600">Please wait while we verify your email address...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                <h2 className="text-xl font-semibold text-gray-900">Email Verified!</h2>
                <p className="text-gray-600">{message}</p>
                {email && (
                  <p className="text-sm text-gray-500">
                    Verified email: <span className="font-medium">{email}</span>
                  </p>
                )}
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-4">
                  <p className="text-green-800 text-sm">
                    Redirecting to login page in 10 seconds...
                  </p>
                </div>
                <Link
                  to="/login"
                  className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Go to Login Now
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <XCircle className="h-16 w-16 text-red-600 mx-auto" />
                <h2 className="text-xl font-semibold text-gray-900">Verification Failed</h2>
                <p className="text-gray-600">{message}</p>

                <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
                  <p className="text-red-800 text-sm mb-2">
                    Your verification link may have expired or is invalid.
                  </p>
                  <p className="text-red-700 text-sm">
                    Please request a new verification email from the login page.
                  </p>
                </div>

                <Link
                  to="/login"
                  className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Go to Login
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-8 text-xs text-gray-500">
          © 2025 DiabetesPredict. Educational and informational use only.
          <br />
          Not intended as a substitute for professional medical advice.
        </div>
      </div>
    </div>
  );
}
