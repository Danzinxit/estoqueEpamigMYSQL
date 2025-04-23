export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Equipment {
  id: number;
  name: string;
  description: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: number;
  equipmentId: number;
  quantity: number;
  type: 'in' | 'out';
  description: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}