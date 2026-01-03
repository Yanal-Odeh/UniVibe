import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration - Uses environment variable or falls back to localhost
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_URL;
    console.log('🌐 API initialized:', this.baseURL);
  }

  async request(endpoint: string, options: any = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Add token from AsyncStorage if available
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      console.log('📡 Fetching:', url);
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      console.log('✅ Success:', endpoint);
      return data;
    } catch (error: any) {
      console.error('❌ API Error:', error.message);
      throw error;
    }
  }

  // Community endpoints
  async getCommunities(search = '') {
    return this.request(`/communities${search ? `?search=${search}` : ''}`);
  }

  async getCommunity(id: number) {
    return this.request(`/communities/${id}`);
  }

  async joinCommunity(communityId: number, userId: number) {
    return this.request(`/communities/${communityId}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async leaveCommunity(communityId: number, userId: number) {
    return this.request(`/communities/${communityId}/leave`, {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    });
  }

  // Event endpoints
  async getEvents(filters = {}) {
    const queryString = new URLSearchParams(filters as any).toString();
    return this.request(`/events${queryString ? `?${queryString}` : ''}`);
  }

  async getEvent(id: number) {
    return this.request(`/events/${id}`);
  }

  async registerForEvent(eventId: number, userId: number) {
    return this.request(`/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      await AsyncStorage.setItem('token', data.token);
    }
    return data;
  }

  async signup(userData: any) {
    const data = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      await AsyncStorage.setItem('token', data.token);
    }
    return data;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    await AsyncStorage.removeItem('token');
  }

  async getCurrentUser() {
    const data = await this.request('/auth/me');
    return data.user || data;
  }

  // Application endpoints
  async createApplication(applicationData: any) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async getApplications() {
    return this.request('/applications');
  }

  async updateApplicationStatus(id: string, status: string, rejectionReason?: string) {
    return this.request(`/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, rejectionReason }),
    });
  }

  async deleteApplication(id: string) {
    return this.request(`/applications/${id}`, {
      method: 'DELETE',
    });
  }

  // Student endpoints
  async getStudents() {
    return this.request('/students');
  }

  async createStudent(studentData: any) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async updateStudent(id: string, updates: any) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteStudent(id: string) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  // Community management
  async createCommunity(communityData: any) {
    return this.request('/communities', {
      method: 'POST',
      body: JSON.stringify(communityData),
    });
  }

  async updateCommunity(id: string, updates: any) {
    return this.request(`/communities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCommunity(id: string) {
    return this.request(`/communities/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
const api = new ApiClient();
export default api;
