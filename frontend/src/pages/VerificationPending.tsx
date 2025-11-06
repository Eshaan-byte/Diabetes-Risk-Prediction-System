import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { getApiBase } from '../config';

const API_BASE = getApiBase();

export default function VerificationPending() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  const handleResendEmail = async () => {
    if (!email) {
      setResendError('Email address not found. Please sign up again.');
      return;
    }

    setIsResending(true);
    setResendMessage('');
    setResendError('');

    try {
      const response = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage(data.message || 'Verification email sent successfully!');
      } else {
        setResendError(data.detail || 'Failed to resend verification email.');
      }
    } catch (error) {
      setResendError('Network error. Please check your connection and try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Redirect to signup if no email is provided
  if (!email) {
    setTimeout(() => navigate('/signup'), 0);
    return null;
  }

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
          <p className="text-gray-600">Email Verification Required</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg sm:px-10">
          <div className="text-center space-y-4">
            <Mail className="h-16 w-16 text-blue-600 mx-auto" />

            <h2 className="text-xl font-semibold text-gray-900">
              Check Your Email
            </h2>

            <p className="text-gray-600">
              We've sent a verification link to:
            </p>

            <p className="text-lg font-medium text-blue-600 break-all">
              {email}
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-left text-sm text-blue-800 space-y-2">
                  <p className="font-medium">Next steps:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Check your email inbox</li>
                    <li>Click the verification link in the email</li>
                    <li>Return here to log in</li>
                  </ol>
                </div>
              </div>
            </div>

            {resendMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                {resendMessage}
              </div>
            )}

            {resendError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {resendError}
              </div>
            )}

            <div className="pt-4 space-y-3">
              <p className="text-sm text-gray-600">
                Didn't receive the email?
              </p>

              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="inline-flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                <span>{isResending ? 'Sending...' : 'Resend Verification Email'}</span>
              </button>

              <div className="text-sm text-gray-500 space-y-1">
                <p>Check your spam folder if you don't see the email.</p>
                <p>The verification link will expire in 24 hours.</p>
              </div>
            </div>

            <div className="pt-6 border-t">
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Back to Login
              </Link>
            </div>
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
