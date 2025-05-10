import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        router.push('/admin');
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    return null;
  }

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,
          password: password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('adminToken', data.token);
        setStatus('Giriş başarılı!');
        setStatusType('success');
        
        setTimeout(() => {
          router.push('/admin');
        }, 500);
      } else {
        const error = await response.json();
        setStatus(error.message || 'Geçersiz e-posta veya şifre!');
        setStatusType('error');
      }
    } catch (error) {
      setStatus('Bir hata oluştu. Lütfen tekrar deneyin.');
      setStatusType('error');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-dark p-4">
      <div className="form-container">
        <h1 className="text-3xl font-bold text-center mb-8 text-neon-purple">
          Yönetici Girişi
        </h1>
        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="E-posta"
            className="input-field"
            autoFocus
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Şifre"
            className="input-field"
          />
          <button onClick={handleLogin} className="btn-primary">
            Giriş Yap
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
  );
} 