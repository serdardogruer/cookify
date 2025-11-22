'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import NotificationBell from './NotificationBell';

export default function Header() {
  const pathname = usePathname();
  const { user, token, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModulesDropdown, setShowModulesDropdown] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);

  useEffect(() => {
    loadProfile();
    loadModules();
  }, [token]);

  const loadModules = async () => {
    if (!token) return;
    try {
      const response = await api.get<any>('/api/modules/user', token);
      if (response.success && response.data) {
        // Sadece core olmayan ve enabled olan modülleri göster
        const activeModules = response.data.filter((m: any) => 
          !m.isCore && m.isEnabled && (m.status === 'active' || m.status === 'trial')
        );
        setModules(activeModules);
      }
    } catch (error) {
      console.error('Modül yükleme hatası:', error);
    }
  };

  // Profil güncellemelerini dinle
  useEffect(() => {
    const handleProfileUpdate = () => {
      loadProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [token]);

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.modules-dropdown')) {
        setShowModulesDropdown(false);
      }
    };

    if (showModulesDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [showModulesDropdown]);

  // Modül güncellemelerini dinle
  useEffect(() => {
    const handleModulesUpdate = () => {
      loadModules();
    };

    window.addEventListener('modulesUpdated', handleModulesUpdate);
    return () => window.removeEventListener('modulesUpdated', handleModulesUpdate);
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

  // Modül linklerini dinamik oluştur
  const moduleItems = modules.map((module: any) => ({
    href: `/dashboard/${module.slug}`,
    icon: module.icon || 'extension',
    label: module.name,
    badge: module.badge
  }));

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

            {/* Modüller Dropdown */}
            <div className="relative modules-dropdown">
                <button
                  onClick={() => setShowModulesDropdown(!showModulesDropdown)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    moduleItems.some(m => isActive(m.href))
                      ? 'bg-[#30D158] text-[#121212] font-semibold'
                      : 'text-white hover:bg-[#30D158]/10 hover:text-[#30D158]'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">extension</span>
                  <span className="text-sm">Modüller</span>
                  <span className="material-symbols-outlined text-lg">
                    {showModulesDropdown ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

              {showModulesDropdown && (
                <div className="absolute top-full right-0 mt-2 min-w-[14rem] bg-[#1E1E1E] rounded-xl shadow-lg border border-white/10 py-2 z-50">
                  {moduleItems.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <div className="text-3xl mb-2">📦</div>
                      <p className="text-[#A0A0A0] text-sm mb-3">
                        Henüz aktif modülünüz yok
                      </p>
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setShowModulesDropdown(false)}
                        className="text-[#30D158] hover:underline text-sm"
                      >
                        Modülleri Keşfet →
                      </Link>
                    </div>
                  ) : (
                    <>
                      {moduleItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setShowModulesDropdown(false)}
                            className={`flex items-center gap-3 px-4 py-3 hover:bg-[#30D158]/10 transition-colors ${
                              active ? 'bg-[#30D158]/20' : ''
                            }`}
                          >
                            <span className="text-2xl">{item.icon}</span>
                            <span className="text-white flex-1 whitespace-nowrap">{item.label}</span>
                            {(item as any).badge && (
                              <span className="text-lg">{(item as any).badge}</span>
                            )}
                          </Link>
                        );
                      })}
                      <div className="border-t border-white/10 mt-2 pt-2 px-4">
                        <Link
                          href="/dashboard/profile"
                          onClick={() => setShowModulesDropdown(false)}
                          className="flex items-center gap-2 text-[#A0A0A0] hover:text-white text-sm py-2"
                        >
                          <span className="material-symbols-outlined text-lg">settings</span>
                          <span>Modül Ayarları</span>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Notification Bell & Profile */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link href="/dashboard/profile" className="flex items-center gap-2 hover:opacity-80 transition">
              {profile?.profileImage ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${profile.profileImage}?t=${Date.now()}`}
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
      </div>


    </header>
  );
}
