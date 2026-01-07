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

  async createEvent(eventData: any) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id: string, updates: any) {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteEvent(id: string) {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  async registerForEvent(eventId: number, userId: number) {
    return this.request(`/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // Event approval workflow
  async approveFacultyLeader(eventId: string, data: any) {
    return this.request(`/events/${eventId}/approve/faculty`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async rejectFacultyLeader(eventId: string, data: any) {
    return this.request(`/events/${eventId}/reject/faculty`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveDeanOfFaculty(eventId: string, data: any) {
    return this.request(`/events/${eventId}/approve/dean`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async rejectDeanOfFaculty(eventId: string, data: any) {
    return this.request(`/events/${eventId}/reject/dean`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveDeanship(eventId: string, data: any) {
    return this.request(`/events/${eventId}/approve/deanship`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async rejectDeanship(eventId: string, data: any) {
    return this.request(`/events/${eventId}/reject/deanship`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async respondToRevision(eventId: string, responseData: any) {
    return this.request(`/events/${eventId}/respond-revision`, {
      method: 'POST',
      body: JSON.stringify(responseData),
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
      method: 'PATCH',
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

  // College and Location endpoints
  async getColleges() {
    return this.request('/colleges');
  }

  async getLocations(collegeId?: string) {
    if (!collegeId) {
      return { locations: [] };
    }
    return this.request(`/colleges/${collegeId}/locations`);
  }

  // Notification endpoints
  async getNotifications() {
    return this.request('/notifications');
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count');
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'PATCH',
    });
  }

  // Study Space endpoints
  async getStudySpaces(date?: string) {
    const params = date ? `?date=${date}` : '';
    return this.request(`/study-spaces${params}`);
  }

  async getStudySpace(id: string, date?: string) {
    const params = date ? `?date=${date}` : '';
    return this.request(`/study-spaces/${id}${params}`);
  }

  async createReservation(spaceId: string, date: string) {
    return this.request('/study-spaces/reserve', {
      method: 'POST',
      body: JSON.stringify({ spaceId, date }),
    });
  }

  async getMyReservations(status?: string) {
    const params = status ? `?status=${status}` : '';
    return this.request(`/study-spaces/my/reservations${params}`);
  }

  async cancelReservation(reservationId: string) {
    return this.request(`/study-spaces/reservations/${reservationId}`, {
      method: 'DELETE',
    });
  }

  async getAllReservations(params?: { status?: string }) {
    const queryParams = params?.status ? `?status=${params.status}` : '';
    return this.request(`/study-spaces/admin/reservations${queryParams}`);
  }
}

// Export singleton instance
const api = new ApiClient();
export default api;
