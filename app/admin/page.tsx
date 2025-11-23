'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import InventoryManagement from '@/components/InventoryManagement';
import BillingSection from '@/components/BillingSection';
import SalesReport from '@/components/SalesReport';

type TabType = 'inventory' | 'billing' | 'sales';

export default function AdminPage() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('billing');

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-content">
          <h1>Billing Software - Admin Dashboard</h1>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="admin-nav">
        <button
          className={`nav-btn ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          💰 Billing
        </button>
        <button
          className={`nav-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          📦 Inventory
        </button>
        <button
          className={`nav-btn ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          📊 Sales Report
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'billing' && <BillingSection />}
        {activeTab === 'inventory' && <InventoryManagement />}
        {activeTab === 'sales' && <SalesReport />}
      </div>

      <style jsx>{`
        .admin-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem 1.5rem;
        }

        .admin-header {
          margin-bottom: 2rem;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .admin-header h1 {
          color: white;
          font-size: 2rem;
          margin: 0;
          font-weight: 700;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
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

        .admin-nav {
          max-width: 1400px;
          margin: 0 auto 2rem;
          display: flex;
          gap: 1rem;
          background: white;
          padding: 0.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .nav-btn {
          flex: 1;
          padding: 1rem 1.5rem;
          border: none;
          background: transparent;
          color: #666;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .nav-btn:hover {
          background: #f5f5f5;
          color: #333;
        }

        .nav-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .admin-content {
          max-width: 1400px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .admin-container {
            padding: 1rem;
          }

          .admin-header h1 {
            font-size: 1.5rem;
          }

          .admin-nav {
            flex-direction: column;
          }

          .nav-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

