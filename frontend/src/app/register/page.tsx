'use client';

import { Suspense } from 'react';
import RegisterPageContent from './RegisterPageContent';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-24 flex justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
