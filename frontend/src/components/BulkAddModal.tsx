'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Ingredient {
  id: number;
  name: string;
  defaultUnit: string;
  shelfLifeDays: number | null;
  quantity?: string;
  expiryDate?: string;
}

export default function BulkAddModal({ isOpen, onClose, onSuccess }: BulkAddModalProps) {
  const { token } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const categories = [
    { value: 'Sebzeler', label: 'Sebzeler' },
    { value: 'Meyveler', label: 'Meyveler' },
    { value: 'Et Ürünleri', label: 'Et Ürünleri' },
    { value: 'Süt Ürünleri', label: 'Süt Ürünleri' },
    { value: 'Tahıllar', label: 'Tahıllar' },
    { value: 'Baharatlar', label: 'Baharatlar' },
    { value: 'İçecekler', label: 'İçecekler' },
    { value: 'Bakliyatlar', label: 'Bakliyatlar' },
    { value: 'Temel Malzemeler', label: 'Temel Malzemeler' },
    { value: 'Soslar', label: 'Soslar' },
    { value: 'Yağlar', label: 'Yağlar' },
  ];

  useEffect(() => {
    if (selectedCategory && token) {
      loadIngredients();
    }
  }, [selectedCategory, token]);

  const loadIngredients = async () => {
    if (!token) return;

    setLoading(true);
    const response = await api.get<any[]>(
      `/api/categories/ingredients?category=${selectedCategory}`,
      token
    );

    if (response.success && response.data) {
      const ingredientsWithDefaults = response.data.map((ing: any) => ({
        ...ing,
        quantity: '',
        expiryDate: ing.shelfLifeDays
          ? new Date(Date.now() + ing.shelfLifeDays * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0]
          : '',
      }));
      setIngredients(ingredientsWithDefaults);
    }
    setLoading(false);
  };

  const handleQuantityChange = (id: number, value: string) => {
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, quantity: value } : ing))
    );
  };

  const handleExpiryChange = (id: number, value: string) => {
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, expiryDate: value } : ing))
    );
  };

  const handleSave = async () => {
    if (!token) return;

    // Sadece miktar girilmiş olanları al
    const itemsToAdd = ingredients.filter((ing) => ing.quantity && parseFloat(ing.quantity) > 0);

    if (itemsToAdd.length === 0) {
      return;
    }

    setSaving(true);

    // Her malzemeyi tek tek ekle
    const promises = itemsToAdd.map((ing) => {
      const quantity = parseFloat(ing.quantity || '0');
      const minQuantity = Math.round(quantity * 0.2 * 10) / 10; // %20

      return api.post(
        '/api/pantry',
        {
          name: ing.name,
          category: selectedCategory,
          quantity,
          minQuantity,
          unit: ing.defaultUnit,
          expiryDate: ing.expiryDate || null,
        },
        token
      );
    });

    await Promise.all(promises);

    setSaving(false);
    onSuccess();
    handleClose();
  };

  const handleClose = () => {
    setSelectedCategory('');
    setIngredients([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        className="flex w-full max-w-2xl flex-col overflow-hidden bg-[#121212] rounded-xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center border-b border-[#3A3A3C] px-4 py-3">
          <div className="w-6"></div>
          <h2 className="flex-1 text-center text-base font-bold tracking-tight text-white">
            Toplu Malzeme Girişi
          </h2>
          <div className="flex w-6 items-center justify-end">
            <button
              onClick={handleClose}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Category Selection */}
          <div className="mb-4">
            <label className="flex flex-col">
              <p className="pb-2 text-sm font-medium text-white">Kategori Seçin</p>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select w-full rounded-lg border border-[#3A3A3C] bg-[#1E1E1E] p-3 text-sm text-white focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]"
              >
                <option value="">Kategori Seçin</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Ingredients List */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-[#A0A0A0]">Malzemeler yükleniyor...</div>
            </div>
          )}

          {!loading && selectedCategory && ingredients.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="text-[#A0A0A0]">Bu kategoride malzeme bulunamadı</div>
            </div>
          )}

          {!loading && ingredients.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-[#A0A0A0] mb-2">
                Sadece eklemek istediğiniz malzemelerin miktarını girin
              </p>
              {ingredients.map((ing) => (
                <div
                  key={ing.id}
                  className="flex flex-col gap-2 rounded-lg bg-[#1E1E1E] p-3 border border-[#3A3A3C]"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">{ing.name}</p>
                    <span className="text-xs text-[#A0A0A0]">{ing.defaultUnit}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={ing.quantity}
                        onChange={(e) => handleQuantityChange(ing.id, e.target.value)}
                        placeholder="Miktar"
                        className="form-input w-full rounded-lg border border-[#3A3A3C] bg-[#121212] p-2 text-sm text-white placeholder:text-[#A0A0A0] focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="date"
                        value={ing.expiryDate}
                        onChange={(e) => handleExpiryChange(ing.id, e.target.value)}
                        className="form-input w-full rounded-lg border border-[#3A3A3C] bg-[#121212] p-2 text-sm text-white focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 gap-2 border-t border-[#3A3A3C] p-4">
          <button
            onClick={handleClose}
            type="button"
            className="flex h-10 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-transparent text-sm font-bold text-[#A0A0A0] transition-colors hover:bg-white/10"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={saving || ingredients.filter((i) => i.quantity && parseFloat(i.quantity) > 0).length === 0}
            type="button"
            className="flex h-10 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#30D158] text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
