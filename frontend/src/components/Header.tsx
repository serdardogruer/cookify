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

  return (
    <header className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="text-2xl font-bold">
            🍳 Cookify
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-md transition ${
                isActive('/dashboard')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              🏠 Anasayfa
            </Link>
            <Link
              href="/dashboard/recipes/search"
              className={`px-4 py-2 rounded-md transition ${
                (pathname === '/dashboard/recipes/search' || (pathname?.includes('/dashboard/recipes/') && !pathname?.includes('/add')))
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              📖 Tarif ara
            </Link>
            <Link
              href="/dashboard/pantry"
              className={`px-4 py-2 rounded-md transition ${
                isActive('/dashboard/pantry')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              🗄️ Dolabım
            </Link>
            <Link
              href="/dashboard/market"
              className={`px-4 py-2 rounded-md transition ${
                isActive('/dashboard/market')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              🛒 Market
            </Link>
            <Link
              href="/dashboard/recipes/add"
              className={`px-4 py-2 rounded-md transition font-semibold ${
                isActive('/dashboard/recipes/add')
                  ? 'bg-purple-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              ➕ Tarif Ekle
            </Link>
          </nav>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 hover:opacity-80 transition"
            >
              {profile?.profileImage ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${profile.profileImage}`}
                  alt="Profil"
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg border-2 border-gray-600">
                  {user?.name?.charAt(0).toUpperCase() || '👤'}
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-20">
                  <div className="p-4 border-b border-gray-700">
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/dashboard/profile"
                      className="block px-4 py-2 hover:bg-gray-700 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      👤 Profil Ayarları
                    </Link>
                    <Link
                      href="/dashboard/kitchen"
                      className="block px-4 py-2 hover:bg-gray-700 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      🏠 Mutfak Yönetimi
                    </Link>
                    <Link
                      href="/dashboard/modules"
                      className="block px-4 py-2 hover:bg-gray-700 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      🧩 Modüller
                    </Link>
                  </div>
                  <div className="border-t border-gray-700 py-2">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        logout();
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-red-600 transition"
                    >
                      🚪 Çıkış Yap
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
