import React, { useState, useEffect } from 'react';
import { Shield, LogIn, AlertCircle, ExternalLink } from 'lucide-react';
import firebaseService from '../services/firebaseService';

interface AdminAuthProps {
  onAuthSuccess: () => void;
}

const AdminAuth: React.FC<AdminAuthProps> = ({ onAuthSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [configError, setConfigError] = useState('');

  // Check for admin emails configuration
  const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(email => email.trim()).filter(Boolean);

  // Check Firebase configuration on mount
  useEffect(() => {
    // Handle redirect result first
    const handleRedirectResult = async () => {
      try {
        const user = await firebaseService.handleRedirectSignInResult();
        if (user) {
          // Check if user email is in the admin list
          if (!ADMIN_EMAILS.includes(user.email)) {
            setError(`Access denied. Your email (${user.email}) is not authorized for admin access.`);
            await firebaseService.signOut();
            return;
          }

          // Store user info for the session
          sessionStorage.setItem('adminAuth', JSON.stringify({
            id: user.uid,
            name: user.displayName,
            email: user.email,
            picture: user.photoURL
          }));

          onAuthSuccess();
          return;
        }
      } catch (error) {
        console.error('Redirect sign-in error:', error);
        if (error instanceof Error) {
          setError(`Sign in failed: ${error.message}`);
        } else {
          setError('Sign in failed. Please try again.');
        }
      }
    };

    const checkFirebaseConfig = async () => {
      try {
        const isConnected = await firebaseService.testConnection();
        if (!isConnected) {
          setConfigError('Firebase connection failed. Please check Firebase configuration.');
        }
      } catch (error) {
        console.error('Firebase config check failed:', error);
        setConfigError('Firebase is not properly configured. Please check the setup instructions.');
      }
    };

    handleRedirectResult();
    checkFirebaseConfig();
  }, []);

  // Debug environment variables (only in development)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Environment check:', {
        adminEmailsCount: ADMIN_EMAILS.length,
        mode: import.meta.env.MODE,
      });
    }
  }, [ADMIN_EMAILS]);

  const handleSignIn = async () => {
    if (ADMIN_EMAILS.length === 0) {
      setError('Admin emails not configured. Please contact the system administrator.');
      return;
    }

    if (configError) {
      setError('Firebase is not properly configured. Please check the setup instructions below.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const user = await firebaseService.signInWithGoogle();
      
      // If user is null, it means we're using redirect method
      if (user === null) {
        setIsLoading(true);
        // The redirect is happening, keep loading state
        return;
      }
      
      // Check if user email is in the admin list
      if (!ADMIN_EMAILS.includes(user.email)) {
        setError(`Access denied. Your email (${user.email}) is not authorized for admin access.`);
        await firebaseService.signOut();
        setIsLoading(false);
        return;
      }

      // Store user info for the session
      sessionStorage.setItem('adminAuth', JSON.stringify({
        id: user.uid,
        name: user.displayName,
        email: user.email,
        picture: user.photoURL
      }));

      onAuthSuccess();
      
    } catch (error) {
      console.error('Sign in error:', error);
      if (error instanceof Error) {
        if (error.message.includes('auth/api-key-not-valid')) {
          setError('Firebase API key is not valid. Please check Firebase configuration.');
        } else if (error.message.includes('auth/unauthorized-domain')) {
          setError('Domain not authorized. Please add localhost:5173 to Firebase authorized domains in Authentication → Settings → Authorized domains.');
        } else if (error.message.includes('popup-closed-by-user') || error.message.includes('auth/popup-blocked')) {
          setError('Popup was blocked or closed. Redirecting to sign in page...');
        } else {
          setError(`Sign in failed: ${error.message}`);
        }
      } else {
        setError('Sign in failed. Please try again.');
      }
      setIsLoading(false);
    }
  };

  if (ADMIN_EMAILS.length === 0) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-dark-secondary rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Configuration Error</h1>
              <p className="text-gray-400">Admin emails are not configured</p>
            </div>
            <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <div>
                  <p className="text-red-400 font-medium">Missing Configuration</p>
                  <div className="text-red-300 text-sm mt-1">
                    <p>Environment variable needed:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><code>VITE_ADMIN_EMAILS</code> - Comma-separated admin emails</li>
                    </ul>
                    <p className="mt-2">
                      <strong>For Netlify:</strong> Set this in your site's Environment Variables section.
                    </p>
                    <p className="mt-1">
                      <strong>For local development:</strong> Add it to your .env file.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-dark-secondary rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-gray-400">Sign in with your authorized Google account</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-600/10 border border-red-600/20 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">Authentication Error</p>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {configError && (
            <div className="mb-6 bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-yellow-400 font-medium">Configuration Issue</p>
                  <p className="text-yellow-300 text-sm mt-1">{configError}</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleSignIn}
            disabled={isLoading || !!configError}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          <div className="mt-6 p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
            <h3 className="text-blue-400 font-medium mb-2">Admin Access Requirements</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Must use an authorized Google account</li>
              <li>• Contact system administrator to add your email</li>
              <li>• Access is logged and monitored</li>
            </ul>
          </div>

          {/* Firebase Setup Instructions */}
          <div className="mt-6 p-4 bg-yellow-600/10 border border-yellow-600/20 rounded-lg">
            <h3 className="text-yellow-400 font-medium mb-2 flex items-center">
              <ExternalLink className="h-4 w-4 mr-2" />
              Firebase Setup Required
            </h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>To enable admin authentication, you need to:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Firebase Console</a></li>
                <li>Select your <code className="bg-yellow-600/20 px-1 rounded">videocalc-b1b43</code> project</li>
                <li>Go to Project Settings → General → Your apps</li>
                <li>Copy the config values and update <code className="bg-yellow-600/20 px-1 rounded">src/config/firebase.ts</code></li>
                <li>Enable Authentication → Sign-in method → Google</li>
                <li>Add your domain to authorized domains</li>
              </ol>
            </div>
          </div>

          {import.meta.env.DEV && (
            <div className="mt-4 p-3 bg-gray-600/10 border border-gray-600/20 rounded-lg">
              <p className="text-gray-400 text-xs">
                <strong>Development Mode:</strong> Environment variables are loaded from .env file
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;