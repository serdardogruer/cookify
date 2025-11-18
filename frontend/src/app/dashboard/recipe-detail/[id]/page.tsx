'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';

interface Recipe {
  id: number;
  title: string;
  image: string;
  video?: string;
  author: string;
  authorImage: string;
  userId: number;
  date: string;
  difficulty: string;
  category: string;
  cuisine: string;
  servings: number;
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
}

interface Ingredient {
  name: string;
  amount: string;
  available: boolean;
}

interface PantryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token, user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    loadRecipe();
  }, [params.id, token]);

  const loadRecipe = async () => {
    if (!token || !params.id) {
      setLoading(false);
      return;
    }

    // Backend'den tarif verilerini çek
    const recipeResponse = await api.get<any>(`/api/recipes/${params.id}`, token);
    
    if (!recipeResponse.success || !recipeResponse.data) {
      toast.error('Tarif bulunamadı');
      setLoading(false);
      return;
    }

    const recipeData = recipeResponse.data;

    // Dolaptaki malzemeleri çek
    const pantryResponse = await api.get<PantryItem[]>('/api/pantry', token);
    const pantryData = pantryResponse.success && pantryResponse.data ? pantryResponse.data : [];

    // Tarifleri uygun formata dönüştür
    const formattedRecipe = {
      id: recipeData.id,
      title: recipeData.title,
      image: recipeData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
      video: recipeData.video,
      author: recipeData.user.name,
      authorImage: recipeData.user.profileImage || '',
      userId: recipeData.userId,
      date: new Date(recipeData.createdAt).toLocaleDateString('tr-TR'),
      difficulty: getDifficultyText(recipeData.difficulty),
      category: recipeData.category || 'Genel',
      cuisine: recipeData.cuisine || 'Dünya',
      servings: recipeData.servings,
      tags: recipeData.tags?.map((t: any) => t.tag) || [],
      ingredients: recipeData.ingredients.map((ing: any) => {
        const pantryItem = pantryData.find(
          (item) => item.name.toLowerCase() === ing.name.toLowerCase() && item.quantity > 0
        );
        return {
          name: ing.name,
          amount: `${ing.quantity} ${ing.unit}`,
          available: !!pantryItem,
        };
      }),
      steps: recipeData.instructions.map((inst: any) => inst.instruction),
    };

    setRecipe(formattedRecipe);
    setLoading(false);
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

  const handleStartReading = () => {
    if (!recipe || !('speechSynthesis' in window)) {
      toast.error('Tarayıcınız seslendirmeyi desteklemiyor');
      return;
    }

    if (isReading) {
      // Durdur
      window.speechSynthesis.cancel();
      setIsReading(false);
      setCurrentStep(0);
      return;
    }

    // Başlat
    setIsReading(true);
    setCurrentStep(0);
    readStep(0);
  };

  const readStep = (stepIndex: number) => {
    if (!recipe || stepIndex >= recipe.steps.length) {
      setIsReading(false);
      setCurrentStep(0);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(recipe.steps[stepIndex]);
    utterance.lang = 'tr-TR';
    utterance.rate = 0.9;

    utterance.onend = () => {
      const nextStep = stepIndex + 1;
      if (nextStep < recipe.steps.length) {
        setCurrentStep(nextStep);
        setTimeout(() => readStep(nextStep), 1000);
      } else {
        setIsReading(false);
        setCurrentStep(0);
        toast.success('Tarif tamamlandı!');
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleMarkAsDone = async () => {
    if (!token || !recipe) return;

    // Tarifte kullanılan malzemeleri dolabımdan düş
    const ingredientsToConsume = recipe.ingredients.map((ing) => {
      // Miktarı parse et (örn: "4 adet" -> 4)
      const quantityMatch = ing.amount.match(/^([\d.]+)/);
      const quantity = quantityMatch ? parseFloat(quantityMatch[1]) : 1;
      
      // Birimi parse et (örn: "4 adet" -> "adet")
      const unitMatch = ing.amount.match(/[\d.]+\s*(.+)$/);
      const unit = unitMatch ? unitMatch[1].trim() : 'adet';
      
      return {
        name: ing.name,
        quantity,
        unit,
      };
    });

    const response = await api.post(
      '/api/pantry/consume-recipe',
      { ingredients: ingredientsToConsume },
      token
    );

    if (response.success) {
      toast.success('Tarif yapıldı! Malzemeler dolabınızdan düşüldü');
      loadRecipe(); // Verileri yenile
    } else {
      toast.error(response.error?.message || 'İşlem başarısız');
    }
  };

  const handleAddMissing = async () => {
    if (!token || !recipe) return;

    const missingIngredients = recipe.ingredients.filter((ing) => !ing.available);

    if (missingIngredients.length === 0) {
      toast.info('Tüm malzemeler dolabınızda mevcut!');
      return;
    }

    // Eksik malzemeleri market listesine ekle
    let addedCount = 0;
    for (const ingredient of missingIngredients) {
      // Miktarı parse et
      const quantityMatch = ingredient.amount.match(/^([\d.]+)/);
      const quantity = quantityMatch ? parseFloat(quantityMatch[1]) : 1;
      
      // Birimi parse et
      const unitMatch = ingredient.amount.match(/[\d.]+\s*(.+)$/);
      const unit = unitMatch ? unitMatch[1].trim() : 'adet';

      // Malzeme veritabanından kategori bilgisini al
      const ingredientResponse = await api.get<any[]>(
        `/api/categories/ingredients/search?q=${encodeURIComponent(ingredient.name)}&limit=1`
      );

      let category = 'SEBZELER'; // Varsayılan kategori
      if (ingredientResponse.success && ingredientResponse.data && ingredientResponse.data.length > 0) {
        category = ingredientResponse.data[0].category.name;
      }

      const response = await api.post(
        '/api/market',
        {
          name: ingredient.name,
          quantity,
          unit,
          category,
        },
        token
      );

      if (response.success) {
        addedCount++;
      }
    }

    if (addedCount > 0) {
      toast.success(`${addedCount} malzeme market listesine eklendi`);
    } else {
      toast.error('Malzemeler eklenemedi');
    }
  };

  if (loading || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  const missingCount = recipe.ingredients.filter(i => !i.available).length;

  return (
    <div className="relative w-full min-h-screen flex flex-col bg-[#121212]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#121212]/80 backdrop-blur-sm border-b border-[#3A3A3C]">
        <div className="max-w-7xl mx-auto p-4">
          <h1 className="text-xl font-bold text-white text-center">{recipe.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            {/* Author Card */}
            <div className="bg-[#1E1E1E] p-4 rounded-lg space-y-4">
              <h2 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wider">
                Tarif Sahibi
              </h2>
              <div className="flex items-center gap-3">
                {recipe.authorImage ? (
                  <img
                    src={recipe.authorImage.startsWith('http') ? recipe.authorImage : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${recipe.authorImage}`}
                    alt={recipe.author}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#30D158] flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {recipe.author.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-white font-semibold">{recipe.author}</p>
                  <p className="text-[#A0A0A0] text-xs">{recipe.date}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {user?.id === recipe.userId && (
                  <button
                    onClick={() => router.push(`/dashboard/recipe-edit/${recipe.id}`)}
                    className="w-full flex items-center justify-center rounded-lg h-10 px-5 bg-[#007AFF] text-white text-sm font-bold hover:bg-[#007AFF]/90 transition"
                  >
                    <span className="material-symbols-outlined mr-2 text-lg">edit</span>
                    Düzenle
                  </button>
                )}
                <button
                  onClick={handleMarkAsDone}
                  className="w-full flex items-center justify-center rounded-lg h-10 px-5 bg-[#30D158] text-white text-sm font-bold"
                >
                  <span className="material-symbols-outlined mr-2 text-lg">check_circle</span>
                  Yapıldı
                </button>
                <button
                  onClick={handleAddMissing}
                  className="w-full flex items-center justify-center rounded-lg h-10 px-5 bg-[#1E1E1E] border border-[#30D158] text-[#30D158] text-sm font-bold"
                >
                  Eksikleri Ekle
                </button>
              </div>
            </div>

            {/* Details Card */}
            <div className="bg-[#1E1E1E] p-4 rounded-lg space-y-3">
              <h2 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wider">
                Detaylar
              </h2>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#A0A0A0]">Zorluk</span>
                <span className="text-white font-semibold">{recipe.difficulty}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#A0A0A0]">Kategori</span>
                <span className="text-white font-semibold">{recipe.category}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#A0A0A0]">Mutfak</span>
                <span className="text-white font-semibold">{recipe.cuisine}</span>
              </div>
            </div>

            {/* Tags Card */}
            <div className="bg-[#1E1E1E] p-4 rounded-lg space-y-3">
              <h2 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wider">
                Etiketler
              </h2>
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#121212] text-[#A0A0A0] text-xs font-medium px-2.5 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recipe Image */}
          <div className="relative aspect-square bg-cover bg-center rounded-lg overflow-hidden group cursor-pointer"
            style={{ backgroundImage: `url(${recipe.image})` }}
            onClick={() => recipe.video && setShowVideoModal(true)}
          >
            {recipe.video && (
              <>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all" />
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all flex items-center justify-center shadow-2xl">
                    <span className="material-symbols-outlined text-[#121212] text-5xl ml-1">
                      play_arrow
                    </span>
                  </div>
                </div>
                {/* Video Badge */}
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-white text-sm">
                    videocam
                  </span>
                  <span className="text-white text-xs font-medium">Video</span>
                </div>
              </>
            )}
          </div>
        </div>



        {/* Ingredients */}
        <div className="bg-[#1E1E1E] p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wider">
              Malzemeler
            </h2>
            <p className="text-[#A0A0A0] text-xs font-medium">
              {recipe.servings} Kişilik - {recipe.ingredients.length} Malzeme var
            </p>
          </div>
          <div className="divide-y divide-[#A0A0A0]/20">
            {recipe.ingredients.map((ingredient, index) => (
              <div
                key={index}
                className={`flex items-center justify-between py-3 text-sm ${
                  ingredient.available ? '' : 'text-red-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined ${
                      ingredient.available ? 'text-[#30D158]' : 'text-red-500'
                    }`}
                  >
                    {ingredient.available ? 'check_circle' : 'cancel'}
                  </span>
                  <p className={ingredient.available ? 'text-white' : ''}>{ingredient.name}</p>
                </div>
                <p className={ingredient.available ? 'text-[#A0A0A0]' : 'text-red-500/80'}>
                  {ingredient.amount}
                </p>
              </div>
            ))}
          </div>
          {missingCount > 0 && (
            <div className="bg-red-500/10 text-red-500 text-sm font-medium p-3 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-base">warning</span>
              <span>{missingCount} adet eksik malzeme var</span>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="bg-[#1E1E1E] p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wider">
              Yapılışı
            </h2>
            <button 
              onClick={handleStartReading}
              className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-md transition ${
                isReading 
                  ? 'bg-red-500/20 text-red-500' 
                  : 'bg-[#30D158]/20 text-[#30D158]'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {isReading ? 'stop' : 'play_arrow'}
              </span>
              {isReading ? 'Durdur' : 'Başlat'}
            </button>
          </div>
          <div className="space-y-3">
            {recipe.steps.map((step, index) => (
              <div 
                key={index} 
                className={`flex items-start gap-3 p-3 rounded-lg transition ${
                  isReading && currentStep === index
                    ? 'bg-[#30D158]/20 border-2 border-[#30D158]'
                    : 'bg-[#121212]'
                }`}
              >
                <div className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isReading && currentStep === index
                    ? 'bg-[#30D158] text-[#121212]'
                    : 'bg-[#30D158] text-[#121212]'
                }`}>
                  {index + 1}
                </div>
                <p className="text-white text-sm flex-1 pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="h-10"></div>
      </div>

      {/* Video Modal */}
      {showVideoModal && recipe.video && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <div 
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-[#30D158] transition"
            >
              <span className="material-symbols-outlined text-4xl">close</span>
            </button>

            {/* Video Container */}
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black shadow-2xl">
              {recipe.video.includes('youtube.com') || recipe.video.includes('youtu.be') ? (
                <iframe
                  className="w-full h-full"
                  src={recipe.video.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  title="Recipe Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : recipe.video.includes('vimeo.com') ? (
                <iframe
                  className="w-full h-full"
                  src={recipe.video.replace('vimeo.com/', 'player.vimeo.com/video/')}
                  title="Recipe Video"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video className="w-full h-full" controls autoPlay>
                  <source src={recipe.video} type="video/mp4" />
                  Tarayıcınız video oynatmayı desteklemiyor.
                </video>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
