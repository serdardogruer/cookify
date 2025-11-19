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

export default function RecipeSearchPage() {
  const router = useRouter();
  const { token } = useAuth();
  useSwipeNavigation();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]); // Tüm tarifler
  const [pantryIngredients, setPantryIngredients] = useState<string[]>([]); // Dolaptaki malzemeler
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [useMyIngredients, setUseMyIngredients] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [difficulty, setDifficulty] = useState('');
  const [maxTime, setMaxTime] = useState(120);
  const [loading, setLoading] = useState(true);

  const categories = [
    'Tümü',
    'Kahvaltı',
    'Ana Yemek',
    'Çorba',
    'Salata',
    'Tatlı',
    'İçecek',
  ];

  useEffect(() => {
    loadRecipes();
  }, [token]);

  const loadRecipes = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    // Tarifleri yükle
    const response = await api.get<Recipe[]>('/api/recipes', token);
    if (response.success && response.data) {
      setAllRecipes(response.data);
      setRecipes(response.data);
    }

    // Dolaptaki malzemeleri yükle
    const pantryResponse = await api.get<any[]>('/api/pantry', token);
    if (pantryResponse.success && pantryResponse.data) {
      const ingredients = pantryResponse.data
        .filter((item: any) => item.quantity > 0)
        .map((item: any) => item.name.toLowerCase());
      setPantryIngredients(ingredients);
    }

    setLoading(false);
  };

  // Dolabıma göre filtrele
  const filterByMyIngredients = () => {
    if (!useMyIngredients) {
      // Tüm tarifleri göster
      setRecipes(allRecipes);
      return;
    }

    // Dolaptaki malzemelerle yapılabilecek tarifleri filtrele
    const filtered = allRecipes.filter((recipe) => {
      // Tarifin malzemelerini kontrol et
      const recipeIngredients = recipe.ingredients?.map((ing: any) => 
        ing.name.toLowerCase()
      ) || [];

      // En az %50 malzeme dolabımda varsa göster
      const availableCount = recipeIngredients.filter((ing: string) =>
        pantryIngredients.some((pantryIng) => 
          pantryIng.includes(ing) || ing.includes(pantryIng)
        )
      ).length;

      const matchPercentage = recipeIngredients.length > 0 
        ? (availableCount / recipeIngredients.length) * 100 
        : 0;

      return matchPercentage >= 50; // En az %50 eşleşme
    });

    setRecipes(filtered);
  };

  // useMyIngredients değiştiğinde filtreleme yap
  useEffect(() => {
    if (allRecipes.length > 0) {
      filterByMyIngredients();
    }
  }, [useMyIngredients]);

  const getDifficultyText = (diff: string) => {
    switch (diff) {
      case 'EASY':
        return 'Kolay';
      case 'MEDIUM':
        return 'Orta';
      case 'HARD':
        return 'Zor';
      default:
        return diff;
    }
  };

  // Tarif için eşleşme bilgilerini hesapla
  const getRecipeMatchInfo = (recipe: Recipe) => {
    if (!useMyIngredients || pantryIngredients.length === 0) return null;

    const recipeIngredients = recipe.ingredients?.map((ing: any) => ing.name.toLowerCase()) || [];
    if (recipeIngredients.length === 0) return null;

    const availableCount = recipeIngredients.filter((ing: string) =>
      pantryIngredients.some((pantryIng) => pantryIng.includes(ing) || ing.includes(pantryIng))
    ).length;

    const missingCount = recipeIngredients.length - availableCount;
    const percentage = Math.round((availableCount / recipeIngredients.length) * 100);

    return { missing: missingCount, percentage };
  };

  // Filtreleme
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Tümü' || recipe.category === selectedCategory;
    const matchesDifficulty = !difficulty || recipe.difficulty === difficulty;
    const matchesTime = !recipe.prepTime || recipe.prepTime <= maxTime;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesTime;
  });

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
          {/* Page Header */}
          <div className="px-4 py-4">
            <h1 className="text-white text-2xl font-bold">Tarif Ara</h1>
          </div>

          {/* Search Bar */}
          <div className="px-4 pb-4">
            <div className="flex w-full items-stretch rounded-lg h-14 bg-[#1E1E1E]">
              <div className="flex items-center justify-center pl-4 text-[#A0A0A0]">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-white placeholder:text-[#A0A0A0] px-4 focus:outline-none"
                placeholder="Makarna, tavuk, çorba..."
              />
            </div>
          </div>

          {/* Search Type Buttons */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setUseMyIngredients(true)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  useMyIngredients
                    ? 'bg-[#30D158] text-white'
                    : 'bg-[#1E1E1E] text-white hover:bg-[#30D158]/10'
                }`}
              >
                <span className="material-symbols-outlined text-2xl">kitchen</span>
                <div className="flex flex-col items-start">
                  <p className="text-sm font-bold">Dolabıma Göre</p>
                  <p className="text-xs opacity-80">Malzemelerimle ara</p>
                </div>
              </button>
              <button
                onClick={() => setUseMyIngredients(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  !useMyIngredients
                    ? 'bg-[#30D158] text-white'
                    : 'bg-[#1E1E1E] text-white hover:bg-[#30D158]/10'
                }`}
              >
                <span className="material-symbols-outlined text-2xl">restaurant</span>
                <div className="flex flex-col items-start">
                  <p className="text-sm font-bold">Malzemeye Göre</p>
                  <p className="text-xs opacity-80">Tüm tarifler</p>
                </div>
              </button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-3 px-4 pb-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none]">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 ${
                  selectedCategory === category
                    ? 'bg-[#30D158] text-white font-bold'
                    : 'bg-[#1E1E1E] text-white hover:bg-[#30D158]/10'
                }`}
              >
                <p className="text-sm">{category}</p>
              </button>
            ))}
          </div>

          {/* Advanced Filters */}
          <div className="px-4 pb-4">
            <details
              className="flex flex-col rounded-lg bg-[#1E1E1E] group"
              open={showFilters}
            >
              <summary
                className="flex cursor-pointer list-none items-center justify-between gap-6 p-4"
                onClick={(e) => {
                  e.preventDefault();
                  setShowFilters(!showFilters);
                }}
              >
                <p className="text-white text-base font-bold leading-normal">
                  Gelişmiş Filtreler
                </p>
                <span
                  className={`material-symbols-outlined text-white transition-transform ${
                    showFilters ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </summary>
              {showFilters && (
                <div className="flex flex-col gap-6 p-4 pt-0">
                  {/* Difficulty */}
                  <div>
                    <p className="text-white text-sm font-medium mb-2">Zorluk</p>
                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-[#121212] p-1">
                      {['EASY', 'MEDIUM', 'HARD'].map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setDifficulty(difficulty === diff ? '' : diff)}
                          className={`rounded-md py-2 text-sm font-semibold ${
                            difficulty === diff
                              ? 'bg-[#30D158] text-white'
                              : 'bg-[#1E1E1E] text-white'
                          }`}
                        >
                          {getDifficultyText(diff)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time */}
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="text-white text-sm font-medium">Süre</p>
                      <p className="text-[#A0A0A0] text-xs font-medium">
                        10 - {maxTime} dk
                      </p>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="120"
                      value={maxTime}
                      onChange={(e) => setMaxTime(parseInt(e.target.value))}
                      className="w-full h-2 bg-[#121212] rounded-lg appearance-none cursor-pointer accent-[#30D158]"
                    />
                  </div>
                </div>
              )}
            </details>
          </div>

          {/* Results */}
          <div className="px-4 pb-24">
            <p className="text-[#A0A0A0] text-sm mb-4">
              {filteredRecipes.length} tarif bulundu
            </p>
            {filteredRecipes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-6xl text-[#30D158] mb-4">
                  search_off
                </span>
                <p className="text-white text-lg font-bold mb-2">Sonuç bulunamadı</p>
                <p className="text-[#A0A0A0] text-sm">Farklı filtreler dene</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredRecipes
                  .sort((a, b) => {
                    // Dolabıma göre modunda eşleşme yüzdesine göre sırala
                    if (useMyIngredients) {
                      const matchA = getRecipeMatchInfo(a);
                      const matchB = getRecipeMatchInfo(b);
                      if (matchA && matchB) {
                        return matchB.percentage - matchA.percentage; // Büyükten küçüğe
                      }
                    }
                    return 0; // Normal modda sıralama yapma
                  })
                  .map((recipe) => (
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

                      {/* Eşleşme bilgisi */}
                      {(() => {
                        const matchInfo = getRecipeMatchInfo(recipe);
                        if (matchInfo) {
                          return (
                            <div className="mt-2 flex items-center gap-2">
                              <div className={`text-xs font-bold ${matchInfo.percentage >= 70 ? 'text-green-400' : matchInfo.percentage >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                %{matchInfo.percentage} eşleşme
                              </div>
                              {matchInfo.missing > 0 && (
                                <div className="text-xs text-red-400">
                                  • {matchInfo.missing} eksik
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}

                      <div className="flex items-center gap-2 mt-3">
                        {recipe.user.profileImage ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${recipe.user.profileImage}`}
                            alt={recipe.user.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-xs text-white">
                              person
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-white">{recipe.user.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}

