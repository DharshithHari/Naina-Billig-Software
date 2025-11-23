'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InventoryItem, BillItem } from '@/lib/localStorage';

export default function InventorySelector() {
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      const result = await response.json();
      if (result.success) {
        setInventory(result.items);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const newSelected = new Map(selectedItems);
    if (quantity > 0) {
      newSelected.set(itemId, quantity);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleGenerateBill = () => {
    if (selectedItems.size === 0) {
      alert('Please select at least one item');
      return;
    }

    // Convert selected items to BillItem format
    const billItems: BillItem[] = Array.from(selectedItems.entries()).map(([itemId, quantity]) => {
      const item = inventory.find(i => i.id === itemId);
      if (!item) throw new Error('Item not found');
      return {
        itemName: item.name,
        quantity,
        price: item.price,
        total: item.price * quantity,
      };
    });

    // Navigate to billing page with selected items
    router.push(`/admin/billing?items=${encodeURIComponent(JSON.stringify(billItems))}`);
  };

  const getTotalItems = () => {
    return Array.from(selectedItems.values()).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalAmount = () => {
    return Array.from(selectedItems.entries()).reduce((sum, [itemId, quantity]) => {
      const item = inventory.find(i => i.id === itemId);
      return sum + (item ? item.price * quantity : 0);
    }, 0);
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading inventory...</div>;
  }

  return (
    <div className="inventory-selector">
      <div className="inventory-header">
        <h2>Select Items</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="inventory-grid">
        {filteredInventory.length === 0 ? (
          <div className="empty-state">No items found</div>
        ) : (
          filteredInventory.map((item) => {
            const quantity = selectedItems.get(item.id) || 0;
            const isSelected = quantity > 0;
            return (
              <div key={item.id} className={`inventory-card ${isSelected ? 'selected' : ''}`}>
                <div className="item-info">
                  <h3>{item.name}</h3>
                  {item.description && <p className="item-description">{item.description}</p>}
                  <p className="item-price">{item.price.toFixed(2)}</p>
                </div>
                <div className="quantity-controls">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.id, Math.max(0, quantity - 1))}
                    className="qty-btn"
                    disabled={quantity === 0}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                    className="qty-input"
                    aria-label={`Quantity for ${item.name}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.id, quantity + 1)}
                    className="qty-btn"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedItems.size > 0 && (
        <div className="selected-summary">
          <div className="summary-info">
            <span>Items Selected: {getTotalItems()}</span>
            <span className="total-amount">Total: ₹{getTotalAmount().toFixed(2)}</span>
          </div>
          <button onClick={handleGenerateBill} className="generate-bill-btn">
            Generate Bill
          </button>
        </div>
      )}

      <style jsx>{`
        .inventory-selector {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .inventory-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .inventory-header h2 {
          color: #333;
          font-size: 1.75rem;
          margin: 0;
          font-weight: 700;
        }

        .search-box {
          flex: 1;
          max-width: 350px;
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1rem;
          padding-left: 2.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-box::before {
          content: '🔍';
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.1rem;
        }

        .inventory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          align-items: stretch;
        }

        .inventory-card {
          background: white;
          border: 2px solid #e8e8e8;
          border-radius: 12px;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          min-height: 220px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .inventory-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transform: scaleX(0);
          transition: transform 0.3s;
        }

        .inventory-card:hover {
          border-color: #667eea;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
          transform: translateY(-4px);
        }

        .inventory-card:hover::before {
          transform: scaleX(1);
        }

        .inventory-card.selected {
          border-color: #667eea;
          background: linear-gradient(to bottom, #f8f9ff 0%, white 20%);
        }

        .inventory-card.selected::before {
          transform: scaleX(1);
        }

        .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .item-info h3 {
          color: #1a1a1a;
          margin: 0;
          font-size: 1.15rem;
          font-weight: 600;
          line-height: 1.4;
          min-height: 2.8rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .item-description {
          color: #666;
          font-size: 0.875rem;
          margin: 0;
          line-height: 1.5;
          min-height: 2.625rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .item-price {
          color: #667eea;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0.5rem 0 0 0;
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }

        .item-price::before {
          content: '₹';
          font-size: 1.1rem;
          font-weight: 600;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid #f0f0f0;
        }

        .qty-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.25rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
        }

        .qty-btn:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
        }

        .qty-btn:active:not(:disabled) {
          transform: scale(0.95);
        }

        .qty-btn:disabled {
          background: #e0e0e0;
          cursor: not-allowed;
          box-shadow: none;
          color: #999;
        }

        .qty-input {
          flex: 1;
          padding: 0.625rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          text-align: center;
          font-size: 1rem;
          font-weight: 600;
          color: #333;
          transition: all 0.2s;
          min-width: 60px;
        }

        .qty-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .qty-input::-webkit-inner-spin-button,
        .qty-input::-webkit-outer-spin-button {
          opacity: 1;
          height: auto;
        }

        .selected-summary {
          position: sticky;
          bottom: 1rem;
          background: white;
          padding: 1.5rem 2rem;
          border-radius: 12px;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1), 0 4px 20px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          border: 2px solid #f0f0f0;
          margin-top: 1rem;
        }

        .summary-info {
          display: flex;
          gap: 2.5rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .summary-info span {
          color: #555;
          font-weight: 500;
          font-size: 1rem;
        }

        .summary-info span:first-child {
          color: #333;
          font-weight: 600;
        }

        .total-amount {
          color: #667eea;
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }

        .total-amount::before {
          content: '₹';
          font-size: 1.2rem;
        }

        .generate-bill-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.875rem 2.5rem;
          font-size: 1.05rem;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          white-space: nowrap;
        }

        .generate-bill-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .generate-bill-btn:active {
          transform: translateY(0);
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: #666;
          font-size: 1.1rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #999;
          grid-column: 1 / -1;
          font-size: 1.1rem;
        }

        @media (max-width: 1024px) {
          .inventory-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 1.25rem;
          }
        }

        @media (max-width: 768px) {
          .inventory-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
          }

          .inventory-card {
            min-height: 200px;
            padding: 1.5rem;
          }

          .inventory-header {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            max-width: 100%;
          }
        }

        @media (max-width: 640px) {
          .inventory-grid {
            grid-template-columns: 1fr;
          }

          .selected-summary {
            flex-direction: column;
            align-items: stretch;
            padding: 1.25rem;
            bottom: 0.5rem;
          }

          .summary-info {
            flex-direction: column;
            gap: 0.75rem;
            align-items: flex-start;
            width: 100%;
          }

          .generate-bill-btn {
            width: 100%;
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

