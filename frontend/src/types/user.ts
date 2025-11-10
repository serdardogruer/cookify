export interface User {
  id: number;
  name: string;
  email: string;
  profileImage: string | null;
  kitchenId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Kitchen {
  id: number;
  name: string;
  inviteCode: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  kitchen?: Kitchen;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}
