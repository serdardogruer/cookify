'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import Link from 'next/link';

export default function JoinKitchenPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Oturum açmanız gerekiyor');
      return;
    }

    if (!inviteCode.trim()) {
      toast.error('Davet kodu gerekli');
      return;
    }

    setLoading(true);

    const response = await api.post('/api/kitchen/join-request', { inviteCode: inviteCode.trim() }, token);

    setLoading(false);

    if (response.success) {
      toast.success('Katılma isteği gönderildi');
      router.push('/dashboard/kitchen');
    } else {
      toast.error(response.error?.message || 'İşlem başarısız');
    }
  };

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col bg-[#121212]">
      {/* Header */}
      <div className="flex items-center bg-[#121212] p-4 pb-2 justify-between sticky top-0 z-10 border-b border-[#3A3A3C]">
        <Link href="/dashboard/kitchen" className="flex size-12 shrink-0 items-center justify-center">
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </Link>
        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Mutfağa Katıl
        </h2>
        <div className="flex size-12 shrink-0 items-center"></div>
      </div>

      <div className="flex flex-col p-4 gap-6">
        {/* Bilgilendirme */}
        <div className="flex flex-col rounded-xl bg-[#1E1E1E] p-4 gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#30D158]">info</span>
            <h3 className="text-white font-bold">Nasıl Katılırım?</h3>
          </div>
          <p className="text-[#A0A0A0] text-sm">
            Başka bir mutfağa katılmak için mutfak sahibinden davet kodunu alın ve aşağıdaki alana girin.
          </p>
          <p className="text-[#A0A0A0] text-sm">
            Katılma isteğiniz mutfak sahibi tarafından onaylandıktan sonra o mutfağa erişebilirsiniz.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col rounded-xl bg-[#1E1E1E] p-4 gap-4">
            <label className="text-white font-medium">Davet Kodu</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="XXXXXX"
              maxLength={6}
              className="w-full bg-[#121212] text-white text-lg font-mono tracking-wider rounded-lg p-4 text-center uppercase focus:outline-none focus:ring-2 focus:ring-[#30D158]"
              disabled={loading}
            />
            <p className="text-[#A0A0A0] text-xs">
              Davet kodu 6 karakterden oluşur ve mutfak sahibi tarafından paylaşılır
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !inviteCode.trim()}
            className="flex items-center justify-center gap-2 rounded-lg h-12 px-4 bg-[#30D158] text-[#121212] text-base font-bold hover:bg-[#30D158]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin">refresh</span>
                Gönderiliyor...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">send</span>
                Katılma İsteği Gönder
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
