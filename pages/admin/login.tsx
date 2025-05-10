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
      console.log('Attempting login with:', { username: email });
      setStatus('Giriş yapılıyor...');
      setStatusType('');
      
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

      const data = await response.json();
      console.log('Login response status:', response.status);
      console.log('Login response data:', data);

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        setStatus('Giriş başarılı! Yönlendiriliyorsunuz...');
        setStatusType('success');
        
        setTimeout(() => {
          router.push('/admin');
        }, 500);
      } else {
        setStatus(data.message || 'Geçersiz e-posta veya şifre!');
        setStatusType('error');
      }
    } catch (error) {
      console.error('Login error:', error);
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
          <button 
            onClick={handleLogin} 
            className="btn-primary w-full py-2 px-4 rounded"
            disabled={!email || !password}
          >
            Giriş Yap
          </button>
          {status && (
            <p className={`text-center mt-4 ${
              statusType === 'success' ? 'text-neon-green' : 
              statusType === 'error' ? 'text-red-500' : 
              'text-gray-400'
            }`}>
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 