import * as authService from '../services/authService.js';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const handleRegister = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const user = await authService.register(validatedData);
    res.status(201).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

export const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const { user, token } = await authService.login(email, password);
    res.status(200).json({ status: 'success', data: { user, token } });
  } catch (error) {
    next(error);
  }
};
