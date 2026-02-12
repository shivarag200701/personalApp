import { useState } from 'react';
import api from '../utils/api';

interface GoogleSignInButtonProps {
  className?: string;
}

export function GoogleSignInButton({ className = '' }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const response = await api.get('/v1/oauth/google/connect');
      // Redirect to Google OAuth
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Failed to initiate Google sign-in:', error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={`flex cursor-pointer items-center justify-center gap-3 w-full px-4 py-3 bg-white backdrop-blur-sm text-gray-900 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md ease-in-out shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium ${className}`}
      type="button"
    >
      <img src="/google-icon.svg" alt="Google" width={20} height={20} />
      <span >{loading ? 'Connecting...' : 'Sign in with Google'}</span>
    </button>
  );
}

