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

  async rejectDeanEvent(eventId, reason = '') {
    return this.request(`/events/${eventId}/reject/dean`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async approveDeanshipEvent(eventId, approved, reason = '') {
    return this.request(`/events/${eventId}/approve/deanship`, {
      method: 'POST',
      body: JSON.stringify({ approved, reason }),
    });
  }

  async rejectDeanshipEvent(eventId, reason = '') {
    return this.request(`/events/${eventId}/reject/deanship`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async respondToRevision(eventId, response) {
    return this.request(`/events/${eventId}/respond-revision`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  }

  async respondToDeanshipRevision(eventId, response) {
    return this.request(`/events/${eventId}/respond-deanship-revision`, {
      method: 'POST',
      body: JSON.stringify({ response }),
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

  // Study Spaces API
  async getAllStudySpaces(date = null) {
    const params = date ? `?date=${date}` : '';
    return this.requestWithDeduplication(`/study-spaces${params}`);
  }

  async getStudySpace(id, date = null) {
    const params = date ? `?date=${date}` : '';
    return this.request(`/study-spaces/${id}${params}`);
  }

  async createReservation(spaceId, date) {
    return this.request('/study-spaces/reserve', {
      method: 'POST',
      body: JSON.stringify({ spaceId, date }),
    });
  }

  async getMyReservations(status = null) {
    const params = status ? `?status=${status}` : '';
    return this.request(`/study-spaces/my/reservations${params}`);
  }

  async cancelReservation(reservationId) {
    return this.request(`/study-spaces/reservations/${reservationId}`, {
      method: 'DELETE',
    });
  }

  // Admin: Study Spaces Management
  async createStudySpace(data) {
    return this.request('/study-spaces/admin/spaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStudySpace(id, data) {
    return this.request(`/study-spaces/admin/spaces/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStudySpace(id) {
    return this.request(`/study-spaces/admin/spaces/${id}`, {
      method: 'DELETE',
    });
  }

  async getStudySpaceStatistics() {
    return this.request('/study-spaces/admin/statistics');
  }

  async getAllReservations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/study-spaces/admin/reservations${queryString ? '?' + queryString : ''}`);
  }

  // Colleges and Locations API
  async getColleges() {
    return this.requestWithDeduplication('/colleges');
  }

  async getCollegeLocations(collegeId) {
    return this.requestWithDeduplication(`/colleges/${collegeId}/locations`);
  }

  async getMyCollegeLocations() {
    return this.requestWithDeduplication('/colleges/my-locations');
  }

  // Task Management API
  async getEventTasks(eventId) {
    return this.request(`/events/${eventId}/tasks`);
  }

  async getMyTasks(eventId) {
    return this.request(`/events/${eventId}/my-tasks`);
  }

  async getCommunityMembers(eventId) {
    return this.request(`/events/${eventId}/members`);
  }

  async createTask(eventId, data) {
    return this.request(`/events/${eventId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(taskId, data) {
    return this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateTaskStatus(taskId, status) {
    return this.request(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteTask(taskId) {
    return this.request(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiClient();
