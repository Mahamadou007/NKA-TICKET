import React, { useState } from 'react';
import { Calendar, MapPin, Ticket, Clock, Share2 } from 'lucide-react';
import { EventItem } from '../types';
import { ShareEventModal } from './ShareEventModal';

interface EventCardProps {
  event: EventItem;
  onSelect: (event: EventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onSelect }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const percentSold = Math.round(((event.totalTickets - event.availableTickets) / event.totalTickets) * 100);
  const isSoldOut = event.availableTickets <= 0;

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
        
        {/* Cover Image & Category Badge */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={event.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80'}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
          
          {/* City Badge */}
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-slate-100 text-xs font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span>{event.city}</span>
          </div>

          {/* Top Right Action Row: Share & Category */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsShareOpen(true);
              }}
              title="Partager sur WhatsApp, Facebook..."
              className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md transition-all shadow-xs group/btn"
            >
              <Share2 className="w-3.5 h-3.5 text-orange-400 group-hover/btn:scale-110 transition-transform" />
            </button>
            <div className="bg-orange-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {event.category}
            </div>
          </div>

          {/* Date Overlay */}
          <div className="absolute bottom-3 left-3 text-white">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              <span>{new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span className="text-slate-400">•</span>
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>{event.time}</span>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
              {event.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 line-clamp-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{event.location}</span>
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Tickets Available Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Places disponibles</span>
              <span className={`font-bold ${isSoldOut ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                {isSoldOut ? 'Épuisé' : `${event.availableTickets} / ${event.totalTickets}`}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${isSoldOut ? 'bg-red-500' : 'bg-orange-500'}`}
                style={{ width: `${Math.min(100, percentSold)}%` }}
              />
            </div>
          </div>

          {/* Price & Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Prix Unitaire</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {event.price.toLocaleString('fr-FR')} <span className="text-xs font-bold text-orange-600">FCFA</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsShareOpen(true)}
                title="Partager"
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                <Share2 className="w-4 h-4 text-slate-600" />
              </button>

              <button
                onClick={() => onSelect(event)}
                disabled={isSoldOut}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                  isSoldOut
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-100 active:scale-98'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>{isSoldOut ? 'Complet' : 'Réserver'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      <ShareEventModal
        event={event}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </>
  );
};
