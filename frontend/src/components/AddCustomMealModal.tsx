'use client';

import { useState } from 'react';

interface AddCustomMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, ingredients: any[]) => void;
}

export default function AddCustomMealModal({
  isOpen,
  onClose,
  onSubmit,
}: AddCustomMealModalProps) {
  const [mealName, setMealName] = useState('');
  const [ingredients, setIngredients] = useState([
    { name: '', quantity: '', unit: 'gram' },
  ]);

  if (!isOpen) return null;

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: 'gram' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: string, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handleSubmit = () => {
    if (!mealName.trim()) {
      alert('Yemek adını girin');
      return;
    }

    const validIngredients = ingredients.filter(
      (ing) => ing.name.trim() && ing.quantity
    );

    if (validIngredients.length === 0) {
      alert('En az bir malzeme ekleyin');
      return;
    }

    onSubmit(
      mealName,
      validIngredients.map((ing) => ({
        name: ing.name,
        quantity: parseFloat(ing.quantity),
        unit: ing.unit,
      }))
    );

    // Reset
    setMealName('');
    setIngredients([{ name: '', quantity: '', unit: 'gram' }]);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-xl bg-[#1E1E1E] p-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-xl font-bold text-white">Yeni Yemek Ekle</h3>

        {/* Yemek Adı */}
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-2">
            Yemek Adı
          </label>
          <input
            type="text"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            placeholder="Örn: Kuru Fasulye"
            className="w-full rounded-lg bg-[#121212] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#30D158]"
          />
        </div>

        {/* Malzemeler */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-white text-sm font-medium">
              Malzemeler
            </label>
            <button
              onClick={addIngredient}
              className="text-[#30D158] text-sm font-medium"
            >
              + Ekle
            </button>
          </div>

          <div className="space-y-2">
            {ingredients.map((ing, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  placeholder="Malzeme"
                  className="flex-1 rounded-lg bg-[#121212] px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none"
                />
                <input
                  type="number"
                  value={ing.quantity}
                  onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                  placeholder="Miktar"
                  className="w-20 rounded-lg bg-[#121212] px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none"
                />
                <select
                  value={ing.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  className="w-24 rounded-lg bg-[#121212] px-2 py-2 text-white text-sm focus:outline-none"
                >
                  <option>gram</option>
                  <option>kg</option>
                  <option>adet</option>
                  <option>litre</option>
                  <option>ml</option>
                </select>
                {ingredients.length > 1 && (
                  <button
                    onClick={() => removeIngredient(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-gray-600 py-3 text-base font-medium text-white hover:bg-gray-500"
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-lg bg-[#30D158] py-3 text-base font-medium text-white hover:bg-[#30D158]/90"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
