/**
 * CampusKart Reactive Store & LocalStorage Persistence Layer
 */

import {
  INITIAL_INSTITUTIONS,
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_LISTINGS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_OFFERS,
  INITIAL_BOOKMARKS,
  INITIAL_NOTIFICATIONS,
  INITIAL_TESTIMONIALS
} from './mockSeed.js';

const STORAGE_KEYS = {
  THEME: 'campuskart_theme',
  CURRENT_USER: 'campuskart_current_user',
  IS_AUTHENTICATED: 'campuskart_is_auth',
  USERS: 'campuskart_users',
  LISTINGS: 'campuskart_listings',
  CATEGORIES: 'campuskart_categories',
  INSTITUTIONS: 'campuskart_institutions',
  CONVERSATIONS: 'campuskart_conversations',
  MESSAGES: 'campuskart_messages',
  OFFERS: 'campuskart_offers',
  BOOKMARKS: 'campuskart_bookmarks',
  NOTIFICATIONS: 'campuskart_notifications',
  SEED_VERSION: 'campuskart_seed_v2_inr'
};

class Store {
  constructor() {
    this.listeners = new Map();
    this.init();
  }

  init() {
    // Check if initialized with latest seed version
    if (!localStorage.getItem(STORAGE_KEYS.SEED_VERSION)) {
      this.resetToSeed();
    }
    this.applyTheme(this.getTheme());
  }

