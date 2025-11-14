'use client';

import { useState } from 'react';

interface MealConsumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: string, servings: number) => void;
}

export default function MealConsumptionModal({
  isOpen,
  onClose,
  onSubmit,
}: MealConsumptionModalProps) {
  const [step, setStep] = useState<'question' | 'category' | 'servings'>('question');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServings, setSelectedServings] = useState(4);

  if (!isOpen) return null;

  const categories = [
    { id: 'soup', label: '🍲 Çorba', icon: '🍲' },
    { id: 'meat', label: '🥩 Etli Yemek', icon: '🥩' },
    { id: 'pasta', label: '🍝 Makarna', icon: '🍝' },
    { id: 'fried', label: '🍟 Kızartma', icon: '🍟' },
    { id: 'dessert', label: '🍰 Tatlı', icon: '🍰' },
    { id: 'salad', label: '🥗 Salata', icon: '🥗' },
    { id: 'other', label: '🍴 Diğer', icon: '🍴' },
  ];

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setStep('servings');
  };

  const handleSubmit = () => {
    onSubmit(selectedCategory, selectedServings);
    handleClose();
  };

  const handleClose = () => {
    setStep('question');
    setSelectedCategory('');
    setSelectedServings(4);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-md rounded-xl bg-[#1E1E1E] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Adım 1: Soru */}
        {step === 'question' && (
          <>
            <h3 className="mb-4 text-xl font-bold text-white text-center">
              🍳 Bugün yemek yaptınız mı?
            </h3>
            <p className="mb-6 text-sm text-[#A0A0A0] text-center">
              Malzeme tüketiminizi takip etmek için
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setStep('category')}
                className="w-full rounded-lg bg-[#30D158] py-4 text-lg font-medium text-white transition-colors hover:bg-[#30D158]/90"
              >
                Evet →
              </button>
              <button
                onClick={handleClose}
                className="w-full rounded-lg bg-gray-600 py-3 text-base font-medium text-white transition-colors hover:bg-gray-500"
              >
                Hayır
              </button>
              <p className="text-xs text-[#A0A0A0] text-center mt-2">
                💡 İpucu: "Hayır" dersen, Dolabım'dan manuel düşebilirsin
              </p>
            </div>
          </>
        )}

        {/* Adım 2: Kategori Seçimi */}
        {step === 'category' && (
          <>
            <h3 className="mb-4 text-xl font-bold text-white text-center">
              Ne tür yemek?
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className="flex flex-col items-center justify-center gap-2 rounded-lg bg-[#121212] py-6 text-white hover:bg-[#30D158] transition"
                >
                  <span className="text-3xl">{cat.icon}</span>
                  <span className="text-sm font-medium">{cat.label.replace(/^.+ /, '')}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep('question')}
              className="w-full rounded-lg bg-gray-600 py-3 text-base font-medium text-white transition-colors hover:bg-gray-500"
            >
              ← Geri
            </button>
          </>
        )}

        {/* Adım 3: Kişi Sayısı */}
        {step === 'servings' && (
          <>
            <h3 className="mb-4 text-xl font-bold text-white text-center">
              Kaç kişilik?
            </h3>
            <div className="mb-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  onClick={() => setSelectedServings(Math.max(1, selectedServings - 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-600 text-white text-2xl hover:bg-gray-500"
                >
                  −
                </button>
                <span className="text-4xl font-bold text-white w-16 text-center">
                  {selectedServings}
                </span>
                <button
                  onClick={() => setSelectedServings(selectedServings + 1)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-600 text-white text-2xl hover:bg-gray-500"
                >
                  +
                </button>
              </div>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSelectedServings(num)}
                    className={`h-10 w-10 rounded-lg text-sm font-medium transition ${
                      selectedServings === num
                        ? 'bg-[#30D158] text-white'
                        : 'bg-[#121212] text-white hover:bg-gray-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('category')}
                className="flex-1 rounded-lg bg-gray-600 py-3 text-base font-medium text-white transition-colors hover:bg-gray-500"
              >
                ← Geri
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 rounded-lg bg-[#30D158] py-3 text-base font-medium text-white transition-colors hover:bg-[#30D158]/90"
              >
                ✓ Tamam
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
