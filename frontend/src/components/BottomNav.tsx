'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: 'home', label: 'Anasayfa', filled: true },
    { href: '/dashboard/pantry', icon: 'kitchen', label: 'Dolabım' },
    { href: '/dashboard/market', icon: 'shopping_cart', label: 'Market' },
    { href: '/dashboard/recipe-add', icon: 'add_circle', label: 'Ekle' },
    { href: '/dashboard/recipe-search', icon: 'search', label: 'Ara' },
    { href: '/dashboard/profile', icon: 'person', label: 'Profil' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#1E1E1E] border-t border-white/10 flex justify-around items-center px-4 z-20 lg:hidden">
      {navItems.map((item) => {
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 ${
              active ? 'text-[#30D158]' : 'text-[#A0A0A0]'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings: active && item.filled ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {item.icon}
            </span>
            <span className={`text-xs ${active ? 'font-bold' : ''}`}>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
