'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Log {
  id: number;
  type: string;
  action: string;
  details?: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

interface Props {
  token: string;
}

export default function LogViewer({ token }: Props) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const response = await api.get('/api/admin/logs?limit=100', token);
    if (response.success) {
      setLogs((response.data as any).logs);
    }
    setLoading(false);
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      log.type.toLowerCase().includes(filter.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ADMIN_ACTION':
        return 'bg-red-500/20 text-red-500';
      case 'USER_ACTION':
        return 'bg-blue-500/20 text-blue-500';
      case 'SYSTEM_EVENT':
        return 'bg-[#30D158]/20 text-[#30D158]';
      default:
        return 'bg-[#A0A0A0]/20 text-[#A0A0A0]';
    }
  };

  if (loading) {
    return <div className="text-center text-[#A0A0A0] py-8">Yükleniyor...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 bg-[#121212] rounded-lg p-3">
        <span className="material-symbols-outlined text-[#A0A0A0]">search</span>
        <input
          type="text"
          placeholder="Log ara..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 bg-transparent text-white outline-none"
        />
      </div>

      <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#121212]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Tarih</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Tip</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">İşlem</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#A0A0A0]">Kullanıcı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#2A2A2A]">
                  <td className="px-4 py-3 text-sm text-[#A0A0A0]">
                    {new Date(log.createdAt).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(log.type)}`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{log.action}</td>
                  <td className="px-4 py-3 text-sm text-[#A0A0A0]">
                    {log.user ? log.user.name : 'System'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
