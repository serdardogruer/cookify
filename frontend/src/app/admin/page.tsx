'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import UserManagementTable from '@/components/admin/UserManagementTable';
import CategoryForm from '@/components/admin/CategoryForm';
import KitchenDetailsModal from '@/components/admin/KitchenDetailsModal';
import LogViewer from '@/components/admin/LogViewer';
import SettingsForm from '@/components/admin/SettingsForm';
import IngredientManagement from '@/components/admin/IngredientManagement';

export default function AdminPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'categories' | 'kitchens' | 'logs' | 'settings' | 'ingredients'>('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Admin kontrolü
    if (user && !(user as any).isAdmin) {
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
      const [statsRes, usersRes, categoriesRes, kitchensRes, ingredientsRes] = await Promise.all([
        api.get('/api/admin/stats', token),
        api.get('/api/admin/users', token),
        api.get('/api/admin/categories', token),
        api.get('/api/admin/kitchens', token),
        api.get('/api/admin/ingredients', token),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data as any);
      if (categoriesRes.success) setCategories(categoriesRes.data as any);
      if (kitchensRes.success) setKitchens((kitchensRes.data as any).kitchens);
      if (ingredientsRes.success) setIngredients(ingredientsRes.data as any);
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

  if (!(user as any)?.isAdmin) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#121212] text-[#E0E0E0]">
        {/* Admin Header */}
        <div className="bg-[#1E1E1E] border-b border-[#3A3A3C] sticky top-0 z-10">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-[#A0A0A0] hover:text-white">
                <span className="material-symbols-outlined">arrow_back</span>
              </Link>
              <div>
                <h1 className="text-white text-2xl font-bold">Admin Panel</h1>
                <p className="text-[#A0A0A0] text-sm">Sistem yönetimi ve istatistikler</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#A0A0A0] text-sm">{(user as any)?.name}</span>
              <div className="w-10 h-10 rounded-full bg-[#30D158] flex items-center justify-center text-white font-bold">
                {(user as any)?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-[#1E1E1E] border-r border-[#3A3A3C] min-h-[calc(100vh-73px)] sticky top-[73px]">
            <nav className="p-4 space-y-2">
              <button
                onClick={() => setActiveTab('stats')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'stats'
                    ? 'bg-[#30D158] text-white'
                    : 'text-[#E0E0E0] hover:bg-[#2A2A2A]'
                }`}
              >
                <span className="material-symbols-outlined text-xl">bar_chart</span>
                <span>İstatistikler</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'bg-[#30D158] text-white'
                    : 'text-[#E0E0E0] hover:bg-[#2A2A2A]'
                }`}
              >
                <span className="material-symbols-outlined text-xl">group</span>
                <span>Kullanıcılar</span>
                <span className="ml-auto text-xs bg-[#3A3A3C] px-2 py-1 rounded">{users.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'categories'
                    ? 'bg-[#30D158] text-white'
                    : 'text-[#E0E0E0] hover:bg-[#2A2A2A]'
                }`}
              >
                <span className="material-symbols-outlined text-xl">category</span>
                <span>Kategoriler</span>
                <span className="ml-auto text-xs bg-[#3A3A3C] px-2 py-1 rounded">{categories.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('kitchens')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'kitchens'
                    ? 'bg-[#30D158] text-white'
                    : 'text-[#E0E0E0] hover:bg-[#2A2A2A]'
                }`}
              >
                <span className="material-symbols-outlined text-xl">kitchen</span>
                <span>Mutfaklar</span>
                <span className="ml-auto text-xs bg-[#3A3A3C] px-2 py-1 rounded">{kitchens.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'logs'
                    ? 'bg-[#30D158] text-white'
                    : 'text-[#E0E0E0] hover:bg-[#2A2A2A]'
                }`}
              >
                <span className="material-symbols-outlined text-xl">description</span>
                <span>Loglar</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-[#30D158] text-white'
                    : 'text-[#E0E0E0] hover:bg-[#2A2A2A]'
                }`}
              >
                <span className="material-symbols-outlined text-xl">settings</span>
                <span>Ayarlar</span>
              </button>
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'ingredients'
                    ? 'bg-[#30D158] text-white'
                    : 'text-[#E0E0E0] hover:bg-[#2A2A2A]'
                }`}
              >
                <span className="material-symbols-outlined text-xl">inventory_2</span>
                <span>Malzemeler</span>
                <span className="ml-auto text-xs bg-[#3A3A3C] px-2 py-1 rounded">{ingredients.length}</span>
              </button>
              <Link
                href="/admin/modules"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-[#E0E0E0] hover:bg-[#2A2A2A]"
              >
                <span className="material-symbols-outlined text-xl">extension</span>
                <span>Modüller</span>
              </Link>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
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
            {activeTab === 'users' && token && (
              <UserManagementTable users={users} token={token} onUpdate={loadData} />
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && token && (
              <CategoryForm categories={categories} token={token} onUpdate={loadData} />
            )}

            {/* Kitchens Tab */}
            {activeTab === 'kitchens' && token && (
              <KitchenDetailsModal kitchens={kitchens} token={token} onUpdate={loadData} />
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && token && <LogViewer token={token} />}

            {/* Settings Tab */}
            {activeTab === 'settings' && token && <SettingsForm token={token} />}

            {/* Ingredients Tab */}
            {activeTab === 'ingredients' && token && (
              <IngredientManagement 
                ingredients={ingredients} 
                categories={categories} 
                token={token} 
                onUpdate={loadData} 
              />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
