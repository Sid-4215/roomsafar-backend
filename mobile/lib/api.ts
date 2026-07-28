import axios, { AxiosInstance, AxiosError } from 'axios';
import { storage } from './storage';
import type {
  AuthResponse, Room, PaginatedResponse,
  SearchParams, Booking, Favorite,
} from './types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (res) => res,
      (err: AxiosError) => {
        const msg =
          (err.response?.data as any)?.message ||
          (err.response?.data as any)?.error ||
          err.message ||
          'Something went wrong';
        throw new Error(msg);
      }
    );
  }

  setToken(token: string | null) {
    this.token = token;
  }

  // ── Auth ─────────────────────────────────────────────────────────────────
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await this.client.post('/auth/register', { name, email, password });
    return res.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await this.client.post('/auth/login', { email, password });
    return res.data;
  }

  async getMe(): Promise<any> {
    const res = await this.client.get('/auth/me');
    return res.data;
  }

  // ── Rooms ─────────────────────────────────────────────────────────────────
  async getFeaturedRooms(): Promise<Room[]> {
    const res = await this.client.get('/api/rooms/featured');
    return res.data;
  }

  async getRooms(page = 0, size = 10): Promise<PaginatedResponse<Room>> {
    const res = await this.client.get('/api/rooms', { params: { page, size, sortBy: 'createdAt', sortDir: 'desc' } });
    return res.data;
  }

  async getRoomById(id: number): Promise<Room> {
    const res = await this.client.get(`/api/rooms/${id}`);
    return res.data;
  }

  async searchRooms(params: SearchParams): Promise<PaginatedResponse<Room>> {
    const res = await this.client.get('/api/rooms/search', { params });
    return res.data;
  }

  async getPopularAreas(): Promise<Record<string, number>> {
    const res = await this.client.get('/api/rooms/popular-areas');
    return res.data;
  }

  // ── Bookings ──────────────────────────────────────────────────────────────
  async createBooking(roomId: number, amount: number): Promise<Booking> {
    const res = await this.client.post('/api/bookings', { roomId, amount });
    return res.data;
  }

  // ── Favorites ─────────────────────────────────────────────────────────────
  async getFavorites(): Promise<Favorite[]> {
    const res = await this.client.get('/api/favorites');
    return res.data;
  }

  async addFavorite(roomId: number): Promise<Favorite> {
    const res = await this.client.post('/api/favorites', { roomId });
    return res.data;
  }

  async removeFavorite(roomId: number): Promise<void> {
    await this.client.delete(`/api/favorites/${roomId}`);
  }

  async checkFavorite(roomId: number): Promise<boolean> {
    const res = await this.client.get(`/api/favorites/check/${roomId}`);
    return res.data;
  }
}

export const api = new ApiClient();

// Restore token from storage on cold start
export async function initApi(): Promise<void> {
  const token = await storage.getToken();
  api.setToken(token);
}
