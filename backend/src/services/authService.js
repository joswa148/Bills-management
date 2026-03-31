import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import crypto from 'crypto';

export const register = async (userData) => {
  const { email, password, name } = userData;

  const [existingUsers] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  if (existingUsers.length > 0) {
    throw new Error('User already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();

  await pool.execute(
    'INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)',
    [id, email, passwordHash, name, 'viewer']
  );

  const token = jwt.sign(
    { id, email, role: 'viewer' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { 
    user: { id, email, name, role: 'viewer' },
    token 
  };
};

export const login = async (email, password) => {
  const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  const user = users[0];

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
  };
};
