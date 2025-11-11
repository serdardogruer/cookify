'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Module {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isCore: boolean;
  isActive: boolean;
  isEnabled: boolean;
  canToggle: boolean;
}

export default function ModulesPage() {
  const { token } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadModules();
  }, [token]);

  const loadModules = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    const response = await api.get<Module[]>('/api/modules', token);
    if (response.success && response.data) {
      setModules(response.data);
    }
    setLoading(false);
  };

  const handleToggle = async (moduleId: number) => {
    if (!token) return;

    const response = await api.post(`/api/modules/${moduleId}/toggle`, {}, token);

    if (response.success) {
      setSuccess('Modül durumu güncellendi');
      loadModules();
      setTimeout(() => setSuccess(''), 2000);
    } else {
      setError(response.error?.message || 'İşlem başarısız');
    }
  };

  const coreModules = modules.filter((m) => m.isCore);
  const optionalModules = modules.filter((m) => !m.isCore && m.isActive);
  const futureModules = modules.filter((m) => !m.isCore && !m.isActive);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white">Yükleniyor...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Header />
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">👤 Profil ve Ayarlar</h1>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Menü</h2>
              <div className="space-y-2">
                <Link
                  href="/dashboard/profile"
                  className="w-full text-left px-4 py-3 rounded hover:bg-gray-700 flex items-center gap-3"
                >
                  <span>👤</span>
                  <span>Profil Bilgileri</span>
                </Link>
                <Link
                  href="/dashboard/kitchen"
                  className="w-full text-left px-4 py-3 rounded hover:bg-gray-700 flex items-center gap-3"
                >
                  <span>🏠</span>
                  <span>Mutfak Yönetimi</span>
                </Link>
                <Link
                  href="/dashboard/modules"
                  className="w-full text-left px-4 py-3 rounded bg-blue-600 hover:bg-blue-700 flex items-center gap-3"
                >
                  <span>🧩</span>
                  <span>Modüller</span>
                </Link>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold">🧩 Modül Yönetimi</h2>
                <p className="text-gray-400 mt-2">Mutfağınızın özelliklerini yönetin</p>
              </div>

          {/* Core Modules */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Temel Modüller</h2>
            <p className="text-gray-400 mb-4">
              Bu modüller her zaman aktiftir ve devre dışı bırakılamaz.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coreModules.map((module) => (
                <div
                  key={module.id}
                  className="bg-gray-800 rounded-lg p-6 border-2 border-green-600"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{module.icon}</div>
                    <span className="px-3 py-1 bg-green-600 rounded-full text-xs">
                      Aktif
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{module.name}</h3>
                  <p className="text-gray-400 text-sm">{module.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Modules */}
          {optionalModules.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Ek Modüller</h2>
              <p className="text-gray-400 mb-4">
                Bu modülleri ihtiyacınıza göre aktif veya pasif yapabilirsiniz.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {optionalModules.map((module) => (
                  <div
                    key={module.id}
                    className={`bg-gray-800 rounded-lg p-6 border-2 ${
                      module.isEnabled ? 'border-blue-600' : 'border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{module.icon}</div>
                      <button
                        onClick={() => handleToggle(module.id)}
                        className={`px-3 py-1 rounded-full text-xs ${
                          module.isEnabled
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                      >
                        {module.isEnabled ? 'Aktif' : 'Pasif'}
                      </button>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{module.name}</h3>
                    <p className="text-gray-400 text-sm">{module.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

              {/* Future Modules */}
              {futureModules.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Yakında Gelecek</h2>
                  <p className="text-gray-400 mb-4">
                    Bu modüller şu anda geliştirme aşamasındadır.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {futureModules.map((module) => (
                      <div
                        key={module.id}
                        className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700 opacity-60"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-4xl">{module.icon}</div>
                          <span className="px-3 py-1 bg-gray-600 rounded-full text-xs">
                            Yakında
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{module.name}</h3>
                        <p className="text-gray-400 text-sm">{module.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
