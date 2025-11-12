'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(path);
  };

  return (
    <nav className="block md:hidden fixed bottom-0 left-0 right-0 w-full bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 z-50">
      <div className="flex justify-around items-center h-20 px-2">
        <Link 
          href="/dashboard" 
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/dashboard') && pathname === '/dashboard'
              ? 'text-blue-400' 
              : 'text-gray-400'
          }`}
        >
          <span className="text-2xl mb-1">🏠</span>
          <span className="text-xs font-medium">Ana Sayfa</span>
        </Link>
        <Link 
          href="/dashboard/recipe-search" 
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            pathname?.includes('/recipe-search') || pathname?.includes('/recipe-detail')
              ? 'text-blue-400' 
              : 'text-gray-400'
          }`}
        >
          <span className="text-2xl mb-1">🔍</span>
          <span className="text-xs font-medium">Ara</span>
        </Link>
        <Link 
          href="/dashboard/recipe-add" 
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            pathname?.includes('/recipe-add')
              ? 'text-purple-400' 
              : 'text-gray-400'
          }`}
        >
          <span className="text-2xl mb-1">➕</span>
          <span className="text-xs font-medium">Ekle</span>
        </Link>
        <Link 
          href="/dashboard/pantry" 
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            pathname?.includes('/pantry')
              ? 'text-blue-400' 
              : 'text-gray-400'
          }`}
        >
          <span className="text-2xl mb-1">🗄️</span>
          <span className="text-xs font-medium">Dolap</span>
        </Link>
        <Link 
          href="/dashboard/market" 
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            pathname?.includes('/market')
              ? 'text-blue-400' 
              : 'text-gray-400'
          }`}
        >
          <span className="text-2xl mb-1">🛒</span>
          <span className="text-xs font-medium">Market</span>
        </Link>
      </div>
    </nav>
  );
}
