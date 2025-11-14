'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardHeader from '@/components/DashboardHeader';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { PantryItem } from '@/types/pantry';
import ConsumeModal from '@/components/ConsumeModal';
import CustomMealModal from '@/components/CustomMealModal';
import AddCustomMealModal from '@/components/AddCustomMealModal';

export default function PantryPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConsumeModal, setShowConsumeModal] = useState(false);
  const [consumingItem, setConsumingItem] = useState<PantryItem | null>(null);
  const [consumeAmount, setConsumeAmount] = useState('');
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  // Custom meals
  const [showMealModal, setShowMealModal] = useState(false);
  const [customMeals, setCustomMeals] = useState<any[]>([]);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  
  // Form states
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemMinQuantity, setNewItemMinQuantity] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('adet');
  const [newItemExpiryDate, setNewItemExpiryDate] = useState('');
  
  // Autocomplete states
  const [ingredientSuggestions, setIngredientSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Kategori isimlerini düzelt
  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'SEBZELER': 'Sebzeler',
      'MEYVELER': 'Meyveler',
      'ET_URUNLERI': 'Et Ürünleri',
      'SUT_URUNLERI': 'Süt Ürünleri',
      'SÜT ÜRÜNLERİ': 'Süt Ürünleri',
      'TAHILLAR': 'Tahıllar',
      'BAHARATLAR': 'Baharatlar',
      'TEMEL MALZEMELER': 'Temel Malzemeler',
      'SOSLAR': 'Soslar',
      'TATLANDIRICILAR': 'Tatlılar',
      'ICECEKLER': 'İçecekler',
      'ATISTIRMALIKLAR': 'Atıştırmalıklar',
      'BAKLAGILLER': 'Baklagiller',
      'DİĞER': 'Diğer',
      'DIGER': 'Diğer',
    };
    return categoryMap[category] || category;
  };

  useEffect(() => {
    loadPantryItems();
    loadCustomMeals();
  }, [token]);

  const loadCustomMeals = async () => {
    if (!token) return;

    const response = await api.get<any[]>('/api/custom-meals', token);
    if (response.success && response.data) {
      setCustomMeals(response.data);
    }
  };

  const handleMealConsume = async (mealId: number, servings: number) => {
    if (!token) return;

    const response = await api.post(
      '/api/custom-meals/consume',
      { mealId, servings },
      token
    );

    if (response.success) {
      toast.success('Malzemeler düşüldü!');
      setShowMealModal(false);
      loadPantryItems();
    } else {
      toast.error('İşlem başarısız');
    }
  };

  const handleAddMeal = () => {
    setShowMealModal(false);
    setShowAddMealModal(true);
  };

  const handleSaveMeal = async (name: string, ingredients: any[]) => {
    if (!token) return;

    const response = await api.post(
      '/api/custom-meals',
      { name, ingredients },
      token
    );

    if (response.success) {
      toast.success('Yemek eklendi!');
      setShowAddMealModal(false);
      loadCustomMeals();
    } else {
      toast.error('Kayıt başarısız');
    }
  };

  const loadPantryItems = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    const response = await api.get<PantryItem[]>('/api/pantry', token);
    if (response.success && response.data) {
      setItems(response.data);
      
      // Sadece miktarı sıfırdan büyük olan malzemelerin kategorilerini al
      const itemsWithStock = response.data.filter(item => item.quantity > 0);
      const uniqueCategories = Array.from(new Set(itemsWithStock.map(item => item.category)));
      setAvailableCategories(uniqueCategories);
    }
    setLoading(false);
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

  const handleQuantityChange = (value: string) => {
    setNewItemQuantity(value);
    // Miktar değiştiğinde minimum miktarı otomatik hesapla (%20)
    const quantity = parseFloat(value);
    if (!isNaN(quantity) && quantity > 0) {
      const minQty = Math.round(quantity * 0.2 * 10) / 10; // %20'si, 1 ondalık basamak
      setNewItemMinQuantity(minQty.toString());
    } else {
      setNewItemMinQuantity('');
    }
  };

  const selectIngredient = (ingredient: any) => {
    setNewItemName(ingredient.name);
    // Backend'den gelen kategori zaten doğru formatta (SEBZELER, MEYVELER, vb.)
    setNewItemCategory(ingredient.category.name);
    setNewItemUnit(ingredient.defaultUnit);
    
    // Tahmini SKT hesapla
    if (ingredient.shelfLifeDays) {
      const today = new Date();
      const expiryDate = new Date(today.getTime() + ingredient.shelfLifeDays * 24 * 60 * 60 * 1000);
      const formattedDate = expiryDate.toISOString().split('T')[0];
      setNewItemExpiryDate(formattedDate);
    } else {
      setNewItemExpiryDate('');
    }
    
    setShowSuggestions(false);
    setIngredientSuggestions([]);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newItemName || !newItemCategory) return;

    const response = await api.post('/api/pantry', {
      name: newItemName,
      category: newItemCategory,
      quantity: parseFloat(newItemQuantity) || 1,
      minQuantity: parseFloat(newItemMinQuantity) || 0,
      unit: newItemUnit,
      expiryDate: newItemExpiryDate || null,
    }, token);

    if (response.success) {
      toast.success('Malzeme eklendi');
      setShowAddModal(false);
      setNewItemName('');
      setNewItemCategory('');
      setNewItemQuantity('');
      setNewItemMinQuantity('');
      setNewItemUnit('adet');
      setNewItemExpiryDate('');
      setShowSuggestions(false);
      setIngredientSuggestions([]);
      loadPantryItems();
    } else {
      toast.error('Malzeme eklenemedi');
    }
  };

  const handleEdit = (item: PantryItem) => {
    setEditingItem(item);
    setNewItemName(item.name);
    setNewItemCategory(item.category);
    setNewItemQuantity(item.quantity.toString());
    setNewItemMinQuantity(item.minQuantity?.toString() || '0');
    setNewItemUnit(item.unit);
    setNewItemExpiryDate(item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '');
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingItem || !newItemName || !newItemCategory) return;

    const response = await api.put(`/api/pantry/${editingItem.id}`, {
      name: newItemName,
      category: newItemCategory,
      quantity: parseFloat(newItemQuantity) || 1,
      minQuantity: parseFloat(newItemMinQuantity) || 0,
      unit: newItemUnit,
      expiryDate: newItemExpiryDate || null,
    }, token);

    if (response.success) {
      toast.success('Malzeme güncellendi');
      setShowEditModal(false);
      setEditingItem(null);
      setNewItemName('');
      setNewItemCategory('');
      setNewItemQuantity('');
      setNewItemMinQuantity('');
      setNewItemUnit('adet');
      setNewItemExpiryDate('');
      loadPantryItems();
    } else {
      toast.error('Güncelleme başarısız');
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;

    const response = await api.delete(`/api/pantry/${id}`, token);
    if (response.success) {
      toast.success('Malzeme silindi');
      loadPantryItems();
    } else {
      toast.error('Silme işlemi başarısız');
    }
  };

  const handleConsumeClick = (item: PantryItem) => {
    setConsumingItem(item);
    setConsumeAmount('');
    setShowConsumeModal(true);
  };

  const handleConsumeSubmit = async () => {
    if (!token || !consumingItem) return;
    
    const amount = parseFloat(consumeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Geçerli bir miktar girin');
      return;
    }

    if (amount > consumingItem.quantity) {
      toast.error('Stoktan fazla miktar düşülemez');
      return;
    }

    const newQuantity = consumingItem.quantity - amount;

    const response = await api.put(
      `/api/pantry/${consumingItem.id}`,
      { quantity: newQuantity },
      token
    );

    if (response.success) {
      toast.success(`${amount} ${consumingItem.unit} düşüldü`);
      setShowConsumeModal(false);
      setConsumingItem(null);
      setConsumeAmount('');
      loadPantryItems();
    } else {
      toast.error('İşlem başarısız');
    }
  };

  const handleAddToMarket = async (id: number) => {
    if (!token) return;

    const response = await api.post(`/api/pantry/${id}/add-to-market`, {}, token);
    if (response.success) {
      toast.success('Market listesine eklendi');
    }
  };

  // Filtreleme
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Tümü' || item.category === selectedCategory;
    const hasQuantity = item.quantity > 0; // Miktarı sıfırdan büyük olanlar
    return matchesSearch && matchesCategory && hasQuantity;
  });

  // Kategoriye göre grupla
  const groupedItems = filteredItems.reduce((acc: any, item) => {
    const category = item.category || 'Diğer';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const getStockPercentage = (item: PantryItem) => {
    if (!item.initialQuantity || item.initialQuantity === 0) return 100;
    return Math.round((item.quantity / item.initialQuantity) * 100);
  };

  const getCategoryName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'SEBZELER': 'Sebzeler',
      'MEYVELER': 'Meyveler',
      'ET_URUNLERI': 'Et Ürünleri',
      'SUT_URUNLERI': 'Süt Ürünleri',
      'TAHILLAR': 'Tahıllar',
      'BAHARATLAR': 'Baharatlar',
      'ICECEKLER': 'İçecekler',
      'ATISTIRMALIKLAR': 'Atıştırmalıklar',
      'BAKLAGILLER': 'Baklagiller',
    };
    return categoryMap[category] || category;
  };

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return { text: '', color: '' };

    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Tarihi formatla (DD.MM.YY)
    const formattedDate = expiry.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });

    if (daysLeft < 0) return { text: `SKT: ${formattedDate}`, color: 'text-red-400' };
    if (daysLeft <= 3) return { text: `SKT: ${formattedDate}`, color: 'text-red-400' };
    if (daysLeft <= 7) return { text: `SKT: ${formattedDate}`, color: 'text-yellow-400' };
    return { text: `SKT: ${formattedDate}`, color: 'text-green-400' };
  };

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
          <div className="px-4 py-4 flex items-center justify-between">
            <h1 className="text-white text-2xl font-bold">Dolabım</h1>
            <button
              onClick={() => setShowMealModal(true)}
              className="flex items-center gap-2 rounded-lg bg-[#30D158] px-4 py-2 text-sm font-medium text-white hover:bg-[#30D158]/90 transition"
            >
              <span className="material-symbols-outlined text-base">restaurant</span>
              Yemek Yaptım
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-4 py-2">
            <div className="flex w-full items-stretch rounded-lg h-12 bg-[#1E1E1E]">
              <div className="flex items-center justify-center pl-4 text-[#30D158]">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-white placeholder:text-[#A0A0A0] px-4 focus:outline-none"
                placeholder="Malzeme ara..."
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-3 px-4 py-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Tümü butonu */}
            <button
              onClick={() => setSelectedCategory('Tümü')}
              className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 ${
                selectedCategory === 'Tümü'
                  ? 'bg-[#30D158] text-[#121212] font-bold'
                  : 'bg-[#1E1E1E] text-white hover:bg-[#30D158]/10'
              }`}
            >
              <p className="text-sm">
                Tümü ({items.filter(item => item.quantity > 0 && item.name.toLowerCase().includes(searchQuery.toLowerCase())).length})
              </p>
            </button>

            {/* Dinamik kategoriler - sadece dolu olanlar, büyükten küçüğe sıralı */}
            {availableCategories
              .map((category) => {
                const categoryItems = items.filter(item => 
                  item.quantity > 0 &&
                  item.category === category && 
                  item.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
                return { category, count: categoryItems.length };
              })
              .filter(item => item.count > 0) // Boş kategorileri filtrele
              .sort((a, b) => b.count - a.count) // Büyükten küçüğe sırala
              .map(({ category, count }) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 ${
                    selectedCategory === category
                      ? 'bg-[#30D158] text-[#121212] font-bold'
                      : 'bg-[#1E1E1E] text-white hover:bg-[#30D158]/10'
                  }`}
                >
                  <p className="text-sm">{getCategoryLabel(category)} ({count})</p>
                </button>
              ))}
          </div>

          {/* Items List */}
          <main className="flex-grow p-4 pb-24">
            {Object.keys(groupedItems).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-6xl text-[#30D158] mb-4">
                  kitchen
                </span>
                <p className="text-white text-lg font-bold mb-2">Dolabın boş görünüyor</p>
                <p className="text-[#A0A0A0] text-sm">İlk malzemeni ekle</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {Object.keys(groupedItems)
                  .sort()
                  .map((category) => (
                    <div key={category} className="flex flex-col gap-4 rounded-xl bg-[#1E1E1E] p-4">
                      <h3 className="text-base font-bold text-white uppercase tracking-wider">
                        {getCategoryName(category)} ({groupedItems[category].length})
                      </h3>
                      <div className="flex flex-col gap-4">
                        {groupedItems[category].map((item: PantryItem) => {
                          const percentage = getStockPercentage(item);
                          const expiryStatus = getExpiryStatus(item.expiryDate);

                          return (
                            <div key={item.id} className="flex flex-col gap-2">
                              <div className="flex items-start justify-between">
                                <div className="flex flex-col gap-1.5">
                                  <p className="text-sm text-white/90">{item.name}</p>
                                  <div className="flex items-center gap-2 text-xs text-white/70">
                                    <span>
                                      {item.quantity} {item.unit}
                                    </span>
                                    {expiryStatus.text && (
                                      <span className={expiryStatus.color}>
                                        {expiryStatus.text}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleConsumeClick(item)}
                                    className="flex h-7 w-7 items-center justify-center rounded bg-orange-600 text-white hover:bg-orange-700"
                                    title="Stok Düş"
                                  >
                                    <span className="material-symbols-outlined text-base">
                                      remove
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => handleAddToMarket(item.id)}
                                    className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-white hover:bg-blue-700"
                                    title="Market'e ekle"
                                  >
                                    <span className="material-symbols-outlined text-base">
                                      shopping_cart
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => handleEdit(item)}
                                    className="flex h-7 w-7 items-center justify-center rounded bg-yellow-600 text-white hover:bg-yellow-700"
                                    title="Düzenle"
                                  >
                                    <span className="material-symbols-outlined text-base">
                                      edit
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    className="flex h-7 w-7 items-center justify-center rounded bg-red-600 text-white hover:bg-red-700"
                                    title="Sil"
                                  >
                                    <span className="material-symbols-outlined text-base">
                                      delete
                                    </span>
                                  </button>
                                </div>
                              </div>
                              {/* Progress Bar */}
                              <div className="h-1.5 w-full rounded-full bg-black/20">
                                <div
                                  className={`h-full rounded-full ${
                                    item.minQuantity && item.quantity <= item.minQuantity
                                      ? 'bg-red-500'
                                      : percentage > 50
                                      ? 'bg-[#30D158]'
                                      : percentage > 20
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </main>
        </div>

        {/* Floating Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-24 right-4 lg:bottom-8 flex items-center justify-center w-14 h-14 bg-[#30D158] rounded-full shadow-lg shadow-[#30D158]/20 hover:bg-[#30D158]/90 transition-colors z-10"
          title="Malzeme Ekle"
        >
          <span className="material-symbols-outlined text-3xl text-[#121212]">add</span>
        </button>

        {/* Bottom Navigation */}
        <BottomNav />

        {/* Consume Modal */}
        <ConsumeModal
          isOpen={showConsumeModal}
          onClose={() => {
            setShowConsumeModal(false);
            setConsumingItem(null);
            setConsumeAmount('');
          }}
          item={consumingItem}
          consumeAmount={consumeAmount}
          setConsumeAmount={setConsumeAmount}
          onSubmit={handleConsumeSubmit}
        />

        {/* Custom Meal Modal */}
        <CustomMealModal
          isOpen={showMealModal}
          onClose={() => setShowMealModal(false)}
          meals={customMeals}
          onSelectMeal={handleMealConsume}
          onAddMeal={handleAddMeal}
        />

        {/* Add Custom Meal Modal */}
        <AddCustomMealModal
          isOpen={showAddMealModal}
          onClose={() => setShowAddMealModal(false)}
          onSubmit={handleSaveMeal}
        />

        {/* Edit Item Modal */}
        {showEditModal && editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex w-full max-w-sm flex-col overflow-hidden bg-[#121212] rounded-xl">
              <div className="flex shrink-0 items-center border-b border-[#3A3A3C] px-3 py-2">
                <div className="w-6"></div>
                <h2 className="flex-1 text-center text-sm font-bold tracking-tight text-white">
                  Malzeme Düzenle
                </h2>
                <div className="flex w-6 items-center justify-end">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingItem(null);
                      setNewItemName('');
                      setNewItemCategory('');
                      setNewItemQuantity('');
                      setNewItemUnit('adet');
                      setNewItemExpiryDate('');
                    }}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdate} className="flex-1 space-y-3 p-3">
                <label className="flex flex-col">
                  <p className="pb-1 text-xs font-medium text-white">Malzeme Adı *</p>
                  <input
                    required
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="form-input flex w-full rounded-lg border border-[#3A3A3C] bg-[#1E1E1E] p-2 text-xs text-white placeholder:text-[#A0A0A0] focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]"
                    placeholder="Örn: Domates"
                  />
                </label>

                <label className="flex flex-col">
                  <p className="pb-1 text-xs font-medium text-white">Kategori *</p>
                  <select
                    required
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="form-select w-full rounded-lg border border-[#3A3A3C] bg-[#1E1E1E] p-2 text-xs text-white focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]"
                  >
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

                <div className="flex items-end gap-2">
                  <label className="flex min-w-0 flex-[2] flex-col">
                    <p className="pb-1 text-xs font-medium text-white">Miktar</p>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(e.target.value)}
                      className="form-input flex w-full rounded-lg border border-[#3A3A3C] bg-[#1E1E1E] p-2 text-xs text-white placeholder:text-[#A0A0A0] focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]"
                      placeholder="0"
                    />
                  </label>
                  <label className="flex min-w-0 flex-1 flex-col">
                    <p className="pb-1 text-xs font-medium text-white">Birim</p>
                    <select
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value)}
                      className="form-select w-full rounded-lg border border-[#3A3A3C] bg-[#1E1E1E] p-2 text-xs text-white focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]"
                    >
                      <option value="adet">adet</option>
                      <option value="kg">kg</option>
                      <option value="gr">gr</option>
                      <option value="litre">litre</option>
                      <option value="ml">ml</option>
                    </select>
                  </label>
                </div>

                <label className="flex flex-col">
                  <p className="pb-1 text-xs font-medium text-white">
                    Min. Miktar
                  </p>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newItemMinQuantity}
                    onChange={(e) => setNewItemMinQuantity(e.target.value)}
                    className="form-input flex w-full rounded-lg border border-[#3A3A3C] bg-[#1E1E1E] p-2 text-xs text-white placeholder:text-[#A0A0A0] focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]"
                    placeholder="Örn: 1"
                  />
                  <p className="pt-0.5 text-[10px] text-[#A0A0A0]">
                    Bu miktarın altında kırmızı gösterilir
                  </p>
                </label>

                <label className="flex flex-col">
                  <p className="pb-1 text-xs font-medium text-white">
                    Son Kullanma Tarihi
                  </p>
                  <div className="relative flex w-full items-stretch rounded-lg">
                    <input
                      type="date"
                      value={newItemExpiryDate}
                      onChange={(e) => setNewItemExpiryDate(e.target.value)}
                      className="form-input flex w-full rounded-lg border border-[#3A3A3C] bg-[#1E1E1E] py-2 pl-2 pr-8 text-xs text-white placeholder:text-[#A0A0A0] focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]"
                      placeholder="Tarih Seç"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-[#A0A0A0]">
                      <span className="material-symbols-outlined text-base">calendar_today</span>
                    </div>
                  </div>
                </label>
              </form>

              <div className="flex shrink-0 gap-2 border-t border-[#3A3A3C] p-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                    setNewItemName('');
                    setNewItemCategory('');
                    setNewItemQuantity('');
                    setNewItemUnit('adet');
                    setNewItemExpiryDate('');
                  }}
                  type="button"
                  className="flex h-9 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-transparent text-xs font-bold text-[#A0A0A0] transition-colors hover:bg-white/10"
                >
                  İptal
                </button>
                <button
                  onClick={handleUpdate}
                  type="button"
                  className="flex h-9 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#30D158] text-xs font-bold text-white transition-opacity hover:opacity-90"
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
            <div className="flex w-full max-w-sm flex-col overflow-hidden bg-[#121212] rounded-xl">
              {/* Modal Header */}
              <div className="flex shrink-0 items-center border-b border-[#3A3A3C] px-3 py-2">
                <div className="w-6"></div>
                <h2 className="flex-1 text-center text-sm font-bold tracking-tight text-white">
                  Malzeme Ekle
                </h2>
                <div className="flex w-6 items-center justify-end">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleAdd} className="flex-1 space-y-3 p-3">
                {/* Ingredient Name */}
                <label className="flex flex-col relative">
                  <p className="pb-1 text-xs font-medium text-white">
                    Malzeme Adı *
                  </p>
                  <input
                    required
                    value={newItemName}
                    onChange={(e) => handleIngredientNameChange(e.target.value)}
                    onFocus={() => newItemName.length >= 2 && setShowSuggestions(true)}
                    className="form-input flex w-full rounded-lg border border-[#3A3A3C] bg-[#1E1E1E] p-2 text-xs text-white placeholder:text-[#A0A0A0] focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]"
                    placeholder="Örn: Domates"
                    autoComplete="off"
                  />
                  {/* Autocomplete Suggestions */}
                  {showSuggestions && ingredientSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1E1E1E] border border-[#3A3A3C] rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                      {ingredientSuggestions.map((ingredient, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectIngredient(ingredient)}
                          className="w-full text-left px-2 py-1.5 hover:bg-[#30D158]/10 text-white text-xs border-b border-[#3A3A3C] last:border-b-0"
                        >
                          <div className="font-medium">{ingredient.name}</div>
                          <div className="text-[10px] text-[#A0A0A0]">
                            {ingredient.category.name} • {ingredient.defaultUnit}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </label>

                {/* Category */}
                <label className="flex flex-col">
                  <p className="pb-1 text-xs font-medium text-white">
                    Kategori *
                  </p>
                  <select
                    required
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="form-select w-full rounded-lg border border-[#3A3A3C] bg-[#1E1E1E] p-2 text-xs text-white focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]"
                  >
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

                {/* Quantity & Unit */}
                <div className="flex items-end gap-2">
                  <label className="flex min-w-0 flex-[2] flex-col">
                    <p className="pb-1 text-xs font-medium text-white">Miktar</p>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={newItemQuantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      className="form-input flex w-full rounded-lg border border-[#3A3A3C] bg-[#1E1E1E] p-2 text-xs text-white placeholder:text-[#A0A0A0] focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]"
                      placeholder="0"
                    />
                  </label>
                  <label className="flex min-w-0 flex-1 flex-col">
                    <p className="pb-1 text-xs font-medium text-white">Birim</p>
                    <select
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value)}
                      className="form-select w-full rounded-lg border border-[#3A3A3C] bg-[#1E1E1E] p-2 text-xs text-white focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]"
                    >
                      <option value="adet">adet</option>
                      <option value="kg">kg</option>
                      <option value="gr">gr</option>
                      <option value="litre">litre</option>
                      <option value="ml">ml</option>
                    </select>
                  </label>
                </div>

                {/* Min Quantity */}
                <label className="flex flex-col">
                  <p className="pb-1 text-xs font-medium text-white">
                    Min. Miktar
                  </p>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newItemMinQuantity}
                    onChange={(e) => setNewItemMinQuantity(e.target.value)}
                    className="form-input flex w-full rounded-lg border border-[#3A3A3C] bg-[#1E1E1E] p-2 text-xs text-white placeholder:text-[#A0A0A0] focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]"
                    placeholder="Otomatik"
                  />
                  <p className="pt-0.5 text-[10px] text-[#A0A0A0]">
                    Otomatik: Miktarın %20'si
                  </p>
                </label>

                {/* Expiry Date */}
                <label className="flex flex-col">
                  <p className="pb-1 text-xs font-medium text-white">
                    Son Kullanma Tarihi
                  </p>
                  <div className="relative flex w-full items-stretch rounded-lg">
                    <input
                      type="date"
                      value={newItemExpiryDate}
                      onChange={(e) => setNewItemExpiryDate(e.target.value)}
                      className="form-input flex w-full rounded-lg border border-[#3A3A3C] bg-[#1E1E1E] py-2 pl-2 pr-8 text-xs text-white placeholder:text-[#A0A0A0] focus:border-[#30D158] focus:outline-0 focus:ring-1 focus:ring-[#30D158]"
                      placeholder="Tarih Seç"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-[#A0A0A0]">
                      <span className="material-symbols-outlined text-base">calendar_today</span>
                    </div>
                  </div>
                </label>
              </form>

              {/* Modal Actions */}
              <div className="flex shrink-0 gap-2 border-t border-[#3A3A3C] p-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  type="button"
                  className="flex h-9 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-transparent text-xs font-bold text-[#A0A0A0] transition-colors hover:bg-white/10"
                >
                  İptal
                </button>
                <button
                  onClick={handleAdd}
                  type="button"
                  className="flex h-9 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#30D158] text-xs font-bold text-white transition-opacity hover:opacity-90"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
