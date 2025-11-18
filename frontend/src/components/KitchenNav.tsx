'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function KitchenNav() {
  const pathname = usePathname();

  return (
    <div className="px-4 py-3 border-b border-[#2A2A2A]">
      <div className="flex gap-2 max-w-7xl mx-auto">
        <Link
          href="/dashboard/pantry"
          className={`flex-1 py-2.5 px-4 rounded-lg text-center text-sm font-medium transition-colors ${
            pathname === '/dashboard/pantry'
              ? 'bg-[#30D158] text-[#121212]'
              : 'bg-[#1E1E1E] text-white hover:bg-[#2A2A2A]'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">kitchen</span>
            Dolabım
          </span>
        </Link>
        <Link
          href="/dashboard/market"
          className={`flex-1 py-2.5 px-4 rounded-lg text-center text-sm font-medium transition-colors ${
            pathname === '/dashboard/market'
              ? 'bg-[#30D158] text-[#121212]'
              : 'bg-[#1E1E1E] text-white hover:bg-[#2A2A2A]'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">shopping_cart</span>
            Market
          </span>
        </Link>
      </div>
    </div>
  );
}
