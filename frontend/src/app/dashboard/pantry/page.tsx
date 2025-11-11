'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { PantryItem } from '@/types/pantry';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Kategori ismini formatla (sadece ilk harf büyük)
function formatCategoryName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// Sürüklenebilir kategori bileşeni
function SortableCategory({ category, isSelected, itemCount, onClick }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded ${
        isSelected ? 'bg-blue-600' : 'hover:bg-gray-700'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="px-2 py-2 cursor-move hover:bg-gray-600 rounded-l flex-shrink-0"
        title="Sürükle"
      >
        ⋮⋮
      </button>
      <button
        onClick={onClick}
        className="flex-1 text-left py-2 pr-3 truncate text-sm"
      >
        {category.icon} {formatCategoryName(category.name)} ({itemCount})
      </button>
    </div>
  );
}

export default function PantryPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sürükle-bırak sensörleri
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Autocomplete state
  const [ingredientSuggestions, setIngredientSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    minQuantity: '',
    unit: 'adet',
    expiryDate: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadPantryItems();
  }, [selectedCategory, token]);

  const loadCategories = async () => {
    const response = await api.get<any>('/api/categories');
    if (response.success && response.data) {
      // LocalStorage'dan sıralamayı yükle
      const savedOrder = localStorage.getItem('categoryOrder');
      if (savedOrder) {
        const orderMap = JSON.parse(savedOrder);
        const sorted = [...response.data].sort((a, b) => {
          const orderA = orderMap[a.id] ?? 999;
          const orderB = orderMap[b.id] ?? 999;
          return orderA - orderB;
        });
        setCategories(sorted);
      } else {
        setCategories(response.data);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Sıralamayı localStorage'a kaydet
        const orderMap: any = {};
        newOrder.forEach((item, index) => {
          orderMap[item.id] = index;
        });
        localStorage.setItem('categoryOrder', JSON.stringify(orderMap));
        
        return newOrder;
      });
    }
  };

  const loadPantryItems = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    const url = selectedCategory
      ? `/api/pantry?category=${selectedCategory}`
      : '/api/pantry';

    const response = await api.get<PantryItem[]>(url, token);
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

  const getDefaultExpiryDate = (categoryName: string): string => {
    const today = new Date();
    let daysToAdd = 30; // Varsayılan 1 ay

    // Kategoriye göre akıllı SKT önerisi
    switch (categoryName) {
      case 'SEBZELER':
      case 'YEŞİLLİKLER':
        daysToAdd = 7; // 1 hafta
        break;
      case 'MEYVELER':
        daysToAdd = 10; // 10 gün
        break;
      case 'ET ÜRÜNLERİ':
      case 'DENİZ ÜRÜNLERİ':
        daysToAdd = 3; // 3 gün (taze)
        break;
      case 'SÜT ÜRÜNLERİ':
        daysToAdd = 14; // 2 hafta
        break;
      case 'BAHARATLAR':
      case 'KURUYEMİŞLER':
      case 'TAHILLAR':
      case 'BAKLİYATLAR':
        daysToAdd = 365; // 1 yıl
        break;
      case 'HAMUR ÜRÜNLERİ':
      case 'SOSLAR':
        daysToAdd = 90; // 3 ay
        break;
      case 'TATLANDIRICILAR':
        daysToAdd = 180; // 6 ay
        break;
      case 'İÇECEKLER':
        daysToAdd = 60; // 2 ay
        break;
      case 'YAĞLAR':
        daysToAdd = 180; // 6 ay
        break;
      case 'TEMEL MALZEMELER':
        daysToAdd = 21; // 3 hafta
        break;
      default:
        daysToAdd = 30; // 1 ay
    }

    const expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + daysToAdd);
    return expiryDate.toISOString().split('T')[0];
  };

  const selectIngredient = (ingredient: any) => {
    const suggestedExpiryDate = getDefaultExpiryDate(ingredient.category.name);
    
    console.log('🔍 Seçilen malzeme:', {
      name: ingredient.name,
      category: ingredient.category.name,
      unit: ingredient.defaultUnit,
      suggestedSKT: suggestedExpiryDate
    });
    
    setFormData({
      ...formData,
      name: ingredient.name,
      category: ingredient.category.name,
      unit: ingredient.defaultUnit,
      expiryDate: suggestedExpiryDate,
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
      response = await api.put(`/api/pantry/${editingItem.id}`, data, token);
    } else {
      response = await api.post('/api/pantry', data, token);
    }

    if (response.success) {
      setSuccess(editingItem ? 'Malzeme güncellendi' : 'Malzeme eklendi');
      setShowAddModal(false);
      setEditingItem(null);
      resetForm();
      loadPantryItems();
    } else {
      setError(response.error?.message || 'İşlem başarısız');
    }
  };

  const handleEdit = (item: PantryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      minQuantity: item.minQuantity?.toString() || '',
      unit: item.unit,
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu malzemeyi silmek istediğinize emin misiniz?')) return;

    if (!token) return;

    const response = await api.delete(`/api/pantry/${id}`, token);
    
    if (response.success) {
      setSuccess('Malzeme silindi');
      loadPantryItems();
    } else {
      setError(response.error?.message || 'Silme başarısız');
    }
  };

  const handleMoveToMarket = async (id: number) => {
    if (!token) return;

    const response = await api.post(`/api/pantry/${id}/add-to-market`, {}, token);

    if (response.success) {
      setSuccess('Malzeme market listesine eklendi');
      // Dolap listesini yenilemeye gerek yok çünkü malzeme hala dolabta
    } else {
      setError(response.error?.message || 'Ekleme başarısız');
    }
  };

  const handleAddLowStockToMarket = async () => {
    if (!token) return;

    // %50'nin altındaki malzemeleri bul
    const lowStockItems = items.filter((item) => {
      const percentage = item.initialQuantity > 0 
        ? (item.quantity / item.initialQuantity) * 100
        : 100;
      return percentage < 50;
    });

    if (lowStockItems.length === 0) {
      setError('Azalan malzeme bulunamadı (%50\'nin altında)');
      return;
    }

    if (!confirm(`${lowStockItems.length} adet azalan malzeme market listesine eklenecek. Devam edilsin mi?`)) {
      return;
    }

    setError('');
    let successCount = 0;
    let errorCount = 0;

    // Her malzemeyi market'e ekle
    for (const item of lowStockItems) {
      const response = await api.post(`/api/pantry/${item.id}/add-to-market`, {}, token);
      if (response.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    if (successCount > 0) {
      setSuccess(`${successCount} malzeme market listesine eklendi${errorCount > 0 ? `, ${errorCount} hata` : ''}`);
    } else {
      setError('Malzemeler eklenemedi');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: '',
      minQuantity: '',
      unit: 'adet',
      expiryDate: '',
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
    resetForm();
    setError('');
  };

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
            <h1 className="text-3xl font-bold">🏠 Dolabım</h1>
            <p className="text-gray-400 mt-2">Evdeki malzemelerinizi yönetin</p>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Kategoriler</h2>
                <span className="text-xs text-gray-400">↕️ Sürükle</span>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-2 rounded ${
                    selectedCategory === ''
                      ? 'bg-blue-600'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  📦 Tümü ({items.length})
                </button>
                
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={categories.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {categories.map((cat) => {
                      const categoryItemCount = items.filter(item => item.category === cat.name).length;
                      return (
                        <SortableCategory
                          key={cat.id}
                          category={cat}
                          isSelected={selectedCategory === cat.name}
                          itemCount={categoryItemCount}
                          onClick={() => setSelectedCategory(cat.name)}
                        />
                      );
                    })}
                  </SortableContext>
                </DndContext>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {selectedCategory || 'Tüm Malzemeler'} ({items.length})
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddLowStockToMarket}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-md flex items-center gap-2"
                      title="Azalan malzemeleri market'e ekle"
                    >
                      ⚠️ Azalanları Market'e Ekle
                    </button>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      + Malzeme Ekle
                    </button>
                  </div>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    Henüz malzeme eklenmemiş
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Kategorilere göre grupla */}
                    {(() => {
                      // Birim dönüşüm fonksiyonu
                      const convertToKg = (quantity: number, unit: string): number => {
                        const unitLower = unit.toLowerCase();
                        if (unitLower === 'gram' || unitLower === 'gr') return quantity / 1000;
                        if (unitLower === 'kg') return quantity;
                        if (unitLower === 'adet') return quantity * 0.2; // 1 adet = 200g ortalama
                        return quantity;
                      };

                      // Kategorilere göre gruplandır
                      const grouped = items.reduce((acc: any, item) => {
                        if (!acc[item.category]) {
                          acc[item.category] = [];
                        }
                        acc[item.category].push(item);
                        return acc;
                      }, {});

                      // Her kategori için render et
                      return Object.keys(grouped).sort().map((category) => {
                        const categoryItems = grouped[category];
                        const categoryIcon = categories.find(c => c.name === category)?.icon || '📦';

                        // Aynı malzemeleri birleştir
                        const mergedItems = categoryItems.reduce((acc: any, item: PantryItem) => {
                          const existing = acc.find((i: any) => i.name.toLowerCase() === item.name.toLowerCase());
                          
                          if (existing) {
                            // Aynı malzeme var, birleştir
                            const existingKg = convertToKg(existing.totalQuantity, existing.unit);
                            const newKg = convertToKg(item.quantity, item.unit);
                            existing.totalQuantity = existingKg + newKg;
                            existing.unit = 'kg';
                            existing.items.push(item);
                            
                            // İlk eklenen malzemenin initial quantity'sini kullan
                            if (item.initialQuantity > 0) {
                              const initialKg = convertToKg(item.initialQuantity, item.unit);
                              existing.totalInitialQuantity += initialKg;
                            }
                          } else {
                            // Yeni malzeme
                            const quantityInKg = convertToKg(item.quantity, item.unit);
                            const initialInKg = item.initialQuantity > 0 ? convertToKg(item.initialQuantity, item.unit) : quantityInKg;
                            
                            acc.push({
                              name: item.name,
                              category: item.category,
                              totalQuantity: quantityInKg,
                              totalInitialQuantity: initialInKg,
                              unit: 'kg',
                              items: [item],
                              expiryDate: item.expiryDate,
                            });
                          }
                          return acc;
                        }, []);

                        return (
                          <div key={category} className="bg-gray-700/30 rounded-lg p-4">
                            {/* Kategori Başlığı */}
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                              <span>{categoryIcon}</span>
                              <span>{category}</span>
                              <span className="text-sm text-gray-400">({mergedItems.length})</span>
                            </h3>

                            {/* Kategori İçindeki Malzemeler */}
                            <div className="space-y-2">
                              {mergedItems.map((merged: any, idx: number) => {
                                const percentage = merged.totalInitialQuantity > 0 
                                  ? Math.round((merged.totalQuantity / merged.totalInitialQuantity) * 100)
                                  : 100;

                                // Birden fazla kayıt varsa göster
                                const hasMultiple = merged.items.length > 1;

                                // Minimum miktar kontrolü
                                const firstItem = merged.items[0];
                                const isLowStock = firstItem.minQuantity && firstItem.minQuantity > 0 && firstItem.quantity < firstItem.minQuantity;

                                return (
                                  <div
                                    key={`${merged.name}-${idx}`}
                                    className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition"
                                  >
                                    <div className="flex items-center justify-between gap-4">
                                      {/* Malzeme Bilgisi */}
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="font-medium text-lg">{merged.name}</div>
                                          {hasMultiple && (
                                            <span className="text-xs bg-blue-600 px-2 py-1 rounded">
                                              {merged.items.length} kayıt birleştirildi
                                            </span>
                                          )}
                                          {isLowStock && (
                                            <span className="text-xs bg-red-600 px-2 py-1 rounded flex items-center gap-1">
                                              ⚠️ Azalıyor (Min: {firstItem.minQuantity} {firstItem.unit})
                                            </span>
                                          )}
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                                          <div
                                            className={`h-2 rounded-full transition-all ${
                                              percentage > 50
                                                ? 'bg-green-500'
                                                : percentage > 20
                                                ? 'bg-yellow-500'
                                                : 'bg-red-500'
                                            }`}
                                            style={{ width: `${percentage}%` }}
                                          ></div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                          <span>%{percentage} kaldı</span>
                                          <span>•</span>
                                          {hasMultiple ? (
                                            // Birden fazla kayıt varsa toplam kg göster
                                            <span className="font-semibold text-white">
                                              {merged.totalQuantity.toFixed(2)} kg
                                            </span>
                                          ) : (
                                            // Tek kayıt varsa orijinal birim + tahmini ağırlık
                                            <span className="font-semibold text-white">
                                              {merged.items[0].quantity} {merged.items[0].unit}
                                              {merged.items[0].unit.toLowerCase() === 'adet' && (
                                                <span className="text-gray-500 font-normal">
                                                  {' '}(~{merged.totalQuantity.toFixed(2)} kg)
                                                </span>
                                              )}
                                              {merged.items[0].unit.toLowerCase() === 'gram' && merged.items[0].quantity >= 1000 && (
                                                <span className="text-gray-500 font-normal">
                                                  {' '}(~{merged.totalQuantity.toFixed(2)} kg)
                                                </span>
                                              )}
                                            </span>
                                          )}
                                          {merged.expiryDate && (
                                            <>
                                              <span>•</span>
                                              <span>SKT: {new Date(merged.expiryDate).toLocaleDateString('tr-TR')}</span>
                                            </>
                                          )}
                                        </div>

                                        {/* Detaylar (birden fazla kayıt varsa) */}
                                        {hasMultiple && (
                                          <div className="mt-2 text-xs text-gray-500">
                                            Detay: {merged.items.map((item: PantryItem, i: number) => (
                                              <span key={item.id}>
                                                {item.quantity} {item.unit}
                                                {item.unit.toLowerCase() === 'adet' && (
                                                  <span className="text-gray-600">
                                                    {' '}(~{(item.quantity * 0.2).toFixed(2)} kg)
                                                  </span>
                                                )}
                                                {i < merged.items.length - 1 && ' + '}
                                              </span>
                                            ))}
                                            {' = '}
                                            <span className="font-semibold text-gray-400">
                                              {merged.totalQuantity.toFixed(2)} kg toplam
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* İşlem Butonları */}
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleEdit(merged.items[0])}
                                          className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
                                          title="Düzenle"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          onClick={() => handleMoveToMarket(merged.items[0].id)}
                                          className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm"
                                          title="Market'e Ekle"
                                        >
                                          🛒
                                        </button>
                                        <button
                                          onClick={() => handleDelete(merged.items[0].id)}
                                          className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
                                          title="Sil"
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      });
                    })()}
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
              {editingItem ? 'Malzeme Düzenle' : 'Yeni Malzeme Ekle'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Malzeme Adı
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
                    Mevcut Miktar
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum Miktar (Opsiyonel)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minQuantity}
                  onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="Örn: 2 (Bu miktarın altına düşünce uyarı)"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Bu miktarın altına düşünce "Azalıyor" uyarısı gösterilir
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Son Kullanma Tarihi (Opsiyonel)
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
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
