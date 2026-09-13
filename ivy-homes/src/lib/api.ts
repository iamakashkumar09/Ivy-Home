import axios, { AxiosInstance } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://solve.ivy.homes';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'IVY26-A4C53DFE6838';

// Token management
const TOKEN_KEY = 'ivy_access_token';
const REFRESH_KEY = 'ivy_refresh_token';
const TOKEN_EXPIRY_KEY = 'ivy_token_expiry';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + expiresIn * 1000));
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

export function isTokenExpired(): boolean {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiry) return true;
  return Date.now() > parseInt(expiry) - 60000; // refresh 1 min before expiry
}

// Axios instance
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token + auto-refresh
api.interceptors.request.use(async (config) => {
  const token = getAccessToken();
  if (token) {
    if (isTokenExpired()) {
      const newToken = await refreshAccessToken();
      if (newToken) config.headers['Authorization'] = `Bearer ${newToken}`;
    } else {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// Refresh token logic
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken }, {
      headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
    });
    const { access_token, refresh_token, expires_in } = res.data;
    setTokens(access_token, refresh_token, expires_in);
    return access_token;
  } catch {
    clearTokens();
    return null;
  }
}

// Auth
export const authAPI = {
  login: async (email: string, password: string) => {
    const res = await axios.post(`${BASE_URL}/auth/login`, { email, password }, {
      headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
    });
    const { access_token, refresh_token, expires_in, user } = res.data;
    setTokens(access_token, refresh_token, expires_in);
    return { user, access_token };
  },
  logout: async () => {
    try { await api.post('/auth/logout'); } catch {}
    clearTokens();
  },
};

// Pagination helper type
export interface PaginatedResponse<T> {
  limit: number;
  offset: number;
  count: number;
  total: number;
  has_more: boolean;
  results: T[];
}

export interface ListingFilters {
  locality?: string;
  bhk?: number;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  furnishing?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Listings
export const listingsAPI = {
  getAll: async (filters: ListingFilters = {}): Promise<PaginatedResponse<Listing>> => {
    const params = { limit: 20, offset: 0, ...filters };
    const res = await api.get('/v1/listings', { params });
    return res.data;
  },
  getById: async (id: string): Promise<Listing> => {
    const res = await api.get(`/v1/listings/${id}`);
    return res.data;
  },
};

// Rentals
export const rentalsAPI = {
  getAll: async (filters: Omit<ListingFilters, 'property_type' | 'min_price' | 'max_price'> = {}): Promise<PaginatedResponse<Rental>> => {
    const params = { limit: 20, offset: 0, ...filters };
    const res = await api.get('/v1/rentals', { params });
    return res.data;
  },
  getById: async (id: string): Promise<Rental> => {
    const res = await api.get(`/v1/rentals/${id}`);
    return res.data;
  },
};

// Projects
export interface ProjectFilters {
  locality?: string;
  project_status?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export const projectsAPI = {
  getAll: async (filters: ProjectFilters = {}): Promise<PaginatedResponse<Project>> => {
    const params = { limit: 20, offset: 0, ...filters };
    const res = await api.get('/v1/projects', { params });
    return res.data;
  },
  getById: async (id: string): Promise<Project> => {
    const res = await api.get(`/v1/projects/${id}`);
    return res.data;
  },
};

// Saved
export const savedAPI = {
  getAll: async (): Promise<{ count: number; results: Listing[] }> => {
    const res = await api.get('/v1/saved');
    return res.data;
  },
  save: async (listingId: string) => {
    const res = await api.post('/v1/saved', { listing_id: listingId });
    return res.data;
  },
  remove: async (listingId: string) => {
    const res = await api.delete(`/v1/saved/${listingId}`);
    return res.data;
  },
};

// Health
export const healthAPI = {
  get: async () => {
    const res = await axios.get(`${BASE_URL}/health`);
    return res.data;
  },
};

export default api;

// Types
export interface Listing {
  listing_id: string;
  listing_url: string;
  website: string;
  city_id: number;
  apartment_name: string;
  locality: string;
  property_type: string;
  bedroom: number;
  bathroom: number;
  balcony: number;
  floor: number;
  total_floors: number;
  furnishing: string;
  facing_direction: string;
  covered_parking: number;
  price: number;
  carpet_area: number;
  super_built_up_area: number;
  latitude: number;
  longitude: number;
  posted_by: string;
  posted_by_name: string;
  posted_by_contact: string;
  project_id: string | null;
  is_verified: boolean;
  description: string;
  posted_at: string;
  is_live: boolean;
}

export interface Rental {
  listing_id: string;
  listing_url: string;
  website: string;
  city_id: number;
  title: string;
  apartment_name: string;
  locality: string;
  property_type: string;
  bedroom: number;
  bathroom: number;
  floor: number;
  total_floors: number;
  furnishing: string;
  facing_direction: string;
  price: number;
  deposit: number;
  maintenance: number;
  carpet_area: number;
  super_builtup_area: number;
  latitude: number;
  longitude: number;
  posted_by: string;
  posted_by_name: string;
  posted_by_contact: string;
  description: string;
  posted_at: string;
  is_live: boolean;
}

export interface Project {
  project_id: string;
  project_url: string;
  city_id: number;
  apartment_name: string;
  developer_name: string;
  locality: string;
  project_status: string;
  total_units: number;
  total_towers: number;
  total_floors: number;
  launch_date: string;
  possession_date: string;
  rera_number: string;
  min_area_sqft: number;
  max_area_sqft: number;
  amenities: string[];
  latitude: number;
  longitude: number;
  total_listings: number;
  price_min: number;
  price_max: number;
}
