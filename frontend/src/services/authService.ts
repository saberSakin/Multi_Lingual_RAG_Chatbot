import { User, AuthState } from '../types';

const STORAGE_KEY = 'chatbot_auth';
const MOCK_USER = {
  id: '1',
  email: 'user1@mail.com',
  name: 'John Doe'
};

class AuthService {
  private authState: AuthState = {
    user: null,
    isAuthenticated: false
  };

  constructor() {
    this.loadAuthState();
  }

  private loadAuthState(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.authState = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
    }
  }

  private saveAuthState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.authState));
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (email === 'user1@mail.com' && password === '123456') {
      this.authState = {
        user: MOCK_USER,
        isAuthenticated: true
      };
      this.saveAuthState();
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  }

  async signup(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // For demo purposes, only allow the mock user credentials
    if (email === 'user1@mail.com') {
      const user = { ...MOCK_USER, name };
      this.authState = {
        user,
        isAuthenticated: true
      };
      this.saveAuthState();
      return { success: true };
    }

    return { success: false, error: 'Registration currently limited to demo account' };
  }

  logout(): void {
    this.authState = {
      user: null,
      isAuthenticated: false
    };
    this.saveAuthState();
  }

  getCurrentUser(): User | null {
    return this.authState.user;
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }
}

export const authService = new AuthService();