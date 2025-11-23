'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/admin');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <main className="container">
      <div className="loading">Redirecting...</div>

      <style jsx>{`
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          min-height: 100vh;
        }

        .header {
          color: white;
          margin-bottom: 2.5rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .header-content > div {
          text-align: center;
          flex: 1;
        }

        .header h1 {
          font-size: 2.75rem;
          margin-bottom: 0.75rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
          font-weight: 700;
        }

        .header p {
          font-size: 1.15rem;
          opacity: 0.95;
          font-weight: 400;
        }

        .logout-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 0.625rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s;
          backdrop-filter: blur(10px);
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: white;
          font-size: 1.2rem;
        }

        .content {
          background: white;
          padding: 2.5rem;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .container {
            padding: 1.5rem 1rem;
          }

          .header h1 {
            font-size: 2rem;
          }

          .header p {
            font-size: 1rem;
          }

          .content {
            padding: 1.5rem;
            border-radius: 12px;
          }
        }
      `}</style>
    </main>
  );
}
