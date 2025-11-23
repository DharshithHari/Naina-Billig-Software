'use client';

import { Bill } from '@/lib/localStorage';
import { format } from 'date-fns';

interface BillPreviewProps {
  bill: Bill;
}

export default function BillPreview({ bill }: BillPreviewProps) {
  return (
    <div className="bill-preview">
      <div className="bill-header">
        <div className="company-info">
          <h1>NAINA</h1>
          <p className="company-address">Dindigul road, Palani, ITO Opps.</p>
        </div>
        <div className="bill-info">
          <div className="bill-info-row">
            <span className="label">Bill #:</span>
            <span className="value">{bill.billNumber}</span>
          </div>
          <div className="bill-info-row">
            <span className="label">Date:</span>
            <span className="value">{format(new Date(bill.date), 'dd/MM/yyyy')}</span>
          </div>
        </div>
      </div>

      <div className="customer-section">
        <div className="section-title">Bill To:</div>
        <div className="customer-details">
          <div className="customer-name">{bill.customerName}</div>
          {bill.customerAddress && <div className="customer-address">{bill.customerAddress}</div>}
          {bill.customerPhone && <div className="customer-phone">Ph: {bill.customerPhone}</div>}
        </div>
      </div>

      <div className="divider"></div>

      <div className="items-section">
        <div className="items-header">
          <span className="item-col-qty">Qty</span>
          <span className="item-col-name">Item</span>
          <span className="item-col-price">Price</span>
          <span className="item-col-total">Total</span>
        </div>
        {bill.items.map((item, index) => (
          <div key={index} className="item-row">
            <span className="item-col-qty">{item.quantity}</span>
            <span className="item-col-name">{item.itemName}</span>
            <span className="item-col-price">₹{item.price.toFixed(2)}</span>
            <span className="item-col-total">₹{item.total.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="divider"></div>

      <div className="bill-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>₹{bill.subtotal.toFixed(2)}</span>
        </div>
        {bill.tax > 0 && (
          <div className="summary-row">
            <span>Tax:</span>
            <span>₹{bill.tax.toFixed(2)}</span>
          </div>
        )}
        <div className="summary-row total">
          <span>TOTAL:</span>
          <span>₹{bill.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="divider"></div>

      <div className="bill-footer">
        <p>Thank you for your business!</p>
      </div>

      <style jsx>{`
        .bill-preview {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          font-size: 0.85rem;
        }

        /* 58mm Thermal Printer Styles */
        @media print {
          @page {
            size: 58mm auto;
            margin: 0;
          }

          .bill-preview {
            width: 58mm;
            max-width: 58mm;
            padding: 5mm;
            margin: 0;
            border-radius: 0;
            font-size: 10px;
            line-height: 1.3;
          }

          body {
            margin: 0;
            padding: 0;
          }

          .no-print {
            display: none !important;
          }
        }

        .bill-header {
          text-align: center;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px dashed #000;
        }

        .company-info {
          margin-bottom: 0.5rem;
        }

        .company-info h1 {
          font-size: 1.3rem;
          color: #000;
          margin: 0 0 0.2rem 0;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .company-address {
          color: #000;
          font-size: 0.75rem;
          margin: 0;
          line-height: 1.3;
        }

        .bill-info {
          margin-top: 0.5rem;
          font-size: 0.75rem;
        }

        .bill-info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.2rem;
        }

        .bill-info-row .label {
          font-weight: 600;
        }

        .bill-info-row .value {
          font-weight: 400;
        }

        .customer-section {
          margin-bottom: 0.6rem;
        }

        .section-title {
          font-weight: 700;
          font-size: 0.8rem;
          margin-bottom: 0.2rem;
          text-transform: uppercase;
        }

        .customer-details {
          font-size: 0.75rem;
        }

        .customer-name {
          font-weight: 600;
          margin-bottom: 0.1rem;
        }

        .customer-address,
        .customer-phone {
          font-size: 0.7rem;
          margin-bottom: 0.1rem;
        }

        .divider {
          border-top: 1px dashed #000;
          margin: 0.6rem 0;
        }

        .items-section {
          margin-bottom: 0.6rem;
        }

        .items-header {
          display: grid;
          grid-template-columns: 0.8fr 2fr 1.2fr 1.2fr;
          gap: 0.2rem;
          font-weight: 700;
          font-size: 0.75rem;
          padding-bottom: 0.2rem;
          border-bottom: 1px solid #000;
          margin-bottom: 0.4rem;
        }

        .item-row {
          display: grid;
          grid-template-columns: 0.8fr 2fr 1.2fr 1.2fr;
          gap: 0.2rem;
          font-size: 0.75rem;
          margin-bottom: 0.3rem;
          padding-bottom: 0.3rem;
          border-bottom: 1px dotted #ccc;
        }

        .item-col-name {
          word-break: break-word;
          overflow-wrap: break-word;
        }

        .item-col-price,
        .item-col-total {
          text-align: right;
        }

        .bill-summary {
          margin-bottom: 0.6rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          margin-bottom: 0.25rem;
        }

        .summary-row.total {
          font-size: 1.4rem;
          font-weight: 900;
          border-top: 2px solid #000;
          padding-top: 0.4rem;
          margin-top: 0.4rem;
        }

        .summary-row.total span {
          font-weight: 900;
        }

        .bill-footer {
          text-align: center;
          font-size: 0.75rem;
          font-style: italic;
          margin-top: 0.6rem;
        }

        /* Screen view styles */
        @media screen {
          .bill-preview {
            max-width: 58mm;
            margin: 0 auto;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
        }

        @media (max-width: 640px) {
          .bill-preview {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
