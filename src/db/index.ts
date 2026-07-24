import fs from 'fs';
import path from 'path';
import { UserProfile, EventItem, TicketItem, StaffAssignment } from '../types';

const DATA_FILE = path.join(process.cwd(), 'data_store.json');

interface LocalStore {
  users: Record<string, UserProfile>;
  events: Record<string, EventItem>;
  tickets: Record<string, TicketItem>;
  staffAssignments: Record<string, StaffAssignment>;
}

// Initial sample events in Mali for immediate rich demonstration
const initialEvents: EventItem[] = [
  {
    id: 'evt-bamako-concert-1',
    title: "Festival de la Musique de Bamako 2026",
    description: "Le plus grand festival de musique urbaine et traditionnelle du Mali à Babemba. Prestations en direct de Sidiki Diabaté, Oumou Sangaré et Iba One.",
    date: '2026-08-15',
    time: '20:00',
    location: 'Palais de la Culture Amadou Hampâté Bâ',
    city: 'Bamako',
    price: 5000,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    category: 'Concert & Musique',
    availableTickets: 245,
    totalTickets: 300,
    organizerId: 'org-mali-events',
    organizerName: 'Mali Events Pro',
    organizerPhone: '+223 76 10 15 02',
    commissionRate: 10,
    verified: true,
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt-segou-art-2',
    title: "Nuit du Balani & Slam Ségou",
    description: "Soirée culturelle au bord du Fleuve Niger avec dégustation de grillades, contes bambara et animations djembé.",
    date: '2026-09-05',
    time: '21:30',
    location: 'Espace Culturel Ndomo',
    city: 'Ségou',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    category: 'Culture & Théâtre',
    availableTickets: 80,
    totalTickets: 100,
    organizerId: 'org-mali-events',
    organizerName: 'Mali Events Pro',
    organizerPhone: '+223 76 10 15 02',
    commissionRate: 10,
    verified: true,
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt-sikasso-tech-3',
    title: "Forum Tech & Innovation Bamako",
    description: "Rencontre des startups maliennes, opportunités de réseau, ateliers Fintech et paiement offline.",
    date: '2026-10-12',
    time: '09:00',
    location: 'Centre International de Conférences de Bamako (CICB)',
    city: 'Bamako',
    price: 10000,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    category: 'Business & Tech',
    availableTickets: 150,
    totalTickets: 200,
    organizerId: 'org-mali-events',
    organizerName: 'Mali Events Pro',
    organizerPhone: '+223 76 10 15 02',
    commissionRate: 8,
    verified: true,
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

const initialUsers: Record<string, UserProfile> = {
  'mahamadousow3601-uid': {
    uid: 'mahamadousow3601-uid',
    email: 'mahamadousow3601@gmail.com',
    displayName: 'Mahamadou Sow (Ultra Admin)',
    phone: '+223 76 10 15 02',
    role: 'ultra_admin',
    createdAt: new Date().toISOString()
  },
  'org-mali-events': {
    uid: 'org-mali-events',
    email: 'organisateur@nkaticket.ml',
    displayName: 'Mali Events Pro',
    phone: '+223 76 10 15 02',
    role: 'organizer',
    createdAt: new Date().toISOString()
  },
  'staff-gate-1': {
    uid: 'staff-gate-1',
    email: 'staff@nkaticket.ml',
    displayName: 'Awa Diallo (Staff Guichet)',
    phone: '+223 70 88 99 00',
    role: 'staff',
    createdAt: new Date().toISOString()
  },
  'buyer-user-1': {
    uid: 'buyer-user-1',
    email: 'client@nkaticket.ml',
    displayName: 'Oumar Traoré',
    phone: '+223 65 43 21 00',
    role: 'user',
    createdAt: new Date().toISOString()
  }
};

const initialTickets: Record<string, TicketItem> = {
  'tkt-demo-1': {
    id: 'tkt-demo-1',
    eventId: 'evt-bamako-concert-1',
    eventTitle: "Festival de la Musique de Bamako 2026",
    eventDate: '2026-08-15',
    eventTime: '20:00',
    eventLocation: 'Palais de la Culture Amadou Hampâté Bâ',
    eventCity: 'Bamako',
    ticketPrice: 5000,
    buyerUid: 'buyer-user-1',
    buyerName: 'Oumar Traoré',
    buyerPhone: '+223 65 43 21 00',
    ticketCode: 'NKA-7821-9904',
    status: 'valid',
    scannedAt: null,
    scannedBy: null,
    createdAt: new Date().toISOString()
  },
  'tkt-demo-2': {
    id: 'tkt-demo-2',
    eventId: 'evt-bamako-concert-1',
    eventTitle: "Festival de la Musique de Bamako 2026",
    eventDate: '2026-08-15',
    eventTime: '20:00',
    eventLocation: 'Palais de la Culture Amadou Hampâté Bâ',
    eventCity: 'Bamako',
    ticketPrice: 5000,
    buyerUid: 'buyer-user-1',
    buyerName: 'Moussa Coulibaly',
    buyerPhone: '+223 74 11 22 33',
    ticketCode: 'NKA-3412-8821',
    status: 'pending',
    scannedAt: null,
    scannedBy: null,
    createdAt: new Date().toISOString()
  }
};

const initialStaff: Record<string, StaffAssignment> = {
  'sa-1': {
    id: 'sa-1',
    staffUid: 'staff-gate-1',
    eventId: 'evt-bamako-concert-1',
    staffName: 'Awa Diallo (Staff Guichet)',
    staffEmail: 'staff@nkaticket.ml',
    eventTitle: "Festival de la Musique de Bamako 2026",
    assignedAt: new Date().toISOString()
  }
};

class DataStorage {
  private store: LocalStore;

  constructor() {
    this.store = this.load();
  }

  private load(): LocalStore {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.events && parsed.tickets) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not parse data_store.json, creating initial store", e);
    }

    const newStore: LocalStore = {
      users: { ...initialUsers },
      events: {},
      tickets: { ...initialTickets },
      staffAssignments: { ...initialStaff }
    };

    initialEvents.forEach(e => {
      newStore.events[e.id] = e;
    });

    this.save(newStore);
    return newStore;
  }

  private save(storeObj?: LocalStore) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(storeObj || this.store, null, 2));
    } catch (e) {
      console.error("Error writing data_store.json", e);
    }
  }

  // User methods
  public syncUser(user: { uid: string; email: string; displayName?: string | null; phone?: string | null; role?: string }): UserProfile {
    const existing = this.store.users[user.uid];
    
    // STRICT RULE: User role mahamadousow3601@gmail.com MUST automatically be assigned ultra_admin on profile sync.
    let targetRole = existing ? existing.role : ((user.role as any) || 'user');
    if (user.email.toLowerCase() === 'mahamadousow3601@gmail.com') {
      targetRole = 'ultra_admin';
    }

    const updated: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || existing?.displayName || user.email.split('@')[0],
      phone: user.phone || existing?.phone || '+223 70 00 00 00',
      role: targetRole,
      createdAt: existing?.createdAt || new Date().toISOString()
    };

    this.store.users[user.uid] = updated;
    this.save();
    return updated;
  }

  public getUsers(): UserProfile[] {
    return Object.values(this.store.users);
  }

  public updateUserRole(uid: string, role: any): UserProfile | null {
    if (this.store.users[uid]) {
      this.store.users[uid].role = role;
      this.save();
      return this.store.users[uid];
    }
    return null;
  }

  // Event methods
  public getEvents(): EventItem[] {
    return Object.values(this.store.events);
  }

  public getEventById(id: string): EventItem | null {
    return this.store.events[id] || null;
  }

  public createEvent(evt: EventItem): EventItem {
    this.store.events[evt.id] = evt;
    this.save();
    return evt;
  }

  public deleteEvent(id: string): boolean {
    if (this.store.events[id]) {
      delete this.store.events[id];
      // delete associated staff assignments and tickets or mark cancelled
      Object.keys(this.store.tickets).forEach(tid => {
        if (this.store.tickets[tid].eventId === id) {
          delete this.store.tickets[tid];
        }
      });
      Object.keys(this.store.staffAssignments).forEach(said => {
        if (this.store.staffAssignments[said].eventId === id) {
          delete this.store.staffAssignments[said];
        }
      });
      this.save();
      return true;
    }
    return false;
  }

  public updateCommissionRate(eventId: string, rate: number): EventItem | null {
    if (this.store.events[eventId]) {
      this.store.events[eventId].commissionRate = rate;
      this.save();
      return this.store.events[eventId];
    }
    return null;
  }

  // Ticket methods
  public getTickets(): TicketItem[] {
    return Object.values(this.store.tickets);
  }

  public getTicketsByBuyer(uid: string): TicketItem[] {
    return Object.values(this.store.tickets).filter(t => t.buyerUid === uid || t.buyerPhone);
  }

  public getTicketsByEvent(eventId: string): TicketItem[] {
    return Object.values(this.store.tickets).filter(t => t.eventId === eventId);
  }

  public createTicket(ticket: TicketItem): TicketItem {
    this.store.tickets[ticket.id] = ticket;
    // Decrement available tickets if needed
    if (this.store.events[ticket.eventId] && this.store.events[ticket.eventId].availableTickets > 0) {
      this.store.events[ticket.eventId].availableTickets -= 1;
    }
    this.save();
    return ticket;
  }

  public verifyTicketPayment(ticketId: string, code: string): TicketItem | null {
    if (this.store.tickets[ticketId]) {
      this.store.tickets[ticketId].status = 'valid';
      this.store.tickets[ticketId].ticketCode = code;
      this.save();
      return this.store.tickets[ticketId];
    }
    return null;
  }

  public scanTicket(codeOrId: string, scannedByUid: string): { success: boolean; message: string; ticket?: TicketItem; errorType?: 'ALREADY_USED' | 'NOT_FOUND' | 'CANCELLED' | 'PENDING' } {
    const cleanCode = codeOrId.trim().toUpperCase();
    const ticket = Object.values(this.store.tickets).find(
      t => t.ticketCode.toUpperCase() === cleanCode || t.id === cleanCode
    );

    if (!ticket) {
      return { success: false, message: 'Billet non trouvé dans la base de données', errorType: 'NOT_FOUND' };
    }

    if (ticket.status === 'used') {
      return { 
        success: false, 
        message: `Billet Déjà Utilisé! Scanné le ${ticket.scannedAt ? new Date(ticket.scannedAt).toLocaleTimeString() : 'précédemment'}.`,
        ticket,
        errorType: 'ALREADY_USED'
      };
    }

    if (ticket.status === 'cancelled') {
      return { success: false, message: 'Billet Annulé ou Remboursé', ticket, errorType: 'CANCELLED' };
    }

    if (ticket.status === 'pending') {
      return { success: false, message: 'Paiement non encore validé pour ce billet', ticket, errorType: 'PENDING' };
    }

    // Valid ticket -> mark used
    ticket.status = 'used';
    ticket.scannedAt = new Date().toISOString();
    ticket.scannedBy = scannedByUid;
    this.save();

    return { success: true, message: 'Entrée Validée - Bienvenue!', ticket };
  }

  // Staff Assignments
  public assignStaff(staffUid: string, eventId: string): StaffAssignment {
    const user = this.store.users[staffUid];
    const event = this.store.events[eventId];
    
    // Ensure user role becomes staff if currently user
    if (user && user.role === 'user') {
      user.role = 'staff';
    }

    const saId = `sa-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const assignment: StaffAssignment = {
      id: saId,
      staffUid,
      eventId,
      staffName: user?.displayName || user?.email || 'Staff Guichet',
      staffEmail: user?.email,
      eventTitle: event?.title || 'Événement',
      assignedAt: new Date().toISOString()
    };

    this.store.staffAssignments[saId] = assignment;
    this.save();
    return assignment;
  }

  public getStaffAssignments(): StaffAssignment[] {
    return Object.values(this.store.staffAssignments);
  }
}

export const dbStore = new DataStorage();
