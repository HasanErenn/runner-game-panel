import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '../../../generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    // Remove password from response
    const { password: _, ...adminWithoutPassword } = admin;

    return res.status(201).json(adminWithoutPassword);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Username already exists' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
} 