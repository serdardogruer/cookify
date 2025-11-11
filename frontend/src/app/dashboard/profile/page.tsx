'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function ProfilePage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [token]);

  const loadProfile = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    const response = await api.get<any>('/api/profile', token);
    if (response.success && response.data) {
      setProfile(response.data);
      setName(response.data.name || '');
      setEmail(response.data.email || '');
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) return;

    const response = await api.post('/api/profile/update', { name, email }, token);

    if (response.success) {
      setSuccess('Profil güncellendi');
      setEditing(false);
      loadProfile();
    } else {
      setError(response.error?.message || 'Güncelleme başarısız');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Sadece JPG, PNG ve WEBP formatları desteklenir');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/profile/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Profil fotoğrafı güncellendi');
        loadProfile();
      } else {
        setError(data.error?.message || 'Yükleme başarısız');
      }
    } catch (err: any) {
      setError(err.message || 'Yükleme başarısız');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!confirm('Profil fotoğrafını silmek istediğinize emin misiniz?')) return;
    if (!token) return;

    const response = await api.delete('/api/profile/image', token);

    if (response.success) {
      setSuccess('Profil fotoğrafı silindi');
      loadProfile();
    } else {
      setError(response.error?.message || 'Silme başarısız');
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
        <div className="max-w-7xl mx-auto">
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
                  className="w-full text-left px-4 py-3 rounded bg-blue-600 hover:bg-blue-700 flex items-center gap-3"
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
                  className="w-full text-left px-4 py-3 rounded hover:bg-gray-700 flex items-center gap-3"
                >
                  <span>🧩</span>
                  <span>Modüller</span>
                </Link>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Profile Image */}
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Profil Fotoğrafı</h2>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {profile?.profileImage ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${profile.profileImage}`}
                        alt="Profil"
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-700"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-4xl border-4 border-gray-600">
                        {profile?.name?.charAt(0).toUpperCase() || '👤'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm mb-4">
                      JPG, PNG veya WEBP formatında, maksimum 5MB
                    </p>
                    <div className="flex gap-2">
                      <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer">
                        {uploading ? 'Yükleniyor...' : 'Fotoğraf Yükle'}
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                      {profile?.profileImage && (
                        <button
                          onClick={handleDeleteImage}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
                        >
                          Fotoğrafı Sil
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

          {/* Profile Info */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Profil Bilgileri</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
                >
                  Düzenle
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setName(profile.name);
                      setEmail(profile.email);
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md"
                  >
                    İptal
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Ad Soyad:</span>
                  <span className="ml-2">{profile?.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">E-posta:</span>
                  <span className="ml-2">{profile?.email}</span>
                </div>
                <div>
                  <span className="text-gray-400">Kayıt Tarihi:</span>
                  <span className="ml-2">
                    {new Date(profile?.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            )}
          </div>

              {/* Kitchen Info */}
              {profile?.kitchen && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Mutfak Bilgileri</h2>
                    <Link
                      href="/dashboard/kitchen"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
                    >
                      Mutfak Yönetimi
                    </Link>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400">Mutfak Adı:</span>
                      <span className="ml-2">{profile.kitchen.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Davet Kodu:</span>
                      <span className="ml-2 font-mono bg-gray-700 px-2 py-1 rounded">
                        {profile.kitchen.inviteCode}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Üye Sayısı:</span>
                      <span className="ml-2">{profile.kitchen.members?.length || 0}</span>
                    </div>
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
