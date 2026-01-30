
// Removed unused UserProfile import
import { SOSPayload } from '../types';

const STORAGE_KEY = 'guardian_sos_queue';

export const sosService = {
  /**
   * Captures the current GPS location.
   */
  getLocation: (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported by browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  },

  /**
   * Mocks sending SOS data to a backend.
   */
  sendSOS: async (payload: SOSPayload): Promise<void> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate API call
    console.log('Sending SOS payload to backend:', JSON.stringify(payload, null, 2));
    
    // Random failure simulation (e.g., 10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Network timeout');
    }

    if (!navigator.onLine) {
      throw new Error('OFFLINE');
    }
  },

  /**
   * Saves SOS to LocalStorage if offline.
   */
  queueOfflineSOS: (payload: SOSPayload) => {
    const queue = sosService.getQueue();
    queue.push({ ...payload, status: 'pending' });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  },

  /**
   * Retrieves pending SOS alerts from storage.
   */
  getQueue: (): SOSPayload[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  /**
   * Clears a specific alert from the queue.
   */
  removeFromQueue: (id: string) => {
    const queue = sosService.getQueue().filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  },

  /**
   * Formats a timestamp into a readable string.
   */
  formatDate: (ts: number) => {
    return new Date(ts).toLocaleString();
  }
};
