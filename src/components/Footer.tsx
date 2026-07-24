import React from 'react';
import { Ticket, Phone, MapPin, ShieldCheck, Banknote, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-900 text-zinc-300 pt-12 pb-8 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-zinc-800">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Ticket className="w-5 h-5 -rotate-12" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">N'KA TICKET</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              La première plateforme malienne de billetterie événementielle et contrôle d'accès au guichet. Payer en liquide, recevoir son QR Code sécurisé.
            </p>
            <p className="text-xs font-semibold text-emerald-400">🇲🇱 "I ka ticket, i ka plaisir"</p>
          </div>

          {/* Offline Payment Policy */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-emerald-500" />
              Paiement Hors-Ligne
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">•</span>
                <span>Réservation en statut <strong>pending</strong> sans frais bancaires.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">•</span>
                <span>Règlement en espèces auprès de l'organisateur ou au guichet.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">•</span>
                <span>Validation immédiate et génération de code unique <strong>NKA-XXXX-XXXX</strong>.</span>
              </li>
            </ul>
          </div>

          {/* Villes & Couverture au Mali */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500" />
              Couverture Mali
            </h4>
            <div className="flex flex-wrap gap-1.5 text-xs text-zinc-400">
              <span className="bg-zinc-800 border border-zinc-700/60 px-2.5 py-1 rounded-md text-zinc-200">Bamako</span>
              <span className="bg-zinc-800 border border-zinc-700/60 px-2.5 py-1 rounded-md text-zinc-200">Ségou</span>
              <span className="bg-zinc-800 border border-zinc-700/60 px-2.5 py-1 rounded-md text-zinc-200">Sikasso</span>
              <span className="bg-zinc-800 border border-zinc-700/60 px-2.5 py-1 rounded-md text-zinc-200">Mopti</span>
              <span className="bg-zinc-800 border border-zinc-700/60 px-2.5 py-1 rounded-md text-zinc-200">Kayes</span>
              <span className="bg-zinc-800 border border-zinc-700/60 px-2.5 py-1 rounded-md text-zinc-200">Kidal</span>
            </div>
            <p className="text-[11px] text-zinc-500">Support client & contrôleurs disponibles dans toutes les capitales régionales.</p>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              Assistance Guichet
            </h4>
            <div className="space-y-2 text-xs text-zinc-400">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-orange-400" />
                <span>+223 76 10 15 02 / +223 71 15 63 04</span>
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                <span>Garantie Escrow 24h après événement</span>
              </p>
            </div>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© 2026 N'Ka Ticket Mali — Tous droits réservés.</p>
          <div className="flex gap-4">
            <span className="hover:text-zinc-300 cursor-pointer">Conditions d'utilisation Escrow</span>
            <span className="hover:text-zinc-300 cursor-pointer">Politique Anti-Fraude</span>
            <span className="hover:text-zinc-300 cursor-pointer">Guide Organisateur</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
