import React, { useState } from 'react';

export default function AdminPanel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [score, setScore] = useState('');
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');

  const handleLogin = () => {
    if (email === 'admin@example.com' && password === 'securepassword') {
      setIsAuthenticated(true);
      setStatus('Giriş başarılı!');
      setStatusType('success');
    } else {
      setStatus('Geçersiz e-posta veya şifre!');
      setStatusType('error');
    }
  };

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
        },
        body: JSON.stringify({ username, score: parseInt(score, 10) }),
      });

      if (response.ok) {
        setStatus('Skor başarıyla eklendi!');
        setStatusType('success');
        setUsername('');
        setScore('');
      } else {
        const errorData = await response.json();
        setStatus(errorData.error || 'Bir hata oluştu.');
        setStatusType('error');
      }
    } catch (error) {
      setStatus('Bir hata oluştu: ' + error.message);
      setStatusType('error');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!isAuthenticated) {
        handleLogin();
      } else {
        handleAddScore();
      }
    }
  };

  if (!isAuthenticated) {
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-dark p-4">
      <div className="form-container">
        <h1 className="text-3xl font-bold text-center mb-8 text-neon-purple">
          Yönetici Paneli
        </h1>
        <div className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Kullanıcı adı"
            className="input-field"
            autoFocus
          />
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            onKeyPress={handleKeyPress}
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
  );
} 