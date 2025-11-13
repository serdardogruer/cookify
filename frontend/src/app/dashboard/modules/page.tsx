'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  isCore: boolean;
  badge?: 'new' | 'premium';
  locked?: boolean;
}

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([
    // Core Modules
    { id: 'recipes', name: 'Tarif Kitabı', description: 'Lezzetli tarifleri keşfedin ve kaydedin', icon: 'menu_book', enabled: true, isCore: true },
    { id: 'shopping', name: 'Alışveriş Listesi', description: 'Malzemelerinizi kolayca takip edin', icon: 'shopping_cart', enabled: true, isCore: true },
    { id: 'pantry', name: 'Kiler Yönetimi', description: 'Evinizdeki malzemeleri yönetin', icon: 'kitchen', enabled: true, isCore: true },
    
    // Additional Modules
    { id: 'meal-planner', name: 'Haftalık Yemek Planlayıcı', description: 'Öğünlerinizi hafta için planlayın', icon: 'date_range', enabled: true, isCore: false },
    { id: 'nutrition', name: 'Besin Değeri Takibi', description: 'Kalori ve makro besinleri izleyin', icon: 'analytics', enabled: false, isCore: false },
    { id: 'timer', name: 'Mutfak Zamanlayıcı', description: 'Çoklu zamanlayıcılarla yemek yapın', icon: 'timer', enabled: true, isCore: false },
    
    // Coming Soon
    { id: 'smart-oven', name: 'Akıllı Fırın Entegrasyonu', description: 'Fırınınızı doğrudan uygulamadan kontrol edin', icon: 'oven_gen', enabled: false, isCore: false, badge: 'new', locked: true },
    { id: 'guest-mode', name: 'Misafir Modu', description: 'Misafirleriniz için tarifleri paylaşın', icon: 'group', enabled: false, isCore: false, badge: 'premium', locked: true },
  ]);

  const toggleModule = (id: string) => {
    setModules(modules.map(m => 
      m.id === id && !m.isCore && !m.locked ? { ...m, enabled: !m.enabled } : m
    ));
  };

  const coreModules = modules.filter(m => m.isCore);
  const additionalModules = modules.filter(m => !m.isCore && !m.locked);
  const comingSoonModules = modules.filter(m => m.locked);

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col bg-[#121212]">
      {/* Header */}
      <div className="flex items-center bg-[#121212] p-4 pb-2 justify-between sticky top-0 z-10 border-b border-[#3A3A3C]">
        <div className="flex size-12 shrink-0 items-center"></div>
        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Profil & Ayarlar
        </h2>
        <div className="flex size-12 shrink-0 items-center"></div>
      </div>

      {/* Tabs */}
      <div className="pb-3 px-4 sticky top-[72px] bg-[#121212] z-10">
        <div className="flex border-b border-[#1E1E1E] justify-between">
          <Link
            href="/dashboard/profile"
            className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#A0A0A0] pb-[13px] pt-4 flex-1"
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Profil Bilgileri</p>
          </Link>
          <Link
            href="/dashboard/kitchen"
            className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#A0A0A0] pb-[13px] pt-4 flex-1"
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Mutfak Yönetimi</p>
          </Link>
          <button
            className="flex flex-col items-center justify-center border-b-[3px] border-b-[#30D158] text-[#30D158] pb-[13px] pt-4 flex-1"
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Modüller</p>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col p-4 pb-24">
        <p className="text-[#A0A0A0] text-base font-normal leading-normal pb-3 pt-1">
          Mutfağınızın özelliklerini yönetin
        </p>

        {/* Core Modules */}
        <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">
          Temel Modüller
        </h3>
        <p className="text-[#A0A0A0] text-sm pb-3">
          Bu temel özellikler, en iyi Cookify deneyimi için her zaman aktiftir.
        </p>
        <div className="flex flex-col gap-2">
          {coreModules.map((module) => (
            <div
              key={module.id}
              className="flex items-center gap-4 bg-[#1E1E1E] rounded-xl px-4 min-h-[72px] py-3 justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="text-[#30D158] flex items-center justify-center rounded-lg bg-[#30D158]/20 shrink-0 size-12">
                  <span className="material-symbols-outlined text-2xl">{module.icon}</span>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-white text-base font-medium leading-normal line-clamp-1">
                    {module.name}
                  </p>
                  <p className="text-[#A0A0A0] text-sm font-normal leading-normal line-clamp-2">
                    {module.description}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <p className="text-[#30D158] text-sm font-medium leading-normal">Aktif</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-4">
          <div className="h-px bg-[#1E1E1E]"></div>
        </div>

        {/* Additional Modules */}
        <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] pb-2">
          Ek Modüller
        </h3>
        <p className="text-[#A0A0A0] text-sm pb-3">
          Deneyiminizi kişiselleştirmek için bu modülleri etkinleştirin veya devre dışı bırakın.
        </p>
        <div className="flex flex-col gap-2">
          {additionalModules.map((module) => (
            <div
              key={module.id}
              className="flex items-center gap-4 bg-[#1E1E1E] rounded-xl px-4 min-h-[72px] py-3 justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="text-[#30D158] flex items-center justify-center rounded-lg bg-[#30D158]/20 shrink-0 size-12">
                  <span className="material-symbols-outlined text-2xl">{module.icon}</span>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-white text-base font-medium leading-normal line-clamp-1">
                    {module.name}
                  </p>
                  <p className="text-[#A0A0A0] text-sm font-normal leading-normal line-clamp-2">
                    {module.description}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={module.enabled}
                    onChange={() => toggleModule(module.id)}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-gray-600 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#30D158] peer-checked:after:translate-x-full peer-focus:ring-2 peer-focus:ring-[#30D158]/50"></div>
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-4">
          <div className="h-px bg-[#1E1E1E]"></div>
        </div>

        {/* Coming Soon */}
        <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] pb-2">
          Yakında Gelecek
        </h3>
        <p className="text-[#A0A0A0] text-sm pb-3">
          Cookify'ı daha da iyi hale getirmek için üzerinde çalıştığımız yeni özellikler.
        </p>
        <div className="flex flex-col gap-2 pb-8">
          {comingSoonModules.map((module) => (
            <div
              key={module.id}
              className="flex items-center gap-4 bg-[#1E1E1E] rounded-xl px-4 min-h-[72px] py-3 justify-between opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="text-[#A0A0A0] flex items-center justify-center rounded-lg bg-gray-700/50 shrink-0 size-12">
                  <span className="material-symbols-outlined text-2xl">{module.icon}</span>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-base font-medium leading-normal line-clamp-1">
                      {module.name}
                    </p>
                    {module.badge === 'new' && (
                      <span className="rounded-full bg-[#4ECDC4] px-2 py-0.5 text-xs font-semibold text-[#121212]">
                        Yeni
                      </span>
                    )}
                    {module.badge === 'premium' && (
                      <span className="rounded-full bg-[#30D158] px-2 py-0.5 text-xs font-semibold text-white">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-[#A0A0A0] text-sm font-normal leading-normal line-clamp-2">
                    {module.description}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-[#A0A0A0]">
                <span className="material-symbols-outlined">lock</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
