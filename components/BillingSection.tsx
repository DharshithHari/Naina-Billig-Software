'use client';

import InventorySelector from './InventorySelector';

export default function BillingSection() {
  return (
    <div className="billing-section">
      <div className="section-header">
        <h2>Create New Bill</h2>
        <p>Select items from inventory and generate a bill</p>
      </div>
      <div className="section-content">
        <InventorySelector />
      </div>
      <style jsx>{`
        .billing-section {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          margin-bottom: 1.5rem;
        }

        .section-header h2 {
          color: #333;
          font-size: 1.5rem;
          margin: 0 0 0.5rem 0;
        }

        .section-header p {
          color: #666;
          margin: 0;
        }

        .section-content {
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
}

