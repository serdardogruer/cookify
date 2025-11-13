'use client';

import { useAuth } from '@/hooks/useAuth';

export default function DashboardHeader() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-2 bg-[#121212]">
      <div className="max-w-7xl mx-auto w-full px-4 py-4">
        {/* Welcome Message */}
        <p className="text-white tracking-light text-[28px] font-bold leading-tight">
          Hoş geldin, {user?.name?.split(' ')[0] || 'Kullanıcı'}!
        </p>
      </div>
    </div>
  );
}
