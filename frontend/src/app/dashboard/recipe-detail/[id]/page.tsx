'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

interface Recipe {
  id: number;
  title: string;
  description?: string;
  image?: string;
  video?: string;
  prepTime?: number;
  cookTime?: number;
  servings: number;
  difficulty: string;
  category?: string;
  cuisine?: string;
  ingredients: Array<{
    id: number;
    name: string;
    quantity: number;
    unit: string;
    order: number;
  }>;
  instructions: Array<{
    id: number;
    stepNumber: number;
    instruction: string;
    image?: string;
  }>;
  tags?: Array<{
    id: number;
    recipeId: number;
    tag: string;
  }>;
  user: {
    id: number;
    name: string;
    profileImage?: string;
  };
  createdAt: string;
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pantryItems, setPantryItems] = useState<any[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const isReadingRef = useRef(false);

  useEffect(() => {
    loadRecipe();
    loadPantryItems();

    // Cleanup: Sayfa değiştiğinde seslendirmeyi durdur
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      isReadingRef.current = false;
    };
  }, [params.id, token]);

  const loadPantryItems = async () => {
    if (!token) return;
    const response = await api.get<any[]>('/api/pantry', token);
    if (response.success && response.data) {
      setPantryItems(response.data);
    }
  };

  const isInPantry = (ingredientName: string) => {
    return pantryItems.some(item => {
      const itemName = item.ingredient?.name || item.name || '';
      return itemName.toLowerCase().includes(ingredientName.toLowerCase()) || 
             ingredientName.toLowerCase().includes(itemName.toLowerCase());
    });
  };

  const handleYaptim = async () => {
    if (!token || !recipe) return;
    
    setError('');
    setSuccess('');

    // Dolaptaki malzemeleri bul ve sil
    let deletedCount = 0;
    let errorCount = 0;

    for (const ingredient of recipe.ingredients) {
      const pantryItem = pantryItems.find(item => {
        const itemName = item.ingredient?.name || item.name || '';
        return itemName.toLowerCase().includes(ingredient.name.toLowerCase()) || 
               ingredient.name.toLowerCase().includes(itemName.toLowerCase());
      });

      if (pantryItem) {
        const response = await api.delete(`/api/pantry/${pantryItem.id}`, token);
        if (response.success) {
          deletedCount++;
        } else {
          errorCount++;
        }
      }
    }

    if (deletedCount > 0) {
      setSuccess(`${deletedCount} malzeme dolabınızdan çıkarıldı!`);
      loadPantryItems(); // Listeyi yenile
    }
    
    if (errorCount > 0) {
      setError(`${errorCount} malzeme çıkarılamadı`);
    }
  };

  const handleEksikleriEkle = async () => {
    if (!token || !recipe) return;
    
    setError('');
    setSuccess('');

    // Dolabımda olmayan malzemeleri bul
    const missingIngredients = recipe.ingredients.filter(ingredient => !isInPantry(ingredient.name));

    if (missingIngredients.length === 0) {
      setSuccess('Tüm malzemeler dolabınızda mevcut!');
      return;
    }

    let addedCount = 0;
    let errorCount = 0;

    for (const ingredient of missingIngredients) {
      const response = await api.post('/api/market', {
        name: ingredient.name,
        category: recipe.category || 'Genel',
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      }, token);

      if (response.success) {
        addedCount++;
      } else {
        errorCount++;
        console.error('Market ekleme hatası:', response.error);
      }
    }

    if (addedCount > 0) {
      setSuccess(`${addedCount} eksik malzeme market listesine eklendi!`);
    }
    
    if (errorCount > 0) {
      setError(`${errorCount} malzeme eklenemedi`);
    }
  };

  const loadRecipe = async () => {
    const response = await api.get<Recipe>(`/api/recipes/${params.id}`, token || undefined);
    if (response.success && response.data) {
      setRecipe(response.data);
    } else {
      setError(response.error?.message || 'Tarif bulunamadı');
    }
    setLoading(false);
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'Kolay';
      case 'MEDIUM': return 'Orta';
      case 'HARD': return 'Zor';
      default: return difficulty;
    }
  };

  const startReading = () => {
    if (!recipe || !('speechSynthesis' in window)) {
      setError('Tarayıcınız sesli okuma özelliğini desteklemiyor');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Eğer zaten okuma yapılıyorsa durdur
    if (isReadingRef.current) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      setCurrentStep(0);
      isReadingRef.current = false;
      return;
    }

    // Önceki konuşmaları temizle
    window.speechSynthesis.cancel();
    
    setIsReading(true);
    setCurrentStep(0);
    setError('');
    isReadingRef.current = true;
    
    // Seslerin yüklenmesini bekle (bazı tarayıcılarda gerekli)
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        setTimeout(() => readStep(0), 100);
      };
    } else {
      setTimeout(() => readStep(0), 100);
    }
  };

  const readStep = (stepIndex: number) => {
    if (!recipe || stepIndex >= recipe.instructions.length) {
      setIsReading(false);
      setCurrentStep(0);
      return;
    }

    const sortedInstructions = recipe.instructions.sort((a, b) => a.stepNumber - b.stepNumber);
    const instruction = sortedInstructions[stepIndex];
    
    const text = `Adım ${instruction.stepNumber}. ${instruction.instruction}`;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Türkçe kadın sesi seç
    const voices = window.speechSynthesis.getVoices();
    const turkishFemaleVoice = voices.find(voice => 
      voice.lang.startsWith('tr') && voice.name.toLowerCase().includes('female')
    ) || voices.find(voice => 
      voice.lang.startsWith('tr') && !voice.name.toLowerCase().includes('male')
    ) || voices.find(voice => voice.lang.startsWith('tr'));
    
    if (turkishFemaleVoice) {
      utterance.voice = turkishFemaleVoice;
    }
    
    // Ses ayarları
    utterance.lang = 'tr-TR';
    utterance.rate = 0.85; // Biraz daha yavaş
    utterance.pitch = 1.1; // Kadın sesi için biraz daha yüksek
    utterance.volume = 1;

    utterance.onstart = () => {
      setCurrentStep(stepIndex);
    };

    utterance.onend = () => {
      const nextStep = stepIndex + 1;
      if (nextStep < sortedInstructions.length && isReadingRef.current) {
        // Bir sonraki adıma geç
        setTimeout(() => readStep(nextStep), 1500);
      } else {
        setIsReading(false);
        setCurrentStep(0);
        isReadingRef.current = false;
      }
    };

    utterance.onerror = (event) => {
      console.error('Sesli okuma hatası:', event);
      
      // Cancel hatası gösterme (kullanıcı durdurdu)
      if (event.error === 'canceled' || event.error === 'interrupted') {
        setIsReading(false);
        setCurrentStep(0);
        isReadingRef.current = false;
        return;
      }
      
      setIsReading(false);
      setCurrentStep(0);
      isReadingRef.current = false;
      
      // Hata mesajını daha açıklayıcı yap
      if (event.error === 'not-allowed') {
        setError('Sesli okuma izni verilmedi. Lütfen tarayıcı ayarlarınızı kontrol edin.');
      } else if (event.error === 'network') {
        setError('İnternet bağlantısı gerekli. Lütfen bağlantınızı kontrol edin.');
      } else {
        setError('Sesli okuma başlatılamadı. Lütfen tekrar deneyin.');
      }
      
      setTimeout(() => setError(''), 5000);
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speak hatası:', err);
      setIsReading(false);
      setCurrentStep(0);
      setError('Sesli okuma başlatılamadı');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Yükleniyor...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !recipe) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-900 text-white p-4">
          <div className="max-w-4xl mx-auto text-center py-12">
            <p className="text-red-500 text-xl mb-4">{error || 'Tarif bulunamadı'}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
            >
              ← Geri Dön
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const isAuthor = user?.id === recipe.user.id;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
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

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar */}
            <div className="lg:w-80 space-y-4">
              {/* Recipe Info Card */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  👤 Tarif Sahibi
                </h3>
                <div className="flex items-center gap-3 mb-6">
                  {recipe.user.profileImage ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${recipe.user.profileImage}`}
                      alt={recipe.user.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-3xl">
                      👤
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-lg">{recipe.user.name}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(recipe.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button 
                    onClick={handleYaptim}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    ✓ Yaptım
                  </button>
                  <button 
                    onClick={handleEksikleriEkle}
                    className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2"
                  >
                    📋 Eksikleri Ekle
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  ℹ️ Detaylar
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Zorluk</span>
                    <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-full font-semibold">
                      {getDifficultyText(recipe.difficulty)}
                    </span>
                  </div>
                  {recipe.category && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Kategori</span>
                      <span className="font-semibold">{recipe.category}</span>
                    </div>
                  )}
                  {recipe.cuisine && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Mutfak</span>
                      <span className="font-semibold">{recipe.cuisine}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    🏷️ Etiketler
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.map((tagObj) => (
                      <span
                        key={tagObj.id}
                        className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium"
                      >
                        {tagObj.tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Hero Image */}
              {recipe.image && (
                <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden mb-6">
                  <img
                    src={
                      recipe.image.startsWith('http')
                        ? recipe.image
                        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${recipe.image}`
                    }
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Time Info Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {recipe.prepTime && (
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-1">⏱️</div>
                    <div className="text-sm text-gray-400">Hazırlık</div>
                    <div className="font-semibold">{recipe.prepTime} dk</div>
                  </div>
                )}
                {recipe.cookTime && (
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-1">🔥</div>
                    <div className="text-sm text-gray-400">Pişirme</div>
                    <div className="font-semibold">{recipe.cookTime} dk</div>
                  </div>
                )}
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-1">👥</div>
                  <div className="text-sm text-gray-400">Porsiyon</div>
                  <div className="font-semibold">{recipe.servings} kişi</div>
                </div>
                {totalTime > 0 && (
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-1">⏰</div>
                    <div className="text-sm text-gray-400">Toplam</div>
                    <div className="font-semibold">{totalTime} dk</div>
                  </div>
                )}
              </div>

              {/* Ingredients */}
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    🥘 Malzemeler
                  </h2>
                  <span className="text-sm text-gray-400">
                    {recipe.servings} kişilik | Malzeme: {recipe.ingredients.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {recipe.ingredients
                    .sort((a, b) => a.order - b.order)
                    .map((ingredient) => {
                      const inPantry = isInPantry(ingredient.name);
                      return (
                        <div
                          key={ingredient.id}
                          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                            inPantry
                              ? 'bg-green-600/10 border border-green-600/30'
                              : 'bg-red-600/10 border border-red-600/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={inPantry ? 'text-green-500' : 'text-red-500'}>
                              {inPantry ? '✓' : '✗'}
                            </span>
                            <span className={inPantry ? 'text-white' : 'text-gray-300'}>
                              {ingredient.name}
                            </span>
                          </div>
                          <span className="text-gray-400 text-sm">
                            {ingredient.quantity} {ingredient.unit}
                          </span>
                        </div>
                      );
                    })}
                </div>
                
                {/* Eksik Malzeme Durumu */}
                <div className="mt-4 p-3 rounded-lg bg-gray-700/50">
                  {(() => {
                    const missingCount = recipe.ingredients.filter(ing => !isInPantry(ing.name)).length;
                    if (missingCount === 0) {
                      return (
                        <div className="flex items-center gap-2 text-green-400">
                          <span>✓</span>
                          <span className="font-semibold">Tüm malzemeler dolabınızda mevcut!</span>
                        </div>
                      );
                    } else {
                      return (
                        <div className="flex items-center gap-2 text-orange-400">
                          <span>⚠</span>
                          <span className="font-semibold">{missingCount} adet eksik malzeme var</span>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    📋 Yapılışı
                  </h2>
                  <button 
                    onClick={startReading}
                    className={`px-4 py-2 ${isReading ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'} rounded-lg text-sm flex items-center gap-2`}
                  >
                    {isReading ? '⏹ Durdur' : '▶ Başlat'}
                  </button>
                </div>
                <div className="space-y-4">
                  {recipe.instructions
                    .sort((a, b) => a.stepNumber - b.stepNumber)
                    .map((instruction, index) => (
                      <div
                        key={instruction.id}
                        className={`flex gap-4 p-4 rounded-lg transition-all ${
                          isReading && currentStep === index
                            ? 'bg-purple-600/30 ring-2 ring-purple-500'
                            : 'bg-gray-700/50 hover:bg-gray-700'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          isReading && currentStep === index
                            ? 'bg-purple-600 animate-pulse'
                            : 'bg-blue-600'
                        }`}>
                          {instruction.stepNumber}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-200 leading-relaxed">
                            {instruction.instruction}
                          </p>
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

              {/* Video */}
              {recipe.video && (
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    🎥 Video
                  </h2>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={
                        recipe.video.includes('youtube.com') ||
                        recipe.video.includes('youtu.be')
                          ? recipe.video
                              .replace('watch?v=', 'embed/')
                              .replace('youtu.be/', 'youtube.com/embed/')
                          : recipe.video
                      }
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    ></iframe>
                  </div>
                </div>
              )}

              {/* Actions */}
              {isAuthor && (
                <div className="flex gap-4">
                  <button
                    onClick={() => router.push(`/dashboard/recipe-edit/${recipe.id}`)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    ✏️ Düzenle
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Bu tarifi silmek istediğinize emin misiniz?')) {
                        // Silme işlemi
                      }
                    }}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg"
                  >
                    🗑️ Sil
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
