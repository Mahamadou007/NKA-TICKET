import React from 'react';
import { UserProfile } from '../types';
import { GuichetScanner } from './GuichetScanner';

interface StaffDashboardProps {
  user: UserProfile | null;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="bg-emerald-900 text-white p-5 rounded-3xl shadow-lg flex items-center justify-between">
        <div>
          <span className="bg-emerald-500 text-emerald-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Espace Staff Guichet
          </span>
          <h2 className="text-xl font-bold mt-1">Session Contrôleur: {user?.displayName || user?.email}</h2>
        </div>
      </div>

      <GuichetScanner user={user} />
    </div>
  );
};
