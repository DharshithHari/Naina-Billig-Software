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
    // Get items from URL params
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

      // Save to local storage
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
    router.push('/');
  };

  if (isLoading) {
    return (
      <main className="container">
        <div className="loading">Loading...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (selectedItems.length === 0 && !message) {
    return (
      <main className="container">
        <div className="loading">Loading...</div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="header">
        <div className="header-content">
          <div>
            <h1>Generate Bill</h1>
            <p>Enter customer details and generate your bill</p>
          </div>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="back-button no-print">
        <button onClick={handleBack} className="back-btn">
          ← Back to Inventory
        </button>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="content">
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
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .header {
          color: white;
          margin-bottom: 1rem;
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
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .header p {
          font-size: 1.1rem;
          opacity: 0.9;
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

        .back-button {
          margin-bottom: 1rem;
        }

        .back-btn {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: #667eea;
          color: white;
        }

        .message {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .message-success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message-error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        @media (max-width: 968px) {
          .content {
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

        .print-button:active {
          transform: translateY(0);
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: white;
          font-size: 1.2rem;
        }

        @media print {
          .container {
            padding: 0;
          }

          .header {
            display: none;
          }

          .back-button {
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
    </main>
  );
}

