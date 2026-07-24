import React, { useState } from 'react';
import { X, Calendar, MapPin, Ticket, Upload, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface CreateEventModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onEventCreated: () => void;
}

const MALI_CITIES = ['Bamako', 'Ségou', 'Sikasso', 'Mopti', 'Kayes', 'Kidal', 'Koulikoro', 'Gao', 'Tombouctou'];
const CATEGORIES = ['Concert & Musique', 'Culture & Théâtre', 'Festival', 'Sport', 'Business & Tech', 'Autre'];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  user,
  onClose,
  onEventCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState('2026-08-20');
  const [time, setTime] = useState('20:00');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('Bamako');
  const [price, setPrice] = useState('5000');
  const [totalTickets, setTotalTickets] = useState('200');
  const [organizerName, setOrganizerName] = useState(user?.displayName || 'Organisateur');
  const [organizerPhone, setOrganizerPhone] = useState(user?.phone || '+223 76 00 11 22');
  const [imageBase64, setImageBase64] = useState<string>('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5 Mo.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // POST /api/events
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          date,
          time,
          location,
          city,
          price: Number(price),
          totalTickets: Number(totalTickets),
          image: imageBase64,
          organizerId: user?.uid || 'org-mali-events',
          organizerName,
          organizerPhone
        })
      });

      const data = await res.json();
      if (data.success) {
        onEventCreated();
        onClose();
      } else {
        throw new Error(data.error || 'Erreur lors de la création de l’événement.');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-zinc-100 my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <span className="bg-amber-400 text-amber-950 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
            Création d'Événement
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight">Publier un événement au Mali</h2>
          <p className="text-emerald-100 text-xs mt-1">
            Configurez vos billets, prix en FCFA et encaissez au guichet physique.
          </p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Titre de l'Événement *</label>
              <input
                type="text"
                required
                placeholder="ex: Concert Géant au Stade Modibo Keïta"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:outline-none"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Ville du Mali *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:outline-none"
                >
                  {MALI_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Lieu & Salle *</label>
              <input
                type="text"
                required
                placeholder="ex: Palais de la Culture, ACI 2000, etc."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Heure de début *</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Prix Unitaire (FCFA) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="500"
                  placeholder="5000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Nombre total de billets *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="200"
                  value={totalTickets}
                  onChange={(e) => setTotalTickets(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Description de l'événement</label>
              <textarea
                rows={3}
                placeholder="Détails du programme, artistes invités, consignes d'accès..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            {/* Image Upload Box */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Affiche / Image de couverture</label>
              <div className="flex items-center gap-4 bg-zinc-50 p-3 rounded-2xl border border-dashed border-zinc-300">
                {imageBase64 ? (
                  <img src={imageBase64} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-zinc-200" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-zinc-200 flex items-center justify-center text-zinc-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                
                <div className="flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 bg-white border border-zinc-300 hover:bg-zinc-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Téléverser depuis l'appareil</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  <p className="text-[10px] text-zinc-400 mt-1">Format PNG, JPG ou WebP (max 5 Mo)</p>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-98 disabled:opacity-50"
            >
              {loading ? 'Publication...' : 'Publier l\'Événement'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
