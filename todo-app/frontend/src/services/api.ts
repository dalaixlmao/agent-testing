import axios from 'axios';
import { TodoFormData, User } from '@/types';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const authAPI = {
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Todos API calls
export const todosAPI = {
  getAllTodos: async (filters?: Record<string, string>) => {
    const queryString = filters 
      ? '?' + new URLSearchParams(filters).toString()
      : '';
    const response = await api.get(`/todos${queryString}`);
    return response.data;
  },
  
  getTodoById: async (id: string) => {
    const response = await api.get(`/todos/${id}`);
    return response.data;
  },
  
  createTodo: async (todoData: TodoFormData) => {
    const response = await api.post('/todos', todoData);
    return response.data;
  },
  
  updateTodo: async (id: string, todoData: Partial<TodoFormData>) => {
    const response = await api.put(`/todos/${id}`, todoData);
    return response.data;
  },
  
  deleteTodo: async (id: string) => {
    const response = await api.delete(`/todos/${id}`);
    return response.data;
  },
};

export default api;