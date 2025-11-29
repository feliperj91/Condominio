import { generateMockData } from './mockData';
import { Unit, Person, Vehicle, ParkingSpot, Package, AccessLog } from '../types';

const STORAGE_KEY = 'condo_manager_db_v1';

interface DB {
  units: Unit[];
  people: Person[];
  vehicles: Vehicle[];
  parkingSpots: ParkingSpot[];
  packages: Package[];
  logs: AccessLog[];
}

// Initialize DB if empty
const initDB = (): DB => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    return JSON.parse(existing);
  }
  const initial = generateMockData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

const getDB = (): DB => {
  return initDB();
};

const saveDB = (db: DB) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

// Simulate async delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const mockService = {
  // Units
  getUnits: async (): Promise<Unit[]> => {
    await delay();
    return getDB().units;
  },
  addUnit: async (unit: Unit): Promise<void> => {
    await delay();
    const db = getDB();
    db.units.push(unit);
    saveDB(db);
  },
  saveUnits: async (units: Unit[]): Promise<void> => {
    await delay();
    const db = getDB();
    db.units = units;
    saveDB(db);
  },

  // People
  getPeople: async (): Promise<Person[]> => {
    await delay();
    return getDB().people;
  },
  addPerson: async (person: Person): Promise<void> => {
    await delay();
    const db = getDB();
    db.people.push(person);
    saveDB(db);
  },
  updatePerson: async (person: Person): Promise<void> => {
    await delay();
    const db = getDB();
    db.people = db.people.map(p => p.id === person.id ? person : p);
    saveDB(db);
  },

  // Vehicles
  getVehicles: async (): Promise<Vehicle[]> => {
    await delay();
    return getDB().vehicles;
  },
  addVehicle: async (vehicle: Vehicle): Promise<void> => {
    await delay();
    const db = getDB();
    db.vehicles.push(vehicle);
    saveDB(db);
  },

  // Parking
  getParkingSpots: async (): Promise<ParkingSpot[]> => {
    await delay();
    return getDB().parkingSpots;
  },
  updateParkingSpot: async (spotId: string, updates: Partial<ParkingSpot>): Promise<void> => {
    await delay();
    const db = getDB();
    db.parkingSpots = db.parkingSpots.map(s => s.id === spotId ? { ...s, ...updates } : s);
    saveDB(db);
  },

  // Packages
  getPackages: async (): Promise<Package[]> => {
    await delay();
    return getDB().packages;
  },
  addPackage: async (pkg: Package): Promise<void> => {
    await delay();
    const db = getDB();
    db.packages.push(pkg);
    saveDB(db);
  },
  updatePackage: async (pkgId: string, updates: Partial<Package>): Promise<void> => {
    await delay();
    const db = getDB();
    db.packages = db.packages.map(p => p.id === pkgId ? { ...p, ...updates } : p);
    saveDB(db);
  },

  // Logs
  getLogs: async (): Promise<AccessLog[]> => {
    await delay();
    return getDB().logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
  addLog: async (log: AccessLog): Promise<void> => {
    await delay();
    const db = getDB();
    db.logs.push(log);
    saveDB(db);
  },

  // New granular methods for compatibility
  deleteUnit: async (id: string): Promise<void> => {
    await delay();
    const db = getDB();
    db.units = db.units.filter(u => u.id !== id);
    saveDB(db);
  },
  deleteBlock: async (block: string): Promise<void> => {
    await delay();
    const db = getDB();
    db.units = db.units.filter(u => u.block !== block);
    saveDB(db);
  }
};

import { supabaseService } from './supabaseService';

const useSupabase = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

export const storageService = useSupabase ? supabaseService : mockService;