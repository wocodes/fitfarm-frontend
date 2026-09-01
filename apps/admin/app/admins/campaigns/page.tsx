'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyAdminsCampaignsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/campaigns');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#060608] text-white flex items-center justify-center p-6 font-mono text-xs">
      <div className="animate-pulse">Redirecting to Promotional Campaigns & Leaderboard...</div>
    </div>
  );
}
