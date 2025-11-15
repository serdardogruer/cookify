'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';

interface Ingredient {
  id: number;
  name: string;
  categoryId: number;
  defaultUnit: string;
  shelfLifeDays: number | null;
  category: {
    id: number;
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
}

interface Props {
  ingredients: Ingredient[];
  categories: Category[];
  token: string;
  onUpdate: () => void;
}

export default function IngredientManagement({ ingredients, categories, token, onUpdate }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    defaultUnit: 'adet',
    shelfLifeDays: '',
  });

  // Kategoriye göre gruplandır
  const groupedIngredients = categories.map(category => ({
    category,
    ingredients: ingredients.filter(ing => ing.categoryId === category.id)
  })).filter(group => group.ingredients.length > 0);

  // Filtreleme
  const filteredGroups = groupedIngredients
    .map(group => ({
      ...group,
      ingredients: group.ingredients.filter(ing =>
        ing.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(group => 
      group.ingredients.length > 0 && 
      (selectedCategory === null || group.category.id === selectedCategory)
    );

  const handleAdd = async () => {
    if (!formData.name || !formData.categoryId) {
      toast.error('Malzeme adı ve kategori zorunludur');
      return;
    }

    const response = await api.post('/api/admin/ingredients', {
      name: formData.name,
      categoryId: parseInt(formData.categoryId),
      defaultUnit: formData.defaultUnit,
      shelfLifeDays: formData.shelfLifeDays ? parseInt(formData.shelfLifeDays) : null,
    }, token);

    if (response.success) {
      toast.success('Malzeme eklendi');
      setIsAddModalOpen(false);
      setFormData({ name: '', categoryId: '', defaultUnit: 'adet', shelfLifeDays: '' });
      onUpdate();
    } else {
      toast.error(response.error?.message || 'Malzeme eklenemedi');
    }
  };

  const handleEdit = async () => {
    if (!editingIngredient || !formData.name || !formData.categoryId) {
      toast.error('Malzeme adı ve kategori zorunludur');
      return;
    }

    const response = await api.put(`/api/admin/ingredients/${editingIngredient.id}`, {
      name: formData.name,
      categoryId: parseInt(formData.categoryId),
      defaultUnit: formData.defaultUnit,
      shelfLifeDays: formData.shelfLifeDays ? parseInt(formData.shelfLifeDays) : null,
    }, token);

    if (response.success) {
      toast.success('Malzeme güncellendi');
      setEditingIngredient(null);
      setFormData({ name: '', categoryId: '', defaultUnit: 'adet', shelfLifeDays: '' });
      onUpdate();
    } else {
      toast.error(response.error?.message || 'Malzeme güncellenemedi');
    }
  };

  const handleDelete = async (id: number, name: string) => {

    const response = await api.delete(`/api/admin/ingredients/${id}`, token);

    if (response.success) {
      toast.success('Malzeme silindi');
      onUpdate();
    } else {
      toast.error(response.error?.message || 'Malzeme silinemedi');
    }
  };

  const openEditModal = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      categoryId: ingredient.categoryId.toString(),
      defaultUnit: ingredient.defaultUnit,
      shelfLifeDays: ingredient.shelfLifeDays?.toString() || '',
    });
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingIngredient(null);
    setFormData({ name: '', categoryId: '', defaultUnit: 'adet', shelfLifeDays: '' });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Malzeme Yönetimi</h2>
          <p className="text-sm text-[#A0A0A0]">Toplam {ingredients.length} malzeme</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#30D158] text-white rounded-lg hover:bg-[#28a745] transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
          Yeni Malzeme
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Malzeme ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-[#1E1E1E] border border-[#3A3A3C] rounded-lg text-white placeholder-[#A0A0A0] focus:outline-none focus:border-[#30D158]"
          />
        </div>
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
          className="px-4 py-2 bg-[#1E1E1E] border border-[#3A3A3C] rounded-lg text-white focus:outline-none focus:border-[#30D158]"
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Grouped List */}
      <div className="space-y-4">
        {filteredGroups.map(group => (
          <div key={group.category.id} className="bg-[#1E1E1E] rounded-lg overflow-hidden">
            <div className="bg-[#2A2A2A] px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-semibold">{group.category.name}</h3>
              <span className="text-sm text-[#A0A0A0]">{group.ingredients.length} malzeme</span>
            </div>
            <div className="divide-y divide-[#2A2A2A]">
              {group.ingredients.map(ingredient => (
                <div 
                  key={ingredient.id} 
                  onClick={() => openEditModal(ingredient)}
                  className="px-4 py-3 flex items-center gap-4 hover:bg-[#2A2A2A] cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{ingredient.name}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[#A0A0A0] whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">scale</span>
                      {ingredient.defaultUnit}
                    </span>
                    {ingredient.shelfLifeDays && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">schedule</span>
                        {ingredient.shelfLifeDays} gün
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredGroups.length === 0 && (
          <div className="bg-[#1E1E1E] rounded-lg p-8 text-center">
            <span className="material-symbols-outlined text-5xl text-[#A0A0A0] mb-2">search_off</span>
            <p className="text-[#A0A0A0]">Malzeme bulunamadı</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || editingIngredient) && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-[#1E1E1E] rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">
              {editingIngredient ? 'Malzeme Düzenle' : 'Yeni Malzeme Ekle'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#A0A0A0] mb-2">Malzeme Adı *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-[#121212] border border-[#3A3A3C] rounded-lg text-white focus:outline-none focus:border-[#30D158]"
                  placeholder="Örn: Domates"
                />
              </div>

              <div>
                <label className="block text-sm text-[#A0A0A0] mb-2">Kategori *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2 bg-[#121212] border border-[#3A3A3C] rounded-lg text-white focus:outline-none focus:border-[#30D158]"
                >
                  <option value="">Kategori seçin</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#A0A0A0] mb-2">Varsayılan Birim</label>
                <select
                  value={formData.defaultUnit}
                  onChange={(e) => setFormData({ ...formData, defaultUnit: e.target.value })}
                  className="w-full px-4 py-2 bg-[#121212] border border-[#3A3A3C] rounded-lg text-white focus:outline-none focus:border-[#30D158]"
                >
                  <option value="adet">Adet</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="gram">Gram</option>
                  <option value="litre">Litre</option>
                  <option value="ml">Mililitre (ml)</option>
                  <option value="paket">Paket</option>
                  <option value="kutu">Kutu</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#A0A0A0] mb-2">Raf Ömrü (Gün)</label>
                <input
                  type="number"
                  value={formData.shelfLifeDays}
                  onChange={(e) => setFormData({ ...formData, shelfLifeDays: e.target.value })}
                  className="w-full px-4 py-2 bg-[#121212] border border-[#3A3A3C] rounded-lg text-white focus:outline-none focus:border-[#30D158]"
                  placeholder="Örn: 7"
                  min="1"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-[#3A3A3C] text-white rounded-lg hover:bg-[#4A4A4C] transition-colors"
              >
                İptal
              </button>
              {editingIngredient && (
                <button
                  onClick={() => {
                    handleDelete(editingIngredient.id, editingIngredient.name);
                    closeModal();
                  }}
                  className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Sil
                </button>
              )}
              <button
                onClick={editingIngredient ? handleEdit : handleAdd}
                className="flex-1 px-4 py-2 bg-[#30D158] text-white rounded-lg hover:bg-[#28a745] transition-colors"
              >
                {editingIngredient ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
