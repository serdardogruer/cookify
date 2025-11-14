'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';

interface Recipe {
  id: number;
  title: string;
  description: string;
  image: string;
  video?: string;
  prepTime?: number;
  cookTime?: number;
  servings: number;
  difficulty: string;
  category: string;
  cuisine: string;
  tags: string[];
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
}

interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
}

interface RecipeInstruction {
  stepNumber: number;
  instruction: string;
}

export default function RecipeEditPage() {
  const router = useRouter();
  const params = useParams();
  const { token, user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRecipe();
  }, [params.id, token]);

  const loadRecipe = async () => {
    if (!token || !params.id) {
      setLoading(false);
      return;
    }

    const recipeResponse = await api.get<any>(`/api/recipes/${params.id}`, token);
    
    if (!recipeResponse.success || !recipeResponse.data) {
      toast.error('Tarif bulunamadı');
      router.push('/dashboard/recipe-search');
      return;
    }

    const recipeData = recipeResponse.data;

    // Yetki kontrolü
    if (user && recipeData.userId !== user.id) {
      toast.error('Bu tarifi düzenleme yetkiniz yok');
      router.push(`/dashboard/recipe-detail/${params.id}`);
      return;
    }

    setRecipe({
      id: recipeData.id,
      title: recipeData.title,
      description: recipeData.description || '',
      image: recipeData.image || '',
      video: recipeData.video || '',
      prepTime: recipeData.prepTime,
      cookTime: recipeData.cookTime,
      servings: recipeData.servings,
      difficulty: recipeData.difficulty,
      category: recipeData.category || '',
      cuisine: recipeData.cuisine || '',
      tags: recipeData.tags?.map((t: any) => t.tag) || [],
      ingredients: recipeData.ingredients.map((ing: any) => ({
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
      })),
      instructions: recipeData.instructions.map((inst: any) => ({
        stepNumber: inst.stepNumber,
        instruction: inst.instruction,
      })),
    });

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

  const handleUpdate = (field: keyof Recipe, value: any) => {
    if (recipe) {
      setRecipe({ ...recipe, [field]: value });
    }
  };

  const handleIngredientUpdate = (index: number, field: keyof RecipeIngredient, value: any) => {
    if (recipe) {
      const newIngredients = [...recipe.ingredients];
      newIngredients[index] = { ...newIngredients[index], [field]: value };
      setRecipe({ ...recipe, ingredients: newIngredients });
    }
  };

  const handleInstructionUpdate = (index: number, value: string) => {
    if (recipe) {
      const newInstructions = [...recipe.instructions];
      newInstructions[index] = { ...newInstructions[index], instruction: value };
      setRecipe({ ...recipe, instructions: newInstructions });
    }
  };

  const addIngredient = () => {
    if (recipe) {
      setRecipe({
        ...recipe,
        ingredients: [...recipe.ingredients, { name: '', quantity: 0, unit: 'Adet' }],
      });
    }
  };

  const removeIngredient = (index: number) => {
    if (recipe) {
      setRecipe({
        ...recipe,
        ingredients: recipe.ingredients.filter((_, i) => i !== index),
      });
    }
  };

  const addInstruction = () => {
    if (recipe) {
      setRecipe({
        ...recipe,
        instructions: [
          ...recipe.instructions,
          { stepNumber: recipe.instructions.length + 1, instruction: '' },
        ],
      });
    }
  };

  const removeInstruction = (index: number) => {
    if (recipe) {
      const newInstructions = recipe.instructions
        .filter((_, i) => i !== index)
        .map((inst, i) => ({ ...inst, stepNumber: i + 1 }));
      setRecipe({ ...recipe, instructions: newInstructions });
    }
  };

  const addTag = (tag: string) => {
    if (recipe && tag.trim() && !recipe.tags.includes(tag.trim())) {
      setRecipe({ ...recipe, tags: [...recipe.tags, tag.trim()] });
    }
  };

  const removeTag = (tag: string) => {
    if (recipe) {
      setRecipe({ ...recipe, tags: recipe.tags.filter(t => t !== tag) });
    }
  };

  const handleSave = async () => {
    if (!recipe || !token) return;

    // Validation
    if (!recipe.title.trim()) {
      toast.error('Lütfen tarif adını girin');
      return;
    }
    if (recipe.servings < 1) {
      toast.error('Lütfen kişi sayısını girin');
      return;
    }
    if (recipe.ingredients.length === 0) {
      toast.error('Lütfen en az bir malzeme ekleyin');
      return;
    }
    if (recipe.instructions.length === 0) {
      toast.error('Lütfen en az bir adım ekleyin');
      return;
    }

    setSaving(true);

    const recipeData = {
      title: recipe.title.trim(),
      description: recipe.description.trim() || undefined,
      image: recipe.image || undefined,
      video: recipe.video || undefined,
      prepTime: recipe.prepTime || undefined,
      cookTime: recipe.cookTime || undefined,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      category: recipe.category || undefined,
      cuisine: recipe.cuisine || undefined,
      ingredients: recipe.ingredients.map((ing, index) => ({
        name: ing.name.trim(),
        quantity: ing.quantity,
        unit: ing.unit,
        order: index + 1,
      })),
      instructions: recipe.instructions.map((inst) => ({
        stepNumber: inst.stepNumber,
        instruction: inst.instruction.trim(),
      })),
      tags: recipe.tags,
    };

    const response = await api.put(`/api/recipes/${params.id}`, recipeData, token);

    if (response.success) {
      toast.success('Tarif başarıyla güncellendi!');
      router.push(`/dashboard/recipe-detail/${params.id}`);
    } else {
      toast.error(response.error?.message || 'Tarif güncellenirken hata oluştu');
    }

    setSaving(false);
  };

  if (loading || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen flex flex-col bg-[#121212]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#121212]/80 backdrop-blur-sm border-b border-[#3A3A3C]">
        <div className="max-w-4xl mx-auto p-4">
          <input
            type="text"
            value={recipe.title}
            onChange={(e) => handleUpdate('title', e.target.value)}
            className="w-full text-xl font-bold text-white text-center bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[#30D158] rounded px-2"
            placeholder="Tarif Adı"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-6 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            {/* Details Card */}
            <div className="bg-[#1E1E1E] p-4 rounded-lg space-y-3">
              <h2 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wider">
                Detaylar
              </h2>
              
              <div className="space-y-2">
                <label className="text-[#A0A0A0] text-xs">Zorluk</label>
                <select
                  value={recipe.difficulty}
                  onChange={(e) => handleUpdate('difficulty', e.target.value)}
                  className="w-full bg-[#121212] text-white rounded px-3 py-2 text-sm"
                >
                  <option value="EASY">Kolay</option>
                  <option value="MEDIUM">Orta</option>
                  <option value="HARD">Zor</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[#A0A0A0] text-xs">Kategori</label>
                <input
                  type="text"
                  value={recipe.category}
                  onChange={(e) => handleUpdate('category', e.target.value)}
                  className="w-full bg-[#121212] text-white rounded px-3 py-2 text-sm"
                  placeholder="Ana Yemek, Tatlı, vb."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[#A0A0A0] text-xs">Mutfak</label>
                <input
                  type="text"
                  value={recipe.cuisine}
                  onChange={(e) => handleUpdate('cuisine', e.target.value)}
                  className="w-full bg-[#121212] text-white rounded px-3 py-2 text-sm"
                  placeholder="Türk, İtalyan, vb."
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <label className="text-[#A0A0A0] text-xs">Hazırlık (dk)</label>
                  <input
                    type="number"
                    value={recipe.prepTime || ''}
                    onChange={(e) => handleUpdate('prepTime', parseInt(e.target.value) || undefined)}
                    className="w-full bg-[#121212] text-white rounded px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[#A0A0A0] text-xs">Pişirme (dk)</label>
                  <input
                    type="number"
                    value={recipe.cookTime || ''}
                    onChange={(e) => handleUpdate('cookTime', parseInt(e.target.value) || undefined)}
                    className="w-full bg-[#121212] text-white rounded px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[#A0A0A0] text-xs">Kişi</label>
                  <input
                    type="number"
                    value={recipe.servings}
                    onChange={(e) => handleUpdate('servings', parseInt(e.target.value) || 1)}
                    className="w-full bg-[#121212] text-white rounded px-3 py-2 text-sm"
                    min="1"
                  />
                </div>
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
                    className="bg-[#121212] text-white text-xs font-medium px-2.5 py-1 rounded flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-red-500 hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTag((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  className="bg-[#121212] text-white text-xs px-2.5 py-1 rounded"
                  placeholder="+ Etiket ekle"
                />
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#1E1E1E] p-4 rounded-lg space-y-3">
              <h2 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wider">
                Açıklama
              </h2>
              <textarea
                value={recipe.description}
                onChange={(e) => handleUpdate('description', e.target.value)}
                className="w-full bg-[#121212] text-white rounded px-3 py-2 text-sm min-h-24"
                placeholder="Tarif hakkında kısa bir açıklama..."
              />
            </div>
          </div>

          {/* Recipe Image */}
          <div className="space-y-3">
            <div
              className="aspect-square bg-cover bg-center rounded-lg"
              style={{ backgroundImage: `url(${recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'})` }}
            />
            <input
              type="text"
              value={recipe.image}
              onChange={(e) => handleUpdate('image', e.target.value)}
              className="w-full bg-[#1E1E1E] text-white rounded px-3 py-2 text-sm"
              placeholder="Resim URL'i"
            />
            <input
              type="text"
              value={recipe.video || ''}
              onChange={(e) => handleUpdate('video', e.target.value)}
              className="w-full bg-[#1E1E1E] text-white rounded px-3 py-2 text-sm"
              placeholder="Video URL'i (YouTube/Vimeo)"
            />
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-[#1E1E1E] p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wider">
              Malzemeler
            </h2>
            <button
              onClick={addIngredient}
              className="text-[#30D158] text-sm font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Ekle
            </button>
          </div>
          <div className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center gap-2 bg-[#121212] p-2 rounded">
                <input
                  type="number"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientUpdate(index, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-20 bg-transparent text-white text-sm px-2 py-1"
                  placeholder="Miktar"
                />
                <select
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientUpdate(index, 'unit', e.target.value)}
                  className="w-28 bg-transparent text-white text-sm"
                >
                  <option>Adet</option>
                  <option>Kg</option>
                  <option>Gram</option>
                  <option>Litre</option>
                  <option>ML</option>
                  <option>Su Bardağı</option>
                  <option>Çay Kaşığı</option>
                  <option>Yemek Kaşığı</option>
                </select>
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientUpdate(index, 'name', e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm px-2 py-1"
                  placeholder="Malzeme adı"
                />
                <button
                  onClick={() => removeIngredient(index)}
                  className="text-red-500 hover:text-red-400"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="bg-[#1E1E1E] p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wider">
              Yapılışı
            </h2>
            <button
              onClick={addInstruction}
              className="text-[#30D158] text-sm font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Ekle
            </button>
          </div>
          <div className="space-y-3">
            {recipe.instructions.map((step, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[#121212]">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold bg-[#30D158] text-[#121212]">
                  {index + 1}
                </div>
                <textarea
                  value={step.instruction}
                  onChange={(e) => handleInstructionUpdate(index, e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm resize-none"
                  placeholder="Adım açıklaması..."
                  rows={2}
                />
                <button
                  onClick={() => removeInstruction(index)}
                  className="text-red-500 hover:text-red-400"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4 pb-8">
          <button
            onClick={() => router.back()}
            className="flex-1 h-14 rounded-full border-2 border-[#A0A0A0] text-[#A0A0A0] font-bold text-base hover:bg-[#A0A0A0]/10 transition"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-14 rounded-full bg-[#30D158] text-[#121212] font-bold text-base hover:bg-[#30D158]/90 transition disabled:opacity-50"
          >
            {saving ? 'Güncelleniyor...' : 'Güncelle'}
          </button>
        </div>
      </div>
    </div>
  );
}
