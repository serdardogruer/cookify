'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

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
      setPhone(response.data.phone || '');
      setBio(response.data.bio || '');
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const response = await api.post('/api/profile/update', { name, phone, bio }, token);

    if (response.success) {
      toast.success('Profil güncellendi');
      loadProfile();
    } else {
      toast.error('Güncelleme başarısız');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    setUploading(true);

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
        loadProfile();
      }
    } catch (err: any) {
      // Hata sessizce yönetilir
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Çıkış yapıldı');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

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

      {/* Profile Header */}
      <div className="flex p-4">
        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {profile?.profileImage ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${profile.profileImage}`}
                  alt="Profil"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-4xl">
                  {profile?.name?.charAt(0).toUpperCase() || '👤'}
                </div>
              )}
              <label className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#30D158] text-[#121212]">
                <span className="material-symbols-outlined text-xl">edit</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            <div className="flex flex-col items-center justify-center">
              <p className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">
                {profile?.name || 'Kullanıcı'}
              </p>
              <p className="text-[#A0A0A0] text-base font-normal leading-normal text-center pt-1">
                {profile?.email}
              </p>
              <p className="text-[#A0A0A0] text-base font-normal leading-normal text-center">
                Üyelik Tarihi: {new Date(profile?.createdAt).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pb-3 px-4 sticky top-[72px] bg-[#121212] z-10">
        <div className="flex border-b border-[#1E1E1E] justify-between">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 flex-1 ${
              activeTab === 'profile'
                ? 'border-b-[#30D158] text-[#30D158]'
                : 'border-b-transparent text-[#A0A0A0]'
            }`}
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Profil Bilgileri</p>
          </button>
          <Link
            href="/dashboard/kitchen"
            className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#A0A0A0] pb-[13px] pt-4 flex-1"
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Mutfak Yönetimi</p>
          </Link>
          <Link
            href="/dashboard/modules"
            className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#A0A0A0] pb-[13px] pt-4 flex-1"
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Modüller</p>
          </Link>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleUpdate} className="flex flex-col p-4 gap-4">
        <div className="flex flex-col rounded-xl bg-[#1E1E1E] p-4 gap-4">
          <label className="flex flex-col w-full">
            <p className="text-[#A0A0A0] text-sm font-medium leading-normal pb-2">Ad Soyad</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#30D158]/50 border-none bg-[#121212] h-14 placeholder:text-[#A0A0A0] p-4 text-base font-normal leading-normal"
            />
          </label>

          <label className="flex flex-col w-full">
            <p className="text-[#A0A0A0] text-sm font-medium leading-normal pb-2">E-posta</p>
            <input
              type="email"
              value={profile?.email || ''}
              readOnly
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#A0A0A0] focus:outline-0 focus:ring-0 border-none bg-[#121212] h-14 p-4 text-base font-normal leading-normal cursor-not-allowed"
            />
          </label>

          <label className="flex flex-col w-full">
            <p className="text-[#A0A0A0] text-sm font-medium leading-normal pb-2">
              Telefon (İsteğe Bağlı)
            </p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#30D158]/50 border-none bg-[#121212] h-14 placeholder:text-[#A0A0A0] p-4 text-base font-normal leading-normal"
              placeholder="Telefon numaranızı girin"
            />
          </label>

          <label className="flex flex-col w-full">
            <p className="text-[#A0A0A0] text-sm font-medium leading-normal pb-2">Biyografi</p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="form-textarea flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#30D158]/50 border-none bg-[#121212] min-h-[120px] placeholder:text-[#A0A0A0] p-4 text-base font-normal leading-normal"
              placeholder="Kendiniz hakkında kısa bir şeyler yazın..."
            />
          </label>
        </div>

        <button
          type="submit"
          className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-[#30D158] text-[#121212] text-base font-bold leading-normal tracking-[0.015em] w-full hover:bg-[#30D158]/90 transition"
        >
          Değişiklikleri Kaydet
        </button>
      </form>

      {/* Logout Section */}
      <div className="flex flex-col items-center gap-4 px-4 py-8 mt-auto">
        <button
          onClick={handleLogout}
          className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-red-500/20 text-red-500 text-base font-bold leading-normal tracking-[0.015em] w-full hover:bg-red-500/30 transition"
        >
          Çıkış Yap
        </button>
        <p className="text-[#A0A0A0] text-xs font-normal">Cookify Version 1.0.0</p>
      </div>
    </div>
  );
}
