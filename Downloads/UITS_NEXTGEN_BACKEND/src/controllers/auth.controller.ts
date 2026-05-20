import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { SignupBody, LoginBody, AuthPayload } from '../types';
import { AuthRequest } from '../middleware/auth.middleware';

const JWT_SECRET     = process.env.JWT_SECRET     || 'change_this_secret';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

function buildToken(user: {
  id: number;
  email: string;
  role: 'student' | 'teacher';
  first_name: string;
  last_name: string;
  role_id: string;
  department: string;
}): string {
  const payload: AuthPayload = {
    userId:     user.id,
    email:      user.email,
    role:       user.role,
    firstName:  user.first_name,
    lastName:   user.last_name,
    roleId:     user.role_id,
    department: user.department,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export const signup = async (req: Request, res: Response): Promise<void> => {
  const {
    firstName, lastName, email, roleId, department, password, role,
  }: SignupBody = req.body;

  if (!firstName || !lastName || !email || !roleId || !department || !password || !role) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ message: 'Invalid email address' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ message: 'Password must be at least 6 characters' });
    return;
  }

  if (!['student', 'teacher'].includes(role)) {
    res.status(400).json({ message: 'Role must be student or teacher' });
    return;
  }

  try {
    if (await UserModel.findByEmail(email)) {
      res.status(409).json({ message: 'Email is already registered' });
      return;
    }

    if (await UserModel.findByRoleId(roleId)) {
      res.status(409).json({
        message: `${role === 'student' ? 'Student' : 'Employee'} ID is already registered`,
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({
      firstName, lastName, email, roleId, department, role, passwordHash,
    });

    const token = buildToken(user);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id:         user.id,
        firstName:  user.first_name,
        lastName:   user.last_name,
        email:      user.email,
        roleId:     user.role_id,
        department: user.department,
        role:       user.role,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { identifier, password, role }: LoginBody = req.body;

  if (!identifier || !password || !role) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  try {
    const user = await UserModel.findByIdentifier(identifier);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (user.role !== role) {
      res.status(401).json({
        message: `No ${role} account found for these credentials`,
      });
      return;
    }

    const token = buildToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id:         user.id,
        firstName:  user.first_name,
        lastName:   user.last_name,
        email:      user.email,
        roleId:     user.role_id,
        department: user.department,
        role:       user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProfile = (req: AuthRequest, res: Response): void => {
  res.json({ user: req.user });
};
