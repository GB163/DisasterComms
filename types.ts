
export type Priority = 'CRITICAL' | 'MEDIUM' | 'SAFE-ISH';
export type NetworkStatus = 'ONLINE' | 'LOW' | 'OFFLINE';
export type RiskType = 'FLOOD' | 'RIOT' | 'ACCIDENT';
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type EntityType = 'POLICE' | 'HOSPITAL' | 'AMBULANCE' | 'USER' | 'COAST_GUARD';
export type EntityStatus = 'AVAILABLE' | 'EN_ROUTE' | 'ARRIVED' | 'BUSY';

export type HelpMode = 'NEED_HELP' | 'CAN_HELP';
export type ResourceType = 'FOOD' | 'WATER' | 'SHELTER' | 'MEDICAL' | 'TRANSPORT';
export type UrgencyLevel = 'CRITICAL' | 'MODERATE' | 'STABLE';

export type CallStatus = 'IDLE' | 'INITIATED' | 'COMPLETED' | 'NO_RESPONSE';
export type SharePreference = 'IMMEDIATE' | 'ON_MATCH';

export interface HelpRequest {
  id: string;
  userId: string;
  mode: HelpMode;
  resourceType: ResourceType;
  urgency: UrgencyLevel;
  latitude: number;
  longitude: number;
  anonymous: boolean;
  phone?: string;
  sharePreference: SharePreference;
  callStatus: CallStatus;
  timestamp: string;
  status: 'PENDING' | 'MATCHED' | 'RESOLVED';
  matchedWith?: string;
  // Added optional distance property for community matching results
  distance?: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  phoneNumber: string;
  emergencyContacts: string[]; // Added for Broadcast system
}

export interface SOSData {
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  priority: Priority;
  network_status: NetworkStatus;
  timestamp: string;
  danger_zone_entry?: string;
}

export interface Responder {
  id: string;
  type: EntityType;
  name: string;
  lat: number;
  lng: number;
  status: EntityStatus;
  distance?: number;
  eta?: number;
}

export interface DangerZone {
  id: string;
  type: RiskType;
  level: RiskLevel;
  lat: number;
  lng: number;
  radius: number;
  description: string;
}

export interface SafePlace {
  id: string;
  type: 'HOSPITAL' | 'POLICE' | 'SHELTER';
  name: string;
  lat: number;
  lng: number;
}

export interface SOSPayload {
  id: string;
  userId: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  status: string;
}

export type SOSStatus = 
  | 'idle' 
  | 'requesting-location' 
  | 'location-captured' 
  | 'broadcasting' // New state
  | 'sending' 
  | 'success' 
  | 'failed-offline' 
  | 'error';
