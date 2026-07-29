import { Suspense } from 'react';

import { AuthErrorToast } from '@/features/auth/components/auth-error-toast';
import { ListingsBrowsePage } from '@/features/listings/components/listings-browse-page';

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <AuthErrorToast />
      </Suspense>
      <ListingsBrowsePage />
    </>
  );
}
