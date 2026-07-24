import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScannerState } from 'html5-qrcode';
import { QrCode, Search, Volume2, VolumeX, CheckCircle2, AlertTriangle, ShieldX, Sparkles, RefreshCw, UserCheck, History, Clock, Trash2 } from 'lucide-react';
import { UserProfile } from '../types';
import { playSuccessChime, playErrorBuzz, setAudioMuted, getAudioMuted } from '../lib/audio';

interface GuichetScannerProps {
  user: UserProfile | null;
}

export interface RecentScanLog {
  id: string;
  code: string;
  success: boolean;
  statusText: string;
  errorType?: 'ALREADY_USED' | 'NOT_FOUND' | 'CANCELLED' | 'PENDING';
  buyerName?: string;
  timestamp: string;
}

export const GuichetScanner: React.FC<GuichetScannerProps> = ({ user }) => {
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    ticket?: any;
    errorType?: 'ALREADY_USED' | 'NOT_FOUND' | 'CANCELLED' | 'PENDING';
  } | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScanLog[]>([]);
  const [isMuted, setIsMuted] = useState(getAudioMuted());
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize html5-qrcode camera scanner
    let scanner: Html5QrcodeScanner | null = null;
    
    if (cameraActive) {
      try {
        scanner = new Html5QrcodeScanner(
          'qr-reader-container',
          { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
          /* verbose= */ false
        );

        scanner.render(
          (decodedText) => {
            handleProcessScan(decodedText);
          },
          (errorMessage) => {
            // Ignore frame decode noise
          }
        );

        scannerRef.current = scanner;
      } catch (err) {
        console.warn("Camera init exception", err);
      }
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (e) {}
      }
    };
  }, [cameraActive]);

  const handleToggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    setAudioMuted(nextState);
  };

  const handleProcessScan = async (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;
    setLoading(true);

    try {
      // POST /api/tickets/scan
      const res = await fetch('/api/tickets/scan', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer uid:${user?.uid || 'staff-session'}` 
        },
        body: JSON.stringify({
          code: codeToVerify,
          staffUid: user?.uid || 'staff-session'
        })
      });

      const data = await res.json();
      setScanResult(data);

      const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newLog: RecentScanLog = {
        id: Math.random().toString(36).substring(2, 9),
        code: codeToVerify,
        success: data.success,
        statusText: data.message || (data.success ? 'Entrée Validée' : 'Échec'),
        errorType: data.errorType,
        buyerName: data.ticket?.buyerName,
        timestamp
      };

      setRecentScans(prev => [newLog, ...prev].slice(0, 10));

      if (data.success) {
        playSuccessChime(); // 800Hz high chime
      } else {
        playErrorBuzz(); // 200Hz double low buzz
      }
    } catch (err: any) {
      const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setScanResult({ success: false, message: 'Erreur réseau ou serveur' });
      setRecentScans(prev => [{
        id: Math.random().toString(36).substring(2, 9),
        code: codeToVerify,
        success: false,
        statusText: 'Erreur réseau ou serveur',
        timestamp
      }, ...prev].slice(0, 10));
      playErrorBuzz();
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProcessScan(manualCode);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Guichet Title & Sound Controls Header */}
      <div className="bg-gradient-to-r from-zinc-900 to-emerald-950 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500 text-zinc-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Contrôle d'Accès Gate
            </span>
            <span className="text-xs text-zinc-400">Guichet & Scanner Caméra</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Guichet Check-In N'Ka</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Scannez les billets pour autoriser l'entrée et prévenir toute tentative de fraude.
          </p>
        </div>

        {/* Sound Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleMute}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              isMuted
                ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                : 'bg-emerald-600 text-white border-emerald-500 shadow-md'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
            <span>{isMuted ? 'Son DÉSACTIVÉ' : 'Son ACTIVÉ (800Hz / 200Hz)'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Scanner Box + Manual Lookup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Camera Live Scanner Box */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-xs flex flex-col items-center text-center space-y-4">
          <div className="flex items-center justify-between w-full pb-2 border-b border-zinc-100">
            <span className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-emerald-600" />
              Caméra en direct
            </span>
            <button
              onClick={() => setCameraActive(!cameraActive)}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              {cameraActive ? 'Redémarrer caméra' : 'Activer caméra'}
            </button>
          </div>

          <div className="w-full bg-zinc-900 rounded-2xl overflow-hidden min-h-[260px] flex items-center justify-center p-2 relative border border-zinc-800 shadow-inner">
            <div id="qr-reader-container" className="w-full text-white" />
          </div>

          <p className="text-[11px] text-zinc-500">
            Pointez la caméra vers le QR Code présent sur le téléphone ou le billet papier du participant.
          </p>
        </div>

        {/* Manual Lookup & Result Status Feedback */}
        <div className="space-y-6">
          
          {/* Manual Code Search Form */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-zinc-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-600" />
              Saisie Manuelle de Code
            </h3>
            <p className="text-xs text-zinc-500">Saisissez le code alphanumérique <span className="font-mono font-bold text-emerald-700">NKA-XXXX-XXXX</span> en cas de soucis de caméra.</p>

            <form onSubmit={handleManualSubmit} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="ex: NKA-7821-9904"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono uppercase focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-xs disabled:opacity-50"
              >
                Vérifier
              </button>
            </form>
          </div>

          {/* Instant Verification Feedback Display */}
          {scanResult && (
            <div className={`rounded-3xl p-6 border shadow-lg transition-all animate-in zoom-in-95 duration-150 ${
              scanResult.success 
                ? 'bg-emerald-500 text-white border-emerald-600'
                : scanResult.errorType === 'ALREADY_USED'
                ? 'bg-red-600 text-white border-red-700'
                : 'bg-amber-500 text-white border-amber-600'
            }`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                  {scanResult.success ? (
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  ) : scanResult.errorType === 'ALREADY_USED' ? (
                    <ShieldX className="w-7 h-7 text-white animate-bounce" />
                  ) : (
                    <AlertTriangle className="w-7 h-7 text-white" />
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full inline-block">
                    {scanResult.success ? 'ENTRÉE VALIDÉE' : scanResult.errorType === 'ALREADY_USED' ? 'FRAUDE DETECTÉE - DOUBLE DE SCAN' : 'BILLET INVALIDÉ'}
                  </span>
                  
                  <h4 className="text-xl font-extrabold leading-tight">
                    {scanResult.message}
                  </h4>

                  {scanResult.ticket && (
                    <div className="pt-2 text-xs bg-black/20 p-3 rounded-xl space-y-0.5 text-white/90">
                      <p><strong>Titulaire :</strong> {scanResult.ticket.buyerName} ({scanResult.ticket.buyerPhone})</p>
                      <p><strong>Événement :</strong> {scanResult.ticket.eventTitle || "Concert Mali"}</p>
                      <p><strong>Code Billet :</strong> <span className="font-mono font-bold">{scanResult.ticket.ticketCode}</span></p>
                      {scanResult.ticket.scannedAt && (
                        <p className="text-[11px] text-white/80">Scanné le: {new Date(scanResult.ticket.scannedAt).toLocaleTimeString()}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Guichet Demo Mode Buttons */}
          <div className="bg-zinc-100 rounded-3xl p-5 border border-zinc-200/80 space-y-2">
            <div className="flex items-center gap-1.5 text-zinc-700 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Simulateur Guichet (Actions de Test Rapide)</span>
            </div>
            <p className="text-[11px] text-zinc-500">Testez les signaux sonores (800Hz / 200Hz) et les retours visuels sans caméra :</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => handleProcessScan('NKA-7821-9904')}
                className="bg-white hover:bg-emerald-50 border border-zinc-200 text-emerald-800 text-xs font-bold py-2 px-3 rounded-xl transition-all shadow-2xs text-left"
              >
                ✅ Scan Valide (NKA-7821-9904)
              </button>
              <button
                onClick={() => handleProcessScan('NKA-7821-9904')}
                className="bg-white hover:bg-red-50 border border-zinc-200 text-red-800 text-xs font-bold py-2 px-3 rounded-xl transition-all shadow-2xs text-left"
              >
                ⚠️ Scan Doublon (Répéter)
              </button>
              <button
                onClick={() => handleProcessScan('NKA-INVALID-9999')}
                className="bg-white hover:bg-amber-50 border border-zinc-200 text-amber-900 text-xs font-bold py-2 px-3 rounded-xl transition-all shadow-2xs text-left"
              >
                ❌ Code Invalide (Inconnu)
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Recent Scans Session Log (Last 10 Scans - Transient Local State) */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-extrabold text-sm text-zinc-900 flex items-center gap-2">
                <span>Historique Récent des Scans (10 Derniers)</span>
                {recentScans.length > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {recentScans.length}
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-500">
                Journal temporaire de session pour revue immédiate par l'agent de contrôle — effacé à la fermeture du guichet.
              </p>
            </div>
          </div>
          {recentScans.length > 0 && (
            <button
              onClick={() => setRecentScans([])}
              className="text-xs text-zinc-400 hover:text-red-600 flex items-center gap-1 font-semibold transition-colors"
              title="Effacer le journal temporaire de la session"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Effacer</span>
            </button>
          )}
        </div>

        {recentScans.length === 0 ? (
          <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 text-zinc-400 text-xs">
            Aucun scan effectué durant cette session. Les 10 derniers billets vérifiés s'afficheront ici en direct.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {recentScans.map((log) => (
              <div
                key={log.id}
                className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-zinc-50/50 px-2 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold text-white shadow-xs ${
                      log.success
                        ? 'bg-emerald-600'
                        : log.errorType === 'ALREADY_USED'
                        ? 'bg-red-600'
                        : 'bg-amber-500'
                    }`}
                  >
                    {log.success ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : log.errorType === 'ALREADY_USED' ? (
                      <ShieldX className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-zinc-900">{log.code}</span>
                      {log.buyerName && (
                        <span className="text-zinc-600 font-medium text-[11px] bg-zinc-100 px-2 py-0.5 rounded-md">
                          {log.buyerName}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500">{log.statusText}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono shrink-0">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
