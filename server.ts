import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbStore } from './src/db/index';
import { verifyAuthToken } from './src/lib/firebase-admin';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // Helper middleware for auth
  const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = await verifyAuthToken(req.headers);
    if (!user) {
      // Allow demo headers or proceed with fallback user
      (req as any).user = { uid: (req.headers['x-user-uid'] as string) || 'demo-uid', email: (req.headers['x-user-email'] as string) || 'guest@nkaticket.ml' };
      return next();
    }
    (req as any).user = user;
    next();
  };

  // --- API ROUTES ---

  // 1. POST /api/users/sync — Profile sync (UPSERT)
  app.post('/api/users/sync', async (req, res) => {
    try {
      const { uid, email, displayName, phone, role } = req.body;
      if (!uid || !email) {
        return res.status(400).json({ error: 'uid and email are required' });
      }

      const syncedUser = dbStore.syncUser({ uid, email, displayName, phone, role });
      res.json({ success: true, user: syncedUser });
    } catch (error: any) {
      console.error('Error in /api/users/sync:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  // GET /api/users — Fetch all users (Admin)
  app.get('/api/users', async (req, res) => {
    try {
      const users = dbStore.getUsers();
      res.json({ success: true, users });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/users/:uid/role — Update user role
  app.patch('/api/users/:uid/role', async (req, res) => {
    try {
      const { uid } = req.params;
      const { role } = req.body;
      const updated = dbStore.updateUserRole(uid, role);
      if (!updated) return res.status(404).json({ error: 'User not found' });
      res.json({ success: true, user: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 2. GET /api/events — Fetch active/approved events
  app.get('/api/events', async (req, res) => {
    try {
      const events = dbStore.getEvents();
      res.json({ success: true, events });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 3. POST /api/events — Create event (Supports Base64 image payload)
  app.post('/api/events', requireAuth, async (req, res) => {
    try {
      const { title, description, date, time, location, city, price, image, category, totalTickets, organizerId, organizerName, organizerPhone } = req.body;

      if (!title || !date || !time || !location || !city || price === undefined || !totalTickets) {
        return res.status(400).json({ error: 'Missing required event fields' });
      }

      const id = `evt-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const newEvent = dbStore.createEvent({
        id,
        title,
        description: description || '',
        date,
        time,
        location,
        city,
        price: Number(price),
        image: image || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
        category: category || 'Concert',
        availableTickets: Number(totalTickets),
        totalTickets: Number(totalTickets),
        organizerId: organizerId || (req as any).user.uid,
        organizerName: organizerName || 'Organisateur',
        organizerPhone: organizerPhone || '+223 70 00 00 00',
        commissionRate: 10, // Default 10%
        verified: true,
        status: 'active',
        createdAt: new Date().toISOString()
      });

      res.json({ success: true, event: newEvent });
    } catch (error: any) {
      console.error('Error creating event:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // 4. DELETE /api/events/:id — Delete event
  app.delete('/api/events/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const success = dbStore.deleteEvent(id);
      if (!success) return res.status(404).json({ error: 'Event not found' });
      res.json({ success: true, message: 'Event deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 5. PATCH /api/events/:id/commission — Update event commission rate
  app.patch('/api/events/:id/commission', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { commissionRate } = req.body;
      if (commissionRate === undefined || isNaN(Number(commissionRate))) {
        return res.status(400).json({ error: 'Invalid commissionRate' });
      }

      const updated = dbStore.updateCommissionRate(id, Number(commissionRate));
      if (!updated) return res.status(404).json({ error: 'Event not found' });
      res.json({ success: true, event: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 6. POST /api/tickets/purchase — Generate pending ticket request
  app.post('/api/tickets/purchase', async (req, res) => {
    try {
      const { eventId, buyerUid, buyerName, buyerPhone, quantity } = req.body;

      if (!eventId || !buyerName || !buyerPhone) {
        return res.status(400).json({ error: 'Missing required purchase information' });
      }

      const event = dbStore.getEventById(eventId);
      if (!event) return res.status(404).json({ error: 'Event not found' });

      const count = Number(quantity) || 1;
      const createdTickets = [];

      for (let i = 0; i < count; i++) {
        const ticketId = `tkt-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        const tempCode = `NKA-PENDING-${Math.floor(1000 + Math.random() * 9000)}`;

        const newTicket = dbStore.createTicket({
          id: ticketId,
          eventId,
          eventTitle: event.title,
          eventDate: event.date,
          eventTime: event.time,
          eventLocation: event.location,
          eventCity: event.city,
          ticketPrice: event.price,
          buyerUid: buyerUid || 'guest-uid',
          buyerName,
          buyerPhone,
          ticketCode: tempCode,
          status: 'pending',
          scannedAt: null,
          scannedBy: null,
          createdAt: new Date().toISOString()
        });

        createdTickets.push(newTicket);
      }

      res.json({ success: true, tickets: createdTickets, message: 'Demande de billet enregistrée. En attente de règlement physique.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 7. POST /api/tickets/:id/verify-payment — Confirm offline payment, transition to valid
  app.post('/api/tickets/:id/verify-payment', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Generate format NKA-XXXX-XXXX
      const part1 = Math.floor(1000 + Math.random() * 9000);
      const part2 = Math.floor(1000 + Math.random() * 9000);
      const uniqueCode = `NKA-${part1}-${part2}`;

      const verifiedTicket = dbStore.verifyTicketPayment(id, uniqueCode);
      if (!verifiedTicket) return res.status(404).json({ error: 'Ticket not found' });

      res.json({ success: true, ticket: verifiedTicket, message: 'Paiement confirmé. Billet validé avec succès!' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 7b. POST /api/tickets/batch-verify-payment — Confirm multiple offline payments at once
  app.post('/api/tickets/batch-verify-payment', requireAuth, async (req, res) => {
    try {
      const { ticketIds } = req.body;
      if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
        return res.status(400).json({ error: 'Array of ticketIds is required' });
      }

      const verifiedTickets = [];
      for (const id of ticketIds) {
        const part1 = Math.floor(1000 + Math.random() * 9000);
        const part2 = Math.floor(1000 + Math.random() * 9000);
        const uniqueCode = `NKA-${part1}-${part2}`;
        const ticket = dbStore.verifyTicketPayment(id, uniqueCode);
        if (ticket) {
          verifiedTickets.push(ticket);
        }
      }

      res.json({
        success: true,
        count: verifiedTickets.length,
        tickets: verifiedTickets,
        message: `${verifiedTickets.length} billet(s) validé(s) en masse avec succès!`
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 8. POST /api/tickets/scan — Validate QR/code, check status & mark used
  app.post('/api/tickets/scan', requireAuth, async (req, res) => {
    try {
      const { code, staffUid } = req.body;
      if (!code) return res.status(400).json({ error: 'Missing code to scan' });

      const scannerUid = staffUid || (req as any).user.uid || 'staff-session';
      const result = dbStore.scanTicket(code, scannerUid);

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 9. POST /api/staff/assign — Assign staff role for an event ID
  app.post('/api/staff/assign', requireAuth, async (req, res) => {
    try {
      const { staffUid, eventId } = req.body;
      if (!staffUid || !eventId) {
        return res.status(400).json({ error: 'staffUid and eventId are required' });
      }

      const assignment = dbStore.assignStaff(staffUid, eventId);
      res.json({ success: true, assignment });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/tickets/my — Fetch tickets for current user
  app.get('/api/tickets/my', async (req, res) => {
    try {
      const uid = (req.query.uid as string) || '';
      const phone = (req.query.phone as string) || '';
      
      const allTickets = dbStore.getTickets();
      const filtered = allTickets.filter(t => 
        (uid && t.buyerUid === uid) || (phone && t.buyerPhone === phone)
      );

      res.json({ success: true, tickets: filtered.length ? filtered : allTickets });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/tickets/all — Fetch all tickets (Organizer / Admin)
  app.get('/api/tickets/all', async (req, res) => {
    try {
      const tickets = dbStore.getTickets();
      res.json({ success: true, tickets });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/staff/assignments — Fetch staff assignments
  app.get('/api/staff/assignments', async (req, res) => {
    try {
      const assignments = dbStore.getStaffAssignments();
      res.json({ success: true, assignments });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware setup for dev & production fallback
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`N'Ka Ticket Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
