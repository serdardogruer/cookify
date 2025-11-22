'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';

interface Module {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isCore: boolean;
  isActive: boolean;
  pricingType: string;
  price: number | null;
  trialDays: number | null;
  badge: string | null;
}

export default function AdminModulesPage() {
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [isCore, setIsCore] = useState(false);
  const [pricingType, setPricingType] = useState('free');
  const [price, setPrice] = useState('');
  const [trialDays, setTrialDays] = useState('');
  const [badge, setBadge] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const response = await api.get<Module[]>('/api/admin/modules', token);
    if (response.success && response.data) {
      setModules(response.data);
    }
    setLoading(false);
  };

  const handleOpenModal = (module?: Module) => {
    if (module) {
      setEditingModule(module);
      setName(module.name);
      setSlug(module.slug);
      setDescription(module.description);
      setIcon(module.icon);
      setIsCore(module.isCore);
      setPricingType(module.pricingType);
      setPrice(module.price?.toString() || '');
      setTrialDays(module.trialDays?.toString() || '');
      setBadge(module.badge || '');
      setIsActive(module.isActive);
    } else {
      setEditingModule(null);
      setName('');
      setSlug('');
      setDescription('');
      setIcon('');
      setIsCore(false);
      setPricingType('free');
      setPrice('');
      setTrialDays('');
      setBadge('');
      setIsActive(true);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    const data = {
      name,
      slug,
      description,
      icon,
      isCore,
      pricingType,
      price: price ? parseFloat(price) : null,
      trialDays: trialDays ? parseInt(trialDays) : null,
      badge: badge || null,
      isActive
    };

    let response;
    if (editingModule) {
      response = await api.put(`/api/admin/modules/${editingModule.id}`, data, token);
    } else {
      response = await api.post('/api/admin/modules', data, token);
    }

    if (response.success) {
      toast.success(editingModule ? 'Modül güncellendi' : 'Modül eklendi');
      setShowModal(false);
      loadModules();
    } else {
      toast.error('İşlem başarısız');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu modülü silmek istediğinizden emin misiniz?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await api.delete(`/api/admin/modules/${id}`, token);
    if (response.success) {
      toast.success('Modül silindi');
      loadModules();
    } else {
      toast.error(response.message || 'Silme başarısız');
    }
  };

  const getPricingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      free: 'Ücretsiz',
      paid: 'Ücretli',
      trial: 'Deneme Süreli',
      freemium: 'Freemium'
    };
    return labels[type] || type;
  };

  if (loading) {
    return <div className="p-8 text-white">Yükleniyor...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Modül Yönetimi</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#30D158] text-white px-4 py-2 rounded-lg hover:bg-[#28a745]"
        >
          ➕ Yeni Modül Ekle
        </button>
      </div>

      <div className="bg-[#1C1C1E] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#2C2C2E]">
            <tr>
              <th className="px-4 py-3 text-left text-white">Icon</th>
              <th className="px-4 py-3 text-left text-white">Modül Adı</th>
              <th className="px-4 py-3 text-left text-white">Slug</th>
              <th className="px-4 py-3 text-left text-white">Tip</th>
              <th className="px-4 py-3 text-left text-white">Fiyatlandırma</th>
              <th className="px-4 py-3 text-left text-white">Durum</th>
              <th className="px-4 py-3 text-left text-white">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((module) => (
              <tr key={module.id} className="border-t border-white/10">
                <td className="px-4 py-3 text-2xl">{module.icon}</td>
                <td className="px-4 py-3 text-white">
                  {module.name}
                  {module.badge && (
                    <span className="ml-2 text-xs bg-[#30D158] text-white px-2 py-1 rounded">
                      {module.badge}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400">{module.slug}</td>
                <td className="px-4 py-3">
                  {module.isCore ? (
                    <span className="text-[#30D158]">Temel</span>
                  ) : (
                    <span className="text-[#FF9500]">Premium</span>
                  )}
                </td>
                <td className="px-4 py-3 text-white">
                  {getPricingTypeLabel(module.pricingType)}
                  {module.price && ` (${module.price} TL/ay)`}
                  {module.trialDays && ` (${module.trialDays} gün deneme)`}
                </td>
                <td className="px-4 py-3">
                  {module.isActive ? (
                    <span className="text-[#30D158]">Aktif</span>
                  ) : (
                    <span className="text-red-500">Pasif</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleOpenModal(module)}
                    className="text-[#30D158] hover:underline mr-3"
                  >
                    Düzenle
                  </button>
                  {!module.isCore && (
                    <button
                      onClick={() => handleDelete(module.id)}
                      className="text-red-500 hover:underline"
                    >
                      Sil
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1C1C1E] rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingModule ? 'Modül Düzenle' : 'Yeni Modül Ekle'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Modül Adı</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#2C2C2E] text-white px-4 py-2 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-[#2C2C2E] text-white px-4 py-2 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Açıklama</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#2C2C2E] text-white px-4 py-2 rounded-lg"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Icon (Emoji)</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full bg-[#2C2C2E] text-white px-4 py-2 rounded-lg"
                    placeholder="🤖"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Badge (Opsiyonel)</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full bg-[#2C2C2E] text-white px-4 py-2 rounded-lg"
                    placeholder="new, premium, popular"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Fiyatlandırma Tipi</label>
                  <select
                    value={pricingType}
                    onChange={(e) => setPricingType(e.target.value)}
                    className="w-full bg-[#2C2C2E] text-white px-4 py-2 rounded-lg"
                  >
                    <option value="free">Ücretsiz</option>
                    <option value="paid">Ücretli</option>
                    <option value="trial">Deneme Süreli</option>
                    <option value="freemium">Freemium</option>
                  </select>
                </div>

                {(pricingType === 'paid' || pricingType === 'trial') && (
                  <div>
                    <label className="block text-white mb-2">Fiyat (TL/ay)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-[#2C2C2E] text-white px-4 py-2 rounded-lg"
                      step="0.01"
                    />
                  </div>
                )}

                {pricingType === 'trial' && (
                  <div>
                    <label className="block text-white mb-2">Deneme Süresi (Gün)</label>
                    <input
                      type="number"
                      value={trialDays}
                      onChange={(e) => setTrialDays(e.target.value)}
                      className="w-full bg-[#2C2C2E] text-white px-4 py-2 rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center text-white">
                  <input
                    type="checkbox"
                    checked={isCore}
                    onChange={(e) => setIsCore(e.target.checked)}
                    className="mr-2"
                  />
                  Temel Modül (Ücretsiz)
                </label>

                <label className="flex items-center text-white">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="mr-2"
                  />
                  Aktif
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#30D158] text-white py-2 rounded-lg hover:bg-[#28a745]"
                >
                  {editingModule ? 'Güncelle' : 'Ekle'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-[#2C2C2E] text-white py-2 rounded-lg hover:bg-[#3C3C3E]"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
