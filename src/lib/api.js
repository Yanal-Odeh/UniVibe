const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_URL;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.pendingRequests = new Map();
  }

  // Cache management
  getCacheKey(endpoint, options) {
    return `${endpoint}_${JSON.stringify(options)}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  // Debounce duplicate requests
  async requestWithDeduplication(endpoint, options = {}) {
    const cacheKey = this.getCacheKey(endpoint, options);
    
    // Check if there's a pending request for the same endpoint
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Create new request promise
    const requestPromise = this.request(endpoint, options).finally(() => {
      this.pendingRequests.delete(cacheKey);
    });

    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Check cache for GET requests
    const method = options.method || 'GET';
    if (method === 'GET') {
      const cacheKey = this.getCacheKey(endpoint, options);
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    
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

      // Cache GET requests
      if (method === 'GET') {
        const cacheKey = this.getCacheKey(endpoint, options);
        this.setCache(cacheKey, data);
      }

      // Clear cache on mutations
      if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
        this.clearCache();
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
    return this.requestWithDeduplication(`/communities${search ? `?search=${search}` : ''}`);
  }

  async getCommunity(id) {
    return this.requestWithDeduplication(`/communities/${id}`);
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
  async getEvents(params = {}, skipCache = false) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/events${query ? `?${query}` : ''}`;
    // For real-time updates, bypass cache and deduplication
    return skipCache ? this.request(endpoint) : this.requestWithDeduplication(endpoint);
  }

  async getEvent(id, skipCache = false) {
    const endpoint = `/events/${id}`;
    // For real-time updates, bypass cache and deduplication
    return skipCache ? this.request(endpoint) : this.requestWithDeduplication(endpoint);
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

  // Notification endpoints
  async getNotifications() {
    return this.request('/notifications');
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count');
  }

  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'PATCH',
    });
  }

  // Event approval endpoints
  async approveFacultyEvent(eventId, approved, reason = '') {
    return this.request(`/events/${eventId}/approve/faculty`, {
      method: 'POST',
      body: JSON.stringify({ approved, reason }),
    });
  }

  async approveDeanEvent(eventId, approved, reason = '') {
    return this.request(`/events/${eventId}/approve/dean`, {
      method: 'POST',
      body: JSON.stringify({ approved, reason }),
    });
  }

  async approveDeanshipEvent(eventId, approved, reason = '') {
    return this.request(`/events/${eventId}/approve/deanship`, {
      method: 'POST',
      body: JSON.stringify({ approved, reason }),
    });
  }

  // Application form endpoints
  async createApplication(applicationData) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async getApplications() {
    return this.request('/applications');
  }

  async getMyApplications() {
    return this.request('/applications/my-applications');
  }

  async updateApplicationStatus(id, status, rejectionReason = null) {
    return this.request(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejectionReason }),
    });
  }

  async deleteApplication(id) {
    return this.request(`/applications/${id}`, {
      method: 'DELETE',
    });
  }

  // Event registration endpoints
  async registerForEvent(eventId) {
    return this.request('/registrations/register', {
      method: 'POST',
      body: JSON.stringify({ eventId }),
    });
  }

  async unregisterFromEvent(eventId) {
    return this.request(`/registrations/unregister/${eventId}`, {
      method: 'DELETE',
    });
  }

  async getMyRegistrations() {
    return this.request('/registrations/my-registrations');
  }

  async checkRegistration(eventId) {
    return this.request(`/registrations/check/${eventId}`);
  }

  async getEventRegistrations(eventId) {
    return this.request(`/registrations/event/${eventId}`);
  }

  // Saved events endpoints
  async saveEvent(eventId) {
    return this.request('/saved-events/save', {
      method: 'POST',
      body: JSON.stringify({ eventId }),
    });
  }

  async unsaveEvent(eventId) {
    return this.request(`/saved-events/unsave/${eventId}`, {
      method: 'DELETE',
    });
  }

  async getMySavedEvents() {
    return this.request('/saved-events/my-saved');
  }

  async checkSavedEvent(eventId) {
    return this.request(`/saved-events/check/${eventId}`);
  }
}

export default new ApiClient();
