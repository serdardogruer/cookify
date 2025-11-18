'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import Link from 'next/link';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';

interface JoinRequest {
  id: number;
  userId: number;
  kitchenId: number;
  kitchenName: string;
  status: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    profileImage?: string;
  };
}

interface MyJoinRequest {
  id: number;
  userId: number;
  kitchenId: number;
  status: string;
  createdAt: string;
  kitchen: {
    id: number;
    name: string;
    owner: {
      id: number;
      name: string;
      email: string;
      profileImage?: string;
    };
  };
}

interface Kitchen {
  id: number;
  name: string;
  inviteCode: string;
  ownerId: number;
  members: any[];
}

export default function KitchenManagementPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kitchen, setKitchen] = useState<Kitchen | null>(null);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [myJoinRequests, setMyJoinRequests] = useState<MyJoinRequest[]>([]);
  const [showInviteCode, setShowInviteCode] = useState(false);

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    // Mutfak bilgilerini yükle
    const kitchenResponse = await api.get<Kitchen>('/api/kitchen', token);
    if (kitchenResponse.success && kitchenResponse.data) {
      setKitchen(kitchenResponse.data);
    }

    // Bekleyen istekleri yükle (mutfak sahibi için)
    const requestsResponse = await api.get<JoinRequest[]>('/api/kitchen/pending-requests', token);
    if (requestsResponse.success && requestsResponse.data) {
      setPendingRequests(requestsResponse.data);
    }

    // Kendi gönderdiğim istekleri yükle
    const myRequestsResponse = await api.get<MyJoinRequest[]>('/api/kitchen/my-join-requests', token);
    if (myRequestsResponse.success && myRequestsResponse.data) {
      setMyJoinRequests(myRequestsResponse.data);
    }

    setLoading(false);
  };

  const handleApprove = async (requestId: number) => {
    if (!token) return;

    const response = await api.post('/api/kitchen/approve-request', { requestId }, token);

    if (response.success) {
      toast.success('Katılma isteği onaylandı');
      loadData();
    } else {
      toast.error('İşlem başarısız');
    }
  };

  const handleReject = async (requestId: number) => {
    if (!token) return;

    const response = await api.post('/api/kitchen/reject-request', { requestId }, token);

    if (response.success) {
      toast.success('Katılma isteği reddedildi');
      loadData();
    } else {
      toast.error('İşlem başarısız');
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!token) return;
    if (!confirm('Bu üyeyi mutfaktan çıkarmak istediğinize emin misiniz?')) return;

    const response = await api.post('/api/kitchen/remove-member', { memberId }, token);

    if (response.success) {
      toast.success('Üye mutfaktan çıkarıldı');
      loadData();
    } else {
      toast.error(response.error?.message || 'İşlem başarısız');
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    if (!token) return;

    const response = await api.post('/api/kitchen/cancel-request', { requestId }, token);

    if (response.success) {
      toast.success('İstek iptal edildi');
      loadData();
    } else {
      toast.error('İşlem başarısız');
    }
  };

  const copyInviteCode = () => {
    if (kitchen?.inviteCode) {
      navigator.clipboard.writeText(kitchen.inviteCode);
      toast.success('Davet kodu kopyalandı');
    }
  };

  const isOwner = kitchen && user && kitchen.ownerId === user.id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col text-[#E0E0E0] pb-24 bg-[#121212]">
      {/* Header */}
      <DashboardHeader />

      {/* Content Container */}
      <div className="max-w-6xl mx-auto w-full">
        {/* Page Title */}
        <div className="px-4 py-4 border-b border-[#2A2A2A]">
          <h1 className="text-white text-2xl font-bold">Mutfak Yönetimi</h1>
        </div>

        <div className="flex flex-col p-4 gap-6">
        {/* Mutfağa Katıl Butonu */}
        <Link
          href="/dashboard/kitchen/join"
          className="flex items-center justify-center gap-2 rounded-lg h-12 px-4 bg-[#30D158] text-[#121212] text-base font-bold hover:bg-[#30D158]/90 transition"
        >
          <span className="material-symbols-outlined">add</span>
          Başka Mutfağa Katıl
        </Link>

        {/* Gönderdiğim Bekleyen İstekler */}
        {myJoinRequests.length > 0 && (
          <div className="flex flex-col rounded-xl bg-[#1E1E1E] p-4 gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-bold">Başka Bir Mutfağa Katıl</h3>
              <span className="px-3 py-1 rounded-full bg-[#FF9500]/20 text-[#FF9500] text-xs font-bold">
                {myJoinRequests.length}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {myJoinRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#121212]"
                >
                  <div className="flex-shrink-0">
                    {request.kitchen.owner.profileImage ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${request.kitchen.owner.profileImage}`}
                        alt={request.kitchen.owner.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-lg">
                        {request.kitchen.owner.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{request.kitchen.name}</p>
                    <p className="text-[#A0A0A0] text-sm truncate">
                      Üye: {request.kitchen.owner.name}
                    </p>
                    <p className="text-[#A0A0A0] text-sm truncate">{request.kitchen.owner.email}</p>
                  </div>

                  <button
                    onClick={() => handleCancelRequest(request.id)}
                    className="flex items-center justify-center px-4 h-10 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition font-medium"
                  >
                    İptal
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mutfak Bilgileri */}
        {kitchen && (
          <div className="flex flex-col rounded-xl bg-[#1E1E1E] p-4 gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-bold">Mutfak Bilgileri</h3>
              {isOwner && (
                <span className="px-3 py-1 rounded-full bg-[#30D158]/20 text-[#30D158] text-xs font-bold">
                  SAHİP
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[#A0A0A0] text-sm">Mutfak Adı</p>
              <p className="text-white text-base font-medium">{kitchen.name}</p>
            </div>

            {isOwner && (
              <div className="flex flex-col gap-2">
                <p className="text-[#A0A0A0] text-sm">Davet Kodu</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#121212] rounded-lg p-3">
                    <p className="text-white text-lg font-mono tracking-wider">
                      {showInviteCode ? kitchen.inviteCode : '••••••'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInviteCode(!showInviteCode)}
                    className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#121212] text-white hover:bg-[#2A2A2C] transition"
                  >
                    <span className="material-symbols-outlined">
                      {showInviteCode ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                  <button
                    onClick={copyInviteCode}
                    className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#30D158] text-[#121212] hover:bg-[#30D158]/90 transition"
                  >
                    <span className="material-symbols-outlined">content_copy</span>
                  </button>
                </div>
                <p className="text-[#A0A0A0] text-xs">
                  Bu kodu paylaşarak başkalarını mutfağınıza davet edebilirsiniz
                </p>
              </div>
            )}
          </div>
        )}

        {/* Bekleyen İstekler */}
        {isOwner && pendingRequests.length > 0 && (
          <div className="flex flex-col rounded-xl bg-[#1E1E1E] p-4 gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-bold">Bekleyen İstekler</h3>
              <span className="px-3 py-1 rounded-full bg-[#FF9500]/20 text-[#FF9500] text-xs font-bold">
                {pendingRequests.length}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#121212]"
                >
                  <div className="flex-shrink-0">
                    {request.user.profileImage ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${request.user.profileImage}`}
                        alt={request.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-lg">
                        {request.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{request.user.name}</p>
                    <p className="text-[#A0A0A0] text-sm truncate">{request.user.email}</p>
                    <p className="text-[#A0A0A0] text-xs mt-1">
                      {new Date(request.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#30D158] text-[#121212] hover:bg-[#30D158]/90 transition"
                    >
                      <span className="material-symbols-outlined text-xl">check</span>
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition"
                    >
                      <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mutfak Üyeleri */}
        {kitchen && kitchen.members && kitchen.members.length > 0 && (
          <div className="flex flex-col rounded-xl bg-[#1E1E1E] p-4 gap-4">
            <h3 className="text-white text-lg font-bold">Mutfak Üyeleri ({kitchen.members.length})</h3>

            <div className="flex flex-col gap-3">
              {kitchen.members.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#121212]"
                >
                  <div className="flex-shrink-0">
                    {member.user.profileImage ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${member.user.profileImage}`}
                        alt={member.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-lg">
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium truncate">{member.user.name}</p>
                      {member.role === 'OWNER' && (
                        <span className="px-2 py-0.5 rounded-full bg-[#30D158]/20 text-[#30D158] text-xs font-bold">
                          SAHİP
                        </span>
                      )}
                    </div>
                    <p className="text-[#A0A0A0] text-sm truncate">{member.user.email}</p>
                  </div>

                  {isOwner && member.user.id !== user?.id && (
                    <button
                      onClick={() => handleRemoveMember(member.user.id)}
                      className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition"
                    >
                      <span className="material-symbols-outlined text-xl">person_remove</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bilgilendirme */}
        {!isOwner && (
          <div className="flex flex-col rounded-xl bg-[#FF9500]/10 border border-[#FF9500]/30 p-4 gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#FF9500]">info</span>
              <p className="text-[#FF9500] font-medium">Bilgilendirme</p>
            </div>
            <p className="text-[#A0A0A0] text-sm">
              Bu mutfağın sahibi değilsiniz. Sadece mutfak sahibi davet kodu görebilir ve üye yönetimi yapabilir.
            </p>
          </div>
        )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

