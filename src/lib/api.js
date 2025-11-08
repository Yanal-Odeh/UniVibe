const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies
    };

    // Add token from localStorage if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  }

  async signup(userData) {
    const data = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
  }

  async getCurrentUser() {
    const data = await this.request('/auth/me');
    return data.user || data;
  }

  // Student endpoints
  async getStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/students${query ? `?${query}` : ''}`);
  }

  async getStudent(id) {
    return this.request(`/students/${id}`);
  }

  async createStudent(studentData) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async updateStudent(id, updates) {
    return this.request(`/students/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteStudent(id) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  // Community endpoints
  async getCommunities(search = '') {
    return this.request(`/communities${search ? `?search=${search}` : ''}`);
  }

  async getCommunity(id) {
    return this.request(`/communities/${id}`);
  }

  async createCommunity(communityData) {
    return this.request('/communities', {
      method: 'POST',
      body: JSON.stringify(communityData),
    });
  }

  async updateCommunity(id, updates) {
    return this.request(`/communities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteCommunity(id) {
    return this.request(`/communities/${id}`, {
      method: 'DELETE',
    });
  }

  async joinCommunity(id) {
    return this.request(`/communities/${id}/join`, {
      method: 'POST',
    });
  }

  async leaveCommunity(id) {
    return this.request(`/communities/${id}/leave`, {
      method: 'POST',
    });
  }

  async removeMemberFromCommunity(communityId, userId) {
    return this.request(`/communities/${communityId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  async updateCommunityMemberRole(communityId, userId, role) {
    return this.request(`/communities/${communityId}/members/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  // Event endpoints
  async getEvents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/events${query ? `?${query}` : ''}`);
  }

  async getEvent(id) {
    return this.request(`/events/${id}`);
  }

  async createEvent(eventData) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id, updates) {
    return this.request(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteEvent(id) {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin preference endpoints
  async getAdminPreferences() {
    return this.request('/auth/preferences');
  }

  async updateAdminPreferences(preferences) {
    return this.request('/auth/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  }
}

export default new ApiClient();
