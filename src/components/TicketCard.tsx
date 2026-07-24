import React, { useState } from 'react';
import { Ticket as TicketIcon, Calendar, MapPin, Printer, QrCode, CheckCircle2, Clock, AlertCircle, Eye, X } from 'lucide-react';
import { TicketItem } from '../types';
import { TicketQRCode } from './TicketQRCode';

interface TicketCardProps {
  ticket: TicketItem;
  onOpenPrintSheet: (ticket: TicketItem) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onOpenPrintSheet }) => {
  const [showQrModal, setShowQrModal] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" />Valide</span>;
      case 'used':
        return <span className="bg-zinc-200 text-zinc-700 border border-zinc-300 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1"><Clock className="w-3 h-3" />Scanné & Utilisé</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 border border-red-300 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3 text-red-600" />Annulé</span>;
      default:
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1"><Clock className="w-3 h-3 text-amber-600 animate-pulse" />En attente de paiement</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-zinc-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all overflow-hidden p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      
      {/* Left Details */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2">
          {getStatusBadge(ticket.status)}
          <span className="text-xs text-zinc-400 dark:text-slate-400 font-mono">
            Acheté le {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('fr-FR') : 'Récemment'}
          </span>
        </div>

        <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">{ticket.eventTitle || "Événement N'Ka"}</h3>

        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 dark:text-slate-300">
          <span className="flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {ticket.eventDate} à {ticket.eventTime}
          </span>
          <span className="flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            {ticket.eventCity}, {ticket.eventLocation}
          </span>
        </div>

        <div className="pt-1 flex items-center gap-3">
          <span className="text-xs text-zinc-500 dark:text-slate-400 font-medium">Acheteur: <strong className="text-zinc-800 dark:text-slate-200">{ticket.buyerName}</strong> ({ticket.buyerPhone})</span>
        </div>
      </div>

      {/* Code & Actions */}
      <div className="w-full md:w-auto bg-zinc-50 dark:bg-slate-800 p-3.5 rounded-2xl border border-zinc-200 dark:border-slate-700 flex items-center justify-between md:justify-end gap-4">
        <div>
          <span className="text-[10px] text-zinc-400 dark:text-slate-400 font-bold uppercase tracking-wider block">Code Billet Unique</span>
          <span className="font-mono font-extrabold text-base text-emerald-700 dark:text-emerald-400">{ticket.ticketCode}</span>
        </div>

        {ticket.status === 'valid' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQrModal(true)}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all"
              title="Afficher QR Code"
            >
              <QrCode className="w-5 h-5" />
            </button>
            <button
              onClick={() => onOpenPrintSheet(ticket)}
              className="p-2.5 bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl shadow-xs transition-all"
              title="Imprimer Billet"
            >
              <Printer className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="text-right text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 max-w-[140px]">
            {ticket.status === 'pending' ? 'Payer au guichet pour activer le QR' : 'Non scannable'}
          </div>
        )}
      </div>

      {/* QR Code Modal Popup */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative border border-zinc-100">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              QR Code d'Accès
            </span>

            <div>
              <h4 className="font-extrabold text-base text-zinc-900">{ticket.eventTitle}</h4>
              <p className="text-xs text-zinc-500 mt-0.5">{ticket.buyerName} • {ticket.buyerPhone}</p>
            </div>

            <div className="my-2 flex justify-center">
              <TicketQRCode
                ticket={ticket}
                size={200}
                showCodeLabel={false}
                className="border-2 border-emerald-500 shadow-md"
              />
            </div>

            <div>
              <span className="text-xs font-mono font-extrabold text-emerald-700 bg-zinc-100 px-3 py-1 rounded-lg border border-zinc-200 block max-w-fit mx-auto">
                {ticket.ticketCode}
              </span>
              <p className="text-[11px] text-zinc-400 mt-2">
                Présentez ce QR Code directement à la caméra du contrôleur au guichet d'entrée.
              </p>
            </div>

            <button
              onClick={() => { setShowQrModal(false); onOpenPrintSheet(ticket); }}
              className="w-full bg-zinc-900 hover:bg-black text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer le Billet</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
