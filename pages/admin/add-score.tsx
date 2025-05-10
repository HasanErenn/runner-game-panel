import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';

export default function AddScore() {
  const [username, setUsername] = useState('');
  const [score, setScore] = useState('');
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error'>('success');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
    }
  }, []);

  const handleAddScore = async () => {
    if (!username || !score) {
      setStatus('Kullanıcı adı ve skor boş olamaz!');
      setStatusType('error');
      return;
    }

    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': localStorage.getItem('adminToken') || '',
        },
        body: JSON.stringify({ username, score: parseInt(score, 10) }),
      });

      if (response.ok) {
        setStatus('Skor başarıyla eklendi!');
        setStatusType('success');
        setUsername('');
        setScore('');
        
        // 1 saniye sonra skor tablosuna yönlendir
        setTimeout(() => {
          router.push('/admin/scoreboard');
        }, 1000);
      } else {
        const errorData = await response.json();
        setStatus(errorData.error || 'Bir hata oluştu.');
        setStatusType('error');
      }
    } catch (error) {
      setStatus('Bir hata oluştu');
      setStatusType('error');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto">
        <div className="bg-dark-light rounded-xl p-8 shadow-neon shadow-neon-purple">
          <h1 className="text-3xl font-bold text-neon-purple mb-8">
            Yeni Skor Ekle
          </h1>
          <div className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Kullanıcı adı"
              className="input-field"
              autoFocus
            />
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Skor"
              className="input-field"
            />
            <button onClick={handleAddScore} className="btn-primary">
              Skor Ekle
            </button>
            {status && (
              <p className={`text-center mt-4 ${
                statusType === 'success' ? 'text-neon-green' : 'text-red-500'
              }`}>
                {status}
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 