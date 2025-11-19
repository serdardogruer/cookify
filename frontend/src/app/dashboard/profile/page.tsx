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
  const [customMeals, setCustomMeals] = useState<any[]>([]);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  
  // Kitchen management states
  const [kitchen, setKitchen] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [myJoinRequests, setMyJoinRequests] = useState<any[]>([]);
  const [showInviteCode, setShowInviteCode] = useState(false);
  
  // Join kitchen modal
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  
  // Modules states
  const [modules, setModules] = useState([
    { id: 'recipes', name: 'Tarif Kitabı', description: 'Lezzetli tarifleri keşfedin ve kaydedin', icon: 'menu_book', enabled: true, isCore: true },
    { id: 'shopping', name: 'Alışveriş Listesi', description: 'Malzemelerinizi kolayca takip edin', icon: 'shopping_cart', enabled: true, isCore: true },
    { id: 'pantry', name: 'Kiler Yönetimi', description: 'Evinizdeki malzemeleri yönetin', icon: 'kitchen', enabled: true, isCore: true },
    { id: 'meal-planner', name: 'Haftalık Yemek Planlayıcı', description: 'Öğünlerinizi hafta için planlayın', icon: 'date_range', enabled: true, isCore: false },
    { id: 'nutrition', name: 'Besin Değeri Takibi', description: 'Kalori ve makro besinleri izleyin', icon: 'analytics', enabled: false, isCore: false },
    { id: 'timer', name: 'Mutfak Zamanlayıcı', description: 'Çoklu zamanlayıcılarla yemek yapın', icon: 'timer', enabled: true, isCore: false },
    { id: 'smart-oven', name: 'Akıllı Fırın Entegrasyonu', description: 'Fırınınızı doğrudan uygulamadan kontrol edin', icon: 'oven_gen', enabled: false, isCore: false, badge: 'new', locked: true },
    { id: 'guest-mode', name: 'Misafir Modu', description: 'Misafirleriniz için tarifleri paylaşın', icon: 'group', enabled: false, isCore: false, badge: 'premium', locked: true },
  ]);

  useEffect(() => {
    loadProfile();
    if (activeTab === 'kitchen') {
      loadKitchenData();
    }
  }, [token, activeTab]);

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

    const response = await api.put('/api/profile/update', { name, phone, bio }, token);

    if (response.success) {
      toast.success('Profil güncellendi');
      await loadProfile();
      // Header'ı güncelle
      window.dispatchEvent(new Event('profileUpdated'));
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
        toast.success('Profil resmi güncellendi');
        await loadProfile();
        // Header'ı güncelle
        window.dispatchEvent(new Event('profileUpdated'));
      } else {
        toast.error('Resim yüklenemedi');
      }
    } catch (err: any) {
      toast.error('Resim yüklenemedi');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Çıkış yapıldı');
  };

  const loadKitchenData = async () => {
    if (!token) return;

    const kitchenResponse = await api.get<any>('/api/kitchen', token);
    if (kitchenResponse.success && kitchenResponse.data) {
      setKitchen(kitchenResponse.data);
    }

    const requestsResponse = await api.get<any[]>('/api/kitchen/pending-requests', token);
    if (requestsResponse.success && requestsResponse.data) {
      setPendingRequests(requestsResponse.data);
    }

    const myRequestsResponse = await api.get<any[]>('/api/kitchen/my-join-requests', token);
    if (myRequestsResponse.success && myRequestsResponse.data) {
      setMyJoinRequests(myRequestsResponse.data);
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    if (!token) return;
    const response = await api.post('/api/kitchen/approve-request', { requestId }, token);
    if (response.success) {
      toast.success('Katılma isteği onaylandı');
      loadKitchenData();
    } else {
      toast.error('İşlem başarısız');
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    if (!token) return;
    const response = await api.post('/api/kitchen/reject-request', { requestId }, token);
    if (response.success) {
      toast.success('Katılma isteği reddedildi');
      loadKitchenData();
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
      loadKitchenData();
    } else {
      toast.error(response.error?.message || 'İşlem başarısız');
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    if (!token) return;
    const response = await api.post('/api/kitchen/cancel-request', { requestId }, token);
    if (response.success) {
      toast.success('İstek iptal edildi');
      loadKitchenData();
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

  const toggleModule = (id: string) => {
    setModules(modules.map(m => 
      m.id === id && !m.isCore && !m.locked ? { ...m, enabled: !m.enabled } : m
    ));
  };

  const coreModules = modules.filter(m => m.isCore);
  const additionalModules = modules.filter(m => !m.isCore && !m.locked);
  const comingSoonModules = modules.filter(m => m.locked);

  const handleJoinKitchen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !inviteCode) return;

    const response = await api.post('/api/kitchen/join', { inviteCode }, token);

    if (response.success) {
      toast.success('Katılma isteği gönderildi');
      setShowJoinModal(false);
      setInviteCode('');
      loadKitchenData();
    } else {
      toast.error(response.error?.message || 'İşlem başarısız');
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
    <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col bg-[#121212]">
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
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${profile.profileImage}?t=${Date.now()}`}
                  alt="Profil"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-4xl">
                  {profile?.name?.charAt(0).toUpperCase() || '👤'}
                </div>
              )}
              <label className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#30D158] text-[#121212]">
                <span className="material-symbols-outlined text-xl">
                  {uploading ? 'hourglass_empty' : 'edit'}
                </span>
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
          <button
            onClick={() => setActiveTab('kitchen')}
            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 flex-1 ${
              activeTab === 'kitchen'
                ? 'border-b-[#30D158] text-[#30D158]'
                : 'border-b-transparent text-[#A0A0A0]'
            }`}
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Mutfak Yönetimi</p>
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 flex-1 ${
              activeTab === 'modules'
                ? 'border-b-[#30D158] text-[#30D158]'
                : 'border-b-transparent text-[#A0A0A0]'
            }`}
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Modüller</p>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <form onSubmit={handleUpdate} className="flex flex-col p-4 gap-4">
        <div className="flex flex-col rounded-xl bg-[#1E1E1E] gap-3">
          <label className="flex flex-col w-full border-b border-[#2A2A2A] p-4 pb-3">
            <p className="text-[#A0A0A0] text-xs font-medium leading-normal pb-2">Ad Soyad</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Adınızı girin"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-white focus:outline-0 border-none bg-transparent placeholder:text-[#A0A0A0] text-base font-normal leading-normal"
            />
          </label>

          <label className="flex flex-col w-full border-b border-[#2A2A2A] p-4 pb-3">
            <p className="text-[#A0A0A0] text-xs font-medium leading-normal pb-2">E-posta</p>
            <input
              type="email"
              value={profile?.email || ''}
              readOnly
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-[#A0A0A0] focus:outline-0 border-none bg-transparent text-base font-normal leading-normal cursor-not-allowed"
            />
          </label>

          <label className="flex flex-col w-full border-b border-[#2A2A2A] p-4 pb-3">
            <p className="text-[#A0A0A0] text-xs font-medium leading-normal pb-2">
              Telefon (İsteğe Bağlı)
            </p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Telefon numaranızı girin"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-white focus:outline-0 border-none bg-transparent placeholder:text-[#A0A0A0] text-base font-normal leading-normal"
            />
          </label>

          <label className="flex flex-col w-full p-4">
            <p className="text-[#A0A0A0] text-xs font-medium leading-normal pb-2">Biyografi</p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Kendiniz hakkında kısa bir şeyler yazın..."
              className="form-textarea flex w-full min-w-0 flex-1 resize-none overflow-hidden text-white focus:outline-0 border-none bg-transparent min-h-[100px] placeholder:text-[#A0A0A0] text-base font-normal leading-normal"
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
      )}

      {activeTab === 'kitchen' && (
        <div className="flex flex-col p-4 gap-6">
          {/* Mutfağa Katıl Butonu */}
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex items-center justify-center gap-2 rounded-lg h-12 px-4 bg-[#30D158] text-[#121212] text-base font-bold hover:bg-[#30D158]/90 transition"
          >
            <span className="material-symbols-outlined">add</span>
            Başka Mutfağa Katıl
          </button>

          {/* Gönderdiğim Bekleyen İstekler */}
          {myJoinRequests.length > 0 && (
            <div className="flex flex-col rounded-xl bg-[#1E1E1E] p-4 gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-lg font-bold">Gönderilen İstekler</h3>
                <span className="px-3 py-1 rounded-full bg-[#FF9500]/20 text-[#FF9500] text-xs font-bold">
                  {myJoinRequests.length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {myJoinRequests.map((request: any) => (
                  <div key={request.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#121212]">
                    <div className="flex-shrink-0">
                      {request.kitchen.owner.profileImage ? (
                        <img
                          src={`http://80.253.246.134:5000${request.kitchen.owner.profileImage}`}
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
                      <p className="text-[#A0A0A0] text-sm truncate">{request.kitchen.owner.name}</p>
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
                {pendingRequests.map((request: any) => (
                  <div key={request.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#121212]">
                    <div className="flex-shrink-0">
                      {request.user.profileImage ? (
                        <img
                          src={`http://80.253.246.134:5000${request.user.profileImage}`}
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
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#30D158] text-[#121212] hover:bg-[#30D158]/90 transition"
                      >
                        <span className="material-symbols-outlined text-xl">check</span>
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
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
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#121212]">
                    <div className="flex-shrink-0">
                      {member.user.profileImage ? (
                        <img
                          src={`http://80.253.246.134:5000${member.user.profileImage}`}
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
        </div>
      )}

      {activeTab === 'modules' && (
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
            {comingSoonModules.map((module: any) => (
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
      )}

      {/* Join Kitchen Modal */}
      {showJoinModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowJoinModal(false)}
        >
          <div 
            className="flex w-full max-w-md flex-col overflow-hidden bg-[#121212] rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center border-b border-[#3A3A3C] px-4 py-3">
              <div className="w-8"></div>
              <h2 className="flex-1 text-center text-base font-bold tracking-tight text-white">
                Mutfağa Katıl
              </h2>
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="flex-1 p-4">
              <div className="flex items-start gap-3 rounded-lg bg-blue-500/10 border border-blue-500/30 p-3 mb-4">
                <span className="material-symbols-outlined text-blue-500 text-xl">info</span>
                <div className="flex-1">
                  <p className="text-blue-500 font-medium text-sm mb-1">Nasıl Katılırım?</p>
                  <p className="text-[#A0A0A0] text-xs">
                    Başka bir mutfağa katılmak için mutfak sahibinden davet kodunu alın ve aşağıdaki alana girin.
                    Katılma isteğiniz mutfak sahibi tarafından onaylandıktan sonra o mutfağa erişebilirsiniz.
                  </p>
                </div>
              </div>

              <form onSubmit={handleJoinKitchen} className="space-y-4">
                <label className="flex flex-col">
                  <p className="text-white text-sm font-medium leading-normal pb-2">Davet Kodu</p>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="ABC123"
                    className="form-input flex w-full rounded-lg border border-[#3A3A3C] bg-[#1E1E1E] p-3 text-white text-center text-lg font-mono tracking-wider placeholder:text-[#A0A0A0] focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]"
                    required
                  />
                  <p className="text-[#A0A0A0] text-xs mt-2">
                    Davet kodu 6 karakterden oluşur ve mutfak sahibi tarafından paylaşılır
                  </p>
                </label>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center rounded-lg h-12 px-4 bg-[#30D158] text-[#121212] text-base font-bold hover:bg-[#30D158]/90 transition"
                >
                  Katılma İsteği Gönder
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

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

