import { TicketItem } from '../types';

export function downloadGuestListCSV(eventTitle: string, tickets: TicketItem[]) {
  const headers = ['Nom Acheteur', 'Téléphone', 'Code Billet', 'Statut', 'Date Achat', 'Date Scan'];
  const rows = tickets.map(t => [
    `"${(t.buyerName || '').replace(/"/g, '""')}"`,
    `"${(t.buyerPhone || '').replace(/"/g, '""')}"`,
    `"${t.ticketCode || ''}"`,
    `"${t.status}"`,
    `"${t.createdAt ? new Date(t.createdAt).toLocaleDateString('fr-FR') : ''}"`,
    `"${t.scannedAt ? new Date(t.scannedAt).toLocaleString('fr-FR') : '-'}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const sanitizedTitle = eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', `invites_${sanitizedTitle}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
