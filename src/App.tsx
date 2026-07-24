import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { EventCard } from './components/EventCard';
import { EventModal } from './components/EventModal';
import { CreateEventModal } from './components/CreateEventModal';
import { AuthModal } from './components/AuthModal';
import { TicketCard } from './components/TicketCard';
import { GuichetScanner } from './components/GuichetScanner';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { PrintableTicketSheet } from './components/PrintableTicketSheet';
import { ProtectedRoute } from './components/ProtectedRoute';
import { EventItem, TicketItem, UserProfile, UserRole, StaffAssignment } from './types';
import { Search, MapPin, Sparkles, Filter, Ticket as TicketIcon, Calendar, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function App() {
  // Current user session state
  const [user, setUser] = useState<UserProfile | null>({
    uid: 'mahamadousow3601-uid',
    email: 'mahamadousow3601@gmail.com',
    displayName: 'Mahamadou Sow (Ultra Admin)',
    phone: '+223 66 12 34 56',
    role: 'ultra_admin'
  });

  const [activeTab, setActiveTab] = useState<string>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Toutes');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [selectedEventModal, setSelectedEventModal] = useState<EventItem | null>(null);
  
  // Data state from backend REST API
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [staffAssignments, setStaffAssignments] = useState<StaffAssignment[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  
  // Printable ticket sheet modal
  const [printableTickets, setPrintableTickets] = useState<TicketItem[] | null>(null);

  // Fetch data on load and refresh
  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      // 1. Fetch Events
      const evtRes = await fetch('/api/events');
      const evtData = await evtRes.json();
      if (evtData.success) {
        setEvents(evtData.events);
      }

      // 2. Fetch Tickets
      const tktRes = await fetch('/api/tickets/all');
      const tktData = await tktRes.json();
      if (tktData.success) {
        setTickets(tktData.tickets);
      }

      // 3. Fetch Users (if admin)
      const usrRes = await fetch('/api/users');
      const usrData = await usrRes.json();
      if (usrData.success) {
        setUsersList(usrData.users);
      }

      // 4. Fetch Staff Assignments
      const staffRes = await fetch('/api/staff/assignments');
      const staffData = await staffRes.json();
      if (staffData.success) {
        setStaffAssignments(staffData.assignments);
      }
    } catch (err) {
      console.warn("Failed to load backend API data", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Deep linking for shared event URLs (?event=evt-101)
  useEffect(() => {
    if (events.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const targetEventId = params.get('event');
      if (targetEventId) {
        const found = events.find(e => e.id === targetEventId);
        if (found) {
          setSelectedEventModal(found);
        }
      }
    }
  }, [events]);

  // Guard against non-admins accessing admin platform
  useEffect(() => {
    if (activeTab === 'admin' && user?.role !== 'admin' && user?.role !== 'ultra_admin') {
      if (user?.role === 'organizer') {
        setActiveTab('organizer');
      } else if (user?.role === 'staff') {
        setActiveTab('guichet');
      } else {
        setActiveTab('explore');
      }
    }
  }, [user, activeTab]);

  // Handle Quick Demo Role Switcher
  const handleSwitchDemoUser = (role: UserRole) => {
    let demoUser: UserProfile;
    switch (role) {
      case 'ultra_admin':
      case 'admin':
        demoUser = {
          uid: 'mahamadousow3601-uid',
          email: 'mahamadousow3601@gmail.com',
          displayName: 'Mahamadou Sow (Admin)',
          phone: '+223 76 10 15 02',
          role: role
        };
        setActiveTab('admin');
        break;
      case 'organizer':
        demoUser = {
          uid: 'org-mali-events',
          email: 'organisateur@nkaticket.ml',
          displayName: 'Mali Events Pro',
          phone: '+223 76 10 15 02',
          role: 'organizer'
        };
        setActiveTab('organizer');
        break;
      case 'staff':
        demoUser = {
          uid: 'staff-gate-1',
          email: 'staff@nkaticket.ml',
          displayName: 'Awa Diallo (Staff Guichet)',
          phone: '+223 71 15 63 04',
          role: 'staff'
        };
        setActiveTab('guichet');
        break;
      default:
        demoUser = {
          uid: 'buyer-user-1',
          email: 'client@nkaticket.ml',
          displayName: 'Oumar Traoré',
          phone: '+223 65 43 21 00',
          role: 'user'
        };
        setActiveTab('explore');
        break;
    }
    setUser(demoUser);
  };

  // Filter events by Search, City, and Category
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'Toutes' || e.city === selectedCity;
    const matchesCategory = selectedCategory === 'Toutes' || e.category === selectedCategory;
    return matchesSearch && matchesCity && matchesCategory;
  });

  // User Tickets list
  const userTickets = tickets.filter(t => t.buyerUid === user?.uid || user?.role === 'admin' || user?.role === 'ultra_admin');

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-orange-500 selection:text-white transition-colors duration-200">
      
      {/* Header Bar */}
      <Header
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCreateEvent={() => setIsCreateEventOpen(true)}
        onSwitchDemoUser={handleSwitchDemoUser}
        onSignOut={() => setUser(null)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Simulateur Multi-Rôles Bar (For Prototype Testing & Review) */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-orange-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Simulateur d'Interface
              </span>
              <p className="text-xs text-slate-300 font-semibold">
                Testez l'application selon les 4 rôles :
              </p>
            </div>
            <p className="text-[11px] text-slate-400">
              ⚡ Sans base de données externe (Mode Simulation pour Export)
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleSwitchDemoUser('user')}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                user?.role === 'user'
                  ? 'bg-orange-600 border-orange-500 text-white shadow-sm'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">👤 1. Client</span>
                {user?.role === 'user' && <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded font-bold">Actif</span>}
              </div>
              <span className="text-[10px] opacity-80 mt-1">Découvrir, réserver & billets</span>
            </button>

            <button
              onClick={() => handleSwitchDemoUser('organizer')}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                user?.role === 'organizer'
                  ? 'bg-orange-600 border-orange-500 text-white shadow-sm'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">🎪 2. Organisateur</span>
                {user?.role === 'organizer' && <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded font-bold">Actif</span>}
              </div>
              <span className="text-[10px] opacity-80 mt-1">Événements & Ventes Escrow</span>
            </button>

            <button
              onClick={() => handleSwitchDemoUser('staff')}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                user?.role === 'staff'
                  ? 'bg-slate-700 border-slate-600 text-white shadow-sm'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">📲 3. Staff Guichet</span>
                {user?.role === 'staff' && <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded font-bold">Actif</span>}
              </div>
              <span className="text-[10px] opacity-80 mt-1">Scan & vérification tickets</span>
            </button>

            <button
              onClick={() => handleSwitchDemoUser('ultra_admin')}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                user?.role === 'admin' || user?.role === 'ultra_admin'
                  ? 'bg-orange-700 border-orange-600 text-white shadow-sm'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">🛡️ 4. Administration</span>
                {(user?.role === 'admin' || user?.role === 'ultra_admin') && <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded font-bold">Actif</span>}
              </div>
              <span className="text-[10px] opacity-80 mt-1">Supervision globale & scan</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: DISCOVER EVENTS (DÉCOUVRIR) */}
        {activeTab === 'explore' && (
          <div className="space-y-8">
            
            {/* Hero Section */}
            <div className="bg-slate-900 rounded-2xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden border border-slate-800">
              <div className="relative z-10 max-w-2xl space-y-4">
                <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                  🇲🇱 Billetterie Événementielle & Guichet du Mali
                </span>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  I ka ticket, <br />
                  <span className="text-orange-500">i ka plaisir</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Réservez vos billets pour les concerts, festivals et événements culturels à Bamako, Ségou, Sikasso et partout au Mali. Paiement en espèces hors-ligne au guichet physique.
                </p>

                {/* Hero Search Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-orange-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Rechercher un artiste, concert ou lieu au Mali..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none"
                    />
                  </div>

                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 bg-slate-900 text-white text-xs rounded-lg font-semibold focus:outline-none cursor-pointer border border-slate-700"
                  >
                    <option value="Toutes">Toutes les Villes</option>
                    <option value="Bamako">Bamako</option>
                    <option value="Ségou">Ségou</option>
                    <option value="Sikasso">Sikasso</option>
                    <option value="Mopti">Mopti</option>
                    <option value="Kayes">Kayes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                {['Toutes', 'Concert & Musique', 'Culture & Théâtre', 'Festival', 'Sport', 'Business & Tech'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {filteredEvents.length} événement(s) disponible(s)
              </span>
            </div>

            {/* Events Grid */}
            {filteredEvents.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
                <TicketIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">Aucun événement trouvé</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Essayez de modifier votre recherche ou le filtre de ville.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((evt) => (
                  <EventCard
                    key={evt.id}
                    event={evt}
                    onSelect={(e) => setSelectedEventModal(e)}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: MES BILLETS (USER TICKETS) */}
        {activeTab === 'my-tickets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Mes Billets & QR Codes</h2>
                <p className="text-xs text-slate-500 mt-1">Consultez vos réservations en attente ou présentez vos QR codes validés au guichet.</p>
              </div>
              <span className="bg-orange-100 text-orange-800 text-xs font-extrabold px-3 py-1 rounded-full">
                {userTickets.length} billet(s)
              </span>
            </div>

            {userTickets.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                <TicketIcon className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-extrabold text-slate-800">Vous n'avez pas encore de billets</h3>
                <p className="text-xs text-slate-500">Parcourez la liste des événements pour faire une réservation offline au guichet.</p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="bg-orange-600 text-white font-bold px-5 py-2.5 rounded-lg text-xs hover:bg-orange-700 shadow-md shadow-orange-100"
                >
                  Découvrir les Événements
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userTickets.map((tkt) => (
                  <TicketCard
                    key={tkt.id}
                    ticket={tkt}
                    onOpenPrintSheet={(t) => setPrintableTickets([t])}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: ORGANIZER DASHBOARD */}
        {activeTab === 'organizer' && (
          <ProtectedRoute
            user={user}
            allowedRoles={['organizer', 'admin', 'ultra_admin']}
            onRedirect={setActiveTab}
          >
            <OrganizerDashboard
              user={user}
              events={events}
              tickets={tickets}
              isLoading={isLoadingData}
              onOpenCreateEvent={() => setIsCreateEventOpen(true)}
              onRefreshData={fetchData}
              onOpenGuichetScan={() => setActiveTab('guichet')}
            />
          </ProtectedRoute>
        )}

        {/* VIEW 4: GUICHET SCANNER PANEL */}
        {activeTab === 'guichet' && (
          <ProtectedRoute
            user={user}
            allowedRoles={['staff', 'admin', 'ultra_admin']}
            onRedirect={setActiveTab}
          >
            <GuichetScanner user={user} />
          </ProtectedRoute>
        )}

        {/* VIEW 5: ADMIN PLATFORM DASHBOARD */}
        {activeTab === 'admin' && (
          <ProtectedRoute
            user={user}
            allowedRoles={['admin', 'ultra_admin']}
            onRedirect={setActiveTab}
          >
            <AdminDashboard
              user={user}
              events={events}
              tickets={tickets}
              usersList={usersList}
              staffAssignments={staffAssignments}
              isLoading={isLoadingData}
              onRefreshData={fetchData}
            />
          </ProtectedRoute>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Popups */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          // Automatically redirect to role's dashboard on login
          if (loggedUser.role === 'organizer') setActiveTab('organizer');
          else if (loggedUser.role === 'staff') setActiveTab('guichet');
          else if (loggedUser.role === 'admin' || loggedUser.role === 'ultra_admin') setActiveTab('admin');
          else setActiveTab('explore');
        }}
        onQuickDemoRole={handleSwitchDemoUser}
      />

      <CreateEventModal
        isOpen={isCreateEventOpen}
        user={user}
        onClose={() => setIsCreateEventOpen(false)}
        onEventCreated={fetchData}
      />

      <EventModal
        event={selectedEventModal}
        user={user}
        onClose={() => setSelectedEventModal(null)}
        onPurchaseSuccess={fetchData}
      />

      <PrintableTicketSheet
        isOpen={!!printableTickets}
        tickets={printableTickets || []}
        onClose={() => setPrintableTickets(null)}
      />

    </div>
  );
}
