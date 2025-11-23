'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import BillPreview from '@/components/BillPreview';
import { Bill } from '@/lib/localStorage';

export default function BillViewContent() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const billNumber = params?.billNumber ? decodeURIComponent(params.billNumber as string) : '';

  useEffect(() => {
    if (billNumber) {
      fetchBill();
    }
  }, [billNumber]);

  const fetchBill = async () => {
    try {
      const response = await fetch('/api/bills');
      const result = await response.json();
      if (result.success) {
        const foundBill = result.bills.find((b: Bill) => b.billNumber === billNumber);
        if (foundBill) {
          setBill(foundBill);
        } else {
          setError('Bill not found');
        }
      } else {
        setError('Failed to load bill');
      }
    } catch (error) {
      console.error('Error fetching bill:', error);
      setError('An error occurred while loading the bill');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    router.push('/admin');
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!billNumber) {
    return (
      <div className="bill-view-page">
        <div className="error-container">
          <div className="error-message">Invalid bill number</div>
          <button onClick={handleBack} className="back-btn">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bill-view-page">
        <div className="loading-container">
          <div className="loading">Loading bill...</div>
        </div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="bill-view-page">
        <div className="error-container">
          <div className="error-message">{error || 'Bill not found'}</div>
          <button onClick={handleBack} className="back-btn">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bill-view-page">
      <div className="page-header">
        <button onClick={handleBack} className="back-btn no-print">
          ← Back to Dashboard
        </button>
        <h1>Bill Generated Successfully</h1>
      </div>

      <div className="bill-container">
        <div className="bill-actions no-print">
          <button onClick={handlePrint} className="print-button">
            Print Bill
          </button>
        </div>
        <BillPreview bill={bill} />
      </div>

      <style jsx>{`
        .bill-view-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem 1.5rem;
        }

        .loading-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading {
          color: white;
          font-size: 1.2rem;
        }

        .error-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
        }

        .error-message {
          color: #721c24;
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
        }

        .page-header {
          max-width: 1000px;
          margin: 0 auto 1.5rem;
        }

        .back-btn {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 1rem;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: #667eea;
          color: white;
        }

        .page-header h1 {
          color: white;
          font-size: 2rem;
          margin: 0;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .bill-container {
          max-width: 1000px;
          margin: 0 auto;
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .bill-actions {
          margin-bottom: 1.5rem;
          text-align: right;
        }

        .print-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          font-size: 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .print-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        @media print {
          .bill-view-page {
            background: white;
            padding: 0;
          }

          .page-header {
            display: none;
          }

          .bill-container {
            box-shadow: none;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}

