'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

export default function AddRecipePage() {
  const router = useRouter();
  const { token } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    video: '',
    prepTime: '',
    cookTime: '',
    servings: '4',
    difficulty: 'MEDIUM',
    category: '',
    cuisine: '',
  });

  const [ingredients, setIngredients] = useState([
    { name: '', quantity: '', unit: 'adet', order: 0 },
  ]);

  const [instructions, setInstructions] = useState([
    { stepNumber: 1, instruction: '', image: '' },
  ]);

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [showSauceSection, setShowSauceSection] = useState(false);
  const [sauces, setSauces] = useState([
    { name: '', ingredients: '', instructions: '' },
  ]);

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: '', quantity: '', unit: 'adet', order: ingredients.length },
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: string, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addInstruction = () => {
    setInstructions([
      ...instructions,
      { stepNumber: instructions.length + 1, instruction: '', image: '' },
    ]);
  };

  const removeInstruction = (index: number) => {
    const updated = instructions.filter((_, i) => i !== index);
    // Adım numaralarını yeniden düzenle
    updated.forEach((inst, i) => {
      inst.stepNumber = i + 1;
    });
    setInstructions(updated);
  };

  const updateInstruction = (index: number, field: string, value: string) => {
    const updated = [...instructions];
    updated[index] = { ...updated[index], [field]: value };
    setInstructions(updated);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const addSauce = () => {
    setSauces([...sauces, { name: '', ingredients: '', instructions: '' }]);
  };

  const removeSauce = (index: number) => {
    setSauces(sauces.filter((_, i) => i !== index));
  };

  const updateSauce = (index: number, field: string, value: string) => {
    const updated = [...sauces];
    updated[index] = { ...updated[index], [field]: value };
    setSauces(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!token) {
      setError('Oturum açmanız gerekiyor');
      setLoading(false);
      return;
    }

    // Validasyon
    if (ingredients.filter((i) => i.name.trim()).length === 0) {
      setError('En az bir malzeme eklemelisiniz');
      setLoading(false);
      return;
    }

    if (instructions.filter((i) => i.instruction.trim()).length === 0) {
      setError('En az bir talimat eklemelisiniz');
      setLoading(false);
      return;
    }

    const data = {
      title: formData.title,
      description: formData.description || undefined,
      image: formData.image || undefined,
      video: formData.video || undefined,
      prepTime: formData.prepTime ? parseInt(formData.prepTime) : undefined,
      cookTime: formData.cookTime ? parseInt(formData.cookTime) : undefined,
      servings: parseInt(formData.servings),
      difficulty: formData.difficulty,
      category: formData.category || undefined,
      cuisine: formData.cuisine || undefined,
      ingredients: ingredients
        .filter((i) => i.name.trim())
        .map((i, idx) => ({
          name: i.name,
          quantity: parseFloat(i.quantity),
          unit: i.unit,
          order: idx,
        })),
      instructions: instructions
        .filter((i) => i.instruction.trim())
        .map((i) => ({
          stepNumber: i.stepNumber,
          instruction: i.instruction,
          image: i.image || undefined,
        })),
      tags: tags.length > 0 ? tags : undefined,
    };

    const response = await api.post('/api/recipes', data, token);

    if (response.success) {
      setSuccess('Tarif başarıyla eklendi!');
      setTimeout(() => {
        router.push(`/recipes/${response.data.id}`);
      }, 1500);
    } else {
      setError(response.error?.message || 'Tarif eklenemedi');
    }

    setLoading(false);
  };

  return (
    <ProtectedRoute>
      <Header />
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white mb-4"
            >
              ← Geri
            </button>
            <h1 className="text-3xl font-bold">➕ Yeni Tarif Ekle</h1>
            <p className="text-gray-400 mt-2">
              Lezzetli tariflerinizi paylaşın
            </p>
          </div>

          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="w-64 space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">📝 İpuçları</h2>
                <div className="text-sm text-gray-400 space-y-3">
                  <p>
                    <strong className="text-white">Başlık:</strong> Kısa ve açıklayıcı olsun
                  </p>
                  <p>
                    <strong className="text-white">Malzemeler:</strong> Miktarları net belirtin
                  </p>
                  <p>
                    <strong className="text-white">Adımlar:</strong> Sıralı ve anlaşılır yazın
                  </p>
                  <p>
                    <strong className="text-white">Soslar:</strong> Özel sos varsa ekleyin
                  </p>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">🎯 Hızlı Erişim</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => document.getElementById('ingredients')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 text-sm"
                  >
                    🥘 Malzemeler
                  </button>
                  <button
                    onClick={() => document.getElementById('instructions')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 text-sm"
                  >
                    📋 Yapılışı
                  </button>
                  <button
                    onClick={() => document.getElementById('sauces')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 text-sm"
                  >
                    🍯 Soslar
                  </button>
                  <button
                    onClick={() => document.getElementById('tags')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 text-sm"
                  >
                    🏷️ Etiketler
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">

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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Temel Bilgiler */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">📝 Temel Bilgiler</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tarif Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    placeholder="Örn: Mercimek Çorbası"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    rows={3}
                    placeholder="Tarif hakkında kısa bir açıklama..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Görsel URL
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Video URL (YouTube/Vimeo)
                    </label>
                    <input
                      type="url"
                      value={formData.video}
                      onChange={(e) =>
                        setFormData({ ...formData, video: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Hazırlık (dk)
                    </label>
                    <input
                      type="number"
                      value={formData.prepTime}
                      onChange={(e) =>
                        setFormData({ ...formData, prepTime: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      placeholder="15"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Pişirme (dk)
                    </label>
                    <input
                      type="number"
                      value={formData.cookTime}
                      onChange={(e) =>
                        setFormData({ ...formData, cookTime: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      placeholder="30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Kişi Sayısı *
                    </label>
                    <input
                      type="number"
                      value={formData.servings}
                      onChange={(e) =>
                        setFormData({ ...formData, servings: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Zorluk *
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData({ ...formData, difficulty: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      required
                    >
                      <option value="EASY">Kolay</option>
                      <option value="MEDIUM">Orta</option>
                      <option value="HARD">Zor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Kategori
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      placeholder="Örn: Çorba, Ana Yemek, Tatlı"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mutfak
                    </label>
                    <input
                      type="text"
                      value={formData.cuisine}
                      onChange={(e) =>
                        setFormData({ ...formData, cuisine: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      placeholder="Örn: Türk, İtalyan, Çin"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Malzemeler */}
            <div id="ingredients" className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">🥘 Malzemeler</h2>

              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) =>
                        updateIngredient(index, 'name', e.target.value)
                      }
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      placeholder="Malzeme adı"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={ingredient.quantity}
                      onChange={(e) =>
                        updateIngredient(index, 'quantity', e.target.value)
                      }
                      className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      placeholder="Miktar"
                    />
                    <select
                      value={ingredient.unit}
                      onChange={(e) =>
                        updateIngredient(index, 'unit', e.target.value)
                      }
                      className="w-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="adet">Adet</option>
                      <option value="kg">Kg</option>
                      <option value="gram">Gram</option>
                      <option value="litre">Litre</option>
                      <option value="ml">ML</option>
                      <option value="su bardağı">Su Bardağı</option>
                      <option value="çay kaşığı">Çay Kaşığı</option>
                      <option value="yemek kaşığı">Yemek Kaşığı</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addIngredient}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                + Malzeme Ekle
              </button>
            </div>

            {/* Talimatlar */}
            <div id="instructions" className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">📋 Yapılışı</h2>

              <div className="space-y-4">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-semibold">
                      {instruction.stepNumber}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={instruction.instruction}
                        onChange={(e) =>
                          updateInstruction(index, 'instruction', e.target.value)
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        rows={2}
                        placeholder="Adım açıklaması..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md h-fit"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addInstruction}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                + Adım Ekle
              </button>
            </div>

            {/* Soslar */}
            <div id="sauces" className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">🍯 Soslar (Opsiyonel)</h2>
                <button
                  type="button"
                  onClick={() => setShowSauceSection(!showSauceSection)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                >
                  {showSauceSection ? '▼ Gizle' : '▶ Göster'}
                </button>
              </div>

              {showSauceSection && (
                <>
                  <p className="text-sm text-gray-400 mb-4">
                    Tarifin özel sosları varsa buraya ekleyebilirsiniz
                  </p>
                  <div className="space-y-4">
                    {sauces.map((sauce, index) => (
                      <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">Sos #{index + 1}</h3>
                          {sauces.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSauce(index)}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={sauce.name}
                            onChange={(e) => updateSauce(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            placeholder="Sos adı (örn: Domates Sosu)"
                          />
                          <textarea
                            value={sauce.ingredients}
                            onChange={(e) => updateSauce(index, 'ingredients', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            rows={2}
                            placeholder="Malzemeler (örn: 2 domates, 1 soğan, tuz)"
                          />
                          <textarea
                            value={sauce.instructions}
                            onChange={(e) => updateSauce(index, 'instructions', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            rows={3}
                            placeholder="Yapılışı..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addSauce}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    + Sos Ekle
                  </button>
                </>
              )}
            </div>

            {/* Etiketler */}
            <div id="tags" className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">🏷️ Etiketler</h2>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="Etiket ekle (örn: vegan, glutensiz)"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Ekle
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-600 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-md font-semibold disabled:opacity-50"
              >
                {loading ? 'Kaydediliyor...' : '✓ Tarifi Kaydet'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-md"
              >
                İptal
              </button>
            </div>
          </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
