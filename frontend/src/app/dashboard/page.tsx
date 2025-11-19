'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { api } from '@/lib/api';
import { Recipe } from '@/types/recipe';
import { toast } from '@/lib/toast';
import MealConsumptionModal from '@/components/MealConsumptionModal';

export default function DashboardPage() {
  const router = useRouter();
  const { token } = useAuth();
  useSwipeNavigation();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pantryCount, setPantryCount] = useState(0);
  const [marketCount, setMarketCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMealModal, setShowMealModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadData();
    checkMealPopup();
  }, [token]);

  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      console.log('Scroll:', { scrollTop, scrollHeight, clientHeight, diff: scrollHeight - (scrollTop + clientHeight) });

      if (scrollTop + clientHeight >= scrollHeight - 500) {
        console.log('Loading more recipes...');
        loadMoreRecipes();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, page, token]);

  const loadMoreRecipes = async () => {
    if (!token || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    const response = await api.get<Recipe[]>(`/api/recipes?limit=20&page=${nextPage}`, token);
    
    if (response.success && response.data && Array.isArray(response.data)) {
      const newRecipes = response.data as Recipe[];
      setRecipes(prev => [...prev, ...newRecipes]);
      setPage(nextPage);
      setHasMore(newRecipes.length === 20);
    }

    setLoadingMore(false);
  };

  const checkMealPopup = () => {
    const lastShown = localStorage.getItem('lastMealPopup');
    const today = new Date().toDateString();
    
    if (lastShown !== today) {
      // 3 saniye sonra göster (kullanıcı sayfayı görsün)
      setTimeout(() => {
        setShowMealModal(true);
        localStorage.setItem('lastMealPopup', today);
      }, 3000);
    }
  };

  const loadData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    // Load recipes
    const recipesResponse = await api.get<Recipe[]>('/api/recipes?limit=20&page=1', token);
    if (recipesResponse.success && recipesResponse.data) {
      setRecipes(recipesResponse.data);
      setHasMore(recipesResponse.data.length === 20);
    }

    // Load pantry count
    const pantryResponse = await api.get<any[]>('/api/pantry', token);
    if (pantryResponse.success && pantryResponse.data) {
      setPantryCount(pantryResponse.data.length);
    }

    // Load market count
    const marketResponse = await api.get<any[]>('/api/market', token);
    if (marketResponse.success && marketResponse.data) {
      setMarketCount(marketResponse.data.length);
    }

    setLoading(false);
  };

  const handleMealSubmit = async (category: string, servings: number) => {
    if (!token) return;

    try {
      // Backend'e yemek tüketimi kaydet
      const response = await api.post(
        '/api/consumption/log',
        { category, servings },
        token
      );

      if (response.success) {
        toast.success('Tüketim kaydedildi! Malzemeler güncellendi.');
      } else {
        toast.error('Kayıt başarısız');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'Kolay';
      case 'MEDIUM':
        return 'Orta';
      case 'HARD':
        return 'Zor';
      default:
        return difficulty;
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

  return (
    <ProtectedRoute>
      <div className="relative flex h-auto min-h-screen w-full flex-col text-[#E0E0E0] pb-24 bg-[#121212]">
        {/* Header */}
        <DashboardHeader />

        {/* Content Container */}
        <div className="max-w-6xl mx-auto w-full">
          {/* Stats Cards */}
          <div className="flex gap-3 px-4 py-4 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex min-w-[170px] flex-1 flex-col gap-2 rounded-lg p-4 bg-[#1E1E1E]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#A0A0A0]">kitchen</span>
              <p className="text-[#A0A0A0] text-base font-medium leading-normal">Dolabımda</p>
            </div>
            <p className="text-white tracking-light text-2xl font-bold leading-tight">
              {pantryCount} malzeme
            </p>
          </div>

          <div className="flex min-w-[170px] flex-1 flex-col gap-2 rounded-lg p-4 bg-[#1E1E1E]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#A0A0A0]">shopping_cart</span>
              <p className="text-[#A0A0A0] text-base font-medium leading-normal">Market Listem</p>
            </div>
            <p className="text-white tracking-light text-2xl font-bold leading-tight">
              {marketCount} ürün
            </p>
          </div>

          <div className="flex min-w-[170px] flex-1 flex-col gap-2 rounded-lg p-4 bg-[#1E1E1E]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#A0A0A0]">menu_book</span>
              <p className="text-[#A0A0A0] text-base font-medium leading-normal">Tariflerim</p>
            </div>
            <p className="text-white tracking-light text-2xl font-bold leading-tight">
              {recipes.length} tarif
            </p>
          </div>
        </div>

        {/* Latest Recipes Section */}
        <div className="flex justify-between items-center px-4 pb-2 pt-6">
          <h3 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">
            Son Tariflerim
          </h3>
          <button
            onClick={() => router.push('/dashboard/recipe-search')}
            className="text-[#30D158] text-sm font-bold hover:underline"
          >
            Tümünü Gör
          </button>
        </div>

        {recipes.length === 0 ? (
          <div className="flex flex-col px-4 py-6">
            <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-[#1E1E1E]">
              <span className="material-symbols-outlined text-6xl text-[#30D158]">cake</span>
              <div className="flex max-w-[480px] flex-col items-center gap-2 text-center">
                <p className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                  Henüz hiç tarifin yok.
                </p>
                <p className="text-[#A0A0A0] text-sm font-normal leading-normal">
                  Yeni tarifler ekleyerek mutfak maceralarına başla!
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard/recipe-add')}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#30D158] text-[#121212] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#30D158]/90 transition-colors"
              >
                <span className="truncate">İlk Tarifini Ekle</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => router.push(`/dashboard/recipe-detail/${recipe.id}`)}
                className="flex flex-col gap-3 pb-3 cursor-pointer hover:opacity-80 transition-opacity"
              >
                {/* Recipe Image */}
                <div className="relative w-full">
                  <div className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-xl bg-gray-700">
                    {recipe.image ? (
                      <img
                        src={
                          recipe.image.startsWith('http')
                            ? recipe.image
                            : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${recipe.image}`
                        }
                        alt={recipe.title}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl rounded-xl">
                        🍽️
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 left-2 bg-[#30D158]/20 text-[#30D158] text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                    {getDifficultyText(recipe.difficulty)}
                  </div>
                </div>

                {/* Recipe Info */}
                <div>
                  <p className="text-white text-base font-bold leading-normal line-clamp-1">
                    {recipe.title}
                  </p>
                  {recipe.description && (
                    <p className="text-[#A0A0A0] text-sm font-normal leading-normal line-clamp-2">
                      {recipe.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-[#A0A0A0]">
                    {recipe.prepTime && (
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">timer</span>
                        <span className="text-xs">{recipe.prepTime} dk</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">restaurant</span>
                      <span className="text-xs">{recipe.servings}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    {recipe.user.profileImage ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${recipe.user.profileImage}`}
                        alt={recipe.user.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                        <span className="material-symbols-outlined text-xs text-white">person</span>
                      </div>
                    )}
                    <span className="text-xs text-white">{recipe.user.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="flex justify-center py-8">
            <div className="text-[#A0A0A0]">Daha fazla tarif yükleniyor...</div>
          </div>
        )}

        {!hasMore && recipes.length > 0 && (
          <div className="flex justify-center py-8">
            <div className="text-[#A0A0A0]">Tüm tarifler yüklendi</div>
          </div>
        )}

        {/* Scroll Trigger */}
        {hasMore && !loadingMore && recipes.length > 0 && (
          <div 
            ref={(el) => {
              if (el && hasMore && !loadingMore) {
                const observer = new IntersectionObserver(
                  (entries) => {
                    if (entries[0].isIntersecting) {
                      console.log('Intersection triggered!');
                      loadMoreRecipes();
                    }
                  },
                  { threshold: 0.1 }
                );
                observer.observe(el);
                return () => observer.disconnect();
              }
            }}
            className="h-20"
          />
        )}

        </div>

        {/* Floating Add Recipe Button */}
        <button
          onClick={() => router.push('/dashboard/recipe-add')}
          className="fixed bottom-24 right-4 lg:bottom-8 flex items-center justify-center w-14 h-14 bg-[#30D158] rounded-full shadow-lg shadow-[#30D158]/20 hover:bg-[#30D158]/90 transition-colors z-10"
          title="Tarif Ekle"
        >
          <span className="material-symbols-outlined text-3xl text-[#121212]">add</span>
        </button>

        {/* Bottom Navigation */}
        <BottomNav />

        {/* Meal Consumption Modal */}
        <MealConsumptionModal
          isOpen={showMealModal}
          onClose={() => setShowMealModal(false)}
          onSubmit={handleMealSubmit}
        />
      </div>
    </ProtectedRoute>
  );
}


