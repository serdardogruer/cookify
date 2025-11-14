'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';

interface Settings {
  allowRegistration: boolean;
  maintenanceMode: boolean;
  maxFileUploadSize: number;
  sessionTimeout: number;
}

interface Props {
  token: string;
}

export default function SettingsForm({ token }: Props) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const response = await api.get('/api/admin/settings', token);
    if (response.success) {
      setSettings(response.data as any);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    const response = await api.put('/api/admin/settings', settings, token);

    if (response.success) {
      toast.success('Ayarlar kaydedildi');
    } else {
      toast.error(response.error?.message || 'İşlem başarısız');
    }
    setSaving(false);
  };

  const handleToggleMaintenance = async () => {
    if (!settings) return;

    const newValue = !settings.maintenanceMode;
    
    if (!confirm(`Bakım modunu ${newValue ? 'açmak' : 'kapatmak'} istediğinize emin misiniz?`)) {
      return;
    }

    const response = await api.post(
      '/api/admin/settings/maintenance',
      { enabled: newValue },
      token
    );

    if (response.success) {
      toast.success(`Bakım modu ${newValue ? 'açıldı' : 'kapatıldı'}`);
      loadSettings();
    } else {
      toast.error(response.error?.message || 'İşlem başarısız');
    }
  };

  if (loading || !settings) {
    return <div className="text-center text-[#A0A0A0] py-8">Yükleniyor...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[#1E1E1E] rounded-lg p-4">
        <h3 className="text-white font-bold mb-4">Sistem Ayarları</h3>
        
        <div className="flex flex-col gap-4">
          {/* Kayıt İzni */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Yeni Kayıt İzni</p>
              <p className="text-[#A0A0A0] text-sm">Yeni kullanıcıların kayıt olmasına izin ver</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, allowRegistration: !settings.allowRegistration })}
              className={`w-12 h-6 rounded-full transition ${
                settings.allowRegistration ? 'bg-[#30D158]' : 'bg-[#A0A0A0]'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition transform ${
                  settings.allowRegistration ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Bakım Modu */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Bakım Modu</p>
              <p className="text-[#A0A0A0] text-sm">Sadece admin kullanıcılar erişebilir</p>
            </div>
            <button
              onClick={handleToggleMaintenance}
              className={`w-12 h-6 rounded-full transition ${
                settings.maintenanceMode ? 'bg-red-500' : 'bg-[#A0A0A0]'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition transform ${
                  settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Dosya Boyutu */}
          <div>
            <label className="text-white font-medium block mb-2">
              Maksimum Dosya Boyutu (MB)
            </label>
            <input
              type="number"
              value={Math.round(settings.maxFileUploadSize / 1024 / 1024)}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxFileUploadSize: parseInt(e.target.value) * 1024 * 1024,
                })
              }
              className="w-full bg-[#121212] text-white rounded-lg p-3 outline-none"
            />
          </div>

          {/* Session Timeout */}
          <div>
            <label className="text-white font-medium block mb-2">
              Oturum Zaman Aşımı (saat)
            </label>
            <input
              type="number"
              value={Math.round(settings.sessionTimeout / 3600)}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  sessionTimeout: parseInt(e.target.value) * 3600,
                })
              }
              className="w-full bg-[#121212] text-white rounded-lg p-3 outline-none"
            />
          </div>

          {/* Kaydet Butonu */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#30D158] text-white rounded-lg py-3 font-medium hover:bg-[#30D158]/90 disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
