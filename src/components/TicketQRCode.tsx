import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TicketItem } from '../types';

interface TicketQRCodeProps {
  ticket: TicketItem;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  showCodeLabel?: boolean;
  className?: string;
}

export const TicketQRCode: React.FC<TicketQRCodeProps> = ({
  ticket,
  size = 180,
  level = 'H',
  includeMargin = true,
  showCodeLabel = true,
  className = '',
}) => {
  // QR code content: encodes ticketCode or structured ticket payload
  const qrData = ticket.ticketCode || `TICKET:${ticket.id}`;

  return (
    <div className={`flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
      <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-center">
        <QRCodeSVG
          value={qrData}
          size={size}
          level={level}
          includeMargin={includeMargin}
          bgColor="#FFFFFF"
          fgColor="#000000"
        />
      </div>

      {showCodeLabel && (
        <div className="mt-2.5 text-center">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block mb-0.5">
            Code Billet
          </span>
          <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 dark:bg-slate-800 dark:text-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            {ticket.ticketCode}
          </span>
        </div>
      )}
    </div>
  );
};
