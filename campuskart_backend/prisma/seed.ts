import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data (order matters for FK constraints)
  await prisma.moderationAction.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.report.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.conversationRead.deleteMany();
  await prisma.message.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.listingView.deleteMany();
  await prisma.pickupSpot.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  // ============================================================
  // Institutions
  // ============================================================
  const institution = await prisma.institution.create({
    data: {
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
        'Business Administration',
      ],
    },
  });
  console.log('Created institution:', institution.name);

  // ============================================================
  // Categories
  // ============================================================
  const categories = await prisma.category.createMany({
    data: [
      { id: 'cat-all', slug: 'all', label: 'All Items' },
      { id: 'cat-academic', slug: 'academic', label: 'Academic' },
      { id: 'cat-hostel', slug: 'hostel', label: 'Hostel' },
      { id: 'cat-electronics', slug: 'electronics', label: 'Electronics' },
      { id: 'cat-cycles', slug: 'cycles', label: 'Cycles' },
      { id: 'cat-stationery', slug: 'stationery', label: 'Stationery' },
    ],
  });
  console.log('Created categories');

  // ============================================================
  // Pickup Spots
  // ============================================================
  await prisma.pickupSpot.createMany({
    data: [
      { id: 'spot-1', campusId: 'inst-1', label: 'Library Gate (Evenings 5-7 PM)' },
      { id: 'spot-2', campusId: 'inst-1', label: 'Block B Hostel Common Room' },
      { id: 'spot-3', campusId: 'inst-1', label: 'Main Quad / Student Center' },
      { id: 'spot-4', campusId: 'inst-1', label: 'Mech Dept 2nd Floor Corridor' },
      { id: 'spot-5', campusId: 'inst-1', label: 'Cycle Stand #3 Near North Gate' },
      { id: 'spot-6', campusId: 'inst-1', label: 'Chemistry Lab Building Lobby' },
      { id: 'spot-7', campusId: 'inst-1', label: 'Hostel 4 Reception Desk' },
      { id: 'spot-8', campusId: 'inst-1', label: 'Central Library 3rd Floor Quiet Zone' },
    ],
  });
  console.log('Created pickup spots');

  // ============================================================
  // Users (password: "password123" for all demo users)
  // ============================================================
  const passwordHash = await bcrypt.hash('password123', 12);

  const users = [
    {
      id: 'user-me',
      fullName: 'Alex Chen',
      email: 'alex.chen@heritageit.edu.in',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      isVerified: true,
      campusId: 'inst-1',
      department: 'Computer Science',
      yearOfStudy: 3,
      joinedAt: new Date('2023-08-15T00:00:00.000Z'),
      ratingAverage: 4.9,
      ratingCount: 14,
      role: 'student',
    },
    {
      id: 'user-admin',
      fullName: 'Admin User',
      email: 'admin@heritageit.edu.in',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      isVerified: true,
      campusId: 'inst-1',
      department: 'Administration',
      yearOfStudy: null,
      joinedAt: new Date('2023-01-01T00:00:00.000Z'),
      ratingAverage: 0,
      ratingCount: 0,
      role: 'admin',
    },
    {
      id: 'user-rohit',
      fullName: 'Rohit Sharma',
      email: 'rohit.s@heritageit.edu.in',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      isVerified: true,
      campusId: 'inst-1',
      department: 'Mechanical',
      yearOfStudy: 3,
      joinedAt: new Date('2023-08-20T00:00:00.000Z'),
      ratingAverage: 4.8,
      ratingCount: 9,
    },
    {
      id: 'user-priya',
      fullName: 'Priya Patel',
      email: 'priya.p@heritageit.edu.in',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      isVerified: true,
      campusId: 'inst-1',
      department: 'Electrical',
      yearOfStudy: 4,
      joinedAt: new Date('2022-08-10T00:00:00.000Z'),
      ratingAverage: 5.0,
      ratingCount: 22,
    },
    {
      id: 'user-dev',
      fullName: 'Dev Malhotra',
      email: 'dev.m@heritageit.edu.in',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      isVerified: true,
      campusId: 'inst-1',
      department: 'Computer Science',
      yearOfStudy: 2,
      joinedAt: new Date('2024-01-10T00:00:00.000Z'),
      ratingAverage: 4.7,
      ratingCount: 6,
    },
    {
      id: 'user-ananya',
      fullName: 'Ananya Sen',
      email: 'ananya.s@heritageit.edu.in',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      isVerified: true,
      campusId: 'inst-1',
      department: 'Civil',
      yearOfStudy: 1,
      joinedAt: new Date('2024-08-01T00:00:00.000Z'),
      ratingAverage: 4.9,
      ratingCount: 5,
    },
    {
      id: 'user-marcus',
      fullName: 'Marcus Vance',
      email: 'marcus.v@heritageit.edu.in',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      isVerified: true,
      campusId: 'inst-1',
      department: 'Electronics',
      yearOfStudy: 4,
      joinedAt: new Date('2022-08-15T00:00:00.000Z'),
      ratingAverage: 5.0,
      ratingCount: 18,
    },
    {
      id: 'user-sarah',
      fullName: 'Sarah Jenkins',
      email: 'sarah.j@heritageit.edu.in',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
      isVerified: true,
      campusId: 'inst-1',
      department: 'Biotechnology',
      yearOfStudy: 2,
      joinedAt: new Date('2023-08-15T00:00:00.000Z'),
      ratingAverage: 4.9,
      ratingCount: 11,
    },
  ];

  for (const user of users) {
    await prisma.user.create({ data: user });
  }
  console.log(`Created ${users.length} users`);

  // ============================================================
  // Listings
  // ============================================================
  const listings = [
    {
      id: 'listing-1',
      type: 'item',
      title: 'Drafting Board & Engineering Drawing Kit',
      description: 'Complete engineering drawing set in pristine condition. Used carefully for one semester of Engineering Graphics.\n\nIncludes:\n• Wooden drafting board (A2 size, smooth surface)\n• Mini drafter with secure table clamp\n• 30cm & 45cm acrylic set squares\n• Pro circle template & french curves\n• Compass & divider set with spare leads\n• Telescopic drafting sheet carrier tube\n\nAll tools cleaned and stored in original protective cases. No cracks or bent edges.',
      price: 850,
      currency: 'INR',
      condition: 'like_new',
      categoryTopId: 'cat-academic',
      pickupLocation: 'Library Gate (Evenings 5-7 PM)',
      pickupSpotId: 'spot-1',
      sellerId: 'user-rohit',
      campusId: 'inst-1',
      status: 'active',
      images: {
        create: [
          { id: 'img-1a', url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80', altText: 'Drafting Board and Drawing Tools', sortOrder: 0 },
          { id: 'img-1b', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80', altText: 'Mini drafter and instruments', sortOrder: 1 },
          { id: 'img-1c', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80', altText: 'Drawing tube and accessories', sortOrder: 2 },
        ],
      },
    },
    {
      id: 'listing-2',
      type: 'item',
      title: 'Mini Fridge (45L) - Perfect for Dorm',
      description: 'Compact 45-litre single door refrigerator. Fits neatly under standard dorm study desks. Cools very fast, has a dedicated ice chiller tray, and runs super quiet. Cleaned, defrosted, and ready to pick up before semester starts.',
      price: 4200,
      currency: 'INR',
      condition: 'good',
      categoryTopId: 'cat-hostel',
      pickupLocation: 'Block B Hostel Common Room',
      pickupSpotId: 'spot-2',
      sellerId: 'user-priya',
      campusId: 'inst-1',
      status: 'active',
      images: {
        create: [
          { id: 'img-2a', url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80', altText: 'Compact Mini Fridge', sortOrder: 0 },
          { id: 'img-2b', url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&auto=format&fit=crop&q=80', altText: 'Interior of mini fridge', sortOrder: 1 },
        ],
      },
    },
    {
      id: 'listing-3',
      type: 'wanted',
      title: 'Looking for: Calc 101 Textbook (Stewart 8th Ed)',
      description: 'Urgent! Need James Stewart Calculus Early Transcendentals 8th edition before midterms next week. Looking for clean copy with minimal highlighting. Willing to pay up to ₹350 cash or UPI immediately.',
      price: 350,
      currency: 'INR',
      categoryTopId: 'cat-academic',
      pickupLocation: 'Main Quad / Student Center',
      pickupSpotId: 'spot-3',
      sellerId: 'user-dev',
      campusId: 'inst-1',
      status: 'active',
    },
    {
      id: 'listing-4',
      type: 'item',
      title: 'Casio FX-991EX ClassWiz Scientific Calculator',
      description: 'Official approved scientific calculator for all campus engineering exams. High-res LCD display, spreadsheet function, matrix 4x4, equation solver, QR code graphing support. Battery + solar dual power.',
      price: 750,
      currency: 'INR',
      condition: 'like_new',
      categoryTopId: 'cat-academic',
      pickupLocation: 'Mech Dept 2nd Floor Corridor',
      pickupSpotId: 'spot-4',
      sellerId: 'user-ananya',
      campusId: 'inst-1',
      status: 'active',
      images: {
        create: [
          { id: 'img-4a', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80', altText: 'Scientific Calculator', sortOrder: 0 },
        ],
      },
    },
    {
      id: 'listing-5',
      type: 'item',
      title: 'City Commuter Bike (21-Speed Hybrid)',
      description: 'Dependable daily campus bicycle. Lightweight aluminum frame, Shimano 21-speed gears, front suspension fork, and puncture-resistant tires. Serviced last month with new brake pads. Comes with heavy duty U-lock.',
      price: 3200,
      currency: 'INR',
      condition: 'fair',
      categoryTopId: 'cat-cycles',
      pickupLocation: 'Cycle Stand #3 Near North Gate',
      pickupSpotId: 'spot-5',
      sellerId: 'user-marcus',
      campusId: 'inst-1',
      status: 'active',
      images: {
        create: [
          { id: 'img-5a', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80', altText: 'Commuter Bike', sortOrder: 0 },
          { id: 'img-5b', url: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&auto=format&fit=crop&q=80', altText: 'Bike Gears and Chain', sortOrder: 1 },
        ],
      },
    },
    {
      id: 'listing-6',
      type: 'item',
      title: 'Chemistry Lab Coat & Splash Goggles (Size M)',
      description: '100% pure cotton heavy white lab coat, knee length with durable snap buttons. No chemical stains or holes. Includes anti-fog safety splash goggles. Required for Chemistry 101/102 labs.',
      price: 280,
      currency: 'INR',
      condition: 'good',
      categoryTopId: 'cat-academic',
      pickupLocation: 'Chemistry Lab Building Lobby',
      pickupSpotId: 'spot-6',
      sellerId: 'user-sarah',
      campusId: 'inst-1',
      status: 'active',
      images: {
        create: [
          { id: 'img-6a', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80', altText: 'Lab Coat and Supplies', sortOrder: 0 },
        ],
      },
    },
    {
      id: 'listing-7',
      type: 'item',
      title: 'Memory Foam Mattress Topper (Single Dorm Bed)',
      description: '2-inch gel-infused memory foam topper. Makes dorm beds feel like luxury hotel mattresses. High breathability cooling channels, hypoallergenic cover included (freshly laundered).',
      price: 950,
      currency: 'INR',
      condition: 'like_new',
      categoryTopId: 'cat-hostel',
      pickupLocation: 'Hostel 4 Reception Desk',
      pickupSpotId: 'spot-7',
      sellerId: 'user-priya',
      campusId: 'inst-1',
      status: 'active',
      images: {
        create: [
          { id: 'img-7a', url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop&q=80', altText: 'Dorm Bed and Topper', sortOrder: 0 },
        ],
      },
    },
    {
      id: 'listing-8',
      type: 'item',
      title: 'Sony WH-1000XM4 Wireless Noise Canceling Headphones',
      description: 'Industry-leading noise canceling headphones. Essential for studying in loud dorms or deep focus in the library. Battery holds 30+ hours on single charge. Includes audio jack cable, airplane adapter, and hard shell travel case.',
      price: 12500,
      currency: 'INR',
      condition: 'good',
      categoryTopId: 'cat-electronics',
      pickupLocation: 'Central Library 3rd Floor Quiet Zone',
      pickupSpotId: 'spot-8',
      sellerId: 'user-me',
      campusId: 'inst-1',
      status: 'active',
      images: {
        create: [
          { id: 'img-8a', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', altText: 'Over-ear Headphones', sortOrder: 0 },
          { id: 'img-8b', url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80', altText: 'Headphones side angle', sortOrder: 1 },
        ],
      },
    },
  ];

  for (const listing of listings) {
    await prisma.listing.create({ data: listing });
  }
  console.log(`Created ${listings.length} listings`);

  // ============================================================
  // Conversations
  // ============================================================
  await prisma.conversation.createMany({
    data: [
      {
        id: 'conv-1',
        listingId: 'listing-1',
        buyerId: 'user-me',
        sellerId: 'user-rohit',
        lastMessagePreview: 'Rohit: Counter offer: ₹800',
        lastMessageAt: new Date('2026-08-22T11:15:00.000Z'),
      },
      {
        id: 'conv-2',
        listingId: 'listing-2',
        buyerId: 'user-me',
        sellerId: 'user-priya',
        lastMessagePreview: 'Priya: Shared pickup location: Block B Hostel',
        lastMessageAt: new Date('2026-08-22T13:26:00.000Z'),
      },
      {
        id: 'conv-3',
        listingId: 'listing-3',
        buyerId: 'user-dev',
        sellerId: 'user-me',
        lastMessagePreview: 'Dev: Hey Alex! Do you know anyone who has...',
        lastMessageAt: new Date('2026-08-22T15:00:00.000Z'),
      },
    ],
  });
  console.log('Created conversations');

  // ============================================================
  // Offers
  // ============================================================
  await prisma.offer.createMany({
    data: [
      {
        id: 'offer-1',
        conversationId: 'conv-1',
        listingId: 'listing-1',
        proposedById: 'user-me',
        amount: 750,
        currency: 'INR',
        status: 'countered',
        createdAt: new Date('2026-08-22T11:00:00.000Z'),
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
        createdAt: new Date('2026-08-22T11:15:00.000Z'),
      },
    ],
  });
  console.log('Created offers');

  // ============================================================
  // Messages
  // ============================================================
  await prisma.message.createMany({
    data: [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-rohit',
        type: 'text',
        text: 'Hey Alex! Saw your interest in the drafting kit. Still available and ready for handoff!',
        createdAt: new Date('2026-08-22T10:45:00.000Z'),
      },
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        senderId: 'user-me',
        type: 'text',
        text: 'Hi Rohit! Is the mini drafter clamp completely tight? No slipping during angle shifts?',
        createdAt: new Date('2026-08-22T10:48:00.000Z'),
      },
      {
        id: 'msg-3',
        conversationId: 'conv-1',
        senderId: 'user-rohit',
        type: 'text',
        text: 'Yeah, tightened and calibrated it last week. Works crisp like new!',
        createdAt: new Date('2026-08-22T10:52:00.000Z'),
      },
      {
        id: 'msg-4',
        conversationId: 'conv-1',
        senderId: 'user-me',
        type: 'offer',
        offerId: 'offer-1',
        text: 'Made an offer: ₹750',
        createdAt: new Date('2026-08-22T11:00:00.000Z'),
      },
      {
        id: 'msg-5',
        conversationId: 'conv-1',
        senderId: 'user-rohit',
        type: 'text',
        text: 'I paid ₹1,600 for it last sem. Can we meet at ₹800 and I will throw in a fresh telescopic sheet holder tube?',
        createdAt: new Date('2026-08-22T11:14:00.000Z'),
      },
      {
        id: 'msg-6',
        conversationId: 'conv-1',
        senderId: 'user-rohit',
        type: 'offer',
        offerId: 'offer-2',
        text: 'Counter offer: ₹800',
        createdAt: new Date('2026-08-22T11:15:00.000Z'),
      },
      {
        id: 'msg-7',
        conversationId: 'conv-2',
        senderId: 'user-me',
        type: 'text',
        text: 'Hi Priya, does the mini fridge chiller tray freeze ice cubes properly?',
        createdAt: new Date('2026-08-22T13:10:00.000Z'),
      },
      {
        id: 'msg-8',
        conversationId: 'conv-2',
        senderId: 'user-priya',
        type: 'text',
        text: 'Hey! Yes, makes ice cubes easily and keeps drinks ice cold.',
        createdAt: new Date('2026-08-22T13:25:00.000Z'),
      },
      {
        id: 'msg-9',
        conversationId: 'conv-2',
        senderId: 'user-priya',
        type: 'location',
        text: 'Shared pickup location: Block B Hostel Common Room (near guard desk)',
        locationLabel: 'Block B Hostel Common Room',
        createdAt: new Date('2026-08-22T13:26:00.000Z'),
      },
      {
        id: 'msg-10',
        conversationId: 'conv-3',
        senderId: 'user-dev',
        type: 'text',
        text: 'Hey Alex! Do you know anyone who has the Stewart Calculus 8th edition book available?',
        createdAt: new Date('2026-08-22T15:00:00.000Z'),
      },
    ],
  });
  console.log('Created messages');

  // ============================================================
  // Bookmarks
  // ============================================================
  await prisma.bookmark.createMany({
    data: [
      { userId: 'user-me', listingId: 'listing-1' },
      { userId: 'user-me', listingId: 'listing-5' },
    ],
  });
  console.log('Created bookmarks');

  // ============================================================
  // Notifications
  // ============================================================
  await prisma.notification.createMany({
    data: [
      {
        id: 'notif-1',
        userId: 'user-me',
        type: 'new_offer',
        payload: { conversationId: 'conv-1', listingId: 'listing-1', offerId: 'offer-2' },
        isRead: false,
        createdAt: new Date('2026-08-22T11:15:00.000Z'),
      },
      {
        id: 'notif-2',
        userId: 'user-me',
        type: 'new_message',
        payload: { conversationId: 'conv-2', listingId: 'listing-2' },
        isRead: false,
        createdAt: new Date('2026-08-22T13:26:00.000Z'),
      },
      {
        id: 'notif-3',
        userId: 'user-me',
        type: 'listing_saved_price_drop',
        payload: { listingId: 'listing-5' },
        isRead: false,
        createdAt: new Date('2026-08-22T14:10:00.000Z'),
      },
      {
        id: 'notif-4',
        userId: 'user-me',
        type: 'system',
        payload: {},
        isRead: true,
        createdAt: new Date('2026-08-20T08:00:00.000Z'),
      },
    ],
  });
  console.log('Created notifications');

  // ============================================================
  // Badges
  // ============================================================
  await prisma.badge.createMany({
    data: [
      { slug: 'first_sale', label: 'First Sale', description: 'Sold your first item on CampusKart' },
      { slug: 'trusted_seller', label: 'Trusted Seller', description: 'Maintained a 4.5+ rating with 10+ sales' },
      { slug: 'ten_deals', label: 'Deal Maker', description: 'Completed 10 successful transactions' },
      { slug: 'quick_responder', label: 'Quick Responder', description: 'Replied to messages within 1 hour 10 times' },
    ],
  });
  console.log('Created badges');

  // ============================================================
  // Conversation Reads
  // ============================================================
  await prisma.conversationRead.createMany({
    data: [
      { conversationId: 'conv-1', userId: 'user-rohit', lastReadAt: new Date('2026-08-22T11:15:00.000Z') },
      { conversationId: 'conv-2', userId: 'user-me', lastReadAt: new Date('2026-08-22T13:10:00.000Z') },
    ],
  });
  console.log('Created conversation reads');

console.log('\n=== Seed completed successfully! ===');
console.log('Demo login credentials:');
console.log('  Student: alex.chen@heritageit.edu.in / password123');
console.log('  Admin:   admin@heritageit.edu.in / password123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
