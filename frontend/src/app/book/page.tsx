'use client';

import { Suspense } from 'react';
import BookPageContent from './BookPageContent';

export default function BookPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-24 flex justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <BookPageContent />
    </Suspense>
  );
}
