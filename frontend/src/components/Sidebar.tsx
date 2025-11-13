'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: 'home', label: 'Anasayfa' },
    { href: '/dashboard/pantry', icon: 'kitchen', label: 'Dolabım' },
    { href: '/dashboard/market', icon: 'shopping_cart', label: 'Market' },
    { href: '/dashboard/recipe-search', icon: 'search', label: 'Tarif Ara' },
    { href: '/dashboard/recipe-add', icon: 'add_circle', label: 'Tarif Ekle' },
    { href: '/dashboard/profile', icon: 'person', label: 'Profil' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-[#1E1E1E] border-r border-white/10 min-h-screen sticky top-16">
      <nav className="flex flex-col p-4 gap-2">
        {navItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? 'bg-[#30D158] text-[#121212] font-semibold'
                  : 'text-white hover:bg-[#30D158]/10 hover:text-[#30D158]'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
