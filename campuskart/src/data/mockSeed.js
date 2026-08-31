/**
 * CampusKart Initial Seed Data & Mock Datasets (INR Pricing)
 * Conforms to PRD Section 7 Data Contracts
 */

export const INITIAL_INSTITUTIONS = [
  {
    id: 'inst-1',
    name: 'State Institute of Technology',
    emailDomains: ['heritageit.edu.in'],
    departments: [
      'Computer Science',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Electronics & Communication',
      'Biotechnology',
      'Architecture & Design',
      'Business Administration'
    ]
  }
];

export const INITIAL_CATEGORIES = [
  { id: 'cat-all', slug: 'all', label: 'All Items' },
  { id: 'cat-academic', slug: 'academic', label: 'Academic', parentId: null },
  { id: 'cat-hostel', slug: 'hostel', label: 'Hostel', parentId: null },
  { id: 'cat-electronics', slug: 'electronics', label: 'Electronics', parentId: null },
  { id: 'cat-cycles', slug: 'cycles', label: 'Cycles', parentId: null },
  { id: 'cat-stationery', slug: 'stationery', label: 'Stationery', parentId: null }
];

export const INITIAL_USERS = [
  {
    id: 'user-me',
    fullName: 'Alex Chen',
    email: 'alex.chen@heritageit.edu.in',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    isVerified: true,
    campusId: 'inst-1',
    department: 'Computer Science',
    yearOfStudy: 3,
    joinedAt: '2023-08-15T00:00:00.000Z',
    ratingAverage: 4.9,
    ratingCount: 14
  },
  {
    id: 'user-rohit',
    fullName: 'Rohit Sharma',
    email: 'rohit.s@heritageit.edu.in',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    isVerified: true,
    campusId: 'inst-1',
    department: 'Mechanical',
    yearOfStudy: 3,
    joinedAt: '2023-08-20T00:00:00.000Z',
    ratingAverage: 4.8,
    ratingCount: 9
  },
  {
    id: 'user-priya',
    fullName: 'Priya Patel',
    email: 'priya.p@heritageit.edu.in',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    isVerified: true,
    campusId: 'inst-1',
    department: 'Electrical',
    yearOfStudy: 4,
    joinedAt: '2022-08-10T00:00:00.000Z',
    ratingAverage: 5.0,
    ratingCount: 22
  },
  {
    id: 'user-dev',
    fullName: 'Dev Malhotra',
    email: 'dev.m@heritageit.edu.in',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    isVerified: true,
    campusId: 'inst-1',
    department: 'Computer Science',
    yearOfStudy: 2,
    joinedAt: '2024-01-10T00:00:00.000Z',
    ratingAverage: 4.7,
    ratingCount: 6
  },
  {
    id: 'user-ananya',
    fullName: 'Ananya Sen',
    email: 'ananya.s@heritageit.edu.in',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    isVerified: true,
    campusId: 'inst-1',
    department: 'Civil',
    yearOfStudy: 1,
    joinedAt: '2024-08-01T00:00:00.000Z',
    ratingAverage: 4.9,
    ratingCount: 5
  },
  {
    id: 'user-marcus',
    fullName: 'Marcus Vance',
    email: 'marcus.v@heritageit.edu.in',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    isVerified: true,
    campusId: 'inst-1',
    department: 'Electronics',
    yearOfStudy: 4,
    joinedAt: '2022-08-15T00:00:00.000Z',
    ratingAverage: 5.0,
    ratingCount: 18
  },
  {
    id: 'user-sarah',
    fullName: 'Sarah Jenkins',
    email: 'sarah.j@heritageit.edu.in',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
    isVerified: true,
    campusId: 'inst-1',
    department: 'Biotechnology',
    yearOfStudy: 2,
    joinedAt: '2023-08-15T00:00:00.000Z',
    ratingAverage: 4.9,
    ratingCount: 11
  }
];

export const INITIAL_TESTIMONIALS = [
  {
    id: 'test-1',
    name: 'Sarah Jenkins',
    joinedLabel: 'Joined Fall 2023',
    department: 'Biotech',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
    isVerified: true,
    rating: 5,
    quote: '"Bought my entire 2nd year biotech reference kit for 40% of retail price, met the senior outside the lab library within 20 minutes."'
  },
  {
    id: 'test-2',
    name: 'David O\'Connor',
    joinedLabel: 'Joined Spring 2023',
    department: 'Computer Science',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    isVerified: true,
    rating: 5,
    quote: '"No sketchy courier services or payment escrow drama. Just cash or UPI right at the hostel gate with fellow batchmates."'
  }
];

