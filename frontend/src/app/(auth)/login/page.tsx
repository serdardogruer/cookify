'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login({ email, password });

    if (!result.success) {
      setError(result.error || 'Giriş başarısız');
    }

    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col dark overflow-x-hidden">
      <div className="flex flex-1">
        <div className="flex w-full flex-col md:flex-row">
          {/* Left Column - Image (Desktop Only) */}
          <div className="hidden md:block md:w-1/2 min-h-screen">
            <div
              className="relative h-full w-full bg-center bg-no-repeat bg-cover"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBedyBynm_Auz9dtMcbPff9oifiN1qq4Zo665IWQT1GBQPOwj0pPhnURrtHoW9dKHaaLsBaQH3oV9hxDprLW31132lw7KpFhLL192ymBeYZnfglqXkyhWoxb4vkoZWZfT--LAaUrKWrEUi4io4UECiAjBaFQWQvPxFiNmNf5P3XfnfxG1hQwQbfocsOLVjOmedwwWgdS6fW-fd5S_Zp0sO3AYtMf0roevDpXDm9td6hvdO3aUcJMbCDEsayhhyDueXi4FT4rb5x")',
              }}
            >
              <div className="absolute inset-0 bg-black/50"></div>
              <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
                <h2 className="font-bold text-3xl lg:text-5xl leading-tight tracking-tight">
                  Lezzetin
                  <br />
                  Yeni Adresi.
                </h2>
                <p className="mt-4 max-w-md text-lg text-white/80">
                  Binlerce tarife ulaşın, kendi tariflerinizi oluşturun ve mutfakta harikalar
                  yaratın.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 bg-[#112116]">
            <div className="flex flex-col max-w-[480px] flex-1">
              {/* Header */}
              <div className="flex justify-start mb-8">
                <Link href="/" className="flex items-center gap-2 text-[#19e65e] font-bold text-2xl">
                  <span className="text-4xl">🍳</span>
                  <span>Cookify</span>
                </Link>
              </div>

              {/* Page Heading */}
              <div className="flex flex-col gap-2 mb-8">
                <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                  Giriş Yap
                </p>
                <p className="text-[#9db8a6] text-base font-normal leading-normal">
                  Mutfağınızı Dijitalleştirin
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Email Field */}
                <label className="flex flex-col w-full">
                  <p className="text-white text-base font-medium leading-normal pb-2">
                    E-posta adresiniz
                  </p>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#19e65e]/50 border-none bg-[#29382e] h-14 placeholder:text-[#9db8a6] p-4 text-base font-normal leading-normal"
                    placeholder="E-posta adresiniz"
                  />
                </label>

                {/* Password Field */}
                <label className="flex flex-col w-full">
                  <p className="text-white text-base font-medium leading-normal pb-2">Şifre</p>
                  <div className="relative flex w-full flex-1 items-stretch">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#19e65e]/50 border-none bg-[#29382e] h-14 placeholder:text-[#9db8a6] p-4 text-base font-normal leading-normal pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                      className="text-[#9db8a6] absolute right-0 top-0 h-full flex items-center justify-center px-4 hover:text-white transition-colors"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </label>

                {/* Forgot Password */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-[#9db8a6] text-sm underline hover:text-[#19e65e] transition-colors"
                  >
                    Şifremi Unuttum
                  </button>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center w-full h-14 px-6 mt-4 rounded-lg bg-[#19e65e] text-black text-lg font-bold leading-normal transition-transform active:scale-95 hover:bg-[#19e65e]/90 focus:outline-none focus:ring-2 focus:ring-[#19e65e]/50 focus:ring-offset-2 focus:ring-offset-[#112116] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </button>

                {/* Register Link */}
                <p className="text-center text-[#9db8a6] text-base font-normal leading-normal mt-6">
                  Hesabın yok mu?{' '}
                  <Link href="/register" className="font-bold text-[#19e65e] hover:underline">
                    Kayıt Ol
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
