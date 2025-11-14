'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';

interface Kitchen {
  id: number;
  name: string;
  status: string;
  owner: {
    name: string;
    email: string;
  };
  _count: {
    members: number;
    pantryItems: number;
    marketItems: number;
  };
}

interface Props {
  kitchens: Kitchen[];
  token: string;
  onUpdate: () => void;
}

export default function KitchenDetailsModal({ kitchens, token, onUpdate }: Props) {
  const [loading, setLoading] = useState<number | null>(null);
  const [selectedKitchen, setSelectedKitchen] = useState<Kitchen | null>(null);

  const handleToggleStatus = async (kitchenId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PASSIVE' : 'ACTIVE';
    
    if (!confirm(`Mutfak durumunu ${newStatus} yapmak istediğinize emin misiniz?`)) {
      return;
    }

    setLoading(kitchenId);
    const response = await api.put(
      `/api/admin/kitchens/${kitchenId}/status`,
      { status: newStatus },
      token
    );

    if (response.success) {
      toast.success('Mutfak durumu güncellendi');
      onUpdate();
    } else {
      toast.error(response.error?.message || 'İşlem başarısız');
    }
    setLoading(null);
  };

  return (
    <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#121212]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Mutfak</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Sahibi</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Üyeler</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Dolap</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Market</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Durum</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2A]">
            {kitchens.map((kitchen) => (
              <tr 
                key={kitchen.id} 
                onClick={() => setSelectedKitchen(kitchen)}
                className="hover:bg-[#2A2A2A] cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-sm text-white">{kitchen.name}</td>
                <td className="px-4 py-3 text-sm text-[#A0A0A0]">
                  <div>{kitchen.owner.name}</div>
                  <div className="text-xs">{kitchen.owner.email}</div>
                </td>
                <td className="px-4 py-3 text-sm text-white">{kitchen._count.members}</td>
                <td className="px-4 py-3 text-sm text-white">{kitchen._count.pantryItems}</td>
                <td className="px-4 py-3 text-sm text-white">{kitchen._count.marketItems}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      kitchen.status === 'ACTIVE'
                        ? 'bg-[#30D158]/20 text-[#30D158]'
                        : 'bg-[#A0A0A0]/20 text-[#A0A0A0]'
                    }`}
                  >
                    {kitchen.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Kitchen Detail Modal */}
      {selectedKitchen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedKitchen(null)}
        >
          <div 
            className="bg-[#1E1E1E] rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Mutfak Detayları</h3>
              <button
                onClick={() => setSelectedKitchen(null)}
                className="text-[#A0A0A0] hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs text-[#A0A0A0] mb-1">Mutfak Adı</p>
                <p className="text-lg text-white font-bold">{selectedKitchen.name}</p>
              </div>
              <div>
                <p className="text-xs text-[#A0A0A0] mb-1">Sahibi</p>
                <p className="text-sm text-white">{selectedKitchen.owner.name}</p>
                <p className="text-xs text-[#A0A0A0]">{selectedKitchen.owner.email}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-[#A0A0A0] mb-1">Üyeler</p>
                  <p className="text-sm text-white">{selectedKitchen._count.members}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A0A0A0] mb-1">Dolap</p>
                  <p className="text-sm text-white">{selectedKitchen._count.pantryItems}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A0A0A0] mb-1">Market</p>
                  <p className="text-sm text-white">{selectedKitchen._count.marketItems}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#A0A0A0] mb-1">Durum</p>
                <span
                  className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                    selectedKitchen.status === 'ACTIVE'
                      ? 'bg-[#30D158]/20 text-[#30D158]'
                      : 'bg-[#A0A0A0]/20 text-[#A0A0A0]'
                  }`}
                >
                  {selectedKitchen.status}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleStatus(selectedKitchen.id, selectedKitchen.status);
                setSelectedKitchen(null);
              }}
              disabled={loading === selectedKitchen.id}
              className="w-full px-4 py-2 bg-[#30D158] text-white rounded-lg hover:bg-[#28a745] transition-colors disabled:opacity-50"
            >
              Durum Değiştir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
