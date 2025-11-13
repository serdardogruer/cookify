'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import Link from 'next/link';
import { showToast } from '@/lib/toast';

export default function KitchenPage() {
  const { token, user } = useAuth();
  const [kitchen, setKitchen] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  
  const isOwner = kitchen?.ownerId === user?.id;

  useEffect(() => {
    loadKitchen();
  }, [token]);

  const loadKitchen = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    const response = await api.get<any>('/api/kitchen', token);
    if (response.success && response.data) {
      setKitchen(response.data);
    }
    setLoading(false);
  };

  const copyInviteCode = () => {
    if (kitchen?.inviteCode) {
      navigator.clipboard.writeText(kitchen.inviteCode);
    }
  };

  const shareWhatsApp = () => {
    if (kitchen?.inviteCode) {
      const text = `Cookify mutfağıma katıl! Davet kodu: ${kitchen.inviteCode}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleJoinKitchen = async () => {
    if (!inviteCode.trim()) {
      showToast('Lütfen davet kodunu girin', 'error');
      return;
    }

    if (!token) {
      showToast('Oturum bulunamadı', 'error');
      return;
    }

    setJoining(true);
    const response = await api.post<any>('/api/kitchen/join', { inviteCode: inviteCode.trim() }, token);
    setJoining(false);

    if (response.success) {
      showToast('Mutfağa başarıyla katıldınız!', 'success');
      setShowJoinModal(false);
      setInviteCode('');
      loadKitchen();
    } else {
      showToast(response.error?.message || 'Mutfağa katılırken hata oluştu', 'error');
    }
  };

  const handleLeaveKitchen = async () => {
    if (!token) {
      showToast('Oturum bulunamadı', 'error');
      return;
    }

    const response = await api.post<any>('/api/kitchen/leave', {}, token);

    if (response.success) {
      showToast('Mutfaktan ayrıldınız', 'success');
      loadKitchen();
    } else {
      showToast(response.error?.message || 'Mutfaktan ayrılırken hata oluştu', 'error');
    }
  };

  const handleRemoveMember = async (memberId: number, memberName: string) => {
    if (!token) {
      showToast('Oturum bulunamadı', 'error');
      return;
    }

    const response = await api.post<any>('/api/kitchen/remove-member', { memberId }, token);

    if (response.success) {
      showToast(`${memberName} mutfaktan çıkarıldı`, 'success');
      loadKitchen();
    } else {
      showToast(response.error?.message || 'Üye çıkarılırken hata oluştu', 'error');
    }
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

      {/* Tabs */}
      <div className="pb-3 px-4 sticky top-[72px] bg-[#121212] z-10">
        <div className="flex border-b border-[#1E1E1E] justify-between">
          <Link
            href="/dashboard/profile"
            className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#A0A0A0] pb-[13px] pt-4 flex-1"
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Profil Bilgileri</p>
          </Link>
          <button
            className="flex flex-col items-center justify-center border-b-[3px] border-b-[#30D158] text-[#30D158] pb-[13px] pt-4 flex-1"
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Mutfak Yönetimi</p>
          </button>
          <Link
            href="/dashboard/modules"
            className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#A0A0A0] pb-[13px] pt-4 flex-1"
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Modüller</p>
          </Link>
        </div>
      </div>

      {/* Content */}
      <main className="flex flex-1 flex-col gap-6 p-4 pb-24">
        {/* Active Kitchen */}
        <section className="flex flex-col gap-4 rounded-xl bg-[#1E1E1E] p-4">
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-white">
            Aktif Mutfak
          </h2>
          <div className="flex flex-col gap-4">
            <div className="text-base">
              <span className="text-[#A0A0A0]">Mutfak Adı: </span>
              <span className="font-medium text-white">{kitchen?.name || 'Mutfağım'}</span>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-base text-[#A0A0A0]">Davet Kodu:</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-[#121212] px-4 py-2 font-mono text-lg font-medium tracking-widest text-white">
                  {kitchen?.inviteCode || 'XXXXXX'}
                </span>
                <button
                  onClick={copyInviteCode}
                  className="flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-500 active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">content_copy</span>
                  Kopyala
                </button>
                <button
                  onClick={shareWhatsApp}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#30D158] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#30D158]/90 active:scale-95"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  </svg>
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Kitchen Members */}
        <section className="flex flex-col gap-4 rounded-xl bg-[#1E1E1E] p-4">
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-white">
            Mutfak Üyeleri ({kitchen?.members?.length || 0})
          </h2>
          <div className="flex flex-col gap-3">
            {kitchen?.members?.map((member: any, index: number) => (
              <div key={index} className="flex items-center justify-between rounded-lg bg-[#121212] p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-600 text-white">
                    <span className="text-lg font-medium">
                      {member.user?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{member.user?.name}</p>
                    <p className="text-sm text-[#A0A0A0]">{member.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      member.role === 'OWNER'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gray-500/30 text-gray-300'
                    }`}
                  >
                    {member.role === 'OWNER' ? 'Sahip' : 'Üye'}
                  </span>
                  {isOwner && member.role !== 'OWNER' && (
                    <button
                      onClick={() => handleRemoveMember(member.user.id, member.user.name)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-400 transition-colors hover:bg-red-500/30 active:scale-95"
                      title="Mutfaktan Çıkar"
                    >
                      <span className="material-symbols-outlined text-base">person_remove</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <section className="flex flex-col gap-4 rounded-xl bg-[#1E1E1E] p-4">
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-white">İşlemler</h2>
          <button 
            onClick={() => setShowJoinModal(true)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gray-600 text-base font-medium text-white transition-colors hover:bg-gray-500 active:scale-95"
          >
            <span className="material-symbols-outlined">link</span>
            Başka Bir Mutfağa Katıl
          </button>
          {!isOwner && (
            <button 
              onClick={handleLeaveKitchen}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-red-500/20 text-base font-medium text-red-400 transition-colors hover:bg-red-500/30 active:scale-95"
            >
              <span className="material-symbols-outlined">logout</span>
              Mutfaktan Ayrıl
            </button>
          )}
        </section>
      </main>

      {/* Join Kitchen Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-[#1E1E1E] p-6">
            <h3 className="mb-4 text-xl font-bold text-white">Mutfağa Katıl</h3>
            <p className="mb-4 text-sm text-[#A0A0A0]">
              Katılmak istediğiniz mutfağın davet kodunu girin
            </p>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="DAVET KODU"
              maxLength={6}
              className="mb-4 w-full rounded-lg bg-[#121212] px-4 py-3 font-mono text-lg tracking-widest text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#30D158]"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setInviteCode('');
                }}
                disabled={joining}
                className="flex-1 rounded-lg bg-gray-600 py-3 text-base font-medium text-white transition-colors hover:bg-gray-500 active:scale-95 disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleJoinKitchen}
                disabled={joining || !inviteCode.trim()}
                className="flex-1 rounded-lg bg-[#30D158] py-3 text-base font-medium text-white transition-colors hover:bg-[#30D158]/90 active:scale-95 disabled:opacity-50"
              >
                {joining ? 'Katılıyor...' : 'Katıl'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
