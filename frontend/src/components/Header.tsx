'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

export default function Header() {
  const pathname = usePathname();
  const { user, token, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, [token]);

  const loadProfile = async () => {
    if (!token) return;
    const response = await api.get<any>('/api/profile', token);
    if (response.success && response.data) {
      setProfile(response.data);
    }
  };

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/dashboard', icon: 'home', label: 'Anasayfa' },
    { href: '/dashboard/pantry', icon: 'kitchen', label: 'Dolabım' },
    { href: '/dashboard/market', icon: 'shopping_cart', label: 'Market' },
    { href: '/dashboard/recipe-search', icon: 'search', label: 'Tarif Ara' },
    { href: '/dashboard/recipe-add', icon: 'add_circle', label: 'Tarif Ekle' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#121212] border-b border-white/10">
      <div className="px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#30D158] text-3xl">skillet</span>
            <span className="text-xl font-bold text-white">Cookify</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    active
                      ? 'bg-[#30D158] text-[#121212] font-semibold'
                      : 'text-white hover:bg-[#30D158]/10 hover:text-[#30D158]'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{
                      fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Profile Button */}
          <Link href="/dashboard/profile" className="flex items-center gap-2 hover:opacity-80 transition">
            {profile?.profileImage ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${profile.profileImage}`}
                alt="Profil"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-white">person</span>
              </div>
            )}
          </Link>
        </div>
      </div>


    </header>
  );
}
