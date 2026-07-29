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
  type: string;           // BHK1, BHK2, RK, SHARED, PG
  furnished: string;      // FURNISHED, SEMI_FURNISHED, UNFURNISHED
  gender: string;         // BOYS, GIRLS, ANYONE
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

export interface RoomRequest {
  description?: string;
  rent: number;
  deposit: number;
  type: string;           // BHK1, BHK2, RK, SHARED, PG
  furnished: string;      // FURNISHED, SEMI_FURNISHED, UNFURNISHED
  gender: string;         // BOYS, GIRLS, ANYONE
  whatsapp: string;       // required, exactly 10 digits
  phone?: string;
  instagram?: string;
  telegram?: string;
  contactPreference: string;
  brokerageRequired: boolean;
  brokerageAmount?: number;
  amenities?: string[];
  address: Partial<Address>;
  images: { url: string; label?: string; caption?: string; sequence?: number }[];
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
  bookingId: string | number;
  roomId?: number;
  amount?: number;
  status: string;
  paymentOrderId?: string;
  startDate?: string;
  endDate?: string;
  userEmail?: string;
  createdAt?: string;
}

export interface BookingRequest {
  roomId: number;
  amount: number;
  startDate?: string;
  endDate?: string;
}

export interface Favorite {
  id: number;
  roomId: number;
  userId: number;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  status: string;
}

