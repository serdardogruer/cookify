'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { MarketItem } from '@/types/market';

export default function MarketPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketItem | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Autocomplete state
  const [ingredientSuggestions, setIngredientSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: 'adet',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadMarketItems();
  }, [selectedCategory, token]);

  const loadCategories = async () => {
    const response = await api.get<any>('/api/categories');
    if (response.success && response.data) {
      setCategories(response.data);
    }
  };

  const loadMarketItems = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    const url = selectedCategory
      ? `/api/market?category=${selectedCategory}`
      : '/api/market';

    const response = await api.get<MarketItem[]>(url, token);
    if (response.success && response.data) {
      setItems(response.data);
    }
    setLoading(false);
  };

  const searchIngredients = async (query: string) => {
    if (query.length < 2) {
      setIngredientSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const response = await api.get<any[]>(`/api/categories/ingredients/search?q=${query}&limit=10`);
    if (response.success && response.data) {
      setIngredientSuggestions(response.data);
      setShowSuggestions(true);
    }
  };

  const selectIngredient = (ingredient: any) => {
    setFormData({
      ...formData,
      name: ingredient.name,
      category: ingredient.category.name,
      unit: ingredient.defaultUnit,
    });
    setShowSuggestions(false);
    setIngredientSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) return;

    const data = {
      ...formData,
      quantity: parseFloat(formData.quantity),
    };

    let response;
    if (editingItem) {
      response = await api.put(`/api/market/${editingItem.id}`, data, token);
    } else {
      response = await api.post('/api/market', data, token);
    }

    if (response.success) {
      setSuccess(editingItem ? 'Ürün güncellendi' : 'Ürün eklendi');
      setShowAddModal(false);
      setEditingItem(null);
      resetForm();
      loadMarketItems();
    } else {
      setError(response.error?.message || 'İşlem başarısız');
    }
  };

  const handleEdit = (item: MarketItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;

    if (!token) return;

    const response = await api.delete(`/api/market/${id}`, token);

    if (response.success) {
      setSuccess('Ürün silindi');
      loadMarketItems();
    } else {
      setError(response.error?.message || 'Silme başarısız');
    }
  };

  const handleMoveToPantry = async (id: number) => {
    if (!token) return;

    const response = await api.post(`/api/market/${id}/move-to-pantry`, {}, token);

    if (response.success) {
      setSuccess('Ürün dolaba taşındı');
      loadMarketItems();
    } else {
      setError(response.error?.message || 'Taşıma başarısız');
    }
  };

  const handleWhatsAppExport = async () => {
    if (!token) return;

    const response = await api.get<{ message: string }>('/api/market/export/whatsapp', token);

    if (response.success && response.data) {
      const message = encodeURIComponent(response.data.message);
      window.open(`https://wa.me/?text=${message}`, '_blank');
    } else {
      setError('Export başarısız');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: '',
      unit: 'adet',
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
    resetForm();
    setError('');
  };

  const pendingItems = items.filter((item) => item.status === 'PENDING');

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white">Yükleniyor...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Header />
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">🛒 Market Listesi</h1>
            <p className="text-gray-400 mt-2">Alışveriş listenizi yönetin</p>
          </div>

          {/* Messages */}
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

          <div className="flex gap-6">
            {/* Sidebar - Categories */}
            <div className="w-64 bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Kategoriler</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-2 rounded ${
                    selectedCategory === '' ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`}
                >
                  📦 Tümü ({pendingItems.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full text-left px-3 py-2 rounded ${
                      selectedCategory === cat.name
                        ? 'bg-blue-600'
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {selectedCategory || 'Tüm Ürünler'} ({pendingItems.length})
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleWhatsAppExport}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md"
                    >
                      📱 WhatsApp
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md"
                    >
                      🖨️ Yazdır
                    </button>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      + Ürün Ekle
                    </button>
                  </div>
                </div>

                {pendingItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    Market listeniz boş
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4">Ürün</th>
                          <th className="text-left py-3 px-4">Kategori</th>
                          <th className="text-left py-3 px-4">Miktar</th>
                          <th className="text-right py-3 px-4">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingItems.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-gray-700 hover:bg-gray-700/50"
                          >
                            <td className="py-3 px-4">{item.name}</td>
                            <td className="py-3 px-4">{item.category}</td>
                            <td className="py-3 px-4">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
                                >
                                  Düzenle
                                </button>
                                <button
                                  onClick={() => handleMoveToPantry(item.id)}
                                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                                >
                                  ✓ Alındı
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                                >
                                  Sil
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">
              {editingItem ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ürün Adı
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    searchIngredients(e.target.value);
                  }}
                  onFocus={() => {
                    if (formData.name.length >= 2) {
                      searchIngredients(formData.name);
                    }
                  }}
                  onBlur={() => {
                    // Delay to allow click on suggestion
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="Örn: domates, soğan..."
                  required
                />
                
                {/* Autocomplete Suggestions */}
                {showSuggestions && ingredientSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {ingredientSuggestions.map((ingredient) => (
                      <button
                        key={ingredient.id}
                        type="button"
                        onClick={() => selectIngredient(ingredient)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-600 flex items-center justify-between"
                      >
                        <span className="font-medium">{ingredient.name}</span>
                        <span className="text-sm text-gray-400">
                          {ingredient.category.name} • {ingredient.defaultUnit}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  required
                >
                  <option value="">Seçiniz</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Miktar
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Birim
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    required
                  >
                    <option value="adet">Adet</option>
                    <option value="kg">Kg</option>
                    <option value="gram">Gram</option>
                    <option value="litre">Litre</option>
                    <option value="ml">ML</option>
                    <option value="paket">Paket</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  {editingItem ? 'Güncelle' : 'Ekle'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
