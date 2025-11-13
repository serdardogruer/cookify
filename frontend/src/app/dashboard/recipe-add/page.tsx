'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Ingredient {
  id: string;
  amount: string;
  unit: string;
  name: string;
}

interface Step {
  id: string;
  description: string;
  imageUrl?: string;
  timer?: number;
}

interface Sauce {
  id: string;
  name: string;
  ingredients: Ingredient[];
}

export default function RecipeAddPage() {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [showSauces, setShowSauces] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', amount: '1', unit: 'Adet', name: 'soğan' },
    { id: '2', amount: '500', unit: 'Gram', name: 'tavuk göğsü' }
  ]);
  const [steps, setSteps] = useState<Step[]>([
    { id: '1', description: 'Soğanları doğrayın ve tavada pembeleşinceye kadar kavurun.' },
    { id: '2', description: 'Tavukları ekleyin ve rengi dönene kadar pişirin.' }
  ]);
  const [sauces, setSauces] = useState<Sauce[]>([]);

  const units = ['Adet', 'Kg', 'Gram', 'Litre', 'ML', 'Su Bardağı', 'Çay Kaşığı', 'Yemek Kaşığı'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addIngredient = () => {
    const newId = (Math.max(...ingredients.map(i => parseInt(i.id)), 0) + 1).toString();
    setIngredients([...ingredients, { id: newId, amount: '', unit: 'Adet', name: '' }]);
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(i => i.id !== id));
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string) => {
    setIngredients(ingredients.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const addStep = () => {
    const newId = (Math.max(...steps.map(s => parseInt(s.id)), 0) + 1).toString();
    setSteps([...steps, { id: newId, description: '' }]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSaveDraft = () => {
    // Taslak kaydetme işlemi
  };

  const handlePublish = () => {
    // Yayınlama işlemi
  };

  const handleDelete = () => {
    // Silme işlemi
    router.back();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      {/* Top App Bar */}
      <header className="sticky top-0 z-10 bg-[#121212]/80 backdrop-blur-sm border-b border-[#3A3A3C]">
        <div className="w-full max-w-4xl mx-auto p-4">
          <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] text-center">
            Yeni Tarif Ekle
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pb-8 w-full max-w-4xl mx-auto">
        {/* Header Image/Video Uploader */}
        <div className="p-4">
          <label className="flex flex-col gap-2">
            <p className="text-white text-base font-medium leading-normal">
              Tarif Görseli
            </p>
            <div className="block w-full bg-[#1E1E1E] border-2 border-dashed border-[#3A3A3C] flex flex-col justify-center items-center overflow-hidden rounded-xl min-h-60 text-center cursor-pointer">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[#A9A9A9] text-5xl">
                    add_photo_alternate
                  </span>
                  <p className="text-[#A9A9A9] mt-2">📁 Bilgisayardan Görsel Seç</p>
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
              />
            </div>
          </label>

          <div className="mt-4">
            <p className="text-[#A9A9A9] text-center mb-2">veya</p>
            <label className="flex flex-col">
              <p className="text-white text-base font-medium leading-normal pb-2">
                Video URL (YouTube/Vimeo)
              </p>
              <input 
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="form-input w-full rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#30D158]/50 border-none bg-[#1E1E1E] h-14 placeholder:text-[#A9A9A9] p-4 text-base font-normal leading-normal"
                placeholder="YouTube veya Vimeo video linkini yapıştırın"
              />
            </label>
          </div>
        </div>

        {/* Section: Temel Bilgiler */}
        <section className="px-4">
          <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pt-5 pb-3">
            Temel Bilgiler
          </h2>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col">
              <p className="text-white text-base font-medium leading-normal pb-2">
                Tarif Adı <span className="text-red-500">*</span>
              </p>
              <input 
                required
                className="form-input w-full rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#30D158]/50 border-none bg-[#1E1E1E] h-14 placeholder:text-[#A9A9A9] p-4 text-base font-normal leading-normal"
                placeholder="Örn: Kremalı Mantarlı Tavuk"
              />
            </label>

            <label className="flex flex-col">
              <p className="text-white text-base font-medium leading-normal pb-2">
                Açıklama
              </p>
              <textarea 
                className="form-textarea w-full rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#30D158]/50 border-none bg-[#1E1E1E] min-h-32 placeholder:text-[#A9A9A9] p-4 text-base font-normal leading-normal"
                placeholder="Tarifiniz hakkında kısa bir açıklama yapın"
              />
            </label>

            <label className="flex flex-col">
              <p className="text-white text-base font-medium leading-normal pb-2">
                Kategori
              </p>
              <div className="relative">
                <select className="form-select appearance-none w-full rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#30D158]/50 border-none bg-[#1E1E1E] h-14 p-4 text-base font-normal leading-normal">
                  <option value="">Kategori Seçin</option>
                  <option>Ana Yemek</option>
                  <option>Tatlı</option>
                  <option>Çorba</option>
                  <option>Salata</option>
                  <option>Aperatif</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#A9A9A9]">
                  expand_more
                </span>
              </div>
            </label>

            <label className="flex flex-col">
              <p className="text-white text-base font-medium leading-normal pb-2">
                Mutfak
              </p>
              <div className="relative">
                <select className="form-select appearance-none w-full rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#30D158]/50 border-none bg-[#1E1E1E] h-14 p-4 text-base font-normal leading-normal">
                  <option value="">Mutfak Seçin</option>
                  <option>Türk Mutfağı</option>
                  <option>İtalyan Mutfağı</option>
                  <option>Fransız Mutfağı</option>
                  <option>Uzak Doğu Mutfağı</option>
                  <option>Dünya Mutfağı</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#A9A9A9]">
                  expand_more
                </span>
              </div>
            </label>
          </div>
        </section>

        {/* Section: Detaylar */}
        <section className="px-4">
          <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pt-8 pb-3">
            Detaylar
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col">
              <p className="text-white text-base font-medium leading-normal pb-2">
                Hazırlık (dk)
              </p>
              <input 
                type="number"
                min="0"
                className="form-input w-full rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#30D158]/50 border-none bg-[#1E1E1E] h-14 placeholder:text-[#A9A9A9] p-4 text-base font-normal"
                placeholder="20"
              />
            </label>

            <label className="flex flex-col">
              <p className="text-white text-base font-medium leading-normal pb-2">
                Pişirme (dk)
              </p>
              <input 
                type="number"
                min="0"
                className="form-input w-full rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#30D158]/50 border-none bg-[#1E1E1E] h-14 placeholder:text-[#A9A9A9] p-4 text-base font-normal"
                placeholder="45"
              />
            </label>

            <label className="flex flex-col">
              <p className="text-white text-base font-medium leading-normal pb-2">
                Kişi Sayısı <span className="text-red-500">*</span>
              </p>
              <input 
                type="number"
                min="1"
                required
                className="form-input w-full rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#30D158]/50 border-none bg-[#1E1E1E] h-14 placeholder:text-[#A9A9A9] p-4 text-base font-normal"
                placeholder="4"
              />
            </label>

            <label className="flex flex-col">
              <p className="text-white text-base font-medium leading-normal pb-2">
                Zorluk <span className="text-red-500">*</span>
              </p>
              <div className="relative">
                <select required className="form-select appearance-none w-full rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#30D158]/50 border-none bg-[#1E1E1E] h-14 p-4 text-base font-normal">
                  <option value="">Seçin</option>
                  <option>Kolay</option>
                  <option>Orta</option>
                  <option>Zor</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#A9A9A9]">
                  expand_more
                </span>
              </div>
            </label>
          </div>
        </section>

        {/* Section: Malzemeler */}
        <section className="px-4">
          <div className="flex justify-between items-center pt-8 pb-3">
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
              🥘 Malzemeler
            </h2>
            <button 
              onClick={addIngredient}
              className="flex items-center gap-1 text-[#30D158] font-bold text-sm"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Malzeme Ekle
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {ingredients.map((ingredient) => (
              <div key={ingredient.id} className="flex items-center gap-2 bg-[#1E1E1E] p-3 rounded-lg">
                <input 
                  type="number"
                  min="0"
                  step="0.1"
                  value={ingredient.amount}
                  onChange={(e) => updateIngredient(ingredient.id, 'amount', e.target.value)}
                  className="w-20 bg-transparent text-white outline-none border-b border-[#3A3A3C] focus:border-[#30D158]"
                  placeholder="Miktar"
                />
                <div className="relative w-32">
                  <select 
                    value={ingredient.unit}
                    onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                    className="form-select appearance-none w-full bg-transparent text-white text-sm outline-none border-b border-[#3A3A3C] focus:border-[#30D158]"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit} className="bg-[#1E1E1E]">{unit}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[#A9A9A9] text-sm">
                    expand_more
                  </span>
                </div>
                <input 
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                  className="flex-1 bg-transparent text-white outline-none border-b border-[#3A3A3C] focus:border-[#30D158]"
                  placeholder="Malzeme adı"
                />
                <button 
                  onClick={() => removeIngredient(ingredient.id)}
                  className="text-[#A9A9A9] hover:text-red-500 transition"
                >
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Tarif Adımları */}
        <section className="px-4">
          <div className="flex justify-between items-center pt-8 pb-3">
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
              📋 Yapılışı
            </h2>
            <button 
              onClick={addStep}
              className="flex items-center gap-1 text-[#30D158] font-bold text-sm"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Adım Ekle
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start bg-[#1E1E1E] p-3 rounded-lg gap-2">
                <span className="material-symbols-outlined text-[#A9A9A9] cursor-grab pt-1">
                  drag_indicator
                </span>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-start">
                    <p className="text-[#30D158] font-bold pt-1">{index + 1}.</p>
                    <textarea 
                      className="bg-transparent text-white font-medium ml-2 flex-1 outline-none resize-none"
                      placeholder="Adım açıklaması yazın..."
                      defaultValue={step.description}
                      rows={2}
                    />
                  </div>
                </div>
                <button 
                  onClick={() => removeStep(step.id)}
                  className="text-[#A9A9A9] hover:text-red-500 transition pt-1"
                >
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Soslar */}
        <section className="px-4">
          <div className="pt-8 pb-3">
            <button
              onClick={() => setShowSauces(!showSauces)}
              className="flex items-center gap-2 text-white text-[22px] font-bold leading-tight tracking-[-0.015em] w-full"
            >
              <span className="material-symbols-outlined">
                {showSauces ? 'expand_more' : 'chevron_right'}
              </span>
              🍯 Soslar (Opsiyonel)
            </button>
          </div>
          
          {showSauces && (
            <div className="flex flex-col gap-4">
              <p className="text-[#A9A9A9] text-sm">
                Tarifinizde kullanılan sosları buraya ekleyebilirsiniz
              </p>
              <button className="flex items-center gap-2 text-[#30D158] font-bold text-sm">
                <span className="material-symbols-outlined text-lg">add_circle</span>
                Sos Ekle
              </button>
            </div>
          )}
        </section>

        {/* Section: Etiketler */}
        <section className="px-4">
          <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pt-8 pb-3">
            🏷️ Etiketler
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <input 
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className="form-input flex-1 rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#30D158]/50 border-none bg-[#1E1E1E] h-14 placeholder:text-[#A9A9A9] p-4 text-base font-normal leading-normal"
                placeholder="Etiket yazın ve Enter'a basın"
              />
              <button
                onClick={addTag}
                type="button"
                className="px-6 h-14 rounded-lg bg-[#30D158] text-[#121212] font-bold text-base hover:bg-[#30D158]/90 transition"
              >
                Ekle
              </button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E1E1E] rounded-full text-white"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-[#A9A9A9] hover:text-red-500 transition"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Kaydet ve Sil Butonları */}
        <section className="px-4 pb-8 pt-8">
          <div className="flex gap-4">
            <button 
              onClick={handleDelete}
              className="w-full h-14 rounded-full border-2 border-red-500 text-red-500 font-bold text-base hover:bg-red-500/10 transition"
            >
              Sil
            </button>
            <button 
              onClick={handlePublish}
              className="w-full h-14 rounded-full bg-[#30D158] text-[#121212] font-bold text-base hover:bg-[#30D158]/90 transition"
            >
              Kaydet
            </button>
          </div>
        </section>
      </main>


    </div>
  );
}
