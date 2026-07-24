import React, { useState } from 'react';
import { Ticket, PlusCircle, User as UserIcon, LogOut, Shield, QrCode, Sparkles, Menu, X, BarChart3, Calendar, Layers, Sun, Moon } from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  user: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenCreateEvent: () => void;
  onSwitchDemoUser: (role: UserRole) => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenCreateEvent,
  onSwitchDemoUser,
  onSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ultra_admin':
        return <span className="bg-orange-500/10 text-orange-600 border border-orange-500/20 text-xs px-2 py-0.5 rounded-full font-semibold">Ultra Admin</span>;
      case 'admin':
        return <span className="bg-purple-500/10 text-purple-600 border border-purple-500/20 text-xs px-2 py-0.5 rounded-full font-semibold">Admin</span>;
      case 'organizer':
        return <span className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 text-xs px-2 py-0.5 rounded-full font-semibold">Organisateur</span>;
      case 'staff':
        return <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs px-2 py-0.5 rounded-full font-semibold">Staff Guichet</span>;
      default:
        return <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full font-medium">Client</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('explore')}>
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-xl italic shadow-sm">
              N
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-white">N'KA</span>
                <span className="font-black text-xl tracking-tighter text-orange-600">TICKET</span>
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  🇲🇱 Mali
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation based on Role */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'explore'
                  ? 'bg-white dark:bg-slate-900 text-orange-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              Découvrir
            </button>

            <button
              onClick={() => setActiveTab('my-tickets')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'my-tickets'
                  ? 'bg-white dark:bg-slate-900 text-orange-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              Mes Billets
            </button>

            {(user?.role === 'organizer' || user?.role === 'admin' || user?.role === 'ultra_admin') && (
              <button
                onClick={() => setActiveTab('organizer')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'organizer'
                    ? 'bg-white dark:bg-slate-900 text-orange-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-orange-500" />
                Espace Organisateur
              </button>
            )}

            {(user?.role === 'staff' || user?.role === 'admin' || user?.role === 'ultra_admin') && (
              <button
                onClick={() => setActiveTab('guichet')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'guichet'
                    ? 'bg-slate-900 dark:bg-slate-950 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                }`}
              >
                <QrCode className="w-4 h-4 text-orange-400" />
                Guichet Scan
              </button>
            )}

            {(user?.role === 'admin' || user?.role === 'ultra_admin') && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                }`}
              >
                <Shield className="w-4 h-4" />
                Administration
              </button>
            )}
          </nav>

          {/* Action Buttons & Profile */}
          <div className="flex items-center gap-2.5">
            
            {/* Global Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 flex items-center justify-center shadow-xs"
              title={isDark ? "Passer au mode clair" : "Passer au mode sombre"}
              aria-label="Changer le thème"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Create Event Button */}
            <button
              onClick={onOpenCreateEvent}
              className="hidden sm:flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition-all shadow-md shadow-orange-100 dark:shadow-none active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publier un événement</span>
            </button>

            {/* Quick Role Switcher Dropdown for Testing/Evaluating */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all"
                title="Changer de rôle de démonstration"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span className="hidden lg:inline">Rôle:</span>
                {user ? getRoleBadge(user.role) : 'Invité'}
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Test Rapide Multi-Rôles</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Changer de profil instantanément:</p>
                  </div>
                  <button
                    onClick={() => { onSwitchDemoUser('user'); setRoleMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>👤 Acheteur (Client)</span>
                    <span className="text-[10px] text-slate-400">client@nkaticket.ml</span>
                  </button>
                  <button
                    onClick={() => { onSwitchDemoUser('organizer'); setRoleMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-700 dark:hover:text-orange-400 flex items-center justify-between"
                  >
                    <span>🎪 Organisateur</span>
                    <span className="text-[10px] text-slate-400">organisateur@nkaticket.ml</span>
                  </button>
                  <button
                    onClick={() => { onSwitchDemoUser('staff'); setRoleMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>📲 Staff Guichet Scan</span>
                    <span className="text-[10px] text-slate-400">staff@nkaticket.ml</span>
                  </button>
                  <button
                    onClick={() => { onSwitchDemoUser('ultra_admin'); setRoleMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 flex items-center justify-between"
                  >
                    <span>⚡ Ultra Admin</span>
                    <span className="text-[10px] text-orange-500">mahamadousow3601@...</span>
                  </button>
                </div>
              )}
            </div>

            {/* Auth / Account Controls */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onSignOut}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                  title="Déconnexion"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all"
              >
                <UserIcon className="w-4 h-4 text-orange-600" />
                <span>Connexion</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-150">
          
          {/* Mobile User Profile Header / Auth */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{user.name || 'Utilisateur N\'Ka'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {getRoleBadge(user.role)}
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{user.phone}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { onSignOut(); setMobileMenuOpen(false); }}
                  className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                  title="Déconnexion"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Compte N'Ka</span>
                </div>
                <button
                  onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                  className="bg-orange-600 text-white hover:bg-orange-700 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  Connexion / Inscription
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => { setActiveTab('explore'); setMobileMenuOpen(false); }}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold text-left flex items-center gap-2.5 transition-all ${
                activeTab === 'explore' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>Découvrir les Événements</span>
            </button>

            <button
              onClick={() => { setActiveTab('my-tickets'); setMobileMenuOpen(false); }}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold text-left flex items-center gap-2.5 transition-all ${
                activeTab === 'my-tickets' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Ticket className="w-4 h-4 text-emerald-500" />
              <span>Mes Billets</span>
            </button>

            {(user?.role === 'organizer' || user?.role === 'admin' || user?.role === 'ultra_admin') && (
              <button
                onClick={() => { setActiveTab('organizer'); setMobileMenuOpen(false); }}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold text-left flex items-center gap-2.5 transition-all ${
                  activeTab === 'organizer' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-orange-500" />
                <span>Espace Organisateur & Ventes</span>
              </button>
            )}

            {(user?.role === 'staff' || user?.role === 'admin' || user?.role === 'ultra_admin') && (
              <button
                onClick={() => { setActiveTab('guichet'); setMobileMenuOpen(false); }}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold text-left flex items-center gap-2.5 transition-all bg-slate-900 dark:bg-slate-950 text-white`}
              >
                <QrCode className="w-4 h-4 text-orange-400" />
                <span>Guichet Scan Billet</span>
              </button>
            )}

            {(user?.role === 'admin' || user?.role === 'ultra_admin') && (
              <button
                onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold text-left flex items-center gap-2.5 transition-all bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400`}
              >
                <Shield className="w-4 h-4" />
                <span>Administration</span>
              </button>
            )}
          </div>

          {/* Primary Mobile Action Buttons */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={() => { onOpenCreateEvent(); setMobileMenuOpen(false); }}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-orange-100 dark:shadow-none transition-all active:scale-98"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Publier un événement</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center"
              aria-label="Changer le thème"
              title={isDark ? "Mode clair" : "Mode sombre"}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

