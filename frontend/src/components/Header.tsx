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
          <Link href="/dashboard" className="text-xl md:text-2xl font-bold">
            🍳 Cookify
          </Link>

          {/* Mobile Profile Button */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="md:hidden flex items-center"
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

          {/* Navigation - Desktop only */}
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-md transition ${
                isActive('/dashboard')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
               Anasayfa
            </Link>
            <Link
              href="/dashboard/pantry"
              className={`px-4 py-2 rounded-md transition ${
                isActive('/dashboard/pantry')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
               Dolabım
            </Link>

            <Link
              href="/dashboard/market"
              className={`px-4 py-2 rounded-md transition ${
                isActive('/dashboard/market')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
               Market
            </Link>
            <Link
              href="/dashboard/recipe-search"
              className={`px-4 py-2 rounded-md transition ${
                pathname?.includes('/recipe-search') || pathname?.includes('/recipe-detail')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
               Tarif ara
            </Link>
            <Link
              href="/dashboard/recipe-add"
              className={`px-4 py-2 rounded-md transition ${
                isActive('/dashboard/recipe-add')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
               Tarif Ekle
            </Link>

          </nav>

          {/* Desktop Profile Dropdown */}
          <div className="hidden md:block relative">
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

            {/* Desktop Dropdown Menu */}
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

      {/* Mobile Drawer Menu */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowDropdown(false)}
          ></div>
          
          {/* Drawer */}
          <div className="md:hidden fixed top-0 right-0 bottom-0 w-80 bg-gray-800 z-50 shadow-2xl transform transition-transform">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold">Menü</h2>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Profile Info */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  {profile?.profileImage ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${profile.profileImage}`}
                      alt="Profil"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl border-2 border-gray-600">
                      {user?.name?.charAt(0).toUpperCase() || '👤'}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-lg">{user?.name}</p>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto py-4">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3 px-6 py-4 hover:bg-gray-700 transition"
                  onClick={() => setShowDropdown(false)}
                >
                  <span className="text-2xl">👤</span>
                  <span>Profil Ayarları</span>
                </Link>
                <Link
                  href="/dashboard/kitchen"
                  className="flex items-center gap-3 px-6 py-4 hover:bg-gray-700 transition"
                  onClick={() => setShowDropdown(false)}
                >
                  <span className="text-2xl">🏠</span>
                  <span>Mutfak Yönetimi</span>
                </Link>
                <Link
                  href="/dashboard/market"
                  className="flex items-center gap-3 px-6 py-4 hover:bg-gray-700 transition"
                  onClick={() => setShowDropdown(false)}
                >
                  <span className="text-2xl">🛒</span>
                  <span>Market Listesi</span>
                </Link>
                <Link
                  href="/dashboard/modules"
                  className="flex items-center gap-3 px-6 py-4 hover:bg-gray-700 transition"
                  onClick={() => setShowDropdown(false)}
                >
                  <span className="text-2xl">🧩</span>
                  <span>Modüller</span>
                </Link>
              </div>

              {/* Logout Button */}
              <div className="p-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition"
                >
                  <span className="text-xl">🚪</span>
                  <span>Çıkış Yap</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
