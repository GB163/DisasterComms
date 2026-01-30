
import React from 'react';
import { SOSStatus } from '../types';

interface StatusDisplayProps {
  status: SOSStatus;
  errorMessage?: string;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ status, errorMessage }) => {
  if (status === 'idle') return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'requesting-location':
        return {
          text: 'Requesting GPS location...',
          icon: 'fa-location-crosshairs text-blue-500',
          bg: 'bg-blue-50 border-blue-200'
        };
      case 'location-captured':
        return {
          text: 'Location captured securely',
          icon: 'fa-location-dot text-green-600',
          bg: 'bg-green-50 border-green-200'
        };
      case 'sending':
        return {
          text: 'Transmitting emergency alert...',
          icon: 'fa-signal text-amber-500',
          bg: 'bg-amber-50 border-amber-200'
        };
      case 'success':
        return {
          text: 'SOS alert sent successfully!',
          icon: 'fa-circle-check text-green-600',
          bg: 'bg-green-100 border-green-300'
        };
      case 'failed-offline':
        return {
          text: 'You are offline. Alert saved and will send when signal returns.',
          icon: 'fa-cloud-arrow-up text-amber-600',
          bg: 'bg-amber-100 border-amber-300'
        };
      case 'error':
        return {
          text: errorMessage || 'Something went wrong. Please try again.',
          icon: 'fa-circle-exclamation text-red-600',
          bg: 'bg-red-100 border-red-300'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <div className={`w-full p-4 rounded-xl border-2 flex items-center space-x-4 shadow-sm animate-in fade-in duration-300 ${config.bg}`}>
      <div className="flex-shrink-0">
        <i className={`fa-solid ${config.icon} text-2xl`}></i>
      </div>
      <div className="flex-1 font-bold text-slate-800 uppercase tracking-wide text-sm">
        {config.text}
      </div>
    </div>
  );
};
