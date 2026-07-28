export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: string;
  message?: string;
}

export interface User {
  name: string;
  email: string;
  role: string;
}

export interface Address {
  line1?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

export interface RoomImage {
  url: string;
  id?: number;
}

export interface Room {
  id: number;
  rent: number;
  deposit: number;
  type: string;           // e.g. "1BHK", "PG", "FLAT"
  furnished: string;      // "FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"
  gender: string;         // "MALE", "FEMALE", "ANY"
  whatsapp?: string;
  phone?: string;
  instagram?: string;
  telegram?: string;
  contactPreference?: string;
  brokerageRequired?: boolean;
  brokerageAmount?: number;
  description?: string;
  address: Address;
  ownerId?: number;
  createdAt?: string;
  updatedAt?: string;
  amenities: string[];
  images: RoomImage[];
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}

export interface SearchParams {
  area?: string;
  city?: string;
  type?: string;
  furnished?: string;
  gender?: string;
  minRent?: number;
  maxRent?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export interface Booking {
  bookingId: string;
  status: string;
  paymentOrderId?: string;
}

export interface Favorite {
  id: number;
  roomId: number;
  userId: number;
}
