'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';

interface Category {
  id: number;
  name: string;
  icon?: string;
  _count: {
    ingredients: number;
  };
}

interface Props {
  categories: Category[];
  token: string;
  onUpdate: () => void;
}

export default function CategoryForm({ categories, token, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', icon: '' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Kategori adı gerekli');
      return;
    }

    setLoading(true);

    const response = editingId
      ? await api.put(`/api/admin/categories/${editingId}`, formData, token)
      : await api.post('/api/admin/categories', formData, token);

    if (response.success) {
      toast.success(editingId ? 'Kategori güncellendi' : 'Kategori eklendi');
      setFormData({ name: '', icon: '' });
      setEditingId(null);
      setIsFormOpen(false);
      onUpdate();
    } else {
      toast.error(response.error?.message || 'İşlem başarısız');
    }
    setLoading(false);
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, icon: category.icon || '' });
    setIsFormOpen(true);
    setSelectedCategory(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', icon: '' });
    setIsFormOpen(false);
  };

  const openCategoryDetail = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleDelete = async (id: number, name: string) => {
    const usage = await api.get(`/api/admin/categories/${id}/usage`, token);
    
    if (usage.success && !(usage.data as any).canDelete) {
      toast.error(`Bu kategori silinemez. ${(usage.data as any).usageCount} malzeme kullanıyor.`);
      return;
    }

    if (!confirm(`${name} kategorisini silmek istediğinize emin misiniz?`)) {
      return;
    }

    const response = await api.delete(`/api/admin/categories/${id}`, token);

    if (response.success) {
      toast.success('Kategori silindi');
      onUpdate();
    } else {
      toast.error(response.error?.message || 'İşlem başarısız');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Kategori Yönetimi</h2>
          <p className="text-sm text-[#A0A0A0]">Toplam {categories.length} kategori</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#30D158] text-white rounded-lg hover:bg-[#28a745] transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
          Yeni Kategori Ekle
        </button>
      </div>

      {/* Liste */}
      <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#121212]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">İkon</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Malzeme Sayısı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {categories.map((category) => (
                <tr 
                  key={category.id} 
                  onClick={() => openCategoryDetail(category)}
                  className="hover:bg-[#2A2A2A] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-white">{category.name}</td>
                  <td className="px-4 py-3 text-sm text-[#A0A0A0]">{category.icon || '-'}</td>
                  <td className="px-4 py-3 text-sm text-white">{category._count.ingredients}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Detail Modal */}
      {selectedCategory && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCategory(null)}
        >
          <div 
            className="bg-[#1E1E1E] rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Kategori Detayları</h3>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-[#A0A0A0] hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-[#30D158] flex items-center justify-center text-3xl">
                  {selectedCategory.icon || '📦'}
                </div>
                <div>
                  <p className="text-white text-lg font-bold">{selectedCategory.name}</p>
                  <p className="text-sm text-[#A0A0A0]">{selectedCategory._count.ingredients} malzeme</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(selectedCategory);
                }}
                className="flex-1 px-4 py-2 bg-[#30D158] text-white rounded-lg hover:bg-[#28a745] transition-colors"
              >
                Düzenle
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(selectedCategory.id, selectedCategory.name);
                  setSelectedCategory(null);
                }}
                className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isFormOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCancel}
        >
          <form 
            onSubmit={handleSubmit} 
            className="bg-[#1E1E1E] rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">
              {editingId ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#A0A0A0] mb-2">Kategori Adı *</label>
                <input
                  type="text"
                  placeholder="Örn: BAHARATLAR"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-[#121212] border border-[#3A3A3C] rounded-lg text-white focus:outline-none focus:border-[#30D158]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#A0A0A0] mb-2">İkon (Emoji)</label>
                <input
                  type="text"
                  placeholder="Örn: 🌶️"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 bg-[#121212] border border-[#3A3A3C] rounded-lg text-white focus:outline-none focus:border-[#30D158]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-[#3A3A3C] text-white rounded-lg hover:bg-[#4A4A4C] transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#30D158] text-white rounded-lg hover:bg-[#28a745] transition-colors disabled:opacity-50"
              >
                {editingId ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
