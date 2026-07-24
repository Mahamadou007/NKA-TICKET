export type UserRole = 'user' | 'organizer' | 'staff' | 'admin' | 'ultra_admin';
export type TicketStatus = 'pending' | 'valid' | 'used' | 'cancelled';
export type EscrowStatus = 'held' | 'released' | 'disputed';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  phone: string | null;
  role: UserRole;
  createdAt?: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  city: string;
  price: number;
  image?: string;
  category: string;
  availableTickets: number;
  totalTickets: number;
  organizerId: string;
  organizerName?: string;
  organizerPhone?: string;
  commissionRate: number; // e.g. 10.0 for 10%
  verified: boolean;
  status: 'active' | 'cancelled' | 'expired';
  createdAt?: string;
}

export interface TicketItem {
  id: string;
  eventId: string;
  eventTitle?: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  eventCity?: string;
  ticketPrice?: number;
  buyerUid?: string;
  buyerName: string;
  buyerPhone: string;
  ticketCode: string; // NKA-XXXX-XXXX
  status: TicketStatus;
  scannedAt?: string | null;
  scannedBy?: string | null;
  createdAt?: string;
}

export interface StaffAssignment {
  id: string;
  staffUid: string;
  eventId: string;
  staffName?: string;
  staffEmail?: string;
  eventTitle?: string;
  assignedAt?: string;
}

export interface FinancialStats {
  grossRevenue: number;
  platformFee: number;
  organizerPayout: number;
  totalTicketsSold: number;
  escrowStatus: EscrowStatus;
  eligibleForPayout: boolean;
  eventEndDate: string;
}
