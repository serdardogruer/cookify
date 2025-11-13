'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (!acceptTerms) {
      setError('Kullanım koşullarını kabul etmelisiniz');
      return;
    }

    setLoading(true);

    const result = await register({ name, email, password });

    if (!result.success) {
      setError(result.error || 'Kayıt başarısız');
    }

    setLoading(false);
  };

  const getPasswordStrength = () => {
    if (!password) return { width: '0%', color: 'bg-gray-500', text: '', textColor: '' };
    if (password.length < 6)
      return { width: '25%', color: 'bg-red-500', text: 'Zayıf', textColor: 'text-red-400' };
    if (password.length < 10)
      return { width: '66%', color: 'bg-yellow-500', text: 'Orta', textColor: 'text-yellow-400' };
    return { width: '100%', color: 'bg-green-500', text: 'Güçlü', textColor: 'text-green-400' };
  };

  const strength = getPasswordStrength();

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
                  Hesap Oluştur
                </p>
                <p className="text-[#9db8a6] text-base font-normal leading-normal">
                  Cookify'a hoş geldiniz!
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
                {/* Name Field */}
                <label className="flex flex-col w-full">
                  <p className="text-white text-base font-medium leading-normal pb-2">
                    Adınız Soyadınız
                  </p>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#19e65e]/50 border-none bg-[#29382e] h-14 placeholder:text-[#9db8a6] p-4 text-base font-normal leading-normal"
                    placeholder="Adınız Soyadınız"
                  />
                </label>

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
                      minLength={6}
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
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-[#29382e] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} rounded-full transition-all duration-300`}
                          style={{ width: strength.width }}
                        ></div>
                      </div>
                      <p className={`text-sm ${strength.textColor}`}>{strength.text}</p>
                    </div>
                  )}
                </label>

                {/* Confirm Password Field */}
                <label className="flex flex-col w-full">
                  <p className="text-white text-base font-medium leading-normal pb-2">
                    Şifreyi Onayla
                  </p>
                  <div className="relative flex w-full flex-1 items-stretch">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#19e65e]/50 border-none bg-[#29382e] h-14 placeholder:text-[#9db8a6] p-4 text-base font-normal leading-normal pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Toggle password visibility"
                      className="text-[#9db8a6] absolute right-0 top-0 h-full flex items-center justify-center px-4 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </label>

                {/* Terms Checkbox */}
                <div className="flex items-center gap-3 py-2">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="form-checkbox h-5 w-5 rounded-md border-2 border-[#9db8a6] bg-transparent text-[#19e65e] focus:ring-[#19e65e] focus:ring-offset-[#112116]"
                  />
                  <label htmlFor="terms" className="text-[#9db8a6] text-base font-normal leading-normal">
                    <a href="#" className="underline hover:text-[#19e65e] transition-colors">
                      Kullanım koşullarını
                    </a>{' '}
                    kabul ediyorum
                  </label>
                </div>

                {/* Sign Up Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center w-full h-14 px-6 mt-4 rounded-lg bg-[#19e65e] text-black text-lg font-bold leading-normal transition-transform active:scale-95 hover:bg-[#19e65e]/90 focus:outline-none focus:ring-2 focus:ring-[#19e65e]/50 focus:ring-offset-2 focus:ring-offset-[#112116] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                </button>

                {/* Login Link */}
                <p className="text-center text-[#9db8a6] text-base font-normal leading-normal mt-6">
                  Zaten hesabın var mı?{' '}
                  <Link href="/login" className="font-bold text-[#19e65e] hover:underline">
                    Giriş Yap
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
