'use client';

import { useState, useEffect } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { toast } from '@/lib/toast';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data.notifications);
      }
    } catch (error) {
      toast.error('Bildirimler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await loadNotifications();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Tüm bildirimler okundu işaretlendi');
      await loadNotifications();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Bildirim silindi');
      await loadNotifications();
    } catch (error) {
      toast.error('Silme başarısız');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-[#A0A0A0]">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-white text-lg font-bold">Bildirimler</h3>
          {unreadCount > 0 && (
            <span className="bg-[#30D158] text-[#121212] text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount} Yeni
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-[#30D158] hover:text-[#30D158]/80"
          >
            Tümünü Okundu İşaretle
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-[#30D158] text-[#121212]'
              : 'bg-[#1E1E1E] text-[#A0A0A0] hover:bg-[#2A2A2A]'
          }`}
        >
          Tümü ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-[#30D158] text-[#121212]'
              : 'bg-[#1E1E1E] text-[#A0A0A0] hover:bg-[#2A2A2A]'
          }`}
        >
          Okunmamış ({unreadCount})
        </button>
      </div>

      {/* Bildirim Listesi */}
      <div className="flex flex-col gap-2">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-[#1E1E1E] rounded-xl">
            <Bell className="w-16 h-16 text-[#3A3A3C] mb-4" />
            <p className="text-[#A0A0A0] text-center">
              {filter === 'unread' ? 'Okunmamış bildirim yok' : 'Henüz bildirim yok'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-3 p-4 rounded-xl transition-colors ${
                !notification.isRead 
                  ? 'bg-[#30D158]/10 border border-[#30D158]/20' 
                  : 'bg-[#1E1E1E]'
              }`}
            >
              {/* İkon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                !notification.isRead ? 'bg-[#30D158]' : 'bg-[#2A2A2A]'
              }`}>
                <Bell className={`w-5 h-5 ${!notification.isRead ? 'text-[#121212]' : 'text-[#A0A0A0]'}`} />
              </div>

              {/* İçerik */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold text-sm mb-1">
                  {notification.title}
                </h4>
                <p className="text-[#A0A0A0] text-sm mb-2">
                  {notification.message}
                </p>
                <p className="text-[#666] text-xs">
                  {formatDate(notification.createdAt)}
                </p>
              </div>

              {/* Aksiyonlar */}
              <div className="flex items-center gap-2">
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-[#30D158] hover:text-[#30D158]/80 text-xs"
                  >
                    Okundu
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="text-red-500 hover:text-red-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
