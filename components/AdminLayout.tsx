import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const menuItems = [
    { path: '/admin', label: 'Ana Sayfa' },
    { path: '/admin/add-score', label: 'Skor Ekle' },
    { path: '/admin/scoreboard', label: 'Skor Tablosu' },
  ];

  if (!mounted) {
    return null;
  }

  const currentPath = router.pathname;
  
  if (currentPath === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-dark">
      <nav className="bg-dark-light border-b border-neon-purple/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPath === item.path
                    ? 'bg-neon-purple text-white'
                    : 'text-gray-300 hover:bg-dark-light/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Çıkış Yap
          </button>
        </div>
      </nav>
      <main className="p-4">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
} 