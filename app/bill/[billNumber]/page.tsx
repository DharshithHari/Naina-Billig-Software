'use client';

import { Suspense } from 'react';
import BillViewContent from './BillViewContent';

export default function BillViewPage() {
  return (
    <Suspense fallback={
      <div className="loading-container">
        <div className="loading">Loading...</div>
      </div>
    }>
      <BillViewContent />
    </Suspense>
  );
}

