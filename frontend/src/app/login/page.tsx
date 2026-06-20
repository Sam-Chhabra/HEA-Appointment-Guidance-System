'use client';

import { Suspense } from 'react';
import LoginPageContent from './LoginPageContent';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-24 flex justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <LoginPageContent />
    </Suspense>
  );
}
