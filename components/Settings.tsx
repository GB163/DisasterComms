
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface SettingsProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ profile, onUpdate, isOpen, onClose }) => {
  const [newContact, setNewContact] = useState('');

  if (!isOpen) return null;

  const addContact = () => {
    if (newContact.trim()) {
      onUpdate({
        ...profile,
        emergencyContacts: [...(profile.emergencyContacts || []), newContact.trim()]
      });
      setNewContact('');
    }
  };

  const removeContact = (index: number) => {
    const updated = [...profile.emergencyContacts];
    updated.splice(index, 1);
    onUpdate({ ...profile, emergencyContacts: updated });
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-user-shield text-blue-500"></i>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Identity & Safety</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>
        </div>
        
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Personal Details</label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => onUpdate({ ...profile, fullName: e.target.value })}
              className="w-full p-4 bg-slate-900 border-2 border-white/5 focus:border-blue-500 rounded-2xl outline-none font-bold text-white transition-all"
              placeholder="Full Name"
            />
            <input
              type="tel"
              value={profile.phoneNumber}
              onChange={(e) => onUpdate({ ...profile, phoneNumber: e.target.value })}
              className="w-full p-4 bg-slate-900 border-2 border-white/5 focus:border-blue-500 rounded-2xl outline-none font-bold text-white transition-all"
              placeholder="Your Phone Number"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black text-red-500 uppercase tracking-widest">Emergency Broadcast Contacts</label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                className="flex-1 p-4 bg-slate-900 border-2 border-white/5 focus:border-red-500 rounded-2xl outline-none font-bold text-white transition-all"
                placeholder="+91 XXXX"
              />
              <button onClick={addContact} className="px-6 bg-red-600 text-white rounded-2xl font-black hover:bg-red-500 transition-all">
                ADD
              </button>
            </div>
            
            <div className="space-y-2 mt-4">
              {profile.emergencyContacts?.map((contact, idx) => (
                <div key={idx} className="flex items-center justify-between glass p-4 rounded-2xl border border-white/5">
                  <span className="text-sm font-black text-white">{contact}</span>
                  <button onClick={() => removeContact(idx)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-all">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              ))}
              {(!profile.emergencyContacts || profile.emergencyContacts.length === 0) && (
                <p className="text-[10px] text-slate-600 font-bold italic text-center p-4 border border-dashed border-white/10 rounded-2xl">
                  No emergency contacts added yet.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl mt-4 shadow-xl hover:bg-blue-500 transition-all uppercase tracking-tighter"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
