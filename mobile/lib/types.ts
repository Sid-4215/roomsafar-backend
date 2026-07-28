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

export interface RoomRequest {
  title?: string;
  description?: string;
  rent: number;
  deposit: number;
  type: string;
  furnished: string;
  gender: string;
  whatsapp?: string;
  phone?: string;
  contactPreference?: string;
  brokerageRequired?: boolean;
  brokerageAmount?: number;
  amenities?: string[];
  address?: Partial<Address>;
  images?: { url: string }[];
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

// RoomieSync
export interface RooميeListing {
  id: number;
  title?: string;
  description?: string;
  listingType?: string;  // "LOOKING_FOR_ROOM" | "HAVE_ROOM"
  rent?: number;
  area?: string;
  city?: string;
  gender?: string;
  ownerId?: number;
  createdAt?: string;
}

export interface RoomieListing {
  id: number;
  title?: string;
  description?: string;
  listingType?: string;
  rent?: number;
  area?: string;
  city?: string;
  gender?: string;
  ownerId?: number;
  createdAt?: string;
}
