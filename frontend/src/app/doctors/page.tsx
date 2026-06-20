'use client';

import { Suspense } from 'react';
import DoctorsContent from './DoctorsPageContent';

export default function DoctorsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12 flex justify-center"><p className="text-muted-foreground">Loading doctors...</p></div>}>
      <DoctorsContent />
    </Suspense>
  );
}
