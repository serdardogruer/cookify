'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Recipe } from '@/types/recipe';

export default function SearchRecipesPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [searchMode, setSearchMode] = useState<'normal' | 'pantry' | 'ingredient'>('normal');
  const [filters, setFilters] = useState({
    difficulty: '',
    category: '',
    cuisine: '',
    maxPrepTime: '',
  });

  useEffect(() => {
    loadAllRecipes();
  }, []);

  const loadAllRecipes = async () => {
    setLoading(true);
    const response = await api.get<Recipe[]>('/api/recipes');
    if (response.success && response.data) {
      setRecipes(response.data);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadAllRecipes();
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({ q: searchQuery });
    
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.category) params.append('category', filters.category);
    if (filters.cuisine) params.append('cuisine', filters.cuisine);
    if (filters.maxPrepTime) params.append('maxPrepTime', filters.maxPrepTime);

    const response = await api.get<Recipe[]>(`/api/recipes/search?${params}`);
    if (response.success && response.data) {
      setRecipes(response.data);
    }
    setLoading(false);
  };

  const searchByPantry = async () => {
    if (!token) return;
    
    setLoading(true);
    setSearchMode('pantry');
    
    // Dolaptaki malzemeleri al
    const pantryResponse = await api.get<any[]>('/api/pantry', token);
    if (!pantryResponse.success || !pantryResponse.data) {
      setLoading(false);
      return;
    }

    const pantryIngredients = pantryResponse.data.map((item: any) => 
      item.name.toLowerCase()
    );

    // Tüm tarifleri al ve filtrele
    const recipesResponse = await api.get<Recipe[]>('/api/recipes');
    if (recipesResponse.success && recipesResponse.data) {
      // Dolaptaki malzemelerle yapılabilecek tarifleri filtrele
      const matchingRecipes = recipesResponse.data.filter((recipe) => {
        const recipeIngredients = recipe.ingredients.map((ing) => 
          ing.name.toLowerCase()
        );
        
        // En az %50 malzeme dolabımızda varsa göster
        const matchCount = recipeIngredients.filter((ing) =>
          pantryIngredients.some((pantryIng) => 
            ing.includes(pantryIng) || pantryIng.includes(ing)
          )
        ).length;
        
        const matchPercentage = (matchCount / recipeIngredients.length) * 100;
        return matchPercentage >= 50;
      });

      // Eşleşme yüzdesine göre sırala
      matchingRecipes.sort((a, b) => {
        const aMatch = a.ingredients.filter((ing) =>
          pantryIngredients.some((pantryIng) => 
            ing.name.toLowerCase().includes(pantryIng) || 
            pantryIng.includes(ing.name.toLowerCase())
          )
        ).length / a.ingredients.length;
        
        const bMatch = b.ingredients.filter((ing) =>
          pantryIngredients.some((pantryIng) => 
            ing.name.toLowerCase().includes(pantryIng) || 
            pantryIng.includes(ing.name.toLowerCase())
          )
        ).length / b.ingredients.length;
        
        return bMatch - aMatch;
      });

      setRecipes(matchingRecipes);
    }
    setLoading(false);
  };

  const searchByIngredient = async () => {
    if (!ingredientSearch.trim()) return;
    
    setLoading(true);
    setSearchMode('ingredient');
    
    const response = await api.get<Recipe[]>('/api/recipes');
    if (response.success && response.data) {
      const filtered = response.data.filter((recipe) =>
        recipe.ingredients.some((ing) =>
          ing.name.toLowerCase().includes(ingredientSearch.toLowerCase())
        )
      );
      setRecipes(filtered);
    }
    setLoading(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      difficulty: '',
      category: '',
      cuisine: '',
      maxPrepTime: '',
    });
    loadAllRecipes();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-600';
      case 'MEDIUM':
        return 'bg-yellow-600';
      case 'HARD':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
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

  return (
    <ProtectedRoute>
      <Header />
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">🔍 Tarif Ara</h1>
            <p className="text-gray-400">
              {recipes.length} tarif bulundu
              {searchMode === 'pantry' && ' (Dolabıma göre)'}
              {searchMode === 'ingredient' && ` (${ingredientSearch} içeren)`}
            </p>
          </div>

          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="w-64 space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">🔍 Arama Türü</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSearchMode('normal');
                      loadAllRecipes();
                    }}
                    className={`w-full text-left px-4 py-3 rounded transition ${
                      searchMode === 'normal'
                        ? 'bg-blue-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    📝 Normal Arama
                  </button>
                  <button
                    onClick={searchByPantry}
                    className={`w-full text-left px-4 py-3 rounded transition ${
                      searchMode === 'pantry'
                        ? 'bg-green-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    🏠 Dolabıma Göre Ara
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">🥘 Malzemeye Göre</h2>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={ingredientSearch}
                    onChange={(e) => setIngredientSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchByIngredient()}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
                    placeholder="Malzeme adı..."
                  />
                  <button
                    onClick={searchByIngredient}
                    className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-md text-sm"
                  >
                    Ara
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">ℹ️ Bilgi</h2>
                <div className="text-sm text-gray-400 space-y-2">
                  <p>
                    <strong className="text-white">Dolabıma Göre:</strong> Dolabınızdaki
                    malzemelerle yapabileceğiniz tarifler
                  </p>
                  <p>
                    <strong className="text-white">Malzemeye Göre:</strong> Belirli bir
                    malzeme içeren tarifler
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">

          {/* Search & Filters */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="Tarif adı, malzeme veya kategori ara..."
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold"
                >
                  Ara
                </button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Zorluk
                  </label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) =>
                      setFilters({ ...filters, difficulty: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="">Tümü</option>
                    <option value="EASY">Kolay</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="HARD">Zor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Kategori
                  </label>
                  <input
                    type="text"
                    value={filters.category}
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    placeholder="Örn: Çorba"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Mutfak
                  </label>
                  <input
                    type="text"
                    value={filters.cuisine}
                    onChange={(e) =>
                      setFilters({ ...filters, cuisine: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    placeholder="Örn: Türk"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Max Hazırlık (dk)
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrepTime}
                    onChange={(e) =>
                      setFilters({ ...filters, maxPrepTime: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
                >
                  Filtrele
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-sm"
                >
                  Temizle
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-white">Yükleniyor...</div>
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-400 mb-4">Tarif bulunamadı</p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => router.push(`/dashboard/recipes/${recipe.id}`)}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition cursor-pointer"
                >
                  {/* Recipe Image */}
                  <div className="h-48 bg-gray-700 relative">
                    {recipe.image ? (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🍽️
                      </div>
                    )}
                    <div
                      className={`absolute top-2 right-2 ${getDifficultyColor(
                        recipe.difficulty
                      )} px-3 py-1 rounded-full text-xs font-semibold`}
                    >
                      {getDifficultyText(recipe.difficulty)}
                    </div>
                  </div>

                  {/* Recipe Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {recipe.title}
                    </h3>
                    {recipe.description && (
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {recipe.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      {recipe.prepTime && (
                        <span className="flex items-center gap-1">
                          ⏱️ {recipe.prepTime} dk
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        👥 {recipe.servings} kişi
                      </span>
                    </div>

                    {recipe.category && (
                      <div className="text-xs text-blue-400 mb-2">
                        📂 {recipe.category}
                      </div>
                    )}

                    {recipe.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {recipe.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs"
                          >
                            {tag.tag}
                          </span>
                        ))}
                        {recipe.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
                            +{recipe.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                        {recipe.user.profileImage ? (
                          <img
                            src={recipe.user.profileImage}
                            alt={recipe.user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          '👤'
                        )}
                      </div>
                      <span className="text-gray-400">{recipe.user.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
