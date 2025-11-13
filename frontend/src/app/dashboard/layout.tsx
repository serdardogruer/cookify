'use client';

import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#121212]">
      <Header />
      <main className="pb-24 lg:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
