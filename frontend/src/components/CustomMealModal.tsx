'use client';

import { useState } from 'react';

interface CustomMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  meals: any[];
  onSelectMeal: (mealId: number, servings: number) => void;
  onAddMeal: () => void;
}

export default function CustomMealModal({
  isOpen,
  onClose,
  meals,
  onSelectMeal,
  onAddMeal,
}: CustomMealModalProps) {
  const [selectedMeal, setSelectedMeal] = useState<number | null>(null);
  const [servings, setServings] = useState(1);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (selectedMeal) {
      onSelectMeal(selectedMeal, servings);
      setSelectedMeal(null);
      setServings(1);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm rounded-xl bg-[#1E1E1E] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 text-lg font-bold text-white">Hangi yemeği yaptınız?</h3>

        {meals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#A0A0A0] mb-4">Henüz yemek eklemediniz</p>
            <button
              onClick={onAddMeal}
              className="rounded-lg bg-[#30D158] px-6 py-3 text-white font-medium hover:bg-[#30D158]/90"
            >
              İlk Yemeğimi Ekle
            </button>
          </div>
        ) : (
          <>
            {/* Yemek Listesi - Grid */}
            <div className="mb-3 grid grid-cols-2 gap-2">
              {meals.slice(0, 6).map((meal) => (
                <button
                  key={meal.id}
                  onClick={() => setSelectedMeal(meal.id)}
                  className={`text-left rounded-lg p-2 transition ${
                    selectedMeal === meal.id
                      ? 'bg-[#30D158] text-white'
                      : 'bg-[#121212] text-white hover:bg-gray-700'
                  }`}
                >
                  <div className="font-medium text-sm">{meal.name}</div>
                  <div className="text-xs opacity-70">{meal.ingredients.length} malzeme</div>
                </button>
              ))}
            </div>

            {/* Kişi Sayısı */}
            {selectedMeal && (
              <div className="mb-3">
                <label className="block text-white text-xs font-medium mb-2">
                  Kaç kişilik?
                </label>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setServings(Math.max(1, servings - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-white text-lg hover:bg-gray-500"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold text-white w-10 text-center">
                    {servings}
                  </span>
                  <button
                    onClick={() => setServings(servings + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-white text-lg hover:bg-gray-500"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Butonlar */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg bg-gray-600 py-2 text-sm font-medium text-white hover:bg-gray-500"
              >
                İptal
              </button>
              {selectedMeal && (
                <button
                  onClick={handleSubmit}
                  className="flex-1 rounded-lg bg-[#30D158] py-2 text-sm font-medium text-white hover:bg-[#30D158]/90"
                >
                  Düş
                </button>
              )}
              <button
                onClick={onAddMeal}
                className="flex-1 rounded-lg bg-[#121212] py-2 text-sm font-medium text-[#30D158] hover:bg-gray-700"
              >
                + Ekle
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
