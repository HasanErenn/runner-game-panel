import React, { useState } from 'react';

export default function AdminPanel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [score, setScore] = useState('');
  const [status, setStatus] = useState('');
  const [statusColor, setStatusColor] = useState('black');

  const handleLogin = () => {
    // Basit bir e-posta ve şifre kontrolü
    if (email === 'admin@example.com' && password === 'securepassword') {
      setIsAuthenticated(true);
      setStatus('Giriş başarılı!');
      setStatusColor('green');
    } else {
      setStatus('Geçersiz e-posta veya şifre!');
      setStatusColor('red');
    }
  };

  const handleAddScore = async () => {
    if (!username || !score) {
      setStatus('Kullanıcı adı ve skor boş olamaz!');
      setStatusColor('red');
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
        setStatusColor('green');
        setUsername('');
        setScore('');
      } else {
        const errorData = await response.json();
        setStatus(errorData.error || 'Bir hata oluştu.');
        setStatusColor('red');
      }
    } catch (error) {
      setStatus('Bir hata oluştu: ' + error.message);
      setStatusColor('red');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Yönetici Girişi</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta"
          style={{ marginRight: '10px' }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Şifre"
          style={{ marginRight: '10px' }}
        />
        <button onClick={handleLogin}>Giriş Yap</button>
        <p style={{ color: statusColor }}>{status}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Yönetici Paneli</h1>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Kullanıcı adı"
        style={{ marginRight: '10px' }}
      />
      <input
        type="number"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        placeholder="Skor"
        style={{ marginRight: '10px' }}
      />
      <button onClick={handleAddScore}>Skor Ekle</button>
      <p style={{ color: statusColor }}>{status}</p>
    </div>
  );
} 