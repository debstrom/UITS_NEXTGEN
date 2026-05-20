export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id: string;
  department: string;
  role: 'student' | 'teacher';
  password_hash: string;
  created_at: Date;
}

export interface AuthPayload {
  userId: number;
  email: string;
  role: 'student' | 'teacher';
  firstName: string;
  lastName: string;
  roleId: string;
  department: string;
}

export interface SignupBody {
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  department: string;
  password: string;
  role: 'student' | 'teacher';
}

export interface LoginBody {
  identifier: string;
  password: string;
  role: 'student' | 'teacher';
}
