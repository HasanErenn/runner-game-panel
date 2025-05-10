import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';

interface Score {
  id: number;
  username: string;
  score: number;
  createdAt: string;
}

export default function Scoreboard() {
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const response = await fetch('/api/scores');
      if (response.ok) {
        const data = await response.json();
        setScores(data);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Skorlar yüklenirken bir hata oluştu');
      }
    } catch (error) {
      setError('Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (username: string) => {
    if (isDeleting) return;
    
    if (!confirm('Bu skoru silmek istediğinizden emin misiniz?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/scores?username=${encodeURIComponent(username)}`, {
        method: 'DELETE',
        headers: {
          'x-api-key': localStorage.getItem('adminToken') || '',
        },
      });

      if (response.ok) {
        setError('');
        await fetchScores();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Skor silinirken bir hata oluştu');
      }
    } catch (error) {
      setError('Bir hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-neon-purple text-xl">Yükleniyor...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-dark-light rounded-xl p-6 shadow-neon shadow-neon-purple">
          <h1 className="text-3xl font-bold text-neon-purple mb-6">Skor Tablosu</h1>

          {error && (
            <div className="bg-red-500 bg-opacity-20 text-red-500 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neon-purple/20">
                  <th className="text-left p-4 text-neon-purple">Kullanıcı Adı</th>
                  <th className="text-left p-4 text-neon-purple">Skor</th>
                  <th className="text-left p-4 text-neon-purple">Tarih</th>
                  <th className="text-left p-4 text-neon-purple">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score) => (
                  <tr key={score.id} className="border-b border-neon-purple/10 hover:bg-dark-light/50">
                    <td className="p-4 text-white">{score.username}</td>
                    <td className="p-4 text-white">{score.score}</td>
                    <td className="p-4 text-white">
                      {new Date(score.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDelete(score.username)}
                        disabled={isDeleting}
                        className={`text-red-500 hover:text-red-400 transition-colors ${
                          isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isDeleting ? 'Siliniyor...' : 'Sil'}
                      </button>
                    </td>
                  </tr>
                ))}
                {scores.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center p-4 text-gray-400">
                      Henüz hiç skor kaydedilmemiş.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 