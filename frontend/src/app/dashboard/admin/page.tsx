'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';

export default function AdminPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'ingredients'>('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Admin kontrolü
    if (user && !user.isAdmin) {
      toast.error('Bu sayfaya erişim yetkiniz yok');
      router.push('/dashboard');
      return;
    }

    if (token) {
      loadData();
    }
  }, [token, user]);

  const loadData = async () => {
    if (!token) return;

    try {
      const [statsRes, usersRes, ingredientsRes] = await Promise.all([
        api.get('/api/admin/stats', token),
        api.get('/api/admin/users', token),
        api.get('/api/admin/ingredients', token),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
      if (ingredientsRes.success) setIngredients(ingredientsRes.data);
    } catch (error) {
      console.error('Admin data load error:', error);
      toast.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
          <div className="text-white">Yükleniyor...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="relative flex h-auto min-h-screen w-full flex-col text-[#E0E0E0] pb-24 bg-[#121212]">
        <DashboardHeader />

        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="px-4 py-4">
            <h1 className="text-white text-2xl font-bold">Admin Panel</h1>
            <p className="text-[#A0A0A0] text-sm">Sistem yönetimi ve istatistikler</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'stats'
                  ? 'bg-[#30D158] text-white'
                  : 'bg-[#1E1E1E] text-white hover:bg-[#30D158]/10'
              }`}
            >
              İstatistikler
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'users'
                  ? 'bg-[#30D158] text-white'
                  : 'bg-[#1E1E1E] text-white hover:bg-[#30D158]/10'
              }`}
            >
              Kullanıcılar ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'ingredients'
                  ? 'bg-[#30D158] text-white'
                  : 'bg-[#1E1E1E] text-white hover:bg-[#30D158]/10'
              }`}
            >
              Malzemeler ({ingredients.length})
            </button>
          </div>

          {/* Content */}
          <div className="px-4 pb-24">
            {/* Stats Tab */}
            {activeTab === 'stats' && stats && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-[#1E1E1E] rounded-lg p-4">
                  <p className="text-[#A0A0A0] text-sm mb-1">Toplam Kullanıcı</p>
                  <p className="text-white text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <div className="bg-[#1E1E1E] rounded-lg p-4">
                  <p className="text-[#A0A0A0] text-sm mb-1">Toplam Mutfak</p>
                  <p className="text-white text-3xl font-bold">{stats.totalKitchens}</p>
                </div>
                <div className="bg-[#1E1E1E] rounded-lg p-4">
                  <p className="text-[#A0A0A0] text-sm mb-1">Toplam Tarif</p>
                  <p className="text-white text-3xl font-bold">{stats.totalRecipes}</p>
                </div>
                <div className="bg-[#1E1E1E] rounded-lg p-4">
                  <p className="text-[#A0A0A0] text-sm mb-1">Dolap Ürünleri</p>
                  <p className="text-white text-3xl font-bold">{stats.totalPantryItems}</p>
                </div>
                <div className="bg-[#1E1E1E] rounded-lg p-4">
                  <p className="text-[#A0A0A0] text-sm mb-1">Market Ürünleri</p>
                  <p className="text-white text-3xl font-bold">{stats.totalMarketItems}</p>
                </div>
                <div className="bg-[#1E1E1E] rounded-lg p-4">
                  <p className="text-[#A0A0A0] text-sm mb-1">Malzeme Veritabanı</p>
                  <p className="text-white text-3xl font-bold">{stats.totalIngredients}</p>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#121212]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">İsim</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Tarifler</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Mutfaklar</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Kayıt Tarihi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2A2A]">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-[#2A2A2A]">
                          <td className="px-4 py-3 text-sm text-white">
                            {user.name}
                            {user.isAdmin && (
                              <span className="ml-2 text-xs bg-[#30D158] text-white px-2 py-0.5 rounded">
                                Admin
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#A0A0A0]">{user.email}</td>
                          <td className="px-4 py-3 text-sm text-white">{user._count.recipes}</td>
                          <td className="px-4 py-3 text-sm text-white">{user._count.ownedKitchens}</td>
                          <td className="px-4 py-3 text-sm text-[#A0A0A0]">
                            {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Ingredients Tab */}
            {activeTab === 'ingredients' && (
              <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#121212]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Malzeme</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Kategori</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Varsayılan Birim</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Raf Ömrü</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2A2A]">
                      {ingredients.map((ingredient) => (
                        <tr key={ingredient.id} className="hover:bg-[#2A2A2A]">
                          <td className="px-4 py-3 text-sm text-white">{ingredient.name}</td>
                          <td className="px-4 py-3 text-sm text-[#A0A0A0]">{ingredient.category.name}</td>
                          <td className="px-4 py-3 text-sm text-white">{ingredient.defaultUnit}</td>
                          <td className="px-4 py-3 text-sm text-[#A0A0A0]">
                            {ingredient.shelfLifeDays ? `${ingredient.shelfLifeDays} gün` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
