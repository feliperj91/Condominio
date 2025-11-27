export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  RESIDENT = 'RESIDENT',
  VISITOR = 'VISITOR'
}

export enum IdentificationType {
  NUMERIC = 'NUMERIC', // 101, 102
  ALPHANUMERIC = 'ALPHANUMERIC', // 101A, 101B
}

export interface Unit {
  id: string;
  block: string;
  number: string;
  floor: number;
}

export interface Person {
  id: string;
  name: string;
  role: Role;
  email: string;
  phone: string;
  unitId?: string; // If resident
  avatarUrl?: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  color: string;
  ownerId?: string; // If registered
  ownerName?: string; // If visitor
  unitId?: string; // If resident
}

export interface ParkingSpot {
  id: string;
  code: string;
  isOccupied: boolean;
  currentVehicleId?: string;
  type: 'RESIDENT' | 'VISITOR' | 'DISABLED';
}

export interface Package {
  id: string;
  trackingCode: string; // or description
  receivedAt: string; // ISO Date
  receivedByStaffId: string;
  unitId: string;
  recipientName: string; // Specific person in unit
  location: string; // e.g., "Reception", "Mailbox A"
  status: 'WAITING_PICKUP' | 'DELIVERED';
  pickedUpAt?: string;
}

export interface AccessLog {
  id: string;
  timestamp: string;
  type: 'ENTRY' | 'EXIT';
  vehiclePlate: string;
  isRegistered: boolean;
  spotId?: string;
  notes?: string;
}

export interface DashboardStats {
  occupancyRate: number;
  packagesPending: number;
  activeVisitors: number;
  totalResidents: number;
}

export interface RolePermission {
  id: string;
  role: Role;
  resource: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}