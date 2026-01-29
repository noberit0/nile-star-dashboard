import api from './api';
import { Operator, LoginResponse } from '@/types';

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', {
    email,
    password,
  });

  if (response.data.data.token) {
    localStorage.setItem('authToken', response.data.data.token);
    localStorage.setItem('operator', JSON.stringify(response.data.data.operator));
  }

  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('operator');
  window.location.href = '/login';
};

export const getOperator = (): Operator | null => {
  if (typeof window === 'undefined') return null;

  const operatorData = localStorage.getItem('operator');
  if (!operatorData) return null;

  try {
    return JSON.parse(operatorData) as Operator;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('authToken');
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};
