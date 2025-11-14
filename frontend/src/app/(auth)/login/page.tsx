'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();

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

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google girişi başarısız');
      return;
    }

    setError('');
    setLoading(true);

    const result = await googleLogin(credentialResponse.credential);

    if (!result.success) {
      setError(result.error || 'Google girişi başarısız');
    }

    setLoading(false);
  };

  const handleGoogleError = () => {
    setError('Google girişi başarısız oldu');
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
                <h2 className="font-bold text-2xl lg:text-4xl leading-tight tracking-tight">
                  Lezzetin
                  <br />
                  Yeni Adresi.
                </h2>
                <p className="mt-3 max-w-md text-base text-white/80">
                  Binlerce tarife ulaşın, kendi tariflerinizi oluşturun ve mutfakta harikalar
                  yaratın.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-6 bg-[#112116] overflow-y-auto">
            <div className="flex flex-col max-w-[420px] flex-1 w-full py-4">
              {/* Header */}
              <div className="flex justify-start mb-4">
                <Link href="/" className="flex items-center gap-2 text-[#19e65e] font-bold text-xl">
                  <span className="text-3xl">🍳</span>
                  <span>Cookify</span>
                </Link>
              </div>

              {/* Page Heading */}
              <div className="flex flex-col gap-1 mb-4">
                <p className="text-white text-3xl font-black leading-tight tracking-[-0.033em]">
                  Giriş Yap
                </p>
                <p className="text-[#9db8a6] text-sm font-normal leading-normal">
                  Mutfağınızı Dijitalleştirin
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-3 bg-red-500/10 border border-red-500 text-red-500 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {/* Email Field */}
                <label className="flex flex-col w-full">
                  <p className="text-white text-sm font-medium leading-normal pb-1.5">
                    E-posta adresiniz
                  </p>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#19e65e]/50 border-none bg-[#29382e] h-11 placeholder:text-[#9db8a6] px-3 py-2 text-sm font-normal leading-normal"
                    placeholder="E-posta adresiniz"
                  />
                </label>

                {/* Password Field */}
                <label className="flex flex-col w-full">
                  <p className="text-white text-sm font-medium leading-normal pb-1.5">Şifre</p>
                  <div className="relative flex w-full flex-1 items-stretch">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#19e65e]/50 border-none bg-[#29382e] h-11 placeholder:text-[#9db8a6] px-3 py-2 text-sm font-normal leading-normal pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                      className="text-[#9db8a6] absolute right-0 top-0 h-full flex items-center justify-center px-3 hover:text-white transition-colors text-sm"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </label>

                {/* Forgot Password */}
                <div className="flex justify-end -mt-1">
                  <button
                    type="button"
                    className="text-[#9db8a6] text-xs underline hover:text-[#19e65e] transition-colors"
                  >
                    Şifremi Unuttum
                  </button>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center w-full h-11 px-4 mt-2 rounded-lg bg-[#19e65e] text-black text-base font-bold leading-normal transition-transform active:scale-95 hover:bg-[#19e65e]/90 focus:outline-none focus:ring-2 focus:ring-[#19e65e]/50 focus:ring-offset-2 focus:ring-offset-[#112116] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-[#29382e]"></div>
                <span className="text-[#9db8a6] text-xs">veya</span>
                <div className="flex-1 h-px bg-[#29382e]"></div>
              </div>

              {/* Google Login Button */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  size="medium"
                  text="signin_with"
                  shape="rectangular"
                  locale="tr"
                  width="100%"
                />
              </div>

              {/* Register Link */}
              <p className="text-center text-[#9db8a6] text-sm font-normal leading-normal mt-4">
                Hesabın yok mu?{' '}
                <Link href="/register" className="font-bold text-[#19e65e] hover:underline">
                  Kayıt Ol
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
