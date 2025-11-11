'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Recipe } from '@/types/recipe';

export default function DashboardPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    const response = await api.get<Recipe[]>('/api/recipes?limit=12');
    if (response.success && response.data) {
      setRecipes(response.data);
    }
    setLoading(false);
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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white">Yükleniyor...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">🍳 Cookify'a Hoş Geldiniz</h1>
            <p className="text-gray-400 text-lg">
              Mutfağınızı yönetin, tarifler keşfedin, lezzetli yemekler yapın!
            </p>
          </div>

          {/* Latest Recipes */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">📖 Son Eklenen Tarifler</h2>
              <button
                onClick={() => router.push('/dashboard/recipes/search')}
                className="text-blue-400 hover:text-blue-300"
              >
                Tümünü Gör →
              </button>
            </div>

            {recipes.length === 0 ? (
              <div className="text-center py-12 bg-gray-800 rounded-lg">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-gray-400 mb-4">Henüz tarif eklenmemiş</p>
                <button
                  onClick={() => router.push('/dashboard/recipes/add')}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg"
                >
                  İlk Tarifi Ekle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
    </ProtectedRoute>
  );
}
