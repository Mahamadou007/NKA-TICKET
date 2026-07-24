import React, { useState } from 'react';
import { Share2, Check, Copy, MessageCircle, Facebook, X, ExternalLink } from 'lucide-react';
import { EventItem } from '../types';
import { getEventShareUrl, getEventShareText, getWhatsAppShareUrl, getFacebookShareUrl, shareEventNative } from '../utils/shareUtils';

interface ShareEventModalProps {
  event: EventItem;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareEventModal: React.FC<ShareEventModalProps> = ({ event, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !event) return null;

  const shareUrl = getEventShareUrl(event.id);
  const shareText = getEventShareText(event);
  const whatsappUrl = getWhatsAppShareUrl(event);
  const facebookUrl = getFacebookShareUrl(event);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleNativeShare = async () => {
    await shareEventNative(event);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 border border-slate-100 space-y-5 relative animate-in zoom-in-95 duration-150">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-3">
            <Share2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Partager cet Événement</h3>
          <p className="text-xs text-slate-500 font-medium line-clamp-1">{event.title}</p>
        </div>

        {/* Share Buttons Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-2 p-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-2xl transition-all group active:scale-98"
          >
            <div className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xs font-bold">WhatsApp</span>
          </a>

          {/* Facebook */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-2 p-3.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-2xl transition-all group active:scale-98"
          >
            <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
              <Facebook className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xs font-bold">Facebook</span>
          </a>

        </div>

        {/* Native Web Share API (Mobile) */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4 text-orange-400" />
            <span>Partager via d'autres applications</span>
          </button>
        )}

        {/* Copy Link Input Bar */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Lien Direct de l'événement
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 truncate focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-orange-600 hover:bg-orange-700 text-white shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