  resetToSeed() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(INITIAL_LISTINGS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(INITIAL_INSTITUTIONS));
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(INITIAL_CONVERSATIONS));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(INITIAL_OFFERS));
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(INITIAL_BOOKMARKS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.SEED_VERSION, '2.0-inr-violet');
    
    // Default authenticated as Alex Chen for seamless instant preview
    const me = INITIAL_USERS.find(u => u.id === 'user-me');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(me));
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
  }

  // --- Theme Management (Light / Dark Mode) ---
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  }

  setTheme(theme) {
    const validTheme = theme === 'light' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEYS.THEME, validTheme);
    this.applyTheme(validTheme);
    this.notify('theme_change', validTheme);
    return validTheme;
  }

  toggleTheme() {
    const current = this.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    return this.setTheme(next);
  }

  applyTheme(theme) {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => {
      this.listeners.get(event).delete(callback);
    };
  }

  notify(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in store listener for ${event}:`, e);
        }
      });
    }
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach(cb => cb({ event, data }));
    }
  }

  // --- Auth & User methods ---
  getCurrentUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated() {
    return localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED) === 'true';
  }

  login(email, password) {
    const users = this.getUsers();
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: `user-${Date.now()}`,
        fullName: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email: email.toLowerCase(),
        isVerified: true,
        campusId: 'inst-1',
        department: 'Computer Science',
        yearOfStudy: 2,
        joinedAt: new Date().toISOString(),
        ratingAverage: 5.0,
        ratingCount: 1
      };
      users.push(user);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
    this.notify('auth_change', { user, isAuthenticated: true });
    return user;
  }

  signup({ email, fullName, department, yearOfStudy }) {
    const users = this.getUsers();
    const newUser = {
      id: `user-${Date.now()}`,
      fullName,
      email: email.toLowerCase(),
      isVerified: true,
      campusId: 'inst-1',
      department: department || 'Engineering',
      yearOfStudy: parseInt(yearOfStudy, 10) || 1,
      joinedAt: new Date().toISOString(),
      ratingAverage: 5.0,
      ratingCount: 0
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
    
    this.addNotification({
      userId: newUser.id,
      type: 'system',
      title: 'Welcome to CampusKart!',
      message: 'Your student account is active. Explore your campus corkboard feed.',
      payload: {}
    });

    this.notify('auth_change', { user: newUser, isAuthenticated: true });
    return newUser;
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'false');
    this.notify('auth_change', { user: null, isAuthenticated: false });
  }

  updateProfile(updates) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;
    const updated = { ...currentUser, ...updates };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
    
    const users = this.getUsers().map(u => u.id === updated.id ? updated : u);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.notify('user_updated', updated);
    return updated;
  }

  getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  getUserById(id) {
    return this.getUsers().find(u => u.id === id) || null;
  }

  // --- Listings ---
  getListings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LISTINGS) || '[]');
  }

  getListingById(id) {
    return this.getListings().find(l => l.id === id) || null;
  }

  addListing(listingData) {
    const listings = this.getListings();
    const currentUser = this.getCurrentUser();
    const newListing = {
      id: `listing-${Date.now()}`,
      type: listingData.type || 'item',
      title: listingData.title,
      description: listingData.description || '',
      price: Number(listingData.price) || 0,
      currency: listingData.currency || 'INR',
      condition: listingData.condition || 'good',
      categoryTop: listingData.categoryTop || 'Academic',
      categorySub: listingData.categorySub || '',
      pickupLocation: listingData.pickupLocation || 'Campus Quad',
      images: listingData.images || [],
      sellerId: currentUser ? currentUser.id : 'user-me',
      campusId: 'inst-1',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    listings.unshift(newListing);
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
    this.notify('listings_change', listings);
    return newListing;
  }

  updateListing(id, updates) {
    const listings = this.getListings();
    const index = listings.findIndex(l => l.id === id);
    if (index === -1) return null;
    listings[index] = { ...listings[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
    this.notify('listings_change', listings);
    return listings[index];
  }

  deleteListing(id) {
    let listings = this.getListings();
    listings = listings.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
    this.notify('listings_change', listings);
    return true;
  }

  // --- Bookmarks ---
  getBookmarks() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARKS) || '[]');
  }

  isBookmarked(listingId) {
    return this.getBookmarks().includes(listingId);
  }

  toggleBookmark(listingId) {
    let bookmarks = this.getBookmarks();
    const exists = bookmarks.includes(listingId);
    if (exists) {
      bookmarks = bookmarks.filter(id => id !== listingId);
    } else {
      bookmarks.push(listingId);
    }
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    this.notify('bookmarks_change', bookmarks);
    return !exists;
  }

  // --- Conversations, Messages & Offers ---
  getConversations() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONVERSATIONS) || '[]');
  }

  getConversationById(id) {
    return this.getConversations().find(c => c.id === id) || null;
  }

  getMessages(conversationId) {
    const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
    return messages.filter(m => m.conversationId === conversationId);
  }

  getOffers(conversationId) {
    const offers = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFERS) || '[]');
    return offers.filter(o => o.conversationId === conversationId);
  }

  getOfferById(offerId) {
    const offers = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFERS) || '[]');
    return offers.find(o => o.id === offerId) || null;
  }

  createOrGetConversation(listingId, sellerId) {
    const currentUser = this.getCurrentUser();
    const currentUserId = currentUser ? currentUser.id : 'user-me';
    let conversations = this.getConversations();
    
    let conv = conversations.find(
      c => c.listingId === listingId && c.participantIds.includes(currentUserId)
    );

    if (!conv) {
      conv = {
        id: `conv-${Date.now()}`,
        listingId,
        participantIds: [currentUserId, sellerId],
        lastMessagePreview: 'Started a new conversation',
        lastMessageAt: new Date().toISOString(),
        unreadCountForCurrentUser: 0
      };
      conversations.unshift(conv);
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
      this.notify('conversations_change', conversations);
    }
    return conv;
  }

  sendMessage(conversationId, { text, type = 'text', offerId, imageUrl }) {
    const currentUser = this.getCurrentUser();
    const currentUserId = currentUser ? currentUser.id : 'user-me';
    const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
    
    const newMsg = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: currentUserId,
      type,
      text: text || '',
      offerId: offerId || null,
      imageUrl: imageUrl || null,
      createdAt: new Date().toISOString()
    };
    
    messages.push(newMsg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));

    let conversations = this.getConversations();
    const convIndex = conversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
      conversations[convIndex].lastMessagePreview = text || (type === 'offer' ? 'Sent an offer' : 'Sent an attachment');
      conversations[convIndex].lastMessageAt = newMsg.createdAt;
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    }

    this.notify(`messages_${conversationId}`, messages);
    this.notify('conversations_change', conversations);
    return newMsg;
  }

  makeOffer(conversationId, listingId, amount, parentOfferId = null) {
    const currentUser = this.getCurrentUser();
    const currentUserId = currentUser ? currentUser.id : 'user-me';
    const offers = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFERS) || '[]');
    const listing = this.getListingById(listingId);
    
    if (parentOfferId) {
      const parentIndex = offers.findIndex(o => o.id === parentOfferId);
      if (parentIndex !== -1) {
        offers[parentIndex].status = 'countered';
      }
    }

    const newOffer = {
      id: `offer-${Date.now()}`,
      conversationId,
      listingId,
      proposedById: currentUserId,
      amount: Number(amount),
      currency: listing ? listing.currency : 'INR',
      status: 'pending',
      parentOfferId,
      createdAt: new Date().toISOString()
    };

    offers.push(newOffer);
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));

    this.sendMessage(conversationId, {
      type: 'offer',
      offerId: newOffer.id,
      text: `Made an offer: ₹${amount}`
    });

    this.notify(`offers_${conversationId}`, offers);
    return newOffer;
  }

  respondToOffer(offerId, status, counterAmount = null) {
    const offers = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFERS) || '[]');
    const offerIndex = offers.findIndex(o => o.id === offerId);
    if (offerIndex === -1) return null;

    const offer = offers[offerIndex];
    offer.status = status;
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));

    if (status === 'accepted') {
      this.sendMessage(offer.conversationId, {
        type: 'system',
        text: `Offer of ₹${offer.amount} accepted! Meet at safe pickup point to exchange.`
      });
      this.addNotification({
        userId: offer.proposedById,
        type: 'offer_accepted',
        title: 'Offer Accepted!',
        message: `Your offer of ₹${offer.amount} was accepted. Check chat for pickup details.`,
        payload: { conversationId: offer.conversationId, listingId: offer.listingId }
      });
    } else if (status === 'rejected') {
      this.sendMessage(offer.conversationId, {
        type: 'system',
        text: `Offer of ₹${offer.amount} was declined.`
      });
    } else if (status === 'countered' && counterAmount) {
      return this.makeOffer(offer.conversationId, offer.listingId, counterAmount, offerId);
    }

    this.notify(`offers_${offer.conversationId}`, offers);
    return offer;
  }

  // --- Notifications ---
  getNotifications() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  }

  getUnreadNotificationCount() {
    return this.getNotifications().filter(n => !n.isRead).length;
  }

  getUnreadMessageCount() {
    return this.getConversations().reduce((acc, c) => acc + (c.unreadCountForCurrentUser || 0), 0);
  }

  markNotificationAsRead(id) {
    let notifications = this.getNotifications();
    notifications = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    this.notify('notifications_change', notifications);
  }

  markAllNotificationsRead() {
    let notifications = this.getNotifications();
    notifications = notifications.map(n => ({ ...n, isRead: true }));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    this.notify('notifications_change', notifications);
  }

  addNotification(notifData) {
    const notifications = this.getNotifications();
    const newNotif = {
      id: `notif-${Date.now()}`,
      userId: notifData.userId || 'user-me',
      type: notifData.type || 'system',
      title: notifData.title || 'Notification',
      message: notifData.message || '',
      payload: notifData.payload || {},
      isRead: false,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    this.notify('notifications_change', notifications);
    return newNotif;
  }

  getCategories() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
  }

  getInstitutions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.INSTITUTIONS) || '[]');
  }

  getTestimonials() {
    return INITIAL_TESTIMONIALS;
  }
}

export const store = new Store();
