import React from 'react';
import { UserProfile, UserRole } from '../types';
import { ShieldAlert, ArrowRight } from 'lucide-react';

interface ProtectedRouteProps {
  user: UserProfile | null;
  allowedRoles: UserRole[];
  children: React.ReactNode;
  onRedirect: (targetTab: string) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  user,
  allowedRoles,
  children,
  onRedirect,
}) => {
  if (!user || !allowedRoles.includes(user.role)) {
    // Determine user's correct home dashboard tab
    const userDefaultTab = 
      user?.role === 'organizer' ? 'organizer' :
      user?.role === 'staff' ? 'guichet' :
      user?.role === 'admin' || user?.role === 'ultra_admin' ? 'admin' :
      'explore';

    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-12 shadow-sm animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black text-slate-900">Accès Restreint par Rôle</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Votre compte actuel (<span className="font-bold text-slate-900">{user ? user.role : 'Non connecté'}</span>) n'a pas les autorisations nécessaires pour accéder à cet espace.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onRedirect(userDefaultTab)}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition-all shadow-md shadow-orange-100 active:scale-98"
          >
            <span>Aller à mon tableau de bord ({userDefaultTab})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
