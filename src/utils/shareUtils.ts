import { EventItem } from '../types';

/**
 * Returns the shareable URL for a specific event containing the event ID.
 */
export function getEventShareUrl(eventId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/?event=${eventId}`;
  }
  return '';
}

/**
 * Formats a clean, engaging message text for sharing an event.
 */
export function getEventShareText(event: EventItem): string {
  const formattedPrice = event.price ? `${event.price.toLocaleString('fr-FR')} FCFA` : 'Gratuit';
  return `🎟️ *${event.title}*\n📅 ${event.date} à ${event.time}\n📍 ${event.location}, ${event.city}\n💰 Prix: ${formattedPrice}\n\nRéservez vos places sur N'Ka Ticket Mali !`;
}

/**
 * Generates direct WhatsApp share URL.
 */
export function getWhatsAppShareUrl(event: EventItem): string {
  const url = getEventShareUrl(event.id);
  const text = getEventShareText(event);
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
}

/**
 * Generates direct Facebook share URL.
 */
export function getFacebookShareUrl(event: EventItem): string {
  const url = getEventShareUrl(event.id);
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

/**
 * Uses Web Share API if available.
 */
export async function shareEventNative(event: EventItem): Promise<boolean> {
  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      await navigator.share({
        title: event.title,
        text: getEventShareText(event),
        url: getEventShareUrl(event.id),
      });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
