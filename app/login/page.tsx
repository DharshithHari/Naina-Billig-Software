'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if already authenticated
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const result = await response.json();
      if (result.authenticated) {
        router.push('/');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(result.error || 'Invalid password');
      }
    } catch (error: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="login-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Billing Software</h1>
          <p>Please enter your password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="login-button"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .login-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 3rem;
          width: 100%;
          max-width: 420px;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .login-header h1 {
          color: #333;
          font-size: 2rem;
          margin: 0 0 0.5rem 0;
          font-weight: 700;
        }

        .login-header p {
          color: #666;
          font-size: 0.95rem;
          margin: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          color: #333;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .form-group input {
          padding: 0.875rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
          width: 100%;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 0.875rem 1rem;
          border-radius: 8px;
          border: 1px solid #fcc;
          font-size: 0.9rem;
          text-align: center;
        }

        .login-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.875rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.5rem;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading-spinner {
          color: white;
          font-size: 1.2rem;
          text-align: center;
        }

        @media (max-width: 640px) {
          .login-card {
            padding: 2rem 1.5rem;
          }

          .login-header h1 {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
}

