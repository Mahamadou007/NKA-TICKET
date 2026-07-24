import { pgTable, text, integer, numeric, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['user', 'organizer', 'staff', 'admin', 'ultra_admin']);
export const ticketStatusEnum = pgEnum('ticket_status', ['pending', 'valid', 'used', 'cancelled']);
export const escrowStatusEnum = pgEnum('escrow_status', ['held', 'released', 'disputed']);

export const users = pgTable('users', {
  uid: text('uid').primaryKey(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  phone: text('phone'),
  role: userRoleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const events = pgTable('events', {
  id: text('id').primaryKey(), // UUID v4
  title: text('title').notNull(),
  description: text('description'),
  date: text('date').notNull(),
  time: text('time').notNull(),
  location: text('location').notNull(),
  city: text('city').notNull(),
  price: numeric('price').notNull(),
  image: text('image'), // Base64 or Storage URL
  category: text('category').notNull(),
  availableTickets: integer('available_tickets').notNull(),
  totalTickets: integer('total_tickets').notNull(),
  organizerId: text('organizer_id').notNull().references(() => users.uid),
  organizerName: text('organizer_name'),
  organizerPhone: text('organizer_phone'),
  commissionRate: numeric('commission_rate').default('10.00').notNull(), // Per-event fee %
  verified: boolean('verified').default(false),
  status: text('status').default('active').notNull(), // 'active', 'cancelled', 'expired'
  createdAt: timestamp('created_at').defaultNow(),
});

export const tickets = pgTable('tickets', {
  id: text('id').primaryKey(),
  eventId: text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  buyerUid: text('buyer_uid').references(() => users.uid),
  buyerName: text('buyer_name').notNull(),
  buyerPhone: text('buyer_phone').notNull(),
  ticketCode: text('ticket_code').unique().notNull(), // NKA-XXXX-XXXX
  status: ticketStatusEnum('status').default('pending').notNull(),
  scannedAt: timestamp('scanned_at'),
  scannedBy: text('scanned_by').references(() => users.uid),
  createdAt: timestamp('created_at').defaultNow(),
});

export const staffAssignments = pgTable('staff_assignments', {
  id: text('id').primaryKey(),
  staffUid: text('staff_uid').notNull().references(() => users.uid, { onDelete: 'cascade' }),
  eventId: text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  assignedAt: timestamp('assigned_at').defaultNow(),
});
