'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useAuth } from '@/components/AuthProvider';
import BillForm from '@/components/BillForm';
import BillPreview from '@/components/BillPreview';
import { Bill, BillItem } from '@/lib/localStorage';

export default function BillingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [bill, setBill] = useState<Bill | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedItems, setSelectedItems] = useState<BillItem[]>([]);

  useEffect(() => {
    const itemsParam = searchParams.get('items');
    if (itemsParam) {
      try {
        const items = JSON.parse(decodeURIComponent(itemsParam)) as BillItem[];
        setSelectedItems(items);
      } catch (error) {
        console.error('Error parsing items:', error);
        setMessage({ type: 'error', text: 'Invalid items data. Please go back and select items again.' });
      }
    } else {
      setMessage({ type: 'error', text: 'No items selected. Please go back and select items.' });
    }
  }, [searchParams]);

  const generateBillNumber = () => {
    return `BILL-${Date.now()}`;
  };

  const handleGenerateBill = async (formData: {
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    items: BillItem[];
    taxRate: number;
  }) => {
    setIsGenerating(true);
    setMessage(null);

    try {
      const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
      const tax = (subtotal * formData.taxRate) / 100;
      const total = subtotal + tax;

      const newBill: Bill = {
        billNumber: generateBillNumber(),
        date: format(new Date(), 'yyyy-MM-dd'),
        customerName: formData.customerName,
        customerAddress: formData.customerAddress,
        customerPhone: formData.customerPhone,
        items: formData.items,
        subtotal,
        tax,
        total,
      };

      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBill),
      });

      const result = await response.json();

      if (result.success) {
        setBill(newBill);
        setMessage({ type: 'success', text: 'Bill generated and saved successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to generate bill' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' });
    } finally {
      setIsGenerating(false);
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

  if (selectedItems.length === 0 && !message) {
    return (
      <div className="loading-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="billing-page">
      <div className="page-header">
        <button onClick={handleBack} className="back-btn no-print">
          ← Back to Dashboard
        </button>
        <h1>Generate Bill</h1>
      </div>

      {message && (
        <div className={`message message-${message.type} no-print`}>
          {message.text}
        </div>
      )}

      <div className="billing-content">
        <div className="form-section no-print">
          <BillForm
            onSubmit={handleGenerateBill}
            isSubmitting={isGenerating}
            preSelectedItems={selectedItems}
          />
        </div>

        {bill && (
          <div className="preview-section">
            <div className="preview-actions no-print">
              <button onClick={handlePrint} className="print-button">
                Print Bill
              </button>
            </div>
            <BillPreview bill={bill} />
          </div>
        )}
      </div>

      <style jsx>{`
        .billing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem 1.5rem;
        }

        .page-header {
          max-width: 1400px;
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

        .message {
          max-width: 1400px;
          margin: 0 auto 1.5rem;
          padding: 1rem;
          border-radius: 8px;
          font-weight: 500;
        }

        .message-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .billing-content {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        @media (max-width: 968px) {
          .billing-content {
            grid-template-columns: 1fr;
          }
        }

        .form-section {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .preview-section {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .preview-actions {
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

        .loading-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .loading {
          color: white;
          font-size: 1.2rem;
        }

        @media print {
          .billing-page {
            background: white;
            padding: 0;
          }

          .page-header {
            display: none;
          }

          .form-section {
            display: none;
          }

          .preview-section {
            box-shadow: none;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}

