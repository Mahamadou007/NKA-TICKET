import React, { useState } from 'react';
import { X, Calendar, MapPin, User, Phone, Banknote, CheckCircle2, Share2, MessageCircle, Facebook, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { EventItem, UserProfile } from '../types';
import { ShareEventModal } from './ShareEventModal';
import { getEventShareUrl, getWhatsAppShareUrl, getFacebookShareUrl } from '../utils/shareUtils';

interface EventModalProps {
  event: EventItem | null;
  user: UserProfile | null;
  onClose: () => void;
  onPurchaseSuccess: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  user,
  onClose,
  onPurchaseSuccess,
}) => {
  const [buyerName, setBuyerName] = useState(user?.displayName || '');
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '+223 ');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submittedTickets, setSubmittedTickets] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!event) return null;

  const totalPrice = event.price * quantity;
  const shareUrl = getEventShareUrl(event.id);
  const whatsappUrl = getWhatsAppShareUrl(event);
  const facebookUrl = getFacebookShareUrl(event);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // POST /api/tickets/purchase
      const res = await fetch('/api/tickets/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          buyerUid: user?.uid || 'guest-buyer',
          buyerName,
          buyerPhone,
          quantity
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedTickets(data.tickets);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        onPurchaseSuccess();
      } else {
        throw new Error(data.error || 'Erreur lors de la réservation.');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-zinc-100 my-8 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Modal Header Image */}
          <div className="relative h-48 sm:h-56 w-full bg-zinc-900">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover opacity-80"
            />
            
            {/* Header Action Buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <button
                onClick={() => setIsShareModalOpen(true)}
                title="Partager l'événement"
                className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all flex items-center gap-1.5 text-xs font-semibold px-3"
              >
                <Share2 className="w-4 h-4 text-orange-400" />
                <span className="hidden sm:inline">Partager</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            <div className="absolute bottom-4 left-6 right-6 text-white">
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">
                {event.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold leading-tight">
                {event.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-zinc-300 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {event.city}, {event.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {event.date} à {event.time}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-5">

            {/* Quick Share Banner */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
                <Share2 className="w-4 h-4 text-orange-600" />
                <span>Partager l'événement :</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-2xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-2xs"
                >
                  <Facebook className="w-3.5 h-3.5 fill-current" />
                  <span>Facebook</span>
                </a>

                <button
                  onClick={handleCopyLink}
                  className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedLink ? 'Copié' : 'Lien'}</span>
                </button>
              </div>
            </div>

          {/* Success State Screen */}
          {submittedTickets ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-emerald-950">
                  Demande de réservation enregistrée !
                </h3>
                <p className="text-xs text-emerald-800 mt-1 max-w-md mx-auto">
                  Votre billet est actuellement en statut <span className="font-bold uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded">PENDING</span>.
                </p>
              </div>

              {/* Offline Payment Instructions */}
              <div className="bg-white p-4 rounded-xl border border-emerald-200 text-left space-y-2 text-xs">
                <p className="font-bold text-zinc-800 flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  Instructions de paiement en espèces :
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-zinc-600">
                  <li>Présentez-vous auprès de l'organisateur ({event.organizerName || 'Organisateur'}) ou au guichet physique.</li>
                  <li>Effectuez le règlement de <strong>{totalPrice.toLocaleString('fr-FR')} FCFA</strong> en liquide ou par transfert direct (Orange Money / Moov Money).</li>
                  <li>Dès réception, l'organisateur cliquera sur <strong>"Valider le paiement"</strong> et votre QR Code unique <span className="font-mono font-bold text-emerald-700">NKA-XXXX-XXXX</span> apparaîtra dans <strong>Mes Billets</strong>.</li>
                </ol>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={onClose}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm"
                >
                  Voir mes billets en attente
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Event Description */}
              <div className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/60">
                <p className="font-semibold text-zinc-800 mb-1">À propos de l'événement :</p>
                <p>{event.description || "Aucune description détaillée fournie."}</p>
                <p className="mt-2 text-zinc-500 font-medium">
                  Organisateur : <strong className="text-zinc-800">{event.organizerName || 'Mali Events'}</strong> ({event.organizerPhone || '+223 76 00 11 22'})
                </p>
              </div>

              {/* STRICT RULE Alert: Offline Payments Only */}
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
                <Banknote className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Règle de Paiement Hors-Ligne (Offline Only) :</span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Aucun paiement par carte bancaire en ligne n'est prélevé. Votre ticket sera réservé en attente (PENDING) jusqu'à confirmation du règlement physique.
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              {/* Purchase Form */}
              <form onSubmit={handlePurchase} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Nom de l'acheteur</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="Oumar Traoré"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Téléphone (Mali)</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        placeholder="+223 76 00 11 22"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Quantity & Total Calculation */}
                <div className="flex items-center justify-between bg-zinc-100 p-3.5 rounded-2xl border border-zinc-200">
                  <div>
                    <label className="block text-xs font-bold text-zinc-800">Nombre de billets</label>
                    <p className="text-[11px] text-zinc-500">Max 5 billets par commande</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-zinc-300 flex items-center justify-center font-bold text-zinc-700 hover:bg-zinc-50"
                    >
                      -
                    </button>
                    <span className="font-extrabold text-base text-zinc-900 min-w-6 text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(5, quantity + 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-zinc-300 flex items-center justify-center font-bold text-zinc-700 hover:bg-zinc-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total Summary Box */}
                <div className="bg-emerald-900 text-white p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-emerald-300 uppercase tracking-wider font-semibold block">Total à payer au guichet</span>
                    <span className="text-xl font-extrabold">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-98 disabled:opacity-50"
                  >
                    {loading ? 'Réservation...' : 'Confirmer la Réservation'}
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>

      <ShareEventModal
        event={event}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </>
  );
};
