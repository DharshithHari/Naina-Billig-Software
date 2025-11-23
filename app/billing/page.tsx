'use client';

import { Suspense } from 'react';
import BillingContent from './BillingContent';

export default function BillingPage() {
  return (
    <Suspense fallback={
      <main className="container">
        <div className="loading">Loading...</div>
      </main>
    }>
      <BillingContent />
    </Suspense>
  );
}
