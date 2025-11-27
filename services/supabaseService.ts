import { supabase } from '../lib/supabase';
import { Unit, Person, Vehicle, ParkingSpot, Package, AccessLog } from '../types';

// Helper to map DB types to App types
const mapUnit = (u: any): Unit => ({
    id: u.id,
    block: u.block,
    number: u.number,
    floor: u.floor
});

const mapPerson = (p: any): Person => ({
    id: p.id,
    name: p.name,
    role: p.role,
    email: p.email,
    phone: p.phone,
    unitId: p.unit_id,
    avatarUrl: p.avatar_url
});

const mapVehicle = (v: any): Vehicle => ({
    id: v.id,
    plate: v.plate,
    model: v.model,
    color: v.color,
    ownerId: v.owner_id,
    ownerName: v.owner_name,
    unitId: v.unit_id
});

const mapSpot = (s: any): ParkingSpot => ({
    id: s.id,
    code: s.code,
    isOccupied: s.is_occupied,
    currentVehicleId: s.current_vehicle_id,
    type: s.type
});

const mapPackage = (p: any): Package => ({
    id: p.id,
    trackingCode: p.tracking_code,
    receivedAt: p.received_at,
    receivedByStaffId: p.received_by_staff_id,
    unitId: p.unit_id,
    recipientName: p.recipient_name,
    location: p.location,
    status: p.status,
    pickedUpAt: p.picked_up_at
});

const mapLog = (l: any): AccessLog => ({
    id: l.id,
    timestamp: l.timestamp,
    type: l.type,
    vehiclePlate: l.vehicle_plate,
    isRegistered: l.is_registered,
    spotId: l.spot_id,
    notes: l.notes
});

export const supabaseService = {
    // Units
    getUnits: async (): Promise<Unit[]> => {
        const { data, error } = await supabase.from('units').select('*');
        if (error) throw error;
        return data.map(mapUnit);
    },
    addUnit: async (unit: Unit): Promise<void> => {
        const { error } = await supabase.from('units').insert({
            block: unit.block,
            number: unit.number,
            floor: unit.floor
        });
        if (error) throw error;
    },
    // Deprecated: prefer addUnit/deleteUnit
    saveUnits: async (units: Unit[]): Promise<void> => {
        // This is a naive implementation for compatibility. 
        // Ideally, refactor App to use granular operations.
        // For now, we'll try to upsert new ones. Deletions won't happen here automatically to be safe.
        const dbUnits = units.map(u => ({
            id: u.id.length < 10 ? undefined : u.id, // Handle temp IDs if any
            block: u.block,
            number: u.number,
            floor: u.floor
        }));

        // Filter out undefined IDs for upsert if they are meant to be new
        const toUpsert = dbUnits.map(u => {
            if (!u.id) {
                const { id, ...rest } = u;
                return rest;
            }
            return u;
        });

        const { error } = await supabase.from('units').upsert(toUpsert);
        if (error) throw error;
    },
    deleteUnit: async (id: string): Promise<void> => {
        const { error } = await supabase.from('units').delete().eq('id', id);
        if (error) throw error;
    },
    deleteBlock: async (block: string): Promise<void> => {
        const { error } = await supabase.from('units').delete().eq('block', block);
        if (error) throw error;
    },

    // People
    getPeople: async (): Promise<Person[]> => {
        const { data, error } = await supabase.from('people').select('*');
        if (error) throw error;
        return data.map(mapPerson);
    },
    addPerson: async (person: Person): Promise<void> => {
        const { error } = await supabase.from('people').insert({
            name: person.name,
            role: person.role,
            email: person.email,
            phone: person.phone,
            unit_id: person.unitId,
            avatar_url: person.avatarUrl
        });
        if (error) throw error;
    },

    // Vehicles
    getVehicles: async (): Promise<Vehicle[]> => {
        const { data, error } = await supabase.from('vehicles').select('*');
        if (error) throw error;
        return data.map(mapVehicle);
    },
    addVehicle: async (vehicle: Vehicle): Promise<void> => {
        const { error } = await supabase.from('vehicles').insert({
            plate: vehicle.plate,
            model: vehicle.model,
            color: vehicle.color,
            owner_id: vehicle.ownerId,
            owner_name: vehicle.ownerName,
            unit_id: vehicle.unitId
        });
        if (error) throw error;
    },

    // Parking
    getParkingSpots: async (): Promise<ParkingSpot[]> => {
        const { data, error } = await supabase.from('parking_spots').select('*');
        if (error) throw error;
        return data.map(mapSpot);
    },
    updateParkingSpot: async (spotId: string, updates: Partial<ParkingSpot>): Promise<void> => {
        const dbUpdates: any = {};
        if (updates.isOccupied !== undefined) dbUpdates.is_occupied = updates.isOccupied;
        if (updates.currentVehicleId !== undefined) dbUpdates.current_vehicle_id = updates.currentVehicleId;
        if (updates.type !== undefined) dbUpdates.type = updates.type;

        const { error } = await supabase.from('parking_spots').update(dbUpdates).eq('id', spotId);
        if (error) throw error;
    },

    // Packages
    getPackages: async (): Promise<Package[]> => {
        const { data, error } = await supabase.from('packages').select('*');
        if (error) throw error;
        return data.map(mapPackage);
    },
    addPackage: async (pkg: Package): Promise<void> => {
        const { error } = await supabase.from('packages').insert({
            tracking_code: pkg.trackingCode,
            received_at: pkg.receivedAt,
            received_by_staff_id: pkg.receivedByStaffId,
            unit_id: pkg.unitId,
            recipient_name: pkg.recipientName,
            location: pkg.location,
            status: pkg.status
        });
        if (error) throw error;
    },
    updatePackage: async (pkgId: string, updates: Partial<Package>): Promise<void> => {
        const dbUpdates: any = {};
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.pickedUpAt !== undefined) dbUpdates.picked_up_at = updates.pickedUpAt;

        const { error } = await supabase.from('packages').update(dbUpdates).eq('id', pkgId);
        if (error) throw error;
    },

    // Logs
    getLogs: async (): Promise<AccessLog[]> => {
        const { data, error } = await supabase.from('access_logs').select('*').order('timestamp', { ascending: false });
        if (error) throw error;
        return data.map(mapLog);
    },
    addLog: async (log: AccessLog): Promise<void> => {
        const { error } = await supabase.from('access_logs').insert({
            timestamp: log.timestamp,
            type: log.type,
            vehicle_plate: log.vehiclePlate,
            is_registered: log.isRegistered,
            spot_id: log.spotId,
            notes: log.notes
        });
        if (error) throw error;
    }
};
