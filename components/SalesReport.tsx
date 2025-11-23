'use client';

import { useState, useEffect } from 'react';
import { Bill } from '@/lib/localStorage';
import { format } from 'date-fns';
import BillPreview from './BillPreview';

export default function SalesReport() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await fetch('/api/bills');
      const result = await response.json();
      if (result.success) {
        setBills(result.bills.reverse()); // Most recent first
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalSales = () => {
    return bills.reduce((sum, bill) => sum + bill.total, 0);
  };

  const getTotalBills = () => {
    return bills.length;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="sales-report">
        <div className="loading">Loading sales report...</div>
      </div>
    );
  }

  return (
    <div className="sales-report">
      <div className="section-header">
        <h2>Sales Report</h2>
        <div className="stats">
          <div className="stat-card">
            <div className="stat-label">Total Bills</div>
            <div className="stat-value">{getTotalBills()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Sales</div>
            <div className="stat-value">₹{getTotalSales().toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="bills-list">
        {bills.length === 0 ? (
          <div className="empty-state">No bills found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Bill Number</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.billNumber}>
                  <td>{bill.billNumber}</td>
                  <td>{format(new Date(bill.date), 'dd MMM yyyy')}</td>
                  <td>{bill.customerName}</td>
                  <td>{bill.items.length} item(s)</td>
                  <td>₹{bill.total.toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => setSelectedBill(bill)}
                      className="view-btn"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedBill && (
        <div className="bill-modal">
          <div className="bill-modal-content">
            <div className="bill-modal-header">
              <h3>Bill Details</h3>
              <div>
                <button onClick={handlePrint} className="print-btn">
                  Print
                </button>
                <button onClick={() => setSelectedBill(null)} className="close-btn">
                  ×
                </button>
              </div>
            </div>
            <div className="bill-preview-container">
              <BillPreview bill={selectedBill} />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .sales-report {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          margin-bottom: 2rem;
        }

        .section-header h2 {
          color: #333;
          font-size: 1.5rem;
          margin: 0 0 1.5rem 0;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.9;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
        }

        .bills-list {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: #f5f5f5;
        }

        th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #e0e0e0;
        }

        td {
          padding: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .view-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }

        .view-btn:hover {
          background: #5568d3;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #999;
        }

        .bill-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .bill-modal-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .bill-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .bill-modal-header h3 {
          margin: 0;
          color: #333;
        }

        .bill-modal-header > div {
          display: flex;
          gap: 0.5rem;
        }

        .print-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }

        .close-btn {
          background: #e0e0e0;
          color: #333;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1.5rem;
          line-height: 1;
        }

        .bill-preview-container {
          max-height: 60vh;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .sales-report {
            padding: 1.5rem;
          }

          table {
            font-size: 0.9rem;
          }

          th,
          td {
            padding: 0.75rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}

