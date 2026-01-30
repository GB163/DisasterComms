
import React, { useState, useEffect, useCallback } from 'react';
import { SOSButton } from './components/SOSButton';
import { StatusDisplay } from './components/StatusDisplay';
import { Settings } from './components/Settings';
import { UserProfile, SOSStatus, SOSPayload } from './types';
import { sosService } from './services/sosService';

const App: React.FC = () => {
  const [status, setStatus] = useState<SOSStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(0);
  
  // Profile state with default/local persistence logic
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('guardian_profile');
    return saved ? JSON.parse(saved) : {
      id: `USR-${Math.floor(Math.random() * 1000000)}`,
      fullName: 'Anonymous User',
      phoneNumber: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('guardian_profile', JSON.stringify(profile));
  }, [profile]);

  // Online status listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial queue check
    setQueueCount(sosService.getQueue().length);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Background sync simulation when back online
  useEffect(() => {
    if (isOnline && queueCount > 0) {
      const syncQueue = async () => {
        const queue = sosService.getQueue();
        for (const item of queue) {
          try {
            await sosService.sendSOS(item);
            sosService.removeFromQueue(item.id);
          } catch (e) {
            console.error('Failed to sync item:', item.id);
          }
        }
        setQueueCount(sosService.getQueue().length);
      };
      syncQueue();
    }
  }, [isOnline, queueCount]);

  const triggerSOS = useCallback(async () => {
    setErrorMessage('');
    setStatus('requesting-location');

    try {
      // 1. Capture Location
      const pos = await sosService.getLocation();
      setStatus('location-captured');

      // 2. Build Payload
      const payload: SOSPayload = {
        id: `SOS-${Date.now()}`,
        userId: profile.id,
        phoneNumber: profile.phoneNumber,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        timestamp: Date.now(),
        status: 'pending'
      };

      // 3. Send Alert
      setStatus('sending');
      if (navigator.onLine) {
        await sosService.sendSOS(payload);
        setStatus('success');
      } else {
        sosService.queueOfflineSOS(payload);
        setQueueCount(prev => prev + 1);
        setStatus('failed-offline');
      }

      // 4. Auto-reset to idle after success
      setTimeout(() => setStatus('idle'), 4000);

    } catch (error: any) {
      console.error('SOS Trigger Error:', error);
      let msg = 'Emergency alert failed.';
      
      if (error.code === 1) msg = 'Location access denied. Please enable GPS.';
      else if (error.code === 2) msg = 'GPS signal unavailable.';
      else if (error.code === 3) msg = 'Location request timed out.';
      else if (error.message === 'OFFLINE') msg = 'Network connection lost.';
      
      setErrorMessage(msg);
      setStatus('error');
    }
  }, [profile]);

  return (
    <div className="min-h-screen flex flex-col max-w-xl mx-auto border-x border-slate-200 bg-white">
      {/* Header */}
      <header className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-200">
            <i className="fa-solid fa-shield-heart text-white text-xl"></i>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tighter">GUARDIAN<span className="text-red-600">SOS</span></h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <button onClick={() => setIsSettingsOpen(true)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
            <i className="fa-solid fa-user-gear"></i>
          </button>
        </div>
      </header>

      {/* Main SOS Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 space-y-12">
        <SOSButton 
          onTrigger={triggerSOS} 
          status={status} 
          disabled={!profile.phoneNumber} 
        />
        
        <div className="w-full max-w-sm">
          <StatusDisplay status={status} errorMessage={errorMessage} />
          
          {!profile.phoneNumber && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start space-x-3">
              <i className="fa-solid fa-circle-info text-blue-500 mt-1"></i>
              <div className="text-xs text-blue-800 font-medium leading-relaxed">
                <span className="font-black">REQUIRED:</span> Please tap the user icon to set your phone number before using the SOS trigger.
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer / Info Panel */}
      <footer className="p-6 bg-slate-50 border-t border-slate-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Queue Status</div>
            <div className="text-2xl font-black text-slate-900">{queueCount}</div>
            <div className="text-[10px] font-medium text-slate-500">Pending Alerts</div>
          </div>
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Profile Info</div>
            <div className="text-sm font-black text-slate-900 truncate">{profile.fullName}</div>
            <div className="text-[10px] font-medium text-slate-500 truncate">{profile.phoneNumber || 'Not set'}</div>
          </div>
        </div>
        
        <p className="mt-6 text-[10px] text-center text-slate-400 font-medium leading-relaxed uppercase tracking-widest">
          In case of life-threatening emergencies, always dial local emergency services (e.g. 911) if possible.
        </p>
      </footer>

      <Settings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        profile={profile} 
        onUpdate={setProfile} 
      />
    </div>
  );
};

export default App;
