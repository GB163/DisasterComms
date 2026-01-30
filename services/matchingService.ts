
import { HelpRequest, ResourceType, UrgencyLevel, HelpMode } from '../types';
import { riskService } from './riskService';

// The in-memory registry of all active help requests and offers
let activeRegistry: HelpRequest[] = [
  { 
    id: 'H1', userId: 'Volunteer: Amit', mode: 'CAN_HELP', resourceType: 'FOOD', urgency: 'STABLE', 
    latitude: 28.6145, longitude: 77.2085, anonymous: false, phone: '+919876543210', 
    sharePreference: 'IMMEDIATE', callStatus: 'IDLE', timestamp: new Date().toISOString(), status: 'PENDING' 
  },
  { 
    id: 'H2', userId: 'Victim: Suman', mode: 'NEED_HELP', resourceType: 'MEDICAL', urgency: 'CRITICAL', 
    latitude: 28.6130, longitude: 77.2100, anonymous: true, phone: '+919000011111', 
    sharePreference: 'ON_MATCH', callStatus: 'IDLE', timestamp: new Date().toISOString(), status: 'PENDING' 
  },
  { 
    id: 'H3', userId: 'Helper: NGO Seva', mode: 'CAN_HELP', resourceType: 'WATER', urgency: 'STABLE', 
    latitude: 28.6160, longitude: 77.2110, anonymous: false, phone: '+918888877777', 
    sharePreference: 'IMMEDIATE', callStatus: 'IDLE', timestamp: new Date().toISOString(), status: 'PENDING' 
  }
];

export const matchingService = {
  /**
   * Returns all active participants in the community matching system.
   */
  getCommunityEntities: (): HelpRequest[] => {
    return activeRegistry;
  },

  /**
   * Adds a new user request to the live registry.
   */
  registerUser: (request: HelpRequest) => {
    activeRegistry = [request, ...activeRegistry];
    return activeRegistry;
  },

  /**
   * Core Matching Engine: Finds the closest person of the opposite role for the same resource.
   */
  findMatches: (userRequest: HelpRequest): HelpRequest[] => {
    const targetMode: HelpMode = userRequest.mode === 'NEED_HELP' ? 'CAN_HELP' : 'NEED_HELP';
    
    return activeRegistry
      .filter(e => 
        e.id !== userRequest.id && 
        e.mode === targetMode && 
        e.resourceType === userRequest.resourceType &&
        e.status !== 'RESOLVED'
      )
      .map(e => ({
        ...e,
        distance: riskService.calculateDistance(userRequest.latitude, userRequest.longitude, e.latitude, e.longitude)
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  },

  /**
   * Masks phone numbers for initial privacy.
   */
  maskPhone: (phone: string | undefined): string => {
    if (!phone) return 'Hidden';
    const cleaned = phone.replace(/\s+/g, '');
    if (cleaned.length < 7) return cleaned;
    return cleaned.substring(0, 3) + ' XXX-XX ' + cleaned.substring(cleaned.length - 3);
  }
};
