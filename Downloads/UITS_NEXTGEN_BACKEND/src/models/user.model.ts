import pool from '../config/database';
import { User } from '../types';

export const UserModel = {
  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await pool.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()],
    );
    return rows[0] ?? null;
  },

  async findByRoleId(roleId: string): Promise<User | null> {
    const { rows } = await pool.query<User>(
      'SELECT * FROM users WHERE role_id = $1',
      [roleId],
    );
    return rows[0] ?? null;
  },

  async findByIdentifier(identifier: string): Promise<User | null> {
    const { rows } = await pool.query<User>(
      'SELECT * FROM users WHERE email = $1 OR role_id = $1',
      [identifier.toLowerCase()],
    );
    return rows[0] ?? null;
  },

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    roleId: string;
    department: string;
    role: 'student' | 'teacher';
    passwordHash: string;
  }): Promise<User> {
    const { rows } = await pool.query<User>(
      `INSERT INTO users (first_name, last_name, email, role_id, department, role, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.firstName,
        data.lastName,
        data.email.toLowerCase(),
        data.roleId,
        data.department,
        data.role,
        data.passwordHash,
      ],
    );
    return rows[0];
  },
};
