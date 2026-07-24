import React, { useState } from 'react';
import { Printer, X, Sun, Moon, Ticket as TicketIcon } from 'lucide-react';
import { TicketItem } from '../types';
import { TicketQRCode } from './TicketQRCode';

interface PrintableTicketSheetProps {
  isOpen: boolean;
  tickets: TicketItem[];
  onClose: () => void;
}

export const PrintableTicketSheet: React.FC<PrintableTicketSheetProps> = ({
  isOpen,
  tickets,
  onClose,
}) => {
  const [darkTheme, setDarkTheme] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border my-6 animate-in fade-in zoom-in-95 duration-150 transition-colors ${
        darkTheme ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        
        {/* Controls Bar (Hidden during printing via CSS) */}
        <div className="print:hidden p-4 border-b border-zinc-200/40 flex items-center justify-between bg-zinc-100/50">
          <div className="flex items-center gap-2">
            <TicketIcon className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-sm">Aperçu Impression Billets ({tickets.length})</h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setDarkTheme(!darkTheme)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 transition-all"
            >
              {darkTheme ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
              <span>{darkTheme ? 'Thème Clair (Standard)' : 'Thème Sombre'}</span>
            </button>

            {/* Print Trigger Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / Exporter PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-500 hover:bg-zinc-200 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Grid Sheet (Targeted by print CSS) */}
        <div className="p-8 print:p-0">
          <div className="text-center mb-6 pb-4 border-b border-zinc-200/60 print:block">
            <h2 className="text-2xl font-black tracking-tight">N'KA TICKET MALI</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Feuille de billets officiels avec QR Code sécurisé</p>
          </div>

          {/* 2-Column Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`p-5 rounded-2xl border-2 border-dashed relative flex items-center justify-between gap-4 ${
                  darkTheme 
                    ? 'bg-zinc-900 border-zinc-700 text-white' 
                    : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              >
                {/* Left Ticket Specs */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                      Valide Guichet
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">🇲🇱 Bamako</span>
                  </div>

                  <h4 className="font-extrabold text-sm line-clamp-2">{ticket.eventTitle || "Événement N'Ka"}</h4>
                  
                  <div className="text-[11px] text-zinc-500 space-y-0.5">
                    <p>📅 {ticket.eventDate} à {ticket.eventTime}</p>
                    <p>📍 {ticket.eventLocation}, {ticket.eventCity}</p>
                    <p>👤 {ticket.buyerName} ({ticket.buyerPhone})</p>
                  </div>

                  <div className="pt-2">
                    <p className="text-[10px] text-zinc-400 font-semibold uppercase">Code Billet Unique</p>
                    <p className="font-mono font-black text-sm text-emerald-600">{ticket.ticketCode}</p>
                  </div>
                </div>

                {/* Right High-Res Working QR Code */}
                <div className="shrink-0 text-center">
                  <TicketQRCode
                    ticket={ticket}
                    size={100}
                    showCodeLabel={false}
                    className="p-2 border border-zinc-200 shadow-xs"
                  />
                  <span className="text-[9px] text-zinc-400 font-mono mt-1 block uppercase font-extrabold">SCAN GUICHET</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-[10px] text-zinc-400 pt-4 border-t border-zinc-200/60 print:block">
            N'Ka Ticket Mali — Document officiel d'accès à présenter à l'entrée. Ne pas plier le QR code.
          </div>
        </div>

      </div>
    </div>
  );
};
