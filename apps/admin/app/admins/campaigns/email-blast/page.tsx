'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyAdminsEmailBlastPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      router.replace(`/campaigns/email-blast${search}`);
    } else {
      router.replace('/campaigns/email-blast');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#060608] text-white flex items-center justify-center p-6 font-mono text-xs">
      <div className="animate-pulse">Redirecting to Email Blast Broadcast System...</div>
    </div>
  );
}
