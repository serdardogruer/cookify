'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Recipe } from '@/types/recipe';

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, token } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pantryItems, setPantryItems] = useState<any[]>([]);
  const [missingIngredients, setMissingIngredients] = useState<any[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadRecipe();
    }
  }, [params.id]);

  // Token yüklendiğinde pantry'yi yükle
  useEffect(() => {
    if (token) {
      loadPantryItems();
    }
  }, [token]);

  useEffect(() => {
    if (recipe && pantryItems.length > 0) {
      checkMissingIngredients(recipe);
    } else if (recipe && token && pantryItems.length === 0) {
      // Token var ama pantry boş, tekrar kontrol et
      checkMissingIngredients(recipe);
    }
  }, [pantryItems, recipe]);

  const loadRecipe = async () => {
    const response = await api.get<Recipe>(`/api/recipes/${params.id}`);
    if (response.success && response.data) {
      setRecipe(response.data);
      checkMissingIngredients(response.data);
    } else {
      setError('Tarif bulunamadı');
    }
    setLoading(false);
  };

  const loadPantryItems = async () => {
    if (!token) return;
    
    const response = await api.get<any[]>('/api/pantry', token);
    
    if (response.success && response.data) {
      setPantryItems(response.data);
    } else {
      setPantryItems([]);
    }
  };

  // Türkçe karakterleri normalize et ve temizle
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/\s+/g, ' ') // Birden fazla boşluğu tek boşluğa çevir
      .replace(/[^\w\s]/g, ''); // Özel karakterleri kaldır
  };

  const checkMissingIngredients = (recipeData: Recipe) => {
    if (!recipeData) return;
    if (pantryItems.length === 0) {
      setMissingIngredients(recipeData.ingredients);
      return;
    }

    const missing = recipeData.ingredients.filter((ingredient) => {
      const ingredientName = normalizeText(ingredient.name);
      
      const found = pantryItems.some((pantryItem) => {
        const pantryName = normalizeText(pantryItem.name);
        
        // Tam eşleşme
        if (ingredientName === pantryName) return true;
        
        // Kısmi eşleşme (her iki yönde)
        if (ingredientName.includes(pantryName) || pantryName.includes(ingredientName)) return true;
        
        // Kelime kelime kontrol (en az 3 karakter)
        const ingredientWords = ingredientName.split(/\s+/).filter(w => w.length >= 3);
        const pantryWords = pantryName.split(/\s+/).filter(w => w.length >= 3);
        
        return ingredientWords.some(word => 
          pantryWords.some(pWord => 
            word === pWord || word.includes(pWord) || pWord.includes(word)
          )
        );
      });

      return !found;
    });

    setMissingIngredients(missing);
  };

  const handleDelete = async () => {
    if (!confirm('Bu tarifi silmek istediğinize emin misiniz?')) return;

    const response = await api.delete(`/api/recipes/${params.id}`, token || undefined);
    if (response.success) {
      router.push('/dashboard');
    } else {
      setError('Tarif silinemedi');
    }
  };

  const addMissingToMarket = async () => {
    if (!token || missingIngredients.length === 0) return;

    if (!confirm(`${missingIngredients.length} eksik malzeme market listesine eklenecek. Devam edilsin mi?`)) {
      return;
    }

    setError('');
    let successCount = 0;
    let errorCount = 0;

    for (const ingredient of missingIngredients) {
      const data = {
        name: ingredient.name,
        category: 'DİĞER',
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      };

      const response = await api.post('/api/market', data, token);
      if (response.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    if (successCount > 0) {
      setSuccess(`${successCount} malzeme market listesine eklendi${errorCount > 0 ? `, ${errorCount} hata` : ''}`);
      setMissingIngredients([]);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Malzemeler eklenemedi');
    }
  };

  const speakInstructions = () => {
    if (!recipe) return;

    // Eğer konuşma devam ediyorsa durdur
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Tarifleri birleştir
    const text = recipe.instructions
      .map((instruction) => `Adım ${instruction.stepNumber}. ${instruction.instruction}`)
      .join('. ');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    utterance.rate = 0.9; // Biraz yavaş konuş
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleRecipeCooked = async () => {
    if (!token || !recipe) return;

    if (!confirm('Bu tarifi yaptınız mı? Malzemeler dolabınızdan düşecek.')) {
      return;
    }

    setError('');

    const ingredients = recipe.ingredients.map((ing) => ({
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
    }));

    const response = await api.post<{
      success: string[];
      notFound: string[];
      failed: string[];
    }>('/api/pantry/consume-recipe', { ingredients }, token);

    if (response.success && response.data) {
      const { success, notFound, failed } = response.data;
      
      if (success.length > 0) {
        setSuccess(
          `Tebrikler! ${success.length} malzeme dolabınızdan düşüldü.${
            notFound.length > 0 ? ` ${notFound.length} malzeme dolabınızda bulunamadı.` : ''
          }`
        );
        // Pantry'yi yenile
        loadPantryItems();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError('Hiçbir malzeme dolabınızda bulunamadı.');
      }
    } else {
      setError(response.error?.message || 'Malzemeler düşülemedi');
    }
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

  if (error || !recipe) {
    return (
      <ProtectedRoute>
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <div className="text-white text-xl mb-4">{error || 'Tarif bulunamadı'}</div>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Geri Dön
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const isOwner = user?.id === recipe.userId;
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  // YouTube video ID'sini çıkar
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  const videoEmbedUrl = recipe.video ? getYouTubeEmbedUrl(recipe.video) : null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="text-white/80 hover:text-white"
                >
                  ← Geri
                </button>
                <h1 className="text-2xl md:text-3xl font-bold">{recipe.title}</h1>
              </div>
              <button
                onClick={() => setShowSidebar(true)}
                className="md:hidden px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-lg"
              >
                ☰
              </button>
            </div>
            {recipe.description && (
              <p className="text-gray-400 mt-2">{recipe.description}</p>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar - Desktop only */}
            <div className="hidden md:block w-64 space-y-6">
              {/* Yazar Bilgisi */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="font-semibold mb-4">👤 Tarif Sahibi</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                    {recipe.user.profileImage ? (
                      <img
                        src={recipe.user.profileImage}
                        alt={recipe.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">👤</span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{recipe.user.name}</div>
                    <div className="text-sm text-gray-400">
                      {new Date(recipe.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </div>

                {isOwner && (
                  <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
                    <button
                      onClick={() => router.push(`/dashboard/recipes/${recipe.id}/edit`)}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      ✏️ Düzenle
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
                    >
                      🗑️ Sil
                    </button>
                  </div>
                )}
              </div>

              {/* Yaptım Butonu */}
              {token && (
                <button
                  onClick={handleRecipeCooked}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <span>✅</span>
                  <span>Yaptım</span>
                </button>
              )}

              {/* Eksikleri Market'e Ekle Butonu */}
              {token && (
                <button
                  onClick={addMissingToMarket}
                  disabled={missingIngredients.length === 0}
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 whitespace-nowrap ${
                    missingIngredients.length > 0
                      ? 'bg-orange-600 hover:bg-orange-700 cursor-pointer'
                      : 'bg-gray-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  🛒 Eksikleri Ekle{missingIngredients.length > 0 && ` (${missingIngredients.length})`}
                </button>
              )}

              {/* Detaylar */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="font-semibold mb-4">ℹ️ Detaylar</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-400">Zorluk</div>
                    <span
                      className={`inline-block mt-1 px-3 py-1 ${getDifficultyColor(
                        recipe.difficulty
                      )} rounded-full text-sm font-semibold`}
                    >
                      {getDifficultyText(recipe.difficulty)}
                    </span>
                  </div>

                  {recipe.category && (
                    <div>
                      <div className="text-sm text-gray-400">Kategori</div>
                      <div className="font-semibold">{recipe.category}</div>
                    </div>
                  )}

                  {recipe.cuisine && (
                    <div>
                      <div className="text-sm text-gray-400">Mutfak</div>
                      <div className="font-semibold">{recipe.cuisine}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Etiketler */}
              {recipe.tags.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="font-semibold mb-4">🏷️ Etiketler</h3>
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm"
                      >
                        {tag.tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Content - Sağ taraf */}
            <div className="flex-1 space-y-6">
              {/* Video/Resim */}
              {(videoEmbedUrl || recipe.image) && (
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  {videoEmbedUrl ? (
                    <div className="relative" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={videoEmbedUrl}
                        title={recipe.title}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : recipe.image ? (
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-96 object-cover"
                    />
                  ) : null}
                </div>
              )}

              {/* Info Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-1">⏱️</div>
                  <div className="text-sm text-gray-400">Hazırlık</div>
                  <div className="font-semibold">{recipe.prepTime || 0} dk</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="text-sm text-gray-400">Pişirme</div>
                  <div className="font-semibold">{recipe.cookTime || 0} dk</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-1">⏰</div>
                  <div className="text-sm text-gray-400">Toplam</div>
                  <div className="font-semibold">{totalTime} dk</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-1">👥</div>
                  <div className="text-sm text-gray-400">Porsiyon</div>
                  <div className="font-semibold">{recipe.servings} kişi</div>
                </div>
              </div>

              {/* Malzemeler */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold">🥘 Malzemeler</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Dolabınızda: {pantryItems.length} malzeme | Eksik: {missingIngredients.length}
                  </p>
                </div>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient) => {
                    const ingredientName = normalizeText(ingredient.name);
                    
                    const isInPantry = pantryItems.some((pantryItem) => {
                      const pantryName = normalizeText(pantryItem.name);
                      
                      // Tam eşleşme
                      if (ingredientName === pantryName) return true;
                      
                      // Kısmi eşleşme
                      if (ingredientName.includes(pantryName) || pantryName.includes(ingredientName)) return true;
                      
                      // Kelime kelime kontrol
                      const ingredientWords = ingredientName.split(/\s+/).filter(w => w.length >= 3);
                      const pantryWords = pantryName.split(/\s+/).filter(w => w.length >= 3);
                      
                      return ingredientWords.some(word => 
                        pantryWords.some(pWord => 
                          word === pWord || word.includes(pWord) || pWord.includes(word)
                        )
                      );
                    });

                    return (
                      <li
                        key={ingredient.id}
                        className={`flex items-center gap-3 py-2 border-b border-gray-700 last:border-0 ${
                          !isInPantry ? 'opacity-60' : ''
                        }`}
                      >
                        <span className={isInPantry ? 'text-green-400' : 'text-red-400'}>
                          {isInPantry ? '✓' : '✗'}
                        </span>
                        <span className="flex-1">{ingredient.name}</span>
                        <span className="text-gray-400">
                          {ingredient.quantity} {ingredient.unit}
                        </span>
                        {!isInPantry && (
                          <span className="text-xs text-red-400">Dolabınızda yok</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {missingIngredients.length === 0 && pantryItems.length > 0 && (
                  <div className="mt-4 p-3 bg-green-600/20 border border-green-600 rounded text-green-400 text-sm">
                    ✓ Tüm malzemeler dolabınızda mevcut!
                  </div>
                )}
              </div>

              {/* Yapılışı */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">📋 Yapılışı</h2>
                  <button
                    onClick={speakInstructions}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition flex items-center gap-2 ${
                      isSpeaking
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <span>⏸️</span>
                        <span>Durdur</span>
                      </>
                    ) : (
                      <>
                        <span>🔊</span>
                        <span>Seslendir</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-4">
                  {recipe.instructions.map((instruction) => (
                    <div key={instruction.id} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
                        {instruction.stepNumber}
                      </div>
                      <div className="flex-1 pt-2">
                        <p className="text-gray-300">{instruction.instruction}</p>
                        {instruction.image && (
                          <img
                            src={instruction.image}
                            alt={`Adım ${instruction.stepNumber}`}
                            className="mt-3 rounded-lg max-w-md"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      {showSidebar && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowSidebar(false)}
          ></div>
          
          <div className="md:hidden fixed top-0 left-0 bottom-0 w-80 bg-gray-900 z-50 shadow-2xl overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Hızlı Menü</h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Tarif Sahibi */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-sm">👤 Tarif Sahibi</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      {recipe.user.profileImage ? (
                        <img src={recipe.user.profileImage} alt={recipe.user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-xl">👤</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{recipe.user.name}</div>
                      <div className="text-xs text-gray-400">{new Date(recipe.createdAt).toLocaleDateString('tr-TR')}</div>
                    </div>
                  </div>
                </div>

                {/* Detaylar */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-sm">ℹ️ Detaylar</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Zorluk</span>
                      <span>{recipe.difficulty === 'EASY' ? 'Kolay' : recipe.difficulty === 'MEDIUM' ? 'Orta' : 'Zor'}</span>
                    </div>
                    {recipe.category && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Kategori</span>
                        <span>{recipe.category}</span>
                      </div>
                    )}
                    {recipe.cuisine && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mutfak</span>
                        <span>{recipe.cuisine}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Etiketler */}
                {recipe.tags.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-sm">🏷️ Etiketler</h3>
                    <div className="flex flex-wrap gap-2">
                      {recipe.tags.map((tag) => (
                        <span key={tag.id} className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                          {tag.tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}


              </div>
            </div>
          </div>
        </>
      )}
    </ProtectedRoute>
  );
}
