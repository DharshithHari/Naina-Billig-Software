'use client';

import { Suspense } from 'react';
import BillingContent from './BillingContent';

export default function AdminBillingPage() {
  return (
    <Suspense fallback={
      <div className="loading-container">
        <div className="loading">Loading...</div>
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}

