import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

// PrismaClient'ı global olarak tanımlayın
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Token doğrulama fonksiyonu
const verifyToken = (token: string): boolean => {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
};

// API anahtarı kontrolü
function isValidAdminRequest(req: NextApiRequest): boolean {
  const token = req.headers['x-api-key'] as string;
  return token ? verifyToken(token) : false;
}

// Yasaklı kelimeleri içeren basit bir liste
const FORBIDDEN_WORDS = [
  // Türkçe yasaklı kelimeler
  'küfür', 'hakaret', 'aptal', 'salak', 'mal',
  // İngilizce yasaklı kelimeler
  'fuck', 'shit', 'stupid', 'idiot', 'noob'
];

function containsForbiddenWords(username: string): boolean {
  const lowercaseUsername = username.toLowerCase();
  return FORBIDDEN_WORDS.some(word => lowercaseUsername.includes(word));
}

function isValidUsername(username: string): boolean {
  // En az 3, en fazla 20 karakter
  if (username.length < 3 || username.length > 20) return false;
  
  // Türkçe karakterler, harf, rakam ve alt çizgi içerebilir
  if (!/^[a-zA-ZğĞüÜşŞıİöÖçÇ0-9_]+$/.test(username)) return false;
  
  // Yasaklı kelimeler kontrolü
  if (containsForbiddenWords(username)) return false;
  
  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // DELETE endpoint'i
  if (req.method === 'DELETE') {
    // Admin token kontrolü
    if (!isValidAdminRequest(req)) {
      return res.status(401).json({ error: 'Yetkisiz erişim' });
    }

    try {
      const { username } = req.query;
      
      if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Geçersiz kullanıcı adı' });
      }

      const result = await prisma.score.deleteMany({
        where: { username },
      });
      
      if (result.count === 0) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }

      return res.status(200).json({ message: 'Skor başarıyla silindi' });
    } catch (error) {
      console.error('Skor silme hatası:', error);
      return res.status(500).json({ error: 'Skor silinemedi' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { username, score } = req.body;
      
      if (!username || typeof username !== 'string' || typeof score !== 'number') {
        return res.status(400).json({ 
          success: false,
          message: 'Geçersiz kullanıcı adı veya skor',
          error: 'INVALID_INPUT'
        });
      }

      if (!isValidUsername(username)) {
        return res.status(400).json({ 
          success: false,
          message: 'Geçersiz kullanıcı adı formatı',
          error: 'INVALID_USERNAME_FORMAT'
        });
      }

      // Kullanıcının en yüksek skorunu güncelle veya yeni skor ekle
      const result = await prisma.score.upsert({
        where: { username },
        update: { score: { set: Math.max(score, (await prisma.score.findUnique({ where: { username } }))?.score || 0) } },
        create: { username, score },
      });
      
      return res.status(200).json({ 
        success: true,
        message: 'Skor başarıyla kaydedildi',
        data: result
      });
    } catch (error) {
      if (error.code === 'P2002') { // Unique constraint failed
        return res.status(409).json({ 
          success: false,
          message: 'Bu kullanıcı adı zaten kullanımda',
          error: 'USERNAME_TAKEN'
        });
      }
      console.error('Skor kaydetme hatası:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Skor kaydedilemedi',
        error: 'SERVER_ERROR'
      });
    }
  }
  
  if (req.method === 'GET') {
    try {
      const scores = await prisma.score.findMany({
        orderBy: { score: 'desc' },
        take: 100,
      });
      
      return res.status(200).json(scores);
    } catch (error) {
      console.error('Skor listeleme hatası:', error);
      return res.status(500).json({ error: 'Skorlar alınamadı' });
    }
  }

  // Kullanıcı adı kontrolü için yeni endpoint
  if (req.method === 'HEAD') {
    try {
      const username = req.query.username as string;
      
      if (!username || !isValidUsername(username)) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz kullanıcı adı formatı',
          error: 'INVALID_USERNAME_FORMAT'
        });
      }

      const result = await prisma.score.findUnique({
        where: { username },
      });
      
      if (result) {
        return res.status(409).json({
          success: false,
          message: 'Bu kullanıcı adı zaten kullanımda',
          error: 'USERNAME_TAKEN'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Kullanıcı adı kullanılabilir'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Sunucu hatası',
        error: 'SERVER_ERROR'
      });
    }
  }
  
  return res.status(405).json({ 
    success: false,
    message: 'Method not allowed',
    error: 'METHOD_NOT_ALLOWED'
  });
} 