
import { DangerZone, SafePlace } from '../types';

export const riskService = {
  /**
   * Haversine formula to calculate distance between two points in KM
   */
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  /**
   * Mock Danger Zones near common testing areas (e.g. city centers)
   */
  getDangerZones: (): DangerZone[] => [
    { id: 'DZ1', type: 'FLOOD', level: 'HIGH', lat: 28.6139, lng: 77.2090, radius: 800, description: 'Yamuna River Overflow Risk' },
    { id: 'DZ2', type: 'RIOT', level: 'HIGH', lat: 28.6250, lng: 77.2150, radius: 500, description: 'Civil Unrest Flagged' },
    { id: 'DZ3', type: 'ACCIDENT', level: 'MEDIUM', lat: 28.6000, lng: 77.2000, radius: 300, description: 'High-Crash Intersection' }
  ],

  /**
   * Mock Safe Places
   */
  getSafePlaces: (): SafePlace[] => [
    { id: 'S1', type: 'HOSPITAL', name: 'City Central Hospital', lat: 28.6100, lng: 77.2300 },
    { id: 'S2', type: 'POLICE', name: 'Metro Police HQ', lat: 28.6300, lng: 77.1900 },
    { id: 'S3', type: 'SHELTER', name: 'Community Safe Zone', lat: 28.5900, lng: 77.2100 }
  ],

  checkRisk: (userLat: number, userLng: number) => {
    const zones = riskService.getDangerZones();
    let activeRisk: DangerZone | null = null;
    
    zones.forEach(zone => {
      const dist = riskService.calculateDistance(userLat, userLng, zone.lat, zone.lng) * 1000; // to meters
      if (dist <= zone.radius) {
        activeRisk = zone;
      }
    });

    return activeRisk;
  }
};
