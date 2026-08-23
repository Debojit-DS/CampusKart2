/**
 * CampusKart API Service Layer
 * Matches PRD Section 8 Endpoint Contracts with simulated async delay for real-world feel
 */

import { store } from '../data/store.js';

const simulateDelay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  // Auth
  async signup(data) {
    await simulateDelay(200);
    return store.signup(data);
  },

  async login(email, password) {
    await simulateDelay(200);
    return store.login(email, password);
  },

  async logout() {
    await simulateDelay(100);
    store.logout();
    return { success: true };
  },

  async verifyEmail(email, code) {
    await simulateDelay(200);
    return { verified: true, email };
  },

  async forgotPassword(email) {
    await simulateDelay(200);
    return { success: true, message: `Reset link sent to ${email}` };
  },

  // Institutions
  async getInstitutions(domain = '') {
    await simulateDelay(100);
    const institutions = store.getInstitutions();
    if (!domain) return institutions;
    return institutions.filter(inst =>
      inst.emailDomains.some(d => domain.toLowerCase().endsWith(d.toLowerCase()))
    );
  },

  // Listings
  async getListings({ category = 'all', search = '', condition = '', minPrice, maxPrice, sort = 'newest' } = {}) {
    await simulateDelay(150);
    let listings = store.getListings();

    // Category filter
    if (category && category !== 'all') {
      listings = listings.filter(l =>
        l.categoryTop?.toLowerCase() === category.toLowerCase() ||
        l.categorySub?.toLowerCase() === category.toLowerCase()
      );
    }

    // Search query filter
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      listings = listings.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.categoryTop?.toLowerCase().includes(q) ||
        l.pickupLocation?.toLowerCase().includes(q)
      );
    }

    // Condition filter
    if (condition) {
      listings = listings.filter(l => l.condition === condition);
    }

    // Price range filter
    if (minPrice !== undefined && minPrice !== '') {
      listings = listings.filter(l => l.price >= Number(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      listings = listings.filter(l => l.price <= Number(maxPrice));
    }

    // Sorting
    if (sort === 'price_asc') {
      listings.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      listings.sort((a, b) => b.price - a.price);
    } else {
      // Default: newest
      listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return listings;
  },

  async getListingById(id) {
    await simulateDelay(100);
    return store.getListingById(id);
  },

  async getSimilarListings(id) {
    await simulateDelay(150);
    const current = store.getListingById(id);
    if (!current) return [];
    return store.getListings()
      .filter(l => l.id !== id && (l.categoryTop === current.categoryTop || l.categorySub === current.categorySub))
      .slice(0, 4);
  },

  async createListing(listingData) {
    await simulateDelay(250);
    return store.addListing(listingData);
  },

  async updateListing(id, updates) {
    await simulateDelay(150);
    return store.updateListing(id, updates);
  },

  async deleteListing(id) {
    await simulateDelay(150);
    return store.deleteListing(id);
  },

  async toggleBookmark(id) {
    await simulateDelay(50);
    return store.toggleBookmark(id);
  },

  async getSavedListings() {
    await simulateDelay(150);
    const bookmarkedIds = store.getBookmarks();
    return store.getListings().filter(l => bookmarkedIds.includes(l.id));
  },

  // Categories
  async getCategories() {
    await simulateDelay(50);
    return store.getCategories();
  },

  // Messaging & Negotiations
  async getConversations() {
    await simulateDelay(100);
    return store.getConversations();
  },

  async getConversationById(id) {
    await simulateDelay(100);
    return store.getConversationById(id);
  },

  async getMessages(conversationId) {
    await simulateDelay(100);
    return store.getMessages(conversationId);
  },

  async getOffers(conversationId) {
    await simulateDelay(100);
    return store.getOffers(conversationId);
  },

  async createOrGetConversation(listingId, sellerId) {
    await simulateDelay(150);
    return store.createOrGetConversation(listingId, sellerId);
  },

  async sendMessage(conversationId, data) {
    await simulateDelay(100);
    return store.sendMessage(conversationId, data);
  },

  async makeOffer(conversationId, listingId, amount, parentOfferId = null) {
    await simulateDelay(200);
    return store.makeOffer(conversationId, listingId, amount, parentOfferId);
  },

  async respondToOffer(offerId, status, counterAmount = null) {
    await simulateDelay(200);
    return store.respondToOffer(offerId, status, counterAmount);
  },

  // Notifications
  async getNotifications() {
    await simulateDelay(100);
    return store.getNotifications();
  },

  async markNotificationRead(id) {
    await simulateDelay(50);
    store.markNotificationAsRead(id);
    return { success: true };
  },

  async markAllNotificationsRead() {
    await simulateDelay(50);
    store.markAllNotificationsRead();
    return { success: true };
  },

  // Users & Profiles
  async getUserById(id) {
    await simulateDelay(100);
    return store.getUserById(id);
  },

  async updateMyProfile(updates) {
    await simulateDelay(200);
    return store.updateProfile(updates);
  }
};
