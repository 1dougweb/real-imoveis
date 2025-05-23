export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  roles?: string[];
  token?: string;
  profile_photo_path?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateUserData?: (userData: User) => void;
} 