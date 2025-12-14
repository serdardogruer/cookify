'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';

export default function UnitConversionsPage() {
  const router = useRouter();
  const [conversions, setConversions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConversion, setEditingConversion] = useState<any>(null);
  
  // Form states
  const [unitFrom, setUnitFrom] = useState('');
  const [unitTo, setUnitTo] = useState('');
  const [multiplier, setMultiplier] = useState('');

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const response = await api.get<any>('/api/profile', token);
    const adminEmails = ['serdardogruer@gmail.com'];
    
    if (!response.success || !adminEmails.includes(response.data?.email)) {
      toast.error('Bu sayfaya erişim yetkiniz yok');
      router.push('/dashboard');
      return;
    }

    loadConversions();
  };

  const loadConversions = async () => {
    const token = localStorage.getItem('token');
    const response = await api.get<any[]>('/api/admin/unit-conversions', token);
    
    if (response.success && response.data) {
      setConversions(response.data);
    }
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const response = await api.post(
      '/api/admin/unit-conversions',
      { unitFrom, unitTo, multiplier: parseFloat(multiplier) },
      token
    );

    if (response.success) {
      toast.success('Dönüşüm eklendi');
      setShowAddModal(false);
      resetForm();
      loadConversions();
    } else {
      toast.error(response.error?.message || 'Ekleme başarısız');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConversion) return;

    const token = localStorage.getItem('token');
    const response = await api.put(
      `/api/admin/unit-conversions/${editingConversion.id}`,
      { unitFrom, unitTo, multiplier: parseFloat(multiplier) },
      token
    );

    if (response.success) {
      toast.success('Dönüşüm güncellendi');
      setEditingConversion(null);
      resetForm();
      loadConversions();
    } else {
      toast.error('Güncelleme başarısız');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu dönüşümü silmek istediğinizden emin misiniz?')) return;

    const token = localStorage.getItem('token');
    const response = await api.delete(`/api/admin/unit-conversions/${id}`, token);

    if (response.success) {
      toast.success('Dönüşüm silindi');
      loadConversions();
    } else {
      toast.error('Silme başarısız');
    }
  };

  const startEdit = (conversion: any) => {
    setEditingConversion(conversion);
    setUnitFrom(conversion.unitFrom);
    setUnitTo(conversion.unitTo);
    setMultiplier(conversion.multiplier.toString());
  };

  const resetForm = () => {
    setUnitFrom('');
    setUnitTo('');
    setMultiplier('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <div className="bg-[#1E1E1E] border-b border-[#3A3A3C] p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin')}
              className="text-[#30D158] hover:text-[#30D158]/80"
            >
              ← Geri
            </button>
            <h1 className="text-2xl font-bold">Birim Dönüşüm Yönetimi</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#30D158] text-[#121212] rounded-lg font-semibold hover:bg-[#30D158]/90"
          >
            + Yeni Dönüşüm
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-[#1E1E1E] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#2A2A2A]">
              <tr>
                <th className="text-left p-4">Kaynak Birim</th>
                <th className="text-left p-4">Hedef Birim</th>
                <th className="text-left p-4">Çarpan</th>
                <th className="text-left p-4">Örnek</th>
                <th className="text-right p-4">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {conversions.map((conversion) => (
                <tr key={conversion.id} className="border-t border-[#3A3A3C]">
                  <td className="p-4">{conversion.unitFrom}</td>
                  <td className="p-4">{conversion.unitTo}</td>
                  <td className="p-4">{conversion.multiplier}</td>
                  <td className="p-4 text-[#A0A0A0]">
                    1 {conversion.unitFrom} = {conversion.multiplier} {conversion.unitTo}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => startEdit(conversion)}
                      className="text-[#30D158] hover:text-[#30D158]/80 mr-3"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(conversion.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {conversions.length === 0 && (
            <div className="p-12 text-center text-[#A0A0A0]">
              Henüz birim dönüşümü yok
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingConversion) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E1E] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingConversion ? 'Dönüşümü Düzenle' : 'Yeni Dönüşüm Ekle'}
            </h2>

            <form onSubmit={editingConversion ? handleUpdate : handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Kaynak Birim</label>
                <input
                  type="text"
                  value={unitFrom}
                  onChange={(e) => setUnitFrom(e.target.value)}
                  className="w-full bg-[#121212] border border-[#3A3A3C] rounded-lg p-2"
                  placeholder="örn: çay kaşığı"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Hedef Birim</label>
                <input
                  type="text"
                  value={unitTo}
                  onChange={(e) => setUnitTo(e.target.value)}
                  className="w-full bg-[#121212] border border-[#3A3A3C] rounded-lg p-2"
                  placeholder="örn: gr"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Çarpan</label>
                <input
                  type="number"
                  step="0.001"
                  value={multiplier}
                  onChange={(e) => setMultiplier(e.target.value)}
                  className="w-full bg-[#121212] border border-[#3A3A3C] rounded-lg p-2"
                  placeholder="örn: 5"
                  required
                />
                <p className="text-xs text-[#A0A0A0] mt-1">
                  1 {unitFrom || '...'} = {multiplier || '...'} {unitTo || '...'}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#30D158] text-[#121212] py-2 rounded-lg font-semibold hover:bg-[#30D158]/90"
                >
                  {editingConversion ? 'Güncelle' : 'Ekle'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingConversion(null);
                    resetForm();
                  }}
                  className="flex-1 bg-[#2A2A2A] py-2 rounded-lg hover:bg-[#3A3A3C]"
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
