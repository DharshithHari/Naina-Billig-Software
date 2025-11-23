'use client';

import { useState, useEffect } from 'react';
import { BillItem } from '@/lib/localStorage';

interface BillFormProps {
  onSubmit: (data: {
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    items: BillItem[];
    taxRate: number;
  }) => void;
  isSubmitting: boolean;
  preSelectedItems?: BillItem[];
}

export default function BillForm({ onSubmit, isSubmitting, preSelectedItems }: BillFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [items, setItems] = useState<BillItem[]>(
    preSelectedItems || [{ itemName: '', quantity: 1, price: 0, total: 0 }]
  );

  useEffect(() => {
    if (preSelectedItems && preSelectedItems.length > 0) {
      setItems(preSelectedItems);
    }
  }, [preSelectedItems]);

  const updateItem = (index: number, field: keyof BillItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'price') {
      newItems[index].total = newItems[index].quantity * newItems[index].price;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { itemName: '', quantity: 1, price: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty items (only if not using pre-selected items)
    const validItems = preSelectedItems 
      ? items 
      : items.filter(item => item.itemName.trim() !== '');
    
    if (validItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    onSubmit({
      customerName,
      customerAddress,
      customerPhone,
      items: validItems,
      taxRate,
    });
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerAddress('');
    setCustomerPhone('');
    setTaxRate(0);
    setItems([{ itemName: '', quantity: 1, price: 0, total: 0 }]);
  };

  return (
    <form onSubmit={handleSubmit} className="bill-form">
      <h2>Bill Details</h2>

      <div className="form-group">
        <label htmlFor="customerName">Customer Name *</label>
        <input
          type="text"
          id="customerName"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
          placeholder="Enter customer name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="customerAddress">Customer Address</label>
        <textarea
          id="customerAddress"
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          placeholder="Enter customer address"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="customerPhone">Customer Phone</label>
        <input
          type="tel"
          id="customerPhone"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="Enter customer phone"
        />
      </div>

      <div className="form-group">
        <label htmlFor="taxRate">Tax Rate (%)</label>
        <input
          type="number"
          id="taxRate"
          value={taxRate}
          onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
          min="0"
          max="100"
          step="0.01"
          placeholder="0"
        />
      </div>

      <div className="items-section">
        <div className="items-header">
          <h3>Selected Items</h3>
          {!preSelectedItems && (
            <button type="button" onClick={addItem} className="add-item-btn">
              + Add Item
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="no-items">No items selected</div>
        ) : (
          items.map((item, index) => (
            <div key={index} className="item-row">
              <input
                type="text"
                placeholder="Item name"
                value={item.itemName}
                onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                className="item-name"
                disabled={!!preSelectedItems}
              />
              <input
                type="number"
                placeholder="Qty"
                value={item.quantity || ''}
                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                min="1"
                className="item-qty"
                disabled={!!preSelectedItems}
              />
              <input
                type="number"
                placeholder="Price"
                value={item.price || ''}
                onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="item-price"
                disabled={!!preSelectedItems}
              />
              <div className="item-total">₹{item.total.toFixed(2)}</div>
              {!preSelectedItems && items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="remove-item-btn"
                >
                  ×
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="form-actions">
        <button type="button" onClick={resetForm} className="reset-btn">
          Reset
        </button>
        <button type="submit" disabled={isSubmitting} className="submit-btn">
          {isSubmitting ? 'Generating...' : 'Generate Bill'}
        </button>
      </div>

      <style jsx>{`
        .bill-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .bill-form h2 {
          color: #333;
          margin-bottom: 0.5rem;
          font-size: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 600;
          color: #555;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group textarea {
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .items-section {
          border-top: 2px solid #e0e0e0;
          padding-top: 1.5rem;
        }

        .items-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .items-header h3 {
          color: #333;
          font-size: 1.2rem;
        }

        .add-item-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }

        .add-item-btn:hover {
          background: #5568d3;
        }

        .item-row {
          display: grid;
          grid-template-columns: 2fr 80px 120px 100px auto;
          gap: 0.5rem;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .item-name {
          padding: 0.5rem;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
        }

        .item-name:disabled,
        .item-qty:disabled,
        .item-price:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .item-qty,
        .item-price {
          padding: 0.5rem;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          text-align: right;
        }

        .no-items {
          text-align: center;
          padding: 2rem;
          color: #999;
        }

        .item-total {
          font-weight: 600;
          color: #333;
          text-align: right;
        }

        .remove-item-btn {
          background: #ff4444;
          color: white;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .remove-item-btn:hover {
          background: #cc0000;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }

        .reset-btn,
        .submit-btn {
          padding: 0.75rem 2rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-btn {
          background: #e0e0e0;
          color: #333;
        }

        .reset-btn:hover {
          background: #d0d0d0;
        }

        .submit-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .item-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .item-total {
            text-align: left;
          }
        }
      `}</style>
    </form>
  );
}

