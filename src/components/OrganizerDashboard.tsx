import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  BarChart3, 
  Calendar, 
  CheckCircle2, 
  DollarSign, 
  Download, 
  PlusCircle, 
  QrCode, 
  Trash2, 
  Clock, 
  Search, 
  X, 
  User, 
  Phone, 
  Filter, 
  Ticket as TicketIcon,
  ShieldCheck,
  Check,
  Archive,
  CheckSquare,
  Square,
  Zap,
  Loader2
} from 'lucide-react';
import { EventItem, TicketItem, UserProfile } from '../types';
import { downloadGuestListCSV } from '../lib/csv';

interface OrganizerDashboardProps {
  user: UserProfile | null;
  events: EventItem[];
  tickets: TicketItem[];
  isLoading?: boolean;
  onOpenCreateEvent: () => void;
  onRefreshData: () => void;
  onOpenGuichetScan: () => void;
}

export const OrganizerDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-slate-200 h-32 rounded-3xl w-full flex flex-col justify-between p-6">
        <div className="h-4 w-36 bg-slate-300 rounded"></div>
        <div className="h-7 w-64 bg-slate-300 rounded"></div>
        <div className="h-3 w-80 bg-slate-300 rounded"></div>
      </div>

      {/* Global Filter Bar Skeleton */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="h-10 bg-slate-200 rounded-xl w-full sm:w-1/3"></div>
        <div className="h-10 bg-slate-200 rounded-xl w-full sm:w-2/3"></div>
      </div>

      {/* Tabs Switcher Skeleton */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <div className="h-9 w-36 bg-slate-200 rounded-lg shrink-0"></div>
        <div className="h-9 w-48 bg-slate-200 rounded-lg shrink-0"></div>
        <div className="h-9 w-44 bg-slate-200 rounded-lg shrink-0"></div>
        <div className="h-9 w-32 bg-slate-200 rounded-lg shrink-0"></div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-32 bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div className="h-3 w-28 bg-slate-200 rounded"></div>
          <div className="h-8 w-36 bg-slate-200 rounded"></div>
          <div className="h-3 w-20 bg-slate-200 rounded"></div>
        </div>
        <div className="h-32 bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div className="h-3 w-28 bg-slate-200 rounded"></div>
          <div className="h-8 w-36 bg-slate-200 rounded"></div>
          <div className="h-3 w-20 bg-slate-200 rounded"></div>
        </div>
        <div className="h-32 bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div className="h-3 w-28 bg-slate-200 rounded"></div>
          <div className="h-8 w-36 bg-slate-200 rounded"></div>
          <div className="h-3 w-20 bg-slate-200 rounded"></div>
        </div>
      </div>

      {/* Items List Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="space-y-2 w-2/3">
              <div className="h-4 w-40 bg-slate-200 rounded"></div>
              <div className="h-3 w-28 bg-slate-200 rounded"></div>
            </div>
            <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  user,
  events,
  tickets,
  isLoading = false,
  onOpenCreateEvent,
  onRefreshData,
  onOpenGuichetScan,
}) => {
  if (isLoading) {
    return <OrganizerDashboardSkeleton />;
  }
  const [activeTab, setActiveTab] = useState<'financial' | 'buyers' | 'pending' | 'events'>('financial');
  const [eventFilterTab, setEventFilterTab] = useState<'active' | 'archived'>('active');
  const [loading, setLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'used' | 'pending'>('all');

  // Helper to check if event date is past
  const isPastEvent = (eventDateStr: string) => {
    if (!eventDateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const evtDate = new Date(eventDateStr);
    return evtDate < today;
  };

  // Filter events belonging to organizer
  const myEvents = events.filter(e => e.organizerId === user?.uid || user?.role === 'admin' || user?.role === 'ultra_admin');
  const activeEvents = myEvents.filter(e => !isPastEvent(e.date));
  const archivedEvents = myEvents.filter(e => isPastEvent(e.date));

  const myEventIds = new Set(myEvents.map(e => e.id));

  // Get all tickets related to organizer's events
  const myTickets = tickets.filter(t => myEventIds.has(t.eventId) || user?.role === 'admin' || user?.role === 'ultra_admin');

  // Filter tickets by selected event and search query
  const filterTickets = (ticketList: TicketItem[]) => {
    return ticketList.filter(t => {
      const matchesEvent = selectedEventId === 'all' || t.eventId === selectedEventId;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        (t.buyerName || '').toLowerCase().includes(q) ||
        (t.buyerPhone || '').toLowerCase().includes(q) ||
        (t.ticketCode || '').toLowerCase().includes(q);
      
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

      return matchesEvent && matchesSearch && matchesStatus;
    });
  };

  const filteredBuyerTickets = filterTickets(myTickets);

  // Pending ticket purchase requests waiting for offline cash validation
  const pendingTickets = myTickets.filter(t => 
    t.status === 'pending' && 
    (selectedEventId === 'all' || t.eventId === selectedEventId) &&
    (!searchQuery.trim() || 
      (t.buyerName || '').toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      (t.buyerPhone || '').toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      (t.ticketCode || '').toLowerCase().includes(searchQuery.trim().toLowerCase()))
  );

  // Batch selection states for pending tickets
  const [selectedPendingIds, setSelectedPendingIds] = useState<string[]>([]);
  const [batchValidating, setBatchValidating] = useState(false);
  const [batchSuccessMsg, setBatchSuccessMsg] = useState<string | null>(null);

  // Toggle selection for individual pending ticket
  const toggleSelectPending = (ticketId: string) => {
    setSelectedPendingIds(prev => 
      prev.includes(ticketId) ? prev.filter(id => id !== ticketId) : [...prev, ticketId]
    );
  };

  // Toggle select all pending tickets currently visible
  const toggleSelectAllPending = () => {
    const pendingTicketIds = pendingTickets.map(t => t.id);
    const allSelected = pendingTicketIds.length > 0 && pendingTicketIds.every(id => selectedPendingIds.includes(id));
    if (allSelected) {
      setSelectedPendingIds([]);
    } else {
      setSelectedPendingIds(pendingTicketIds);
    }
  };

  // Batch verify payment for selected or specific ticket IDs
  const handleBatchVerifyPayment = async (targetIds?: string[]) => {
    const idsToVerify = targetIds || selectedPendingIds;
    if (idsToVerify.length === 0) return;

    setBatchValidating(true);
    try {
      const res = await fetch('/api/tickets/batch-verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer uid:${user?.uid}`
        },
        body: JSON.stringify({ ticketIds: idsToVerify })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedPendingIds(prev => prev.filter(id => !idsToVerify.includes(id)));
        setBatchSuccessMsg(`✅ ${data.count || idsToVerify.length} billet(s) validé(s) en masse avec succès !`);
        setTimeout(() => setBatchSuccessMsg(null), 4000);
        onRefreshData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBatchValidating(false);
    }
  };

  // Financial Calculations for Organizer
  const calculateFinancials = () => {
    let grossRevenue = 0;
    let platformFeeTotal = 0;
    let organizerPayoutTotal = 0;
    let validTicketsCount = 0;

    const filteredTickets = myTickets.filter(t => 
      (t.status === 'valid' || t.status === 'used') && 
      (selectedEventId === 'all' ? true : t.eventId === selectedEventId)
    );

    filteredTickets.forEach(t => {
      const evt = events.find(e => e.id === t.eventId);
      const price = t.ticketPrice || evt?.price || 0;
      const commRate = evt?.commissionRate || 10;

      const ticketGross = price;
      const ticketFee = ticketGross * (commRate / 100);
      const ticketPayout = ticketGross - ticketFee;

      grossRevenue += ticketGross;
      platformFeeTotal += ticketFee;
      organizerPayoutTotal += ticketPayout;
      validTicketsCount += 1;
    });

    return {
      grossRevenue,
      platformFeeTotal,
      organizerPayoutTotal,
      validTicketsCount,
    };
  };

  const financials = calculateFinancials();

  // Attendance Chart Data for Recharts
  const targetEventsForChart = selectedEventId === 'all' 
    ? myEvents 
    : myEvents.filter(e => e.id === selectedEventId);

  const attendanceChartData = targetEventsForChart.map(evt => {
    const evtTickets = myTickets.filter(t => t.eventId === evt.id);
    const sold = evtTickets.filter(t => t.status === 'valid' || t.status === 'used').length;
    const used = evtTickets.filter(t => t.status === 'used').length;
    const pending = evtTickets.filter(t => t.status === 'pending').length;

    return {
      name: evt.title.length > 20 ? evt.title.substring(0, 18) + '…' : evt.title,
      fullTitle: evt.title,
      'Vendus': sold,
      'Validés (Utilisés)': used,
      'En Attente': pending,
      capacite: evt.totalTickets
    };
  });

  const totalSoldChart = attendanceChartData.reduce((acc, curr) => acc + curr['Vendus'], 0);
  const totalUsedChart = attendanceChartData.reduce((acc, curr) => acc + curr['Validés (Utilisés)'], 0);
  const totalAttendanceRate = totalSoldChart > 0 ? Math.round((totalUsedChart / totalSoldChart) * 100) : 0;

  // Validate Offline Payment
  const handleVerifyPayment = async (ticketId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/verify-payment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer uid:${user?.uid}`
        }
      });
      const data = await res.json();
      if (data.success) {
        onRefreshData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet événement ?")) return;
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer uid:${user?.uid}` }
      });
      const data = await res.json();
      if (data.success) {
        onRefreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate ticket counts for capacity tracking
  const validTicketsList = myTickets.filter(t => (selectedEventId === 'all' || t.eventId === selectedEventId) && t.status === 'valid');
  const usedTicketsList = myTickets.filter(t => (selectedEventId === 'all' || t.eventId === selectedEventId) && t.status === 'used');
  const pendingTicketsList = myTickets.filter(t => (selectedEventId === 'all' || t.eventId === selectedEventId) && t.status === 'pending');
  
  const totalPaidTickets = validTicketsList.length + usedTicketsList.length;
  const attendanceRate = totalPaidTickets > 0 ? Math.round((usedTicketsList.length / totalPaidTickets) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
        <div>
          <span className="bg-orange-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
            Espace Organisateur & Ventes
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Tableau de Bord Ventes & Escrow</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Suivez la recette brute, validez les paiements en espèces, recherchez rapidement vos acheteurs par nom ou téléphone.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateEvent}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition-all shadow-md shadow-orange-950/20 active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publier un Événement</span>
          </button>
          <button
            onClick={onOpenGuichetScan}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition-all border border-slate-700"
          >
            <QrCode className="w-4 h-4 text-orange-400" />
            <span>Ouvrir Guichet</span>
          </button>
        </div>
      </div>

      {/* Global Filter Bar (Event Selector & Buyer Search) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Event Filter */}
          <div className="flex items-center gap-2 min-w-[220px]">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-orange-600 focus:outline-none transition-all"
            >
              <option value="all">Tous mes événements ({myEvents.length})</option>
              {activeEvents.length > 0 && (
                <optgroup label="Événements Actifs & À Venir">
                  {activeEvents.map(e => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </optgroup>
              )}
              {archivedEvents.length > 0 && (
                <optgroup label="Événements Archivés (Passés)">
                  {archivedEvents.map(e => (
                    <option key={e.id} value={e.id}>📦 {e.title} (Archivé)</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Buyer Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher acheteur par nom, téléphone (+223...) ou code ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-orange-600 focus:outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {searchQuery && (
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>
              Résultats pour « <strong className="text-slate-900 dark:text-slate-100">{searchQuery}</strong> » : <strong className="text-orange-600 dark:text-orange-400">{filteredBuyerTickets.length}</strong> billet(s) trouvé(s)
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
            >
              Réinitialiser la recherche
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('financial')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'financial' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4 text-orange-400 dark:text-orange-600" />
          <span>Financier & Recettes</span>
        </button>

        <button
          onClick={() => setActiveTab('buyers')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'buyers' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4 text-orange-400" />
          <span>Acheteurs & Verification ({filteredBuyerTickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 relative shrink-0 ${
            activeTab === 'pending' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Demandes Espèces ({pendingTickets.length})</span>
          {pendingTickets.length > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
              {pendingTickets.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'events' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Mes Événements ({myEvents.length})</span>
        </button>
      </div>

      {/* TAB 1: FINANCIER & VENTES */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          
          {/* Financial Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Gross Revenue */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Recette Brute Cumulée</span>
              <p className="text-2xl font-black text-slate-900">
                {financials.grossRevenue.toLocaleString('fr-FR')} <span className="text-xs font-bold text-orange-600">FCFA</span>
              </p>
              <p className="text-[11px] text-slate-500">{financials.validTicketsCount} billet(s) payé(s)</p>
            </div>

            {/* Platform Cut */}
            <div className="bg-orange-50/60 p-5 rounded-2xl border border-orange-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-800 block">Commission Plateforme</span>
              <p className="text-2xl font-black text-orange-950">
                {financials.platformFeeTotal.toLocaleString('fr-FR')} <span className="text-xs font-bold text-orange-600">FCFA</span>
              </p>
              <p className="text-[11px] text-orange-800">Frais de gestion N'Ka Ticket</p>
            </div>

            {/* Organizer Net Payout */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Net Organisateur (Revenu Net)</span>
              <p className="text-2xl font-black text-white">
                {financials.organizerPayoutTotal.toLocaleString('fr-FR')} <span className="text-xs font-bold text-orange-400">FCFA</span>
              </p>
              <p className="text-[11px] text-slate-400">Garantie Escrow libérable 24h après événement</p>
            </div>

          </div>

          {/* Recharts Bar Chart: Tickets Sold vs Used */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <span>Analyse des Fréquentations : Billets Vendus vs Utilisés</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualisez le taux de présence effective au guichet par rapport au volume total de billets vendus.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Taux Présence Global</span>
                  <span className="text-sm font-black text-emerald-600">{totalAttendanceRate}%</span>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Scannés / Vendus</span>
                  <span className="text-sm font-black text-slate-900">{totalUsedChart} / {totalSoldChart}</span>
                </div>
              </div>
            </div>

            {attendanceChartData.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                Aucun événement disponible pour afficher le graphique de fréquentation.
              </div>
            ) : (
              <div className="h-72 sm:h-80 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={attendanceChartData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0]?.payload;
                          return (
                            <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 shadow-xl text-xs space-y-1.5 min-w-[200px]">
                              <p className="font-extrabold text-orange-400 border-b border-slate-800 pb-1">{data?.fullTitle || label}</p>
                              <div className="space-y-1 pt-0.5">
                                <p className="flex items-center justify-between gap-4 text-slate-200">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                                    <span>Billets Vendus :</span>
                                  </span>
                                  <strong className="font-mono text-white">{data?.['Vendus']}</strong>
                                </p>
                                <p className="flex items-center justify-between gap-4 text-emerald-400">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                    <span>Entrées Scannées :</span>
                                  </span>
                                  <strong className="font-mono">{data?.['Validés (Utilisés)']}</strong>
                                </p>
                                <p className="flex items-center justify-between gap-4 text-amber-400">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                    <span>En Attente Espèces :</span>
                                  </span>
                                  <strong className="font-mono">{data?.['En Attente']}</strong>
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ paddingBottom: '15px', fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="Vendus" name="Billets Vendus" fill="#ea580c" radius={[6, 6, 0, 0]} maxBarSize={45} />
                    <Bar dataKey="Validés (Utilisés)" name="Entrées Validées (Scannées)" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={45} />
                    <Bar dataKey="En Attente" name="En Attente Espèces" fill="#d97706" radius={[6, 6, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Guest List CSV Export Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Exporter la Liste des Invités & Billets</h3>
                <p className="text-xs text-slate-500">Générez un fichier Excel/CSV avec les noms, téléphones et codes QR.</p>
              </div>

              <button
                onClick={() => downloadGuestListCSV("Tous_les_Événements", filteredBuyerTickets)}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition-all shadow-md shadow-orange-100"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger Fichier CSV ({filteredBuyerTickets.length})</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: BUYER SEARCH & CHECK-IN LIST */}
      {activeTab === 'buyers' && (
        <div className="space-y-5">
          
          {/* Capacity & Scanning Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Total Paid / Reserved */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Billets Payés</span>
                <p className="text-2xl font-black text-slate-900">{totalPaidTickets}</p>
                <p className="text-[11px] text-slate-500 font-medium">Billet(s) vendus</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center font-bold text-xs">
                {totalPaidTickets}
              </div>
            </div>

            {/* Remaining Capacity (Valid Non-Scanned) */}
            <button
              onClick={() => setStatusFilter('valid')}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                statusFilter === 'valid'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-emerald-50/60 text-emerald-950 border-emerald-200/80 hover:bg-emerald-100/60'
              }`}
            >
              <div>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${statusFilter === 'valid' ? 'text-emerald-100' : 'text-emerald-800'}`}>
                  🟢 Capacité Restante (À Scanner)
                </span>
                <p className="text-2xl font-black">{validTicketsList.length}</p>
                <p className={`text-[11px] font-medium ${statusFilter === 'valid' ? 'text-emerald-100' : 'text-emerald-800'}`}>
                  {totalPaidTickets > 0 ? Math.round((validTicketsList.length / totalPaidTickets) * 100) : 0}% des personnes attendues
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                statusFilter === 'valid' ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-900'
              }`}>
                {validTicketsList.length}
              </div>
            </button>

            {/* Scanned / Already Checked-In */}
            <button
              onClick={() => setStatusFilter('used')}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                statusFilter === 'used'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-blue-50/60 text-blue-950 border-blue-200/80 hover:bg-blue-100/60'
              }`}
            >
              <div>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${statusFilter === 'used' ? 'text-blue-100' : 'text-blue-800'}`}>
                  🔵 Entrées Effectuées (Scannés)
                </span>
                <p className="text-2xl font-black">{usedTicketsList.length}</p>
                <p className={`text-[11px] font-medium ${statusFilter === 'used' ? 'text-blue-100' : 'text-blue-800'}`}>
                  Taux de remplissage : {attendanceRate}%
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                statusFilter === 'used' ? 'bg-white/20 text-white' : 'bg-blue-200 text-blue-900'
              }`}>
                {usedTicketsList.length}
              </div>
            </button>

          </div>

          {/* Quick Filter Buttons Row */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1 shrink-0">Filtrer statut :</span>
              
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Tous ({myTickets.length})
              </button>

              <button
                onClick={() => setStatusFilter('valid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5 ${
                  statusFilter === 'valid'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <span>🟢 Valides / Capacité Restante ({validTicketsList.length})</span>
              </button>

              <button
                onClick={() => setStatusFilter('used')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5 ${
                  statusFilter === 'used'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
                }`}
              >
                <span>🔵 Scannés / Déjà Entrés ({usedTicketsList.length})</span>
              </button>

              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5 ${
                  statusFilter === 'pending'
                    ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
                }`}
              >
                <span>🟠 Attente Paiement Cash ({pendingTicketsList.length})</span>
              </button>
            </div>

            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 underline shrink-0"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Buyer Tickets List */}
          {filteredBuyerTickets.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-500 space-y-3">
              <User className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Aucun acheteur ne correspond à vos critères.</p>
              <p className="text-xs text-slate-400">Essayez un autre numéro de téléphone ou nom d'acheteur.</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredBuyerTickets.map((t) => (
                <div
                  key={t.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-orange-200 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      {/* Status Badge */}
                      {t.status === 'valid' && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Valide (Prêt pour Entrée)</span>
                        </span>
                      )}
                      {t.status === 'used' && (
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-blue-600" />
                          <span>Scanné / Entrée Effectuée</span>
                        </span>
                      )}
                      {t.status === 'pending' && (
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Attente Paiement Cash</span>
                        </span>
                      )}

                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {t.ticketCode}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-orange-600 shrink-0" />
                        <span>{t.buyerName}</span>
                      </h4>
                      <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a href={`tel:${t.buyerPhone}`} className="hover:text-orange-600 underline">
                          {t.buyerPhone}
                        </a>
                      </p>
                    </div>

                    <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                      <p className="font-bold text-slate-800 truncate">{t.eventTitle}</p>
                      <p className="text-[11px] text-slate-500">Prix : <strong>{(t.ticketPrice || 0).toLocaleString('fr-FR')} FCFA</strong></p>
                      {t.scannedAt && (
                        <p className="text-[10px] text-blue-600 font-semibold">
                          Scanné le : {new Date(t.scannedAt).toLocaleString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {t.status === 'pending' && (
                    <button
                      onClick={() => handleVerifyPayment(t.id)}
                      disabled={loading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Valider le Paiement Cash au Guichet</span>
                    </button>
                  )}
                  {t.status === 'valid' && (
                    <button
                      onClick={onOpenGuichetScan}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-4 h-4 text-orange-400" />
                      <span>Passer au Scanner Guichet</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB 3: DEMANDES EN ATTENTE (PENDING CASH PAYMENTS) */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <span>Demandes de Billets en Attente de Paiement</span>
                {pendingTickets.length > 0 && (
                  <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {pendingTickets.length}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Une fois l'argent liquide reçu au guichet, cochez les billets et validez la sélection groupée en 1-clic.
              </p>
            </div>

            {pendingTickets.length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={toggleSelectAllPending}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {pendingTickets.every(t => selectedPendingIds.includes(t.id)) ? (
                    <>
                      <CheckSquare className="w-4 h-4 text-orange-600" />
                      <span>Tout Désélectionner</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4 text-slate-400" />
                      <span>Tout Sélectionner ({pendingTickets.length})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Success Banner */}
          {batchSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>{batchSuccessMsg}</span>
            </div>
          )}

          {/* Batch Selection Action Bar */}
          {selectedPendingIds.length > 0 && (
            <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                  {selectedPendingIds.length}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-100">
                    {selectedPendingIds.length} billet(s) sélectionné(s) pour validation groupée
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Montant total à encaisser : <strong className="text-emerald-400 font-extrabold">{pendingTickets.filter(t => selectedPendingIds.includes(t.id)).reduce((sum, t) => sum + (t.ticketPrice || 0), 0).toLocaleString('fr-FR')} FCFA</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedPendingIds([])}
                  className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white underline shrink-0"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleBatchVerifyPayment()}
                  disabled={batchValidating}
                  className="bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shrink-0 disabled:opacity-50"
                >
                  {batchValidating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Validation en cours...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-slate-950 fill-current" />
                      <span>Valider les {selectedPendingIds.length} Billets (1-Clic)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {pendingTickets.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-50" />
              <p className="text-sm font-bold text-slate-700">Toutes les demandes ont été traitées !</p>
              <p className="text-slate-400">Aucune demande de réservation en attente de paiement espèces.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTickets.map((t) => {
                const isSelected = selectedPendingIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleSelectPending(t.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-orange-50/80 border-orange-300 ring-2 ring-orange-400/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectPending(t.id);
                        }}
                        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all border shrink-0 ${
                          isSelected
                            ? 'bg-orange-600 border-orange-600 text-white'
                            : 'bg-white border-slate-300 text-transparent hover:border-orange-400'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                            PENDING CASH
                          </span>
                          <span className="text-xs text-slate-500 font-medium">{t.eventTitle}</span>
                        </div>
                        <p className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                          <User className="w-4 h-4 text-orange-600 shrink-0" />
                          <span>{t.buyerName}</span>
                          <span className="text-xs font-normal text-slate-500">({t.buyerPhone})</span>
                        </p>
                        <p className="text-xs text-slate-500">
                          Montant à encaisser : <strong className="text-slate-900">{(t.ticketPrice || 0).toLocaleString('fr-FR')} FCFA</strong>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVerifyPayment(t.id);
                      }}
                      disabled={loading || batchValidating}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Valider Individuellement</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MES ÉVÉNEMENTS */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          
          {/* Sub-tab filter controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEventFilterTab('active')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  eventFilterTab === 'active'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                <span>Actifs & À Venir ({activeEvents.length})</span>
              </button>

              <button
                onClick={() => setEventFilterTab('archived')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  eventFilterTab === 'archived'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100'
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archivés ({archivedEvents.length})</span>
              </button>
            </div>

            <button
              onClick={onOpenCreateEvent}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Créer un Événement</span>
            </button>
          </div>

          {/* List of events */}
          {(eventFilterTab === 'active' ? activeEvents : archivedEvents).length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-500 space-y-2">
              <Archive className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-800">
                {eventFilterTab === 'active'
                  ? "Aucun événement actif ou à venir."
                  : "Aucun événement archivé pour le moment."}
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {eventFilterTab === 'active'
                  ? "Les événements dont la date est dépassée sont automatiquement basculés dans les archives pour garder votre liste d'événements claire."
                  : "Vos événements passés apparaîtront ici automatiquement dès leur date d'échéance."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(eventFilterTab === 'active' ? activeEvents : archivedEvents).map(e => {
                const past = isPastEvent(e.date);
                return (
                  <div
                    key={e.id}
                    className={`bg-white p-5 rounded-3xl border shadow-xs flex flex-col justify-between space-y-3 transition-all ${
                      past ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                            {e.category}
                          </span>
                          {past && (
                            <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                              <Archive className="w-3 h-3 text-amber-700" />
                              <span>Archivé (Passé)</span>
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-500">{e.city}</span>
                      </div>

                      <h4 className="font-extrabold text-base text-slate-900 mt-2">{e.title}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{e.date} à {e.time}</span>
                        <span>•</span>
                        <span>{e.location}</span>
                      </p>
                      <p className="text-xs font-bold text-emerald-700 mt-1.5">
                        {e.price.toLocaleString('fr-FR')} FCFA / billet
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Commission N'Ka: <strong>{e.commissionRate}%</strong></span>
                      <button
                        onClick={() => handleDeleteEvent(e.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Supprimer l'événement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
};

