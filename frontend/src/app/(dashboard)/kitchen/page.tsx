'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function KitchenPage() {
  const { token } = useAuth();
  const [kitchen, setKitchen] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadKitchen();
  }, [token]);

  const loadKitchen = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    const response = await api.get('/api/kitchen', token);
    if (response.success && response.data) {
      setKitchen(response.data);
    }
    setLoading(false);
  };

  const handleJoinKitchen = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) return;

    const response = await api.post('/api/kitchen/join', { inviteCode }, token);

    if (response.success) {
      setSuccess('Mutfağa katıldınız!');
      setShowJoinModal(false);
      setInviteCode('');
      loadKitchen();
    } else {
      setError(response.error?.message || 'Katılma başarısız');
    }
  };

  const handleLeaveKitchen = async () => {
    if (!confirm('Bu mutfaktan ayrılmak istediğinize emin misiniz?')) return;

    setError('');
    setSuccess('');

    if (!token) return;

    const response = await api.post('/api/kitchen/leave', {}, token);

    if (response.success) {
      setSuccess('Mutfaktan ayrıldınız');
      loadKitchen();
    } else {
      setError(response.error?.message || 'Ayrılma başarısız');
    }
  };

  const copyInviteCode = () => {
    if (kitchen?.inviteCode) {
      navigator.clipboard.writeText(kitchen.inviteCode);
      setSuccess('Davet kodu kopyalandı!');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const shareWhatsApp = () => {
    if (kitchen?.inviteCode) {
      const message = `Cookify mutfağıma katıl! Davet kodu: ${kitchen.inviteCode}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

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
        <div className="max-w-4xl mx-auto">
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
                  href="/profile"
                  className="w-full text-left px-4 py-3 rounded hover:bg-gray-700 flex items-center gap-3"
                >
                  <span>👤</span>
                  <span>Profil Bilgileri</span>
                </Link>
                <Link
                  href="/kitchen"
                  className="w-full text-left px-4 py-3 rounded bg-blue-600 hover:bg-blue-700 flex items-center gap-3"
                >
                  <span>🏠</span>
                  <span>Mutfak Yönetimi</span>
                </Link>
                <Link
                  href="/modules"
                  className="w-full text-left px-4 py-3 rounded hover:bg-gray-700 flex items-center gap-3"
                >
                  <span>🧩</span>
                  <span>Modüller</span>
                </Link>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
          {/* Kitchen Info */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Aktif Mutfak</h2>
            <div className="space-y-4">
              <div>
                <span className="text-gray-400">Mutfak Adı:</span>
                <span className="ml-2 text-lg">{kitchen?.name}</span>
              </div>

              <div>
                <span className="text-gray-400">Davet Kodu:</span>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-mono bg-gray-700 px-4 py-2 rounded text-xl">
                    {kitchen?.inviteCode}
                  </span>
                  <button
                    onClick={copyInviteCode}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    📋 Kopyala
                  </button>
                  <button
                    onClick={shareWhatsApp}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md"
                  >
                    📱 WhatsApp
                  </button>
                </div>
              </div>

              <div>
                <span className="text-gray-400">Durum:</span>
                <span className="ml-2">
                  {kitchen?.status === 'ACTIVE' ? (
                    <span className="text-green-500">● Aktif</span>
                  ) : (
                    <span className="text-gray-500">● Pasif</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Mutfak Üyeleri ({kitchen?.members?.length || 0})
            </h2>
            <div className="space-y-3">
              {kitchen?.members?.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between bg-gray-700 p-3 rounded"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{member.user.name}</div>
                      <div className="text-sm text-gray-400">{member.user.email}</div>
                    </div>
                  </div>
                  <div>
                    {member.role === 'OWNER' ? (
                      <span className="px-3 py-1 bg-yellow-600 rounded text-sm">
                        👑 Sahip
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-600 rounded text-sm">
                        Üye
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

              {/* Actions */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">İşlemler</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-md text-left"
                  >
                    🔗 Başka Bir Mutfağa Katıl
                  </button>

                  {kitchen?.ownerId !== kitchen?.members?.[0]?.userId && (
                    <button
                      onClick={handleLeaveKitchen}
                      className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-md text-left"
                    >
                      🚪 Bu Mutfaktan Ayrıl
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Mutfağa Katıl</h3>
            <form onSubmit={handleJoinKitchen}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Davet Kodu
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white font-mono text-lg"
                  placeholder="ABC123"
                  required
                  maxLength={6}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Katıl
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setInviteCode('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
