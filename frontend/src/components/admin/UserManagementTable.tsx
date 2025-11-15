'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  password: string;
  plainPassword?: string;
  profileImage?: string;
  isAdmin: boolean;
  createdAt: string;
  _count: {
    recipes: number;
    ownedKitchens: number;
  };
}

interface Props {
  users: User[];
  token: string;
  onUpdate: () => void;
}

export default function UserManagementTable({ users, token, onUpdate }: Props) {
  const [loading, setLoading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const togglePasswordVisibility = (userId: number) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleToggleAdmin = async (userId: number, currentStatus: boolean) => {
    setLoading(userId);
    const response = await api.post(
      `/api/admin/users/${userId}/toggle-admin`,
      { isAdmin: !currentStatus },
      token
    );

    if (response.success) {
      toast.success(currentStatus ? 'Admin yetkisi kaldırıldı' : 'Admin yetkisi verildi');
      onUpdate();
    } else {
      toast.error(response.error?.message || 'İşlem başarısız');
    }
    setLoading(null);
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    setLoading(userId);
    const response = await api.delete(`/api/admin/users/${userId}`, token);

    if (response.success) {
      toast.success('Kullanıcı silindi');
      onUpdate();
    } else {
      toast.error(response.error?.message || 'İşlem başarısız');
    }
    setLoading(null);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Arama */}
      <div className="flex items-center gap-2 bg-[#121212] rounded-lg p-3">
        <span className="material-symbols-outlined text-[#A0A0A0]">search</span>
        <input
          type="text"
          placeholder="Kullanıcı ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-white outline-none"
        />
      </div>

      {/* Tablo */}
      <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#121212]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Kullanıcı</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Telefon</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Şifre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Tarifler</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Mutfaklar</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Kayıt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {filteredUsers.map((user) => (
                <tr 
                  key={user.id} 
                  onClick={() => setSelectedUser(user)}
                  className="hover:bg-[#2A2A2A] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.profileImage ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${user.profileImage}`}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-white text-sm font-medium">{user.name}</p>
                        {user.isAdmin && (
                          <span className="text-xs bg-[#30D158] text-white px-2 py-0.5 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#A0A0A0]">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-[#A0A0A0]">{user.phone || '-'}</td>
                  <td className="px-4 py-3">
                    {user.plainPassword ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium">
                          {visiblePasswords.has(user.id) 
                            ? user.plainPassword 
                            : '••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(user.id)}
                          className="p-1 text-[#A0A0A0] hover:text-white transition-colors"
                          title={visiblePasswords.has(user.id) ? 'Gizle' : 'Göster'}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {visiblePasswords.has(user.id) ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[#A0A0A0]">Google ile giriş</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{user._count.recipes}</td>
                  <td className="px-4 py-3 text-sm text-white">{user._count.ownedKitchens}</td>
                  <td className="px-4 py-3 text-sm text-[#A0A0A0]">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-[#A0A0A0]">
            Kullanıcı bulunamadı
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div 
            className="bg-[#1E1E1E] rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Kullanıcı Detayları</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-[#A0A0A0] hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* User Info */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 mb-4">
                {selectedUser.profileImage ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${selectedUser.profileImage}`}
                    alt={selectedUser.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#30D158] flex items-center justify-center text-2xl text-white font-bold">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-white text-lg font-bold">{selectedUser.name}</p>
                  {selectedUser.isAdmin && (
                    <span className="text-xs bg-[#30D158] text-white px-2 py-1 rounded">
                      Admin
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[#A0A0A0] mb-1">Email</p>
                  <p className="text-sm text-white">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A0A0A0] mb-1">Telefon</p>
                  <p className="text-sm text-white">{selectedUser.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A0A0A0] mb-1">Şifre</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white font-mono">
                      {visiblePasswords.has(selectedUser.id) 
                        ? (selectedUser.plainPassword || 'Google ile giriş')
                        : '••••••••'}
                    </p>
                    {selectedUser.plainPassword && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePasswordVisibility(selectedUser.id);
                        }}
                        className="p-1 text-[#A0A0A0] hover:text-white transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {visiblePasswords.has(selectedUser.id) ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-[#A0A0A0] mb-1">Tarifler</p>
                    <p className="text-sm text-white">{selectedUser._count.recipes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#A0A0A0] mb-1">Mutfaklar</p>
                    <p className="text-sm text-white">{selectedUser._count.ownedKitchens}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#A0A0A0] mb-1">Kayıt Tarihi</p>
                  <p className="text-sm text-white">
                    {new Date(selectedUser.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleAdmin(selectedUser.id, selectedUser.isAdmin);
                }}
                disabled={loading === selectedUser.id}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  selectedUser.isAdmin
                    ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                    : 'bg-[#30D158]/20 text-[#30D158] hover:bg-[#30D158]/30'
                }`}
              >
                {selectedUser.isAdmin ? 'Admin Kaldır' : 'Admin Yap'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteUser(selectedUser.id, selectedUser.name);
                  setSelectedUser(null);
                }}
                disabled={loading === selectedUser.id}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
