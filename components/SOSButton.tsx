
import React, { useState, useEffect, useRef } from 'react';
import { SOSStatus } from '../types';

interface SOSButtonProps {
  onTrigger: () => void;
  status: SOSStatus;
  disabled: boolean;
}

const HOLD_DURATION = 1500; // ms to hold for confirmation

export const SOSButton: React.FC<SOSButtonProps> = ({ onTrigger, status, disabled }) => {
  const [holdProgress, setHoldProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef<number | null>(null);

  const startHolding = () => {
    if (disabled || status !== 'idle') return;
    setIsPressing(true);
    setHoldProgress(0);
    
    const startTime = Date.now();
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        clearTimer();
        setIsPressing(false);
        setHoldProgress(0);
        onTrigger();
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      }
    }, 50);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPressing(false);
    setHoldProgress(0);
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const getButtonClass = () => {
    if (status === 'requesting-location' || status === 'location-captured' || status === 'sending') {
      return 'bg-[#522B5B] scale-95 shadow-inner cursor-wait';
    }
    if (status === 'success') {
      return 'bg-[#522B5B] scale-100 shadow-lg';
    }
    if (status === 'failed-offline' || status === 'error') {
      return 'bg-[#2B124C] scale-100 shadow-lg';
    }
    return 'bg-[#854F6C] hover:opacity-90 active:scale-90 sos-pulse';
  };

  const getIcon = () => {
    if (status === 'requesting-location' || status === 'sending') {
      return <i className="fa-solid fa-spinner fa-spin text-5xl"></i>;
    }
    if (status === 'success') {
      return <i className="fa-solid fa-check text-5xl"></i>;
    }
    if (status === 'location-captured') {
      return <i className="fa-solid fa-location-dot text-5xl"></i>;
    }
    return <span className="text-6xl font-black tracking-tighter">SOS</span>;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 w-full">
      <div className="relative w-64 h-64 md:w-80 md:h-80">
        {/* Hold Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="48%"
            fill="transparent"
            stroke="#522B5B"
            strokeWidth="8"
          />
          <circle
            cx="50%"
            cy="50%"
            r="48%"
            fill="transparent"
            stroke="#854F6C"
            strokeWidth="8"
            strokeDasharray="301.59"
            strokeDashoffset={301.59 - (301.59 * holdProgress) / 100}
            strokeLinecap="round"
            className="transition-all duration-75"
          />
        </svg>

        {/* Main SOS Button */}
        <button
          onPointerDown={startHolding}
          onPointerUp={clearTimer}
          onPointerLeave={clearTimer}
          disabled={disabled || (status !== 'idle' && status !== 'error')}
          className={`absolute inset-4 rounded-full flex items-center justify-center text-[#FBE4D8] transition-all duration-300 transform outline-none select-none ${getButtonClass()}`}
        >
          {getIcon()}
        </button>
      </div>

      <p className="text-[#DFB6B2] font-medium text-center px-4">
        {isPressing ? "HOLDING TO TRIGGER..." : "HOLD BUTTON FOR 2 SECONDS TO ALERT EMERGENCY SERVICES"}
      </p>
    </div>
  );
};
