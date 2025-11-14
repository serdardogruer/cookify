'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';

interface MarketItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  marketQuantity?: number;
  marketUnit?: string;
  category: string;
  completed: boolean;
}

export default function MarketPage() {
  const { token } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketItem | null>(null);
  
  // Form states
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('adet');
  const [editMarketQuantity, setEditMarketQuantity] = useState('');
  const [editMarketUnit, setEditMarketUnit] = useState('');
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Autocomplete states
  const [ingredientSuggestions, setIngredientSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    loadMarketItems();
  }, [token]);

  const loadMarketItems = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    const response = await api.get<MarketItem[]>('/api/market', token);
    if (response.success && response.data) {
      setItems(response.data);
    }
    setLoading(false);
  };

  const handleMoveToPantry = async (id: number) => {
    if (!token) return;

    const response = await api.post(`/api/market/${id}/move-to-pantry`, {}, token);
    if (response.success) {
      toast.success('Ürün dolabınıza eklendi');
      loadMarketItems();
    } else {
      toast.error('Ürün eklenemedi');
    }
  };

  const handleEdit = (item: MarketItem) => {
    setEditingItem(item);
    setEditMarketQuantity((item.marketQuantity || item.quantity).toString());
    setEditMarketUnit(item.marketUnit || item.unit);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!token || !editingItem) return;

    const response = await api.put(
      `/api/market/${editingItem.id}`,
      {
        marketQuantity: parseFloat(editMarketQuantity),
        marketUnit: editMarketUnit,
      },
      token
    );

    if (response.success) {
      toast.success('Market paketi güncellendi');
      setShowEditModal(false);
      setEditingItem(null);
      loadMarketItems();
    } else {
      toast.error('Güncelleme başarısız');
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;

    const response = await api.delete(`/api/market/${id}`, token);
    if (response.success) {
      toast.success('Ürün silindi');
      loadMarketItems();
    } else {
      toast.error('Silme işlemi başarısız');
    }
  };

  const handleClearAll = async () => {
    if (!token) return;

    const response = await api.delete('/api/market/clear', token);
    if (response.success) {
      toast.success('Liste temizlendi');
      loadMarketItems();
    } else {
      toast.error('Temizleme işlemi başarısız');
    }
  };

  const searchIngredients = async (query: string) => {
    if (query.length < 2) {
      setIngredientSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const response = await api.get<any[]>(`/api/categories/ingredients/search?q=${query}&limit=5`);
    if (response.success && response.data) {
      setIngredientSuggestions(response.data);
      setShowSuggestions(true);
    }
  };

  const handleIngredientNameChange = (value: string) => {
    setNewItemName(value);
    searchIngredients(value);
  };

  const selectIngredient = (ingredient: any) => {
    setNewItemName(ingredient.name);
    setNewItemCategory(ingredient.category.name);
    setNewItemUnit(ingredient.defaultUnit);
    setShowSuggestions(false);
    setIngredientSuggestions([]);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newItemName || !newItemCategory) return;

    const response = await api.post('/api/market', {
      name: newItemName,
      category: newItemCategory,
      quantity: parseFloat(newItemQuantity) || 1,
      unit: newItemUnit,
    }, token);

    if (response.success) {
      toast.success('Ürün eklendi');
      setShowAddModal(false);
      setNewItemName('');
      setNewItemCategory('');
      setNewItemQuantity('');
      setNewItemUnit('adet');
      setShowSuggestions(false);
      setIngredientSuggestions([]);
      loadMarketItems();
    } else {
      toast.error('Ürün eklenemedi');
    }
  };

  // Kategoriye göre grupla
  const groupedItems = items.reduce((acc: any, item) => {
    const category = item.category || 'Diğer';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const totalItems = items.length;

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
          <div className="text-white">Yükleniyor...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="relative flex h-auto min-h-screen w-full flex-col text-[#E0E0E0] pb-24 bg-[#121212]">
        {/* Header */}
        <DashboardHeader />

        {/* Content Container */}
        <div className="max-w-7xl mx-auto w-full">
          {/* Page Header */}
          <div className="px-4 py-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-white text-2xl font-bold">Market Listem</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const text = items
                      .map((item) => `${item.name} - ${item.quantity} ${item.unit}`)
                      .join('\n');
                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
                      'Market Listem:\n\n' + text
                    )}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-md bg-green-500 px-3 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-green-600"
                  title="WhatsApp'ta Paylaş"
                >
                  <span className="material-symbols-outlined text-lg">call</span>
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="hidden lg:flex items-center justify-center gap-1.5 rounded-md bg-blue-500 px-3 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-600"
                  title="Yazdır"
                >
                  <span className="material-symbols-outlined text-lg">print</span>
                  <span>Yazdır</span>
                </button>
              </div>
            </div>
            <button
              onClick={handleClearAll}
              className="text-[#30D158] hover:text-[#30D158]/80 text-sm font-bold"
            >
              Tümünü Temizle
            </button>
          </div>

          {/* Summary */}
          <div className="px-4 pb-4">
            <div className="bg-[#1E1E1E] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-lg font-semibold">
                    {totalItems} ürün listemde
                  </p>
                  <p className="text-[#A0A0A0] text-sm">
                    Alındı butonuna basarak dolabınıza ekleyin
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#30D158] text-4xl">
                  shopping_cart
                </span>
              </div>
            </div>
          </div>

          {/* Items List */}
          <main className="flex-grow px-4 pb-24">
            {Object.keys(groupedItems).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-6xl text-[#30D158] mb-4">
                  shopping_cart
                </span>
                <p className="text-white text-lg font-bold mb-2">Market listen boş</p>
                <p className="text-[#A0A0A0] text-sm">İlk ürünü ekle</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {Object.keys(groupedItems)
                  .sort()
                  .map((category) => (
                    <details
                      key={category}
                      className="flex flex-col rounded-xl bg-[#1E1E1E] group"
                      open
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-4">
                        <p className="text-white text-base font-medium leading-normal">
                          {category} ({groupedItems[category].length})
                        </p>
                        <span className="material-symbols-outlined text-white group-open:rotate-180 transition-transform">
                          expand_more
                        </span>
                      </summary>
                      <div className="px-4 pb-2">
                        {groupedItems[category].map((item: MarketItem) => (
                          <div
                            key={item.id}
                            className="flex items-center py-3 border-t border-white/10"
                          >
                            <div className="flex-grow">
                              <p className="text-white text-base font-semibold leading-normal">
                                {item.name}
                              </p>
                              <div className="flex flex-col gap-0.5">
                                <p className="text-white/40 text-xs font-normal">
                                  Gereken: {item.quantity} {item.unit}
                                </p>
                                <p className="text-[#30D158] text-sm font-medium">
                                  Alınacak: {item.marketQuantity || item.quantity} {item.marketUnit || item.unit}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/80 hover:bg-blue-500"
                                title="Düzenle"
                              >
                                <span className="material-symbols-outlined text-white text-xl">
                                  edit
                                </span>
                              </button>
                              <button
                                onClick={() => handleMoveToPantry(item.id)}
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#30D158] hover:bg-[#30D158]/90"
                                title="Alındı - Dolabıma Ekle"
                              >
                                <span className="material-symbols-outlined text-[#121212] text-xl">
                                  check_circle
                                </span>
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/80 hover:bg-red-500"
                                title="Sil"
                              >
                                <span className="material-symbols-outlined text-white text-xl">
                                  delete
                                </span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
              </div>
            )}
          </main>
        </div>

        {/* Floating Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-24 right-4 lg:bottom-8 flex items-center justify-center w-14 h-14 bg-[#30D158] rounded-full shadow-lg shadow-[#30D158]/20 hover:bg-[#30D158]/90 transition-colors z-10"
          title="Ürün Ekle"
        >
          <span className="material-symbols-outlined text-3xl text-[#121212]">add</span>
        </button>

        {/* Bottom Navigation */}
        <BottomNav />

        {/* Edit Market Package Modal */}
        {showEditModal && editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex w-full max-w-sm flex-col overflow-hidden bg-[#121212] rounded-xl">
              <div className="flex shrink-0 items-center border-b border-[#3A3A3C] px-4 py-3">
                <div className="w-8"></div>
                <h2 className="flex-1 text-center text-base font-bold tracking-tight text-white">
                  Market Paketi Düzenle
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <div className="flex-1 space-y-4 p-4">
                <div className="rounded-lg bg-[#1E1E1E] p-3">
                  <p className="text-sm text-white/60 mb-1">Malzeme</p>
                  <p className="text-base font-semibold text-white">{editingItem.name}</p>
                </div>

                <div className="rounded-lg bg-[#1E1E1E] p-3">
                  <p className="text-sm text-white/60 mb-1">Tariften Gereken</p>
                  <p className="text-base text-white/80">
                    {editingItem.quantity} {editingItem.unit}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">Market'ten Alınacak</p>
                  <div className="flex items-end gap-3">
                    <label className="flex min-w-0 flex-[2] flex-col">
                      <p className="pb-1.5 text-sm font-medium text-white">Miktar</p>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={editMarketQuantity}
                        onChange={(e) => setEditMarketQuantity(e.target.value)}
                        className="form-input flex w-full rounded-lg border border-[#3A3A3C] bg-[#1E1E1E] p-3 text-sm text-white placeholder:text-[#A0A0A0] focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]"
                        placeholder="0"
                      />
                    </label>
                    <label className="flex min-w-0 flex-1 flex-col">
                      <p className="pb-1.5 text-sm font-medium text-white">Birim</p>
                      <select
                        value={editMarketUnit}
                        onChange={(e) => setEditMarketUnit(e.target.value)}
                        className="form-select w-full rounded-lg border border-[#3A3A3C] bg-[#1E1E1E] p-3 text-sm text-white focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]"
                      >
                        <option value="adet">adet</option>
                        <option value="paket">paket</option>
                        <option value="kg">kg</option>
                        <option value="gr">gr</option>
                        <option value="litre">litre</option>
                        <option value="ml">ml</option>
                      </select>
                    </label>
                  </div>
                  <p className="text-xs text-white/40">
                    Örn: Tarif 5 gr vanilya istiyor, market'ten 1 paket alacaksınız
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 border-t border-[#3A3A3C] p-4">
                <button
                  onClick={handleUpdate}
                  className="flex h-11 w-full items-center justify-center rounded-lg bg-[#30D158] text-sm font-bold text-white hover:opacity-90"
                >
                  Güncelle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Item Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex w-full max-w-sm flex-col overflow-hidden bg-[#121212] rounded-xl max-h-[85vh]">
              <div className="flex shrink-0 items-center border-b border-[#3A3A3C] px-4 py-3">
                <div className="w-8"></div>
                <h2 className="flex-1 text-center text-base font-bold tracking-tight text-white">
                  Ürün Ekle
                </h2>
                <div className="flex w-8 items-center justify-end">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>
              </div>
              <form onSubmit={handleAdd} className="flex-1 space-y-4 overflow-y-auto p-4">
                <label className="flex flex-col relative">
                  <p className="pb-1.5 text-sm font-medium text-white">Ürün Adı *</p>
                  <input 
                    required 
                    value={newItemName} 
                    onChange={(e) => handleIngredientNameChange(e.target.value)}
                    onFocus={() => newItemName.length >= 2 && setShowSuggestions(true)}
                    className="form-input flex w-full rounded-lg border border-[#3A3A3C] bg-[#1E1E1E] p-3 text-sm text-white placeholder:text-[#A0A0A0] focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]" 
                    placeholder="Örn: Domates"
                    autoComplete="off"
                  />
                  {/* Autocomplete Suggestions */}
                  {showSuggestions && ingredientSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1E1E1E] border border-[#3A3A3C] rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      {ingredientSuggestions.map((ingredient, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectIngredient(ingredient)}
                          className="w-full text-left px-3 py-2 hover:bg-[#30D158]/10 text-white text-sm border-b border-[#3A3A3C] last:border-b-0"
                        >
                          <div className="font-medium">{ingredient.name}</div>
                          <div className="text-xs text-[#A0A0A0]">
                            {ingredient.category.name} • {ingredient.defaultUnit}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </label>
                <label className="flex flex-col">
                  <p className="pb-1.5 text-sm font-medium text-white">Kategori *</p>
                  <select required value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} className="form-select w-full rounded-lg border border-[#3A3A3C] bg-[#1E1E1E] p-3 text-sm text-white focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]">
                    <option value="">Kategori Seç</option>
                    <option value="SEBZELER">Sebzeler</option>
                    <option value="MEYVELER">Meyveler</option>
                    <option value="ET_URUNLERI">Et Ürünleri</option>
                    <option value="SUT_URUNLERI">Süt Ürünleri</option>
                    <option value="TAHILLAR">Tahıllar</option>
                    <option value="BAHARATLAR">Baharatlar</option>
                    <option value="ICECEKLER">İçecekler</option>
                    <option value="ATISTIRMALIKLAR">Atıştırmalıklar</option>
                  </select>
                </label>
                <div className="flex items-end gap-3">
                  <label className="flex min-w-0 flex-[2] flex-col">
                    <p className="pb-1.5 text-sm font-medium text-white">Miktar</p>
                    <input type="number" min="0" step="0.1" value={newItemQuantity} onChange={(e) => setNewItemQuantity(e.target.value)} className="form-input flex w-full rounded-lg border border-[#3A3A3C] bg-[#1E1E1E] p-3 text-sm text-white placeholder:text-[#A0A0A0] focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]" placeholder="0" />
                  </label>
                  <label className="flex min-w-0 flex-1 flex-col">
                    <p className="pb-1.5 text-sm font-medium text-white">Birim</p>
                    <select value={newItemUnit} onChange={(e) => setNewItemUnit(e.target.value)} className="form-select w-full rounded-lg border border-[#3A3A3C] bg-[#1E1E1E] p-3 text-sm text-white focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]">
                      <option value="adet">adet</option>
                      <option value="kg">kg</option>
                      <option value="gr">gr</option>
                      <option value="litre">litre</option>
                      <option value="ml">ml</option>
                    </select>
                  </label>
                </div>
              </form>
              <div className="flex shrink-0 flex-col space-y-2 border-t border-[#3A3A3C] p-4">
                <button onClick={handleAdd} type="button" className="flex h-11 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#30D158] text-sm font-bold text-white transition-opacity hover:opacity-90">Ekle</button>
                <button onClick={() => setShowAddModal(false)} type="button" className="flex h-11 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-transparent text-sm font-bold text-[#A0A0A0] transition-colors hover:bg-white/10">İptal</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}