
import { Responder, EntityType, Priority } from '../types';
import { riskService } from './riskService';

export const responderService = {
  // Mock data for nearby responders centered around Delhi for demo
  getNearbyResponders: (victimLat: number, victimLng: number, priority: Priority): Responder[] => {
    const radius = priority === 'CRITICAL' ? 5 : 2; // km
    
    const pool: {type: EntityType, name: string, offset: number[]}[] = [
      { type: 'POLICE', name: 'Unit Delta-9', offset: [0.005, 0.005] },
      { type: 'AMBULANCE', name: 'LifeSupport 02', offset: [-0.008, 0.002] },
      { type: 'HOSPITAL', name: 'Apollo Emergency', offset: [0.015, -0.010] },
      { type: 'COAST_GUARD', name: 'CG Sentinel', offset: [0.020, 0.020] },
      { type: 'USER', name: 'Volunteer: Rahul', offset: [-0.003, -0.004] },
      { type: 'AMBULANCE', name: 'RedCross 11', offset: [0.010, 0.008] },
    ];

    return pool.map((item, idx) => {
      const lat = victimLat + item.offset[0];
      const lng = victimLng + item.offset[1];
      const dist = riskService.calculateDistance(victimLat, victimLng, lat, lng);
      
      return {
        id: `RES_${idx}`,
        type: item.type,
        name: item.name,
        lat,
        lng,
        status: 'AVAILABLE',
        distance: dist,
        eta: Math.round(dist * 4) + 2 // Estimated 4 mins per km + 2 min prep
      };
    });
  }
};
