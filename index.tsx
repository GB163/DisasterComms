
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Priority, SOSData, DangerZone, SafePlace, Responder, 
  EntityType, HelpMode, ResourceType, UrgencyLevel, HelpRequest, SharePreference, SOSStatus, UserProfile
} from './types';
import { riskService } from './services/riskService';
import { responderService } from './services/responderService';
import { matchingService } from './services/matchingService';
import { sosService } from './services/sosService';
import { SOSButton } from './components/SOSButton';
import { Settings } from './components/Settings';

declare const L: any;

let globalSOSLogs: SOSData[] = [];

// --- Broadcast Modal Component ---
const BroadcastModal = ({ contacts, location, onCancel, onComplete }: { 
  contacts: string[], 
  location: { lat: number, lng: number }, 
  onCancel: () => void,
  onComplete: () => void
}) => {
  const time = new Date().toLocaleTimeString();
  const messageBody = `🚨 SOS ALERT FROM GUARDIAN\nI need immediate help.\n📍 Live Location:\nLat: ${location.lat.toFixed(5)}\nLng: ${location.lng.toFixed(5)}\nGoogle Maps: https://www.google.com/maps?q=${location.lat},${location.lng}\n⏰ Time: ${time}\n⚠️ Please contact emergency services!`;

  const sendSMS = (phone: string) => {
    window.location.href = `sms:${phone}?body=${encodeURIComponent(messageBody)}`;
  };

  const sendWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(messageBody)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#190019]/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-[#854F6C] rounded-full flex items-center justify-center mx-auto sos-pulse shadow-2xl">
            <i className="fa-solid fa-tower-broadcast text-3xl text-[#FBE4D8]"></i>
          </div>
          <h2 className="text-3xl font-black text-[#FBE4D8] tracking-tighter">EMERGENCY BROADCAST</h2>
          <p className="text-[#DFB6B2] text-[10px] font-black uppercase tracking-widest">Choose Contact to Alert</p>
        </div>

        <div className="glass p-6 rounded-3xl space-y-4 border-[#522B5B]">
          <label className="text-[10px] font-black text-[#DFB6B2] uppercase tracking-widest">Message Preview</label>
          <div className="bg-[#2B124C]/80 p-4 rounded-2xl border border-[#522B5B] text-[11px] font-mono text-[#DFB6B2] leading-relaxed max-h-40 overflow-y-auto">
            {messageBody}
          </div>
        </div>

        <div className="space-y-3">
          {contacts.map((phone, i) => (
            <div key={i} className="glass p-4 rounded-3xl flex items-center justify-between border-[#522B5B] hover:bg-[#522B5B]/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#522B5B] rounded-xl flex items-center justify-center text-[#DFB6B2]">
                  <i className="fa-solid fa-phone"></i>
                </div>
                <span className="text-sm font-black text-[#FBE4D8]">{phone}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => sendSMS(phone)} className="w-10 h-10 bg-[#854F6C] rounded-xl flex items-center justify-center text-[#FBE4D8] shadow-lg hover:scale-110 transition-transform">
                  <i className="fa-solid fa-comment-sms"></i>
                </button>
                <button onClick={() => sendWhatsApp(phone)} className="w-10 h-10 bg-[#522B5B] rounded-xl flex items-center justify-center text-[#FBE4D8] shadow-lg hover:scale-110 transition-transform">
                  <i className="fa-brands fa-whatsapp"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-4 bg-[#2B124C] text-[#DFB6B2] font-black rounded-2xl hover:text-[#FBE4D8] transition-all uppercase tracking-tighter">Cancel</button>
          <button onClick={onComplete} className="flex-1 py-4 bg-[#854F6C] text-[#FBE4D8] font-black rounded-2xl shadow-xl hover:opacity-90 transition-all uppercase tracking-tighter">I'm Safe Now</button>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---
const ResourceIcon = ({ type, size = "text-xl" }: { type: ResourceType, size?: string }) => {
  const icons = {
    FOOD: 'fa-bowl-rice',
    WATER: 'fa-droplet',
    SHELTER: 'fa-house-chimney',
    MEDICAL: 'fa-hand-holding-medical',
    TRANSPORT: 'fa-car'
  };
  return <i className={`fa-solid ${icons[type]} ${size}`}></i>;
};

// --- Community View ---
const CommunityView = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [mode, setMode] = useState<HelpMode | null>(null);
  const [resource, setResource] = useState<ResourceType | null>(null);
  const [phone, setPhone] = useState('');
  const [matches, setMatches] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [myRequest, setMyRequest] = useState<HelpRequest | null>(null);

  const startMatching = async () => {
    if (!phone || phone.length < 10) {
      alert("Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    setStep(3);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const newReq: HelpRequest = {
        id: `REQ_${Date.now()}`,
        userId: mode === 'CAN_HELP' ? 'Volunteer' : 'Victim',
        mode: mode!,
        resourceType: resource!,
        urgency: 'MODERATE',
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        anonymous: false,
        phone: phone,
        sharePreference: 'IMMEDIATE',
        callStatus: 'IDLE',
        timestamp: new Date().toISOString(),
        status: 'PENDING'
      };

      matchingService.registerUser(newReq);
      setMyRequest(newReq);
      
      const foundMatches = matchingService.findMatches(newReq);
      setMatches(foundMatches);
      setLoading(false);
      setStep(4);
    }, (err) => {
      alert("Location access is required for matching nearby users.");
      setLoading(false);
      setStep(2);
    });
  };

  return (
    <div className="min-h-[85vh] p-6 flex flex-col justify-center animate-in fade-in duration-500">
      {step === 1 && (
        <div className="space-y-6 text-center max-w-sm mx-auto w-full">
          <h2 className="text-4xl font-black text-[#FBE4D8] tracking-tighter mb-4">COMMUNITY HELP</h2>
          <p className="text-[#DFB6B2] text-xs font-bold uppercase tracking-widest mb-8">Role Selection</p>
          <div className="grid grid-cols-1 gap-4">
            <button onClick={() => { setMode('NEED_HELP'); setStep(2); }} className="p-8 bg-[#854F6C] rounded-3xl flex items-center justify-between group border-b-8 border-[#522B5B] transition-all">
              <div className="text-left">
                <span className="text-[10px] font-black text-[#FBE4D8]/80 uppercase">Crisis</span>
                <h3 className="text-xl font-black text-[#FBE4D8]">I NEED HELP</h3>
              </div>
              <i className="fa-solid fa-hand-holding-heart text-3xl text-[#FBE4D8]"></i>
            </button>
            <button onClick={() => { setMode('CAN_HELP'); setStep(2); }} className="p-8 bg-[#522B5B] rounded-3xl flex items-center justify-between group border-b-8 border-[#2B124C] transition-all">
              <div className="text-left">
                <span className="text-[10px] font-black text-[#FBE4D8]/80 uppercase">Support</span>
                <h3 className="text-xl font-black text-[#FBE4D8]">I CAN HELP</h3>
              </div>
              <i className="fa-solid fa-hands-holding-circle text-3xl text-[#FBE4D8]"></i>
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-in slide-in-from-right-8 max-w-sm mx-auto w-full">
          <button onClick={() => setStep(1)} className="text-[#DFB6B2] font-bold uppercase text-[10px] flex items-center gap-2">
            <i className="fa-solid fa-arrow-left"></i> Back
          </button>
          <h3 className="text-2xl font-black text-[#FBE4D8]">DETAILS REQUIRED</h3>
          
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-[#DFB6B2] uppercase tracking-widest">Resource Type</label>
            <div className="grid grid-cols-2 gap-3">
              {(['FOOD', 'WATER', 'SHELTER', 'MEDICAL', 'TRANSPORT'] as ResourceType[]).map(r => (
                <button key={r} onClick={() => setResource(r)} className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${resource === r ? 'bg-[#854F6C] border-[#DFB6B2] text-[#FBE4D8]' : 'glass border-[#522B5B] text-[#DFB6B2]'}`}>
                  <ResourceIcon type={r} size="text-xl" />
                  <span className="font-black text-[9px] tracking-widest">{r}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-[#DFB6B2] uppercase tracking-widest">Phone Number (For Direct Calling)</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              className="w-full bg-[#2B124C] border-2 border-[#522B5B] rounded-2xl p-4 text-[#FBE4D8] font-black outline-none focus:border-[#854F6C] transition-all"
            />
          </div>

          <button 
            disabled={!resource || !phone}
            onClick={startMatching} 
            className="w-full py-5 bg-[#854F6C] disabled:opacity-50 text-[#FBE4D8] font-black rounded-3xl shadow-2xl hover:opacity-90 transition-all uppercase tracking-tighter"
          >
            Find Nearby Match
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="w-24 h-24 border-8 border-[#854F6C] border-t-transparent rounded-full animate-spin"></div>
          <h3 className="text-2xl font-black text-[#FBE4D8]">SEARCHING...</h3>
          <p className="text-[#DFB6B2] text-xs font-bold uppercase tracking-widest">Scanning nearby radius for {resource}</p>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 max-w-md mx-auto w-full">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-[#FBE4D8]">NEARBY MATCHES</h3>
            <button onClick={() => setStep(1)} className="text-[#DFB6B2] text-[10px] font-black uppercase">Close</button>
          </div>

          {matches.length > 0 ? (
            <div className="space-y-4">
              {matches.map((m, i) => (
                <div key={i} className="glass p-6 rounded-3xl border-l-8 border-[#854F6C] animate-in fade-in slide-in-from-right-4" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-black text-[#DFB6B2] uppercase tracking-widest">{m.mode.replace('_', ' ')}</span>
                      <h4 className="text-lg font-black text-[#FBE4D8]">{m.userId}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-[#FBE4D8]">{m.distance?.toFixed(2)} km</p>
                      <p className="text-[8px] font-bold text-[#DFB6B2] uppercase">Away</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <a 
                      href={`tel:${m.phone}`}
                      className="flex-1 bg-[#522B5B] hover:opacity-90 text-[#FBE4D8] py-4 rounded-2xl font-black text-center flex items-center justify-center gap-2 transition-all shadow-lg"
                    >
                      <i className="fa-solid fa-phone"></i> CALL NOW
                    </a>
                    <button className="w-16 h-14 glass rounded-2xl flex items-center justify-center text-[#FBE4D8] hover:bg-[#522B5B]/50 transition-all">
                      <i className="fa-solid fa-location-dot"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass p-12 rounded-3xl text-center space-y-4 border border-dashed border-[#522B5B]">
              <i className="fa-solid fa-magnifying-glass-location text-4xl text-[#522B5B]"></i>
              <p className="text-[#DFB6B2] text-sm font-bold uppercase leading-relaxed">No direct matches found yet.<br/>We've listed your request in the dashboard.</p>
              <button onClick={() => setStep(1)} className="text-[#854F6C] font-black text-xs uppercase underline">Try different role</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- User View ---
const UserDeviceView = ({ profile, onOpenSettings, onSwitchToCommunity }: { profile: UserProfile, onOpenSettings: () => void, onSwitchToCommunity: () => void }) => {
  const [status, setStatus] = useState<SOSStatus>('idle');
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [showBroadcast, setShowBroadcast] = useState(false);

  const triggerSOS = async () => {
    if (!profile.emergencyContacts || profile.emergencyContacts.length === 0) {
      alert("⚠️ ACTION REQUIRED: No Emergency Contacts Found.\nPlease add contacts in settings before sending SOS.");
      onOpenSettings();
      return;
    }

    setStatus('requesting-location');
    try {
      const pos = await sosService.getLocation();
      const currentCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCoords(currentCoords);
      setStatus('location-captured');

      globalSOSLogs = [{
        user_id: profile.fullName || "ME_SOS",
        latitude: currentCoords.lat,
        longitude: currentCoords.lng,
        accuracy: pos.coords.accuracy,
        priority: 'CRITICAL',
        network_status: 'ONLINE',
        timestamp: new Date().toISOString()
      }, ...globalSOSLogs];

      setTimeout(() => {
        setStatus('broadcasting');
        setShowBroadcast(true);
      }, 1000);

    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[85vh] px-6 text-center space-y-12 transition-all ${status === 'broadcasting' ? 'bg-[#854F6C]/20' : ''}`}>
      {showBroadcast && coords && (
        <BroadcastModal 
          contacts={profile.emergencyContacts} 
          location={coords} 
          onCancel={() => { setShowBroadcast(false); setStatus('idle'); }}
          onComplete={() => { setShowBroadcast(false); setStatus('success'); setTimeout(() => setStatus('idle'), 2000); }}
        />
      )}

      <div className="space-y-2">
        <h2 className="text-4xl font-black text-[#FBE4D8] tracking-tighter">GUARDIAN SOS</h2>
        <div className="flex items-center justify-center gap-2">
          <span className={`w-2 h-2 rounded-full ${status === 'idle' ? 'bg-[#522B5B]' : 'bg-[#854F6C] animate-ping'}`}></span>
          <p className="text-[#DFB6B2] text-[10px] font-black uppercase tracking-[0.3em]">
            {status === 'idle' ? 'Ready to Assist' : status.replace('-', ' ')}
          </p>
        </div>
      </div>

      <SOSButton 
        onTrigger={triggerSOS} 
        status={status} 
        disabled={status !== 'idle' && status !== 'error'} 
      />

      <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
        <button onClick={onSwitchToCommunity} className="group flex items-center gap-3 glass px-8 py-5 rounded-3xl hover:bg-[#522B5B]/30 transition-all border-[#522B5B]">
          <div className="bg-[#854F6C]/30 p-2 rounded-xl text-[#DFB6B2] group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-people-group"></i>
          </div>
          <div className="text-left">
            <h4 className="text-xs font-black text-[#FBE4D8] uppercase">Community Help</h4>
            <p className="text-[9px] text-[#DFB6B2] font-bold">Matching Engine active</p>
          </div>
        </button>
      </div>
    </div>
  );
};

// --- Dashboard View ---
const DashboardView = () => {
  const mapRef = useRef<any>(null);
  const markers = useRef<Map<string, any>>(new Map());
  const [logs, setLogs] = useState<SOSData[]>([]);
  const [helpEvents, setHelpEvents] = useState<HelpRequest[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<HelpRequest | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map', { zoomControl: false }).setView([28.6139, 77.2090], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
    }
    const timer = setInterval(() => {
      setLogs([...globalSOSLogs]);
      setHelpEvents([...matchingService.getCommunityEntities()]);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Clear dead markers if they exist (Registry cleanup not fully implemented here for simplicity)
    
    logs.forEach(log => {
      if (!markers.current.has(log.user_id)) {
        const icon = L.divIcon({
          className: 'custom-icon',
          html: `<div class="w-10 h-10 bg-[#854F6C] rounded-full border-4 border-[#FBE4D8] flex items-center justify-center sos-pulse shadow-2xl"><i class="fa-solid fa-person-burst text-[#FBE4D8] text-xs"></i></div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
        const marker = L.marker([log.latitude, log.longitude], { icon }).addTo(mapRef.current);
        markers.current.set(log.user_id, marker);
      }
    });

    helpEvents.forEach(ev => {
      if (!markers.current.has(ev.id)) {
        const color = ev.mode === 'NEED_HELP' ? '#854F6C' : '#522B5B';
        const icon = L.divIcon({
          className: 'custom-icon',
          html: `<div class="w-8 h-8 rounded-full border-2 border-[#FBE4D8] flex items-center justify-center shadow-lg" style="background: ${color}"><i class="fa-solid ${ev.mode === 'NEED_HELP' ? 'fa-hand-holding-heart' : 'fa-hands-holding-circle'} text-[8px] text-[#FBE4D8]"></i></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        const marker = L.marker([ev.latitude, ev.longitude], { icon }).addTo(mapRef.current);
        marker.on('click', () => setSelectedEntity(ev));
        markers.current.set(ev.id, marker);
      }
    });
  }, [logs, helpEvents]);

  return (
    <div className="flex flex-col md:flex-row h-full md:h-[88vh] gap-4 p-4">
      <div className="flex-1 glass p-2 rounded-3xl overflow-hidden relative min-h-[400px]">
        <div id="map" className="w-full h-full rounded-2xl"></div>
      </div>

      <div className="w-full md:w-80 flex flex-col gap-4">
        {selectedEntity ? (
          <div className="glass p-6 rounded-3xl space-y-6 animate-in slide-in-from-right-8">
            <div className="flex justify-between items-center">
              <span className={`text-[10px] font-black px-3 py-1 rounded-full text-[#FBE4D8] uppercase ${selectedEntity.mode === 'NEED_HELP' ? 'bg-[#854F6C]' : 'bg-[#522B5B]'}`}>
                {selectedEntity.mode.replace('_', ' ')}
              </span>
              <button onClick={() => setSelectedEntity(null)} className="text-[#DFB6B2]"><i className="fa-solid fa-xmark"></i></button>
            </div>
            
            <h3 className="text-xl font-black text-[#FBE4D8]">{selectedEntity.userId}</h3>
            
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-[#2B124C]/80 p-4 rounded-2xl border border-[#522B5B]">
                 <span className="text-[8px] font-black text-[#DFB6B2] uppercase tracking-widest">Resource</span>
                 <p className="text-xs font-black text-[#FBE4D8] mt-1 uppercase">{selectedEntity.resourceType}</p>
               </div>
               <div className="bg-[#2B124C]/80 p-4 rounded-2xl border border-[#522B5B]">
                 <span className="text-[8px] font-black text-[#DFB6B2] uppercase tracking-widest">Time</span>
                 <p className="text-xs font-black text-[#FBE4D8] mt-1">{new Date(selectedEntity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
               </div>
            </div>

            <a href={`tel:${selectedEntity.phone}`} className="w-full py-4 bg-[#522B5B] hover:opacity-90 text-[#FBE4D8] font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl">
               <i className="fa-solid fa-phone"></i> CALL NOW
            </a>
          </div>
        ) : (
          <div className="glass p-6 rounded-3xl space-y-4 flex-1">
            <h3 className="text-xs font-black text-[#DFB6B2] uppercase tracking-widest">Live Registry</h3>
            <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
               {helpEvents.map((ev, i) => (
                 <div key={i} onClick={() => setSelectedEntity(ev)} className="p-4 bg-[#522B5B]/20 border border-[#522B5B] rounded-2xl cursor-pointer hover:bg-[#522B5B]/40 transition-all">
                    <div className="flex justify-between items-center">
                       <span className={`text-[8px] font-black uppercase ${ev.mode === 'NEED_HELP' ? 'text-[#854F6C]' : 'text-[#DFB6B2]'}`}>{ev.mode}</span>
                       <span className="text-[8px] text-[#DFB6B2]">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm font-black text-[#FBE4D8] mt-1 uppercase">{ev.resourceType}</p>
                 </div>
               ))}
               {helpEvents.length === 0 && <p className="text-center text-[10px] text-[#522B5B] font-bold italic py-8">No community reports yet.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---
const App = () => {
  const [activeTab, setActiveTab] = useState<'SOS' | 'COMMUNITY' | 'CONTROL'>('SOS');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('guardian_profile_v2');
    return saved ? JSON.parse(saved) : {
      id: `USR-${Math.floor(Math.random() * 1000000)}`,
      fullName: 'Survivor 01',
      phoneNumber: '',
      emergencyContacts: []
    };
  });

  useEffect(() => {
    localStorage.setItem('guardian_profile_v2', JSON.stringify(profile));
  }, [profile]);

  return (
    <div className="min-h-screen flex flex-col bg-[#190019]">
      <header className="p-4 glass sticky top-0 z-[100] flex justify-between items-center px-6 border-b border-[#522B5B]">
        <div className="flex items-center gap-3">
          <div className="bg-[#854F6C] w-10 h-10 rounded-xl flex items-center justify-center shadow-2xl">
            <i className="fa-solid fa-house-medical text-[#FBE4D8]"></i>
          </div>
          <div>
            <h1 className="font-black text-lg text-[#FBE4D8] leading-none tracking-tighter">UNITY <span className="text-[#854F6C]">GUARDIAN</span></h1>
            <span className="text-[8px] font-bold text-[#DFB6B2] uppercase tracking-widest tracking-tighter">MATCHING SYSTEM ACTIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex bg-[#2B124C] p-1 rounded-2xl">
            <button onClick={() => setActiveTab('SOS')} className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'SOS' ? 'bg-[#522B5B] text-[#FBE4D8]' : 'text-[#DFB6B2]'}`}>SOS</button>
            <button onClick={() => setActiveTab('COMMUNITY')} className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'COMMUNITY' ? 'bg-[#522B5B] text-[#FBE4D8]' : 'text-[#DFB6B2]'}`}>COMMUNITY</button>
            <button onClick={() => setActiveTab('CONTROL')} className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'CONTROL' ? 'bg-[#522B5B] text-[#FBE4D8]' : 'text-[#DFB6B2]'}`}>DASHBOARD</button>
          </div>
          <button onClick={() => setIsSettingsOpen(true)} className="w-10 h-10 rounded-full bg-[#2B124C] flex items-center justify-center text-[#DFB6B2] hover:text-[#FBE4D8] transition-all border border-[#522B5B]">
            <i className="fa-solid fa-user-gear"></i>
          </button>
        </div>
      </header>

      <main className="flex-1">
        {activeTab === 'SOS' && <UserDeviceView profile={profile} onOpenSettings={() => setIsSettingsOpen(true)} onSwitchToCommunity={() => setActiveTab('COMMUNITY')} />}
        {activeTab === 'COMMUNITY' && <CommunityView onComplete={() => setActiveTab('CONTROL')} />}
        {activeTab === 'CONTROL' && <DashboardView />}
      </main>

      <div className="sm:hidden glass sticky bottom-0 z-[100] p-4 flex justify-around border-t border-[#522B5B]">
         <button onClick={() => setActiveTab('SOS')} className={`p-2 ${activeTab === 'SOS' ? 'text-[#854F6C]' : 'text-[#DFB6B2]'}`}><i className="fa-solid fa-satellite-dish text-xl"></i></button>
         <button onClick={() => setActiveTab('COMMUNITY')} className={`p-2 ${activeTab === 'COMMUNITY' ? 'text-[#854F6C]' : 'text-[#DFB6B2]'}`}><i className="fa-solid fa-handshake text-xl"></i></button>
         <button onClick={() => setActiveTab('CONTROL')} className={`p-2 ${activeTab === 'CONTROL' ? 'text-[#FBE4D8]' : 'text-[#DFB6B2]'}`}><i className="fa-solid fa-tower-observation text-xl"></i></button>
      </div>

      <Settings profile={profile} onUpdate={setProfile} isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
