import axios, { AxiosInstance, AxiosError } from 'axios';
import { storage } from './storage';
import type {
  AuthResponse, Room, RoomRequest, PaginatedResponse,
  SearchParams, Booking, BookingRequest, Favorite, PaymentOrder,
} from './types';

// Empty string → relative URLs (same-origin via the proxy on port 5000).
// Fallback to localhost for native builds.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

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
    const res = await this.client.get('/api/rooms', {
      params: { page, size, sortBy: 'createdAt', sortDir: 'desc' },
    });
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

  async getMyRooms(page = 0, size = 20): Promise<PaginatedResponse<Room>> {
    const res = await this.client.get('/api/rooms/my-rooms', {
      params: { page, size },
    });
    return res.data;
  }

  async createRoom(data: RoomRequest): Promise<Room> {
    const res = await this.client.post('/api/rooms', data);
    return res.data;
  }

  async updateRoom(id: number, data: RoomRequest): Promise<Room> {
    const res = await this.client.put(`/api/rooms/${id}`, data);
    return res.data;
  }

  async deleteRoom(id: number): Promise<void> {
    await this.client.delete(`/api/rooms/${id}`);
  }

  // ── Bookings ──────────────────────────────────────────────────────────────
  async createBooking(req: BookingRequest): Promise<Booking> {
    const res = await this.client.post('/api/bookings', req);
    return res.data;
  }

  async getMyBookings(): Promise<Booking[]> {
    const res = await this.client.get('/api/bookings/my');
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

  // ── Payments ──────────────────────────────────────────────────────────────
  async createPaymentOrder(amount: number, currency = 'INR', receipt?: string): Promise<PaymentOrder> {
    const res = await this.client.post('/api/payments/create-order', {
      amount,
      currency,
      receipt: receipt ?? `pay_${Date.now()}`,
    });
    return res.data;
  }

  // ── Image Upload ──────────────────────────────────────────────────────────
  async uploadImage(formData: FormData): Promise<{ url: string; filename: string }> {
    // Do NOT set Content-Type manually — axios must auto-set it with the
    // correct multipart boundary (e.g. "multipart/form-data; boundary=----...").
    // Explicitly setting it without a boundary causes the server to reject the body.
    const res = await this.client.post('/api/rooms/images/upload', formData, {
      headers: { 'Content-Type': undefined },
      timeout: 30000,
    });
    return res.data;
  }
}

export const api = new ApiClient();

// Restore token from storage on cold start
export async function initApi(): Promise<void> {
  const token = await storage.getToken();
  api.setToken(token);
}
