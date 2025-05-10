import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

// API anahtarını environment variable'dan al
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

// Yasaklı kelimeleri içeren basit bir liste
const FORBIDDEN_WORDS = [
  // Türkçe yasaklı kelimeler
  'küfür', 'hakaret', 'aptal', 'salak', 'mal',
  // İngilizce yasaklı kelimeler
  'fuck', 'shit', 'stupid', 'idiot', 'noob'
];

// API anahtarı kontrolü
function isValidAdminRequest(req: NextApiRequest): boolean {
  const apiKey = req.headers['x-api-key'];
  return apiKey === ADMIN_API_KEY;
}

function containsForbiddenWords(username: string): boolean {
  const lowercaseUsername = username.toLowerCase();
  return FORBIDDEN_WORDS.some(word => lowercaseUsername.includes(word));
}

function isValidUsername(username: string): boolean {
  // En az 3, en fazla 20 karakter
  if (username.length < 3 || username.length > 20) return false;
  
  // Sadece harf, rakam ve alt çizgi içerebilir
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return false;
  
  // Yasaklı kelimeler kontrolü
  if (containsForbiddenWords(username)) return false;
  
  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // DELETE endpoint'i ekle
  if (req.method === 'DELETE') {
    // Admin API anahtarı kontrolü
    if (!isValidAdminRequest(req)) {
      return res.status(401).json({ error: 'Yetkisiz erişim' });
    }

    try {
      const { username } = req.query;
      
      if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Geçersiz kullanıcı adı' });
      }

      const result = await prisma.score.delete({
        where: { username },
      });
      
      if (!result) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }

      return res.status(200).json({ message: 'Skor başarıyla silindi' });
    } catch (error) {
      return res.status(500).json({ error: 'Skor silinemedi' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { username, score } = req.body;
      
      if (!username || typeof username !== 'string' || !score || typeof score !== 'number') {
        return res.status(400).json({ error: 'Geçersiz kullanıcı adı veya skor' });
      }

      if (!isValidUsername(username)) {
        return res.status(400).json({ error: 'Geçersiz kullanıcı adı formatı' });
      }

      // Kullanıcının en yüksek skorunu güncelle veya yeni skor ekle
      const result = await prisma.score.upsert({
        where: { username },
        update: { score: { set: Math.max(score, (await prisma.score.findUnique({ where: { username } }))?.score || 0) } },
        create: { username, score },
      });
      
      return res.status(200).json({ message: 'Skor başarıyla kaydedildi' });
    } catch (error) {
      if (error.code === 'P2002') { // Unique constraint failed
        return res.status(409).json({ error: 'Bu kullanıcı adı zaten kullanımda' });
      }
      return res.status(500).json({ error: 'Skor kaydedilemedi' });
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
      return res.status(500).json({ error: 'Skorlar alınamadı' });
    }
  }

  // Kullanıcı adı kontrolü için yeni endpoint
  if (req.method === 'HEAD') {
    try {
      const username = req.query.username as string;
      
      if (!username || !isValidUsername(username)) {
        return res.status(400).end();
      }

      const result = await prisma.score.findUnique({
        where: { username },
      });
      
      return res.status(result ? 409 : 200).end();
    } catch (error) {
      return res.status(500).end();
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
} 