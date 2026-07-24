import React, { useState } from 'react';
import { Shield, Users, BarChart3, Settings, Trash2, CheckCircle2, Percent, AlertCircle, Lock, UserPlus, Sliders, DollarSign, Calendar } from 'lucide-react';
import { EventItem, TicketItem, UserProfile, StaffAssignment } from '../types';

interface AdminDashboardProps {
  user: UserProfile | null;
  events: EventItem[];
  tickets: TicketItem[];
  usersList: UserProfile[];
  staffAssignments: StaffAssignment[];
  isLoading?: boolean;
  onRefreshData: () => void;
}

export const AdminDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Platform Admin Header Skeleton */}
      <div className="bg-slate-200 h-32 rounded-2xl w-full flex flex-col justify-between p-6">
        <div className="h-4 w-40 bg-slate-300 rounded"></div>
        <div className="h-7 w-72 bg-slate-300 rounded"></div>
        <div className="h-3 w-96 bg-slate-300 rounded"></div>
      </div>

      {/* Admin Tabs Skeleton */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <div className="h-9 w-32 bg-slate-200 rounded-lg shrink-0"></div>
        <div className="h-9 w-52 bg-slate-200 rounded-lg shrink-0"></div>
        <div className="h-9 w-44 bg-slate-200 rounded-lg shrink-0"></div>
        <div className="h-9 w-48 bg-slate-200 rounded-lg shrink-0"></div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="h-3 w-28 bg-slate-200 rounded"></div>
            <div className="h-8 w-36 bg-slate-200 rounded"></div>
            <div className="h-3 w-24 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Main Table / Management Panel Skeleton */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="h-6 w-48 bg-slate-200 rounded"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-14 bg-slate-100 rounded-xl w-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  events,
  tickets,
  usersList,
  staffAssignments,
  isLoading = false,
  onRefreshData,
}) => {
  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'users' | 'escrow'>('overview');
  const [selectedEventForStaff, setSelectedEventForStaff] = useState<string>(events[0]?.id || '');
  const [selectedUserForStaff, setSelectedUserForStaff] = useState<string>('');
  const [editingCommissionEventId, setEditingCommissionEventId] = useState<string | null>(null);
  const [newCommissionRate, setNewCommissionRate] = useState<string>('10');
  const [disputedEvents, setDisputedEvents] = useState<Record<string, boolean>>({});

  // Calculations for Platform Overview
  const totalTicketsSold = tickets.filter(t => t.status === 'valid' || t.status === 'used').length;
  
  let totalGrossVolume = 0;
  let totalPlatformCommission = 0;

  tickets.filter(t => t.status === 'valid' || t.status === 'used').forEach(t => {
    const evt = events.find(e => e.id === t.eventId);
    const price = t.ticketPrice || evt?.price || 0;
    const rate = evt?.commissionRate || 10;
    totalGrossVolume += price;
    totalPlatformCommission += price * (rate / 100);
  });

  // Update event commission rate
  const handleUpdateCommission = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/commission`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer uid:${user?.uid}` 
        },
        body: JSON.stringify({ commissionRate: Number(newCommissionRate) })
      });
      const data = await res.json();
      if (data.success) {
        setEditingCommissionEventId(null);
        onRefreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update user role
  const handleUpdateUserRole = async (targetUid: string, role: string) => {
    try {
      const res = await fetch(`/api/users/${targetUid}/role`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer uid:${user?.uid}` 
        },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (data.success) {
        onRefreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Assign staff to event
  const handleAssignStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForStaff || !selectedEventForStaff) return;

    try {
      const res = await fetch('/api/staff/assign', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer uid:${user?.uid}` 
        },
        body: JSON.stringify({
          staffUid: selectedUserForStaff,
          eventId: selectedEventForStaff
        })
      });
      const data = await res.json();
      if (data.success) {
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Action d'administration: Supprimer définitivement cet événement ?")) return;
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

  const toggleDispute = (eventId: string) => {
    setDisputedEvents(prev => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Platform Admin Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-orange-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {user?.role === 'ultra_admin' ? '⚡ Ultra Admin Platform' : '🛡️ Administration'}
            </span>
            <span className="text-xs text-slate-300">{user?.email}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Panneau de Contrôle N'Ka Ticket</h2>
          <p className="text-xs text-slate-300 mt-1">
            Supervision globale du réseau de billetterie au Mali, commissions personnalisées et système d'Escrow.
          </p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'overview' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-orange-400" />
          <span>Vue d'ensemble</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'events' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4 text-orange-400" />
          <span>Événements & Commission Per-Event</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'users' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4 text-orange-400" />
          <span>Utilisateurs & Staff Guichet</span>
        </button>

        <button
          onClick={() => setActiveTab('escrow')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'escrow' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4 text-orange-400" />
          <span>Escrow & Litiges (24h Post-Event)</span>
        </button>
      </div>

      {/* TAB 1: VUE D'ENSEMBLE */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">Total Événements</span>
              <p className="text-3xl font-black text-zinc-900">{events.length}</p>
              <p className="text-[11px] text-zinc-500">Actifs dans toutes les villes du Mali</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">Billets Valides / Scannés</span>
              <p className="text-3xl font-black text-emerald-600">{totalTicketsSold}</p>
              <p className="text-[11px] text-zinc-500">Titres d'accès émis au guichet</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">Volume Brut de Billetterie</span>
              <p className="text-2xl font-black text-zinc-900">
                {totalGrossVolume.toLocaleString('fr-FR')} <span className="text-xs text-emerald-600 font-bold">FCFA</span>
              </p>
              <p className="text-[11px] text-zinc-500">Paiements encaissés hors-ligne</p>
            </div>

            <div className="bg-purple-900 text-white p-5 rounded-3xl shadow-md space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300 block">Revenu Plateforme N'Ka</span>
              <p className="text-2xl font-black text-white">
                {totalPlatformCommission.toLocaleString('fr-FR')} <span className="text-xs text-purple-300 font-bold">FCFA</span>
              </p>
              <p className="text-[11px] text-purple-200">Commissions prélevées sur événements</p>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: ÉVÉNEMENTS & COMMISSION PER-EVENT */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-zinc-900">Événements Actifs & Personnalisation Commission</h3>
          <p className="text-xs text-zinc-500">Ajustez le taux de commission (par exemple 5%, 8%, 10%, 12%) ou supprimez des événements.</p>

          <div className="space-y-3">
            {events.map(e => (
              <div key={e.id} className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {e.category}
                    </span>
                    <span className="text-xs font-bold text-zinc-600">{e.city}</span>
                  </div>
                  <h4 className="font-extrabold text-base text-zinc-900 mt-1">{e.title}</h4>
                  <p className="text-xs text-zinc-500">{e.date} • {e.location} • Organisateur: {e.organizerName}</p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Commission Modifier Form */}
                  {editingCommissionEventId === e.id ? (
                    <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-purple-300">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        value={newCommissionRate}
                        onChange={(ev) => setNewCommissionRate(ev.target.value)}
                        className="w-16 px-2 py-1 text-xs font-bold border rounded"
                      />
                      <span className="text-xs font-bold text-zinc-600">%</span>
                      <button
                        onClick={() => handleUpdateCommission(e.id)}
                        className="bg-purple-600 text-white font-bold text-xs px-2.5 py-1 rounded"
                      >
                        Enregistrer
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingCommissionEventId(e.id); setNewCommissionRate(String(e.commissionRate)); }}
                      className="bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
                    >
                      <Percent className="w-3.5 h-3.5" />
                      <span>Frais: {e.commissionRate}%</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteEvent(e.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Supprimer l'événement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: UTILISATEURS & ASSIGNATION STAFF */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          
          {/* Assign Staff Box */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-zinc-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-purple-600" />
              Assigner un Membre du Staff au Guichet
            </h3>

            <form onSubmit={handleAssignStaff} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Sélectionner un Utilisateur</label>
                <select
                  value={selectedUserForStaff}
                  onChange={(e) => setSelectedUserForStaff(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold"
                >
                  <option value="">-- Choisir un utilisateur --</option>
                  {usersList.map(u => (
                    <option key={u.uid} value={u.uid}>{u.displayName || u.email} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Sélectionner un Événement</label>
                <select
                  value={selectedEventForStaff}
                  onChange={(e) => setSelectedEventForStaff(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold"
                >
                  {events.map(evt => (
                    <option key={evt.id} value={evt.id}>{evt.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-xs"
                >
                  Assigner au Guichet
                </button>
              </div>
            </form>
          </div>

          {/* User List Table */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-zinc-900">Utilisateurs Enregistrés sur la Plateforme</h3>
            <div className="space-y-2">
              {usersList.map(u => (
                <div key={u.uid} className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-sm text-zinc-900">{u.displayName || u.email}</p>
                    <p className="text-xs text-zinc-500">{u.email} • {u.phone}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateUserRole(u.uid, e.target.value)}
                      className="px-2.5 py-1 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-purple-900"
                    >
                      <option value="user">Client (Acheteur)</option>
                      <option value="organizer">Organisateur</option>
                      <option value="staff">Staff Guichet</option>
                      <option value="admin">Admin</option>
                      <option value="ultra_admin">Ultra Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: ESCROW & LITIGES */}
      {activeTab === 'escrow' && (
        <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-zinc-900">Système Escrow & Libération 24h Post-Événement</h3>
          <p className="text-xs text-zinc-500">Les fonds de billetterie sont conservés en Escrow puis débloqués 24 heures après la fin de l'événement.</p>

          <div className="space-y-3">
            {events.map(evt => {
              const isDisputed = !!disputedEvents[evt.id];
              return (
                <div key={evt.id} className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-sm text-zinc-900">{evt.title}</h4>
                    <p className="text-xs text-zinc-500">Date: {evt.date} • Lieu: {evt.location}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                      isDisputed
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {isDisputed ? 'Escrow Suspendu (Litige)' : 'Éligible aux Versements (24h)'}
                    </span>

                    <button
                      onClick={() => toggleDispute(evt.id)}
                      className="text-xs font-semibold text-zinc-600 hover:underline"
                    >
                      {isDisputed ? 'Lever le Litige' : 'Signaler Litige'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
