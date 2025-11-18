export interface Block {
  id: string;
  name: string;
}

export interface Apartment {
  id: string;
  number: string;
  blockId: string;
}

export interface Vehicle {
  id: string;
  model: string;
  plate: string;
}

export interface PersonRoles {
  isResident: boolean;
  isAdmin: boolean;
  isDoorman: boolean;
  isManager: boolean; // Síndico
  isServiceProvider: boolean;
}

export interface Person {
  id: string;
  name: string;
  email: string;
  phone: string;
  apartmentId?: string;
  vehicles: Vehicle[];
  roles: PersonRoles;
  isActive: boolean;
}


export enum PackageStatus {
  WaitingPickup = 'WAITING_PICKUP',
  Delivered = 'DELIVERED',
}

export interface Package {
  id:string;
  description: string;
  apartmentId: string;
  status: PackageStatus;
  receivedAt: Date;
  receivedBy: string;
  deliveredAt?: Date;
  deliveredTo?: string;
  personId?: string;
  recipientName?: string;
  recipientPhone?: string;
  location?: string;
}

export enum VehicleLogType {
  Resident = 'RESIDENT',
  Visitor = 'VISITOR',
  ServiceProvider = 'SERVICE_PROVIDER',
}

export enum VehicleLogStatus {
  Inside = 'INSIDE',
  Outside = 'OUTSIDE',
}

export interface VehicleLog {
  id: string;
  plate: string;
  model: string;
  type: VehicleLogType;
  contactPhone?: string;
  entryTime: Date;
  exitTime?: Date;
  status: VehicleLogStatus;
  personId?: string; 
  apartmentId: string; 
}


export type View = 'dashboard' | 'setup' | 'people' | 'packages' | 'vehicles' | 'access_control';