'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Her 30 saniyede bir yenile
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await api.get<any>('/api/notifications', token);
    if (response.success && response.data) {
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    await api.put(`/api/notifications/${id}/read`, {}, token);
    loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    await api.put('/api/notifications/read-all', {}, token);
    await loadNotifications();
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    await api.delete(`/api/notifications/${id}`, token);
    loadNotifications();
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      module_trial_ending: '⏰',
      module_expired: '❌',
      new_module: '🎉',
      payment_reminder: '💳'
    };
    return icons[type] || '🔔';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-white hover:bg-white/10 rounded-lg transition"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-[#1C1C1E] rounded-lg shadow-lg z-50 max-h-[500px] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-white font-semibold">Bildirimler</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  className="text-[#30D158] text-sm hover:underline"
                >
                  Tümünü Okundu İşaretle
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <span className="material-symbols-outlined text-4xl mb-2">notifications_off</span>
                  <p>Bildirim yok</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-white/10 hover:bg-white/5 transition ${
                      !notification.isRead ? 'bg-[#30D158]/10' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-white font-medium text-sm">{notification.title}</h4>
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-xs">
                            {new Date(notification.createdAt).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-[#30D158] text-xs hover:underline"
                            >
                              Okundu İşaretle
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