export const INITIAL_LISTINGS = [
  {
    id: 'listing-1',
    type: 'item',
    title: 'Drafting Board & Engineering Drawing Kit',
    description: 'Complete engineering drawing set in pristine condition. Used carefully for one semester of Engineering Graphics.\n\nIncludes:\n• Wooden drafting board (A2 size, smooth surface)\n• Mini drafter with secure table clamp\n• 30cm & 45cm acrylic set squares\n• Pro circle template & french curves\n• Compass & divider set with spare leads\n• Telescopic drafting sheet carrier tube\n\nAll tools cleaned and stored in original protective cases. No cracks or bent edges.',
    price: 850,
    currency: 'INR',
    condition: 'like_new',
    categoryTop: 'Academic',
    categorySub: 'Drawing Tools',
    pickupLocation: 'Library Gate (Evenings 5-7 PM)',
    images: [
      { id: 'img-1a', url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80', altText: 'Drafting Board and Drawing Tools', sortOrder: 0 },
      { id: 'img-1b', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80', altText: 'Mini drafter and instruments', sortOrder: 1 },
      { id: 'img-1c', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80', altText: 'Drawing tube and accessories', sortOrder: 2 }
    ],
    sellerId: 'user-rohit',
    campusId: 'inst-1',
    status: 'active',
    createdAt: '2026-08-21T10:30:00.000Z',
    updatedAt: '2026-08-21T10:30:00.000Z'
  },
  {
    id: 'listing-2',
    type: 'item',
    title: 'Mini Fridge (45L) - Perfect for Dorm',
    description: 'Compact 45-litre single door refrigerator. Fits neatly under standard dorm study desks. Cools very fast, has a dedicated ice chiller tray, and runs super quiet. Cleaned, defrosted, and ready to pick up before semester starts.',
    price: 4200,
    currency: 'INR',
    condition: 'good',
    categoryTop: 'Hostel',
    categorySub: 'Appliances',
    pickupLocation: 'Block B Hostel Common Room',
    images: [
      { id: 'img-2a', url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80', altText: 'Compact Mini Fridge', sortOrder: 0 },
      { id: 'img-2b', url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&auto=format&fit=crop&q=80', altText: 'Interior of mini fridge', sortOrder: 1 }
    ],
    sellerId: 'user-priya',
    campusId: 'inst-1',
    status: 'active',
    createdAt: '2026-08-22T08:15:00.000Z',
    updatedAt: '2026-08-22T08:15:00.000Z'
  },
  {
    id: 'listing-3',
    type: 'wanted',
    title: 'Looking for: Calc 101 Textbook (Stewart 8th Ed)',
    description: 'Urgent! Need James Stewart Calculus Early Transcendentals 8th edition before midterms next week. Looking for clean copy with minimal highlighting. Willing to pay up to ₹350 cash or UPI immediately.',
    price: 350,
    currency: 'INR',
    categoryTop: 'Academic',
    categorySub: 'Textbooks',
    pickupLocation: 'Main Quad / Student Center',
    images: [],
    sellerId: 'user-dev',
    campusId: 'inst-1',
    status: 'active',
    createdAt: '2026-08-22T14:40:00.000Z',
    updatedAt: '2026-08-22T14:40:00.000Z'
  },
  {
    id: 'listing-4',
    type: 'item',
    title: 'Casio FX-991EX ClassWiz Scientific Calculator',
    description: 'Official approved scientific calculator for all campus engineering exams. High-res LCD display, spreadsheet function, matrix 4x4, equation solver, QR code graphing support. Battery + solar dual power.',
    price: 750,
    currency: 'INR',
    condition: 'like_new',
    categoryTop: 'Academic',
    categorySub: 'Calculators',
    pickupLocation: 'Mech Dept 2nd Floor Corridor',
    images: [
      { id: 'img-4a', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80', altText: 'Scientific Calculator', sortOrder: 0 }
    ],
    sellerId: 'user-ananya',
    campusId: 'inst-1',
    status: 'active',
    createdAt: '2026-08-20T16:00:00.000Z',
    updatedAt: '2026-08-20T16:00:00.000Z'
  },
  {
    id: 'listing-5',
    type: 'item',
    title: 'City Commuter Bike (21-Speed Hybrid)',
    description: 'Dependable daily campus bicycle. Lightweight aluminum frame, Shimano 21-speed gears, front suspension fork, and puncture-resistant tires. Serviced last month with new brake pads. Comes with heavy duty U-lock.',
    price: 3200,
    currency: 'INR',
    condition: 'fair',
    categoryTop: 'Cycles',
    categorySub: 'Commuters',
    pickupLocation: 'Cycle Stand #3 Near North Gate',
    images: [
      { id: 'img-5a', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80', altText: 'Commuter Bike', sortOrder: 0 },
      { id: 'img-5b', url: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&auto=format&fit=crop&q=80', altText: 'Bike Gears and Chain', sortOrder: 1 }
    ],
    sellerId: 'user-marcus',
    campusId: 'inst-1',
    status: 'active',
    createdAt: '2026-08-19T11:20:00.000Z',
    updatedAt: '2026-08-19T11:20:00.000Z'
  },
  {
    id: 'listing-6',
    type: 'item',
    title: 'Chemistry Lab Coat & Splash Goggles (Size M)',
    description: '100% pure cotton heavy white lab coat, knee length with durable snap buttons. No chemical stains or holes. Includes anti-fog safety splash goggles. Required for Chemistry 101/102 labs.',
    price: 280,
    currency: 'INR',
    condition: 'good',
    categoryTop: 'Academic',
    categorySub: 'Lab Supplies',
    pickupLocation: 'Chemistry Lab Building Lobby',
    images: [
      { id: 'img-6a', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80', altText: 'Lab Coat and Supplies', sortOrder: 0 }
    ],
    sellerId: 'user-sarah',
    campusId: 'inst-1',
    status: 'active',
    createdAt: '2026-08-22T09:00:00.000Z',
    updatedAt: '2026-08-22T09:00:00.000Z'
  },
  {
    id: 'listing-7',
    type: 'item',
    title: 'Memory Foam Mattress Topper (Single Dorm Bed)',
    description: '2-inch gel-infused memory foam topper. Makes dorm beds feel like luxury hotel mattresses. High breathability cooling channels, hypoallergenic cover included (freshly laundered).',
    price: 950,
    currency: 'INR',
    condition: 'like_new',
    categoryTop: 'Hostel',
    categorySub: 'Bedding',
    pickupLocation: 'Hostel 4 Reception Desk',
    images: [
      { id: 'img-7a', url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop&q=80', altText: 'Dorm Bed and Topper', sortOrder: 0 }
    ],
    sellerId: 'user-priya',
    campusId: 'inst-1',
    status: 'active',
    createdAt: '2026-08-18T17:45:00.000Z',
    updatedAt: '2026-08-18T17:45:00.000Z'
  },
  {
    id: 'listing-8',
    type: 'item',
    title: 'Sony WH-1000XM4 Wireless Noise Canceling Headphones',
    description: 'Industry-leading noise canceling headphones. Essential for studying in loud dorms or deep focus in the library. Battery holds 30+ hours on single charge. Includes audio jack cable, airplane adapter, and hard shell travel case.',
    price: 12500,
    currency: 'INR',
    condition: 'good',
    categoryTop: 'Electronics',
    categorySub: 'Audio',
    pickupLocation: 'Central Library 3rd Floor Quiet Zone',
    images: [
      { id: 'img-8a', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', altText: 'Over-ear Headphones', sortOrder: 0 },
      { id: 'img-8b', url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80', altText: 'Headphones side angle', sortOrder: 1 }
    ],
    sellerId: 'user-me',
    campusId: 'inst-1',
    status: 'active',
    createdAt: '2026-08-20T12:00:00.000Z',
    updatedAt: '2026-08-20T12:00:00.000Z'
  }
];

export const INITIAL_OFFERS = [
  {
    id: 'offer-1',
    conversationId: 'conv-1',
    listingId: 'listing-1',
    proposedById: 'user-me',
    amount: 750,
    currency: 'INR',
    status: 'countered',
    createdAt: '2026-08-22T11:00:00.000Z'
  },
  {
    id: 'offer-2',
    conversationId: 'conv-1',
    listingId: 'listing-1',
    proposedById: 'user-rohit',
    amount: 800,
    currency: 'INR',
    status: 'pending',
    parentOfferId: 'offer-1',
    createdAt: '2026-08-22T11:15:00.000Z'
  }
];

export const INITIAL_MESSAGES = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-rohit',
    type: 'text',
    text: 'Hey Alex! Saw your interest in the drafting kit. Still available and ready for handoff!',
    createdAt: '2026-08-22T10:45:00.000Z'
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'user-me',
    type: 'text',
    text: 'Hi Rohit! Is the mini drafter clamp completely tight? No slipping during angle shifts?',
    createdAt: '2026-08-22T10:48:00.000Z'
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: 'user-rohit',
    type: 'text',
    text: 'Yeah, tightened and calibrated it last week. Works crisp like new!',
    createdAt: '2026-08-22T10:52:00.000Z'
  },
  {
    id: 'msg-4',
    conversationId: 'conv-1',
    senderId: 'user-me',
    type: 'offer',
    offerId: 'offer-1',
    text: 'Made an offer: ₹750',
    createdAt: '2026-08-22T11:00:00.000Z'
  },
  {
    id: 'msg-5',
    conversationId: 'conv-1',
    senderId: 'user-rohit',
    type: 'text',
    text: 'I paid ₹1,600 for it last sem. Can we meet at ₹800 and I will throw in a fresh telescopic sheet holder tube?',
    createdAt: '2026-08-22T11:14:00.000Z'
  },
  {
    id: 'msg-6',
    conversationId: 'conv-1',
    senderId: 'user-rohit',
    type: 'offer',
    offerId: 'offer-2',
    text: 'Counter offer: ₹800',
    createdAt: '2026-08-22T11:15:00.000Z'
  },
  {
    id: 'msg-7',
    conversationId: 'conv-2',
    senderId: 'user-me',
    type: 'text',
    text: 'Hi Priya, does the mini fridge chiller tray freeze ice cubes properly?',
    createdAt: '2026-08-22T13:10:00.000Z'
  },
  {
    id: 'msg-8',
    conversationId: 'conv-2',
    senderId: 'user-priya',
    type: 'text',
    text: 'Hey! Yes, makes ice cubes easily and keeps drinks ice cold.',
    createdAt: '2026-08-22T13:25:00.000Z'
  },
  {
    id: 'msg-9',
    conversationId: 'conv-2',
    senderId: 'user-priya',
    type: 'location',
    text: 'Shared pickup location: Block B Hostel Common Room (near guard desk)',
    createdAt: '2026-08-22T13:26:00.000Z'
  },
  {
    id: 'msg-10',
    conversationId: 'conv-3',
    senderId: 'user-dev',
    type: 'text',
    text: 'Hey Alex! Do you know anyone who has the Stewart Calculus 8th edition book available?',
    createdAt: '2026-08-22T15:00:00.000Z'
  }
];

export const INITIAL_CONVERSATIONS = [
  {
    id: 'conv-1',
    listingId: 'listing-1',
    participantIds: ['user-me', 'user-rohit'],
    lastMessagePreview: 'Rohit: Counter offer: ₹800',
    lastMessageAt: '2026-08-22T11:15:00.000Z',
    unreadCountForCurrentUser: 1
  },
  {
    id: 'conv-2',
    listingId: 'listing-2',
    participantIds: ['user-me', 'user-priya'],
    lastMessagePreview: 'Priya: Shared pickup location: Block B Hostel',
    lastMessageAt: '2026-08-22T13:26:00.000Z',
    unreadCountForCurrentUser: 1
  },
  {
    id: 'conv-3',
    listingId: 'listing-3',
    participantIds: ['user-me', 'user-dev'],
    lastMessagePreview: 'Dev: Hey Alex! Do you know anyone who has...',
    lastMessageAt: '2026-08-22T15:00:00.000Z',
    unreadCountForCurrentUser: 1
  }
];

export const INITIAL_BOOKMARKS = ['listing-1', 'listing-5'];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    userId: 'user-me',
    type: 'new_offer',
    title: 'New counter offer received',
    message: 'Rohit Sharma counter-offered ₹800 for Drafting Board & Engineering Drawing Kit.',
    payload: { conversationId: 'conv-1', listingId: 'listing-1', offerId: 'offer-2' },
    isRead: false,
    createdAt: '2026-08-22T11:15:00.000Z'
  },
  {
    id: 'notif-2',
    userId: 'user-me',
    type: 'new_message',
    title: 'New message from Priya',
    message: 'Priya Patel shared pickup spot for Mini Fridge (45L).',
    payload: { conversationId: 'conv-2', listingId: 'listing-2' },
    isRead: false,
    createdAt: '2026-08-22T13:26:00.000Z'
  },
  {
    id: 'notif-3',
    userId: 'user-me',
    type: 'listing_saved_price_drop',
    title: 'Item on your watchlist',
    message: 'City Commuter Bike has 2 new interested buyers on your campus.',
    payload: { listingId: 'listing-5' },
    isRead: false,
    createdAt: '2026-08-22T14:10:00.000Z'
  },
  {
    id: 'notif-4',
    userId: 'user-me',
    type: 'system',
    title: 'Verified Student Badge Active',
    message: 'Your official campus email has been verified. Welcome to CampusKart!',
    payload: {},
    isRead: true,
    createdAt: '2026-08-20T08:00:00.000Z'
  }
];
