import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import crypto from 'crypto';

export const register = async (userData) => {
  const { email, password, name } = userData;

  const [existingUsers] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  if (existingUsers.length > 0) {
    const error = new Error('User already exists');
    error.statusCode = 400;
    throw error;
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
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
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

export const getUserById = async (id) => {
  const [users] = await pool.execute('SELECT id, email, name, role FROM users WHERE id = ?', [id]);
  return users[0];
};

export const updateUser = async (id, data) => {
  const { name, email, password } = data;
  
  if (password) {
    const passwordHash = await bcrypt.hash(password, 10);
    await pool.execute(
      'UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?',
      [name, email, passwordHash, id]
    );
  } else {
    await pool.execute(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, id]
    );
  }

  return getUserById(id);
};
