import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-dark-light rounded-xl p-8 shadow-neon shadow-neon-purple">
          <h1 className="text-3xl font-bold text-neon-purple mb-8">
            Yönetici Paneli
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              onClick={() => router.push('/admin/add-score')}
              className="bg-dark p-6 rounded-xl border-2 border-neon-green cursor-pointer
                hover:bg-dark-light transition-all duration-300 transform hover:scale-105"
            >
              <h2 className="text-2xl font-bold text-neon-green mb-3">Skor Ekle</h2>
              <p className="text-gray-400">
                Yeni bir oyuncu skoru ekleyin veya mevcut bir skoru güncelleyin.
              </p>
            </div>

            <div
              onClick={() => router.push('/admin/scoreboard')}
              className="bg-dark p-6 rounded-xl border-2 border-neon-purple cursor-pointer
                hover:bg-dark-light transition-all duration-300 transform hover:scale-105"
            >
              <h2 className="text-2xl font-bold text-neon-purple mb-3">Skor Tablosu</h2>
              <p className="text-gray-400">
                Tüm oyuncuların skorlarını görüntüleyin ve yönetin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 