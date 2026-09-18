/**
 * CampusKart API Service Layer
 * Connects to backend at /api/v1/*
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

let accessToken = null;
let isRefreshing = false;

function setAccessToken(token) {
  accessToken = token;
  if (token) {
    localStorage.setItem('campuskart_access_token', token);
  } else {
    localStorage.removeItem('campuskart_access_token');
  }
}

async function fetchAPI(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 204) {
    return undefined;
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || 'API_ERROR');
    error.data = data;
    error.status = response.status;
    throw error;
  }

  return data;
}

async function refreshAccessToken() {
  if (isRefreshing) {
    return null;
  }
  isRefreshing = true;
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      accessToken = null;
      return null;
    }

    const data = await response.json();
    accessToken = data.accessToken;
    localStorage.setItem('campuskart_access_token', accessToken);
    return accessToken;
  } catch {
    accessToken = null;
    return null;
  } finally {
    isRefreshing = false;
  }
}

async function fetchWithRetry(path, options = {}) {
  try {
    return await fetchAPI(path, options);
  } catch (err) {
    if (err.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return await fetchAPI(path, options);
      }
      // Refresh failed - clear auth state and redirect to login
      localStorage.removeItem('campuskart_is_auth');
      localStorage.removeItem('campuskart_current_user');
      const currentPath = window.location.hash.slice(1) || '/';
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/signup')) {
        window.location.hash = '/login?returnUrl=' + encodeURIComponent(currentPath);
      }
      return null;
    }
    throw err;
  }
}

export const apiService = {
  setAccessToken,

  // Auth
  async signup(data) {
    const result = await fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result;
  },

  async login(email, password) {
    const result = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    accessToken = result.accessToken;
    localStorage.setItem('campuskart_access_token', accessToken);
    return result;
  },

  async logout() {
    try {
      await fetchAPI('/auth/logout', { method: 'POST' });
    } finally {
      accessToken = null;
      localStorage.removeItem('campuskart_access_token');
    }
    return { success: true };
  },

  async verifyEmail(email, code) {
    const result = await fetchAPI('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
    return result;
  },

  async forgotPassword(email) {
    const result = await fetchAPI('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return { success: true, message: result.message };
  },

  async resetPassword(token, newPassword) {
    return await fetchAPI('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  async refreshToken() {
    const token = await refreshAccessToken();
    return { accessToken: token };
  },

  // Media
  async signUpload(folder = 'listings') {
    return await fetchWithRetry('/media/sign-upload', {
      method: 'POST',
      body: JSON.stringify({ folder }),
    });
  },

  // Institutions
  async getInstitutions(domain = '') {
    const query = domain ? `?emailDomain=${encodeURIComponent(domain)}` : '';
    return await fetchWithRetry(`/institutions${query}`);
  },

  async getPickupSpots(institutionId) {
    return await fetchWithRetry(`/institutions/${institutionId}/pickup-spots`);
  },

  // Listings
  async getListings(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.condition) query.set('condition', params.condition);
    if (params.minPrice) query.set('minPrice', params.minPrice);
    if (params.maxPrice) query.set('maxPrice', params.maxPrice);
    if (params.sort) query.set('sort', params.sort);
    if (params.cursor) query.set('cursor', params.cursor);
    if (params.sellerId) query.set('sellerId', params.sellerId);
    const qs = query.toString();
    return await fetchWithRetry(`/listings${qs ? '?' + qs : ''}`);
  },

  async getListingById(id) {
    return await fetchWithRetry(`/listings/${id}`);
  },

  async getSimilarListings(id) {
    return await fetchWithRetry(`/listings/${id}/similar`);
  },

  async createListing(listingData) {
    return await fetchWithRetry('/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  },

  async analyzeListingImage(imageUrl) {
    return await fetchWithRetry('/listings/analyze-image', {
      method: 'POST',
      body: JSON.stringify({ imageUrl }),
    });
  },

  async updateListing(id, updates) {
    return await fetchWithRetry(`/listings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteListing(id) {
    return await fetchWithRetry(`/listings/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleBookmark(id) {
    return await fetchWithRetry(`/listings/${id}/bookmark`, {
      method: 'POST',
    });
  },

  async getSavedListings() {
    return await fetchWithRetry('/listings/bookmarks');
  },

  // Categories
  async getCategories() {
    return await fetchWithRetry('/categories');
  },

  // Messaging & Negotiations
  async getConversations() {
    return await fetchWithRetry('/conversations');
  },

  async getConversationById(id) {
    return await fetchWithRetry(`/conversations/${id}`);
  },

  async createConversation(listingId) {
    return await fetchWithRetry('/conversations', {
      method: 'POST',
      body: JSON.stringify({ listingId }),
    });
  },

  async sendMessage(conversationId, data) {
    return await fetchWithRetry(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async makeOffer(conversationId, amount) {
    return await fetchWithRetry(`/conversations/${conversationId}/offers`, {
      method: 'POST',
      body: JSON.stringify({ amount, currency: 'INR' }),
    });
  },

  async respondToOffer(offerId, action, amount) {
    return await fetchWithRetry(`/offers/${offerId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action, amount }),
    });
  },

  // Notifications
  async getNotifications() {
    return await fetchWithRetry('/notifications');
  },

  async getUnreadNotificationCount() {
    return await fetchWithRetry('/notifications/unread-count');
  },

  async markNotificationRead(id) {
    return await fetchWithRetry(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  async markAllNotificationsRead() {
    return await fetchWithRetry('/notifications/read-all', {
      method: 'PATCH',
    });
  },

  // Users & Profiles
  async getMe() {
    return await fetchWithRetry('/users/me');
  },

  async getUserById(id) {
    return await fetchWithRetry(`/users/${id}`);
  },

  async updateMyProfile(updates) {
    return await fetchWithRetry('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async getMyBadges() {
    return await fetchWithRetry('/users/me/badges');
  },

  // Leaderboard
  async getLeaderboard(type = 'top_sellers') {
    return await fetchWithRetry(`/campuses/me/leaderboard?type=${type}`);
  },

  async getTrends() {
    return await fetchWithRetry('/campuses/me/trends');
  },

  // Wishlist
  async getWishlist() {
    return await fetchWithRetry('/wishlist');
  },

  async addToWishlist(keyword, categoryId) {
    return await fetchWithRetry('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ keyword, categoryId }),
    });
  },

  async removeFromWishlist(id) {
    return await fetchWithRetry(`/wishlist/${id}`, {
      method: 'DELETE',
    });
  },

  // Reports
  async submitReport(data) {
    return await fetchWithRetry('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Admin
  async adminGetUsers(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.sort) query.set('sort', params.sort);
    const qs = query.toString();
    return await fetchWithRetry(`/admin/users${qs ? '?' + qs : ''}`);
  },

  async adminUpdateUser(id, status, reason) {
    return await fetchWithRetry(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  },

  async adminGetListings(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.reported) query.set('reported', params.reported);
    const qs = query.toString();
    return await fetchWithRetry(`/admin/listings${qs ? '?' + qs : ''}`);
  },

  async adminRemoveListing(id, reason) {
    return await fetchWithRetry(`/admin/listings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },

  async adminGetReports(status = '') {
    const qs = status ? `?status=${status}` : '';
    return await fetchWithRetry(`/admin/reports${qs}`);
  },

  async adminResolveReport(id, status, resolutionNote) {
    return await fetchWithRetry(`/admin/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolutionNote }),
    });
  },

  async adminGetAnalytics() {
    return await fetchWithRetry('/admin/analytics');
  },
};
