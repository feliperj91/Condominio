import { supabase } from '../src/lib/supabase';
import { Unit, Person, Vehicle, ParkingSpot, Package, AccessLog, RolePermission, RoleDefinition } from '../types';

// Helper to map DB types to App types
const mapUnit = (u: any): Unit => ({
    id: u.id,
    block: u.block,
    number: u.number,
    floor: u.floor
});

const mapRole = (r: any): RoleDefinition => ({
    id: r.id,
    name: r.name,
    description: r.description
});

const mapPerson = (p: any): Person => ({
    id: p.id,
    name: p.name,
    roleId: p.role_id,
    roleName: p.roles?.name, // Join
    email: p.email,
    phone: p.phone,
    unitId: p.unit_id,
    avatarUrl: p.avatar_url,
    username: p.username,
    active: p.active
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
    // Roles
    getRoles: async (): Promise<RoleDefinition[]> => {
        const { data, error } = await supabase.from('roles').select('*').order('name');
        if (error) throw error;
        return data.map(mapRole);
    },
    addRole: async (role: RoleDefinition): Promise<void> => {
        const { error } = await supabase.from('roles').insert({
            name: role.name,
            description: role.description
        });
        if (error) throw error;
    },
    deleteRole: async (id: string): Promise<void> => {
        const { error } = await supabase.from('roles').delete().eq('id', id);
        if (error) throw error;
    },

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
        // Prepare units for DB
        const dbUnits = units.map(u => {
            // If ID is temporary (starts with 'gen-') or too short, remove it to let DB generate a UUID
            if (u.id.startsWith('gen-') || u.id.length < 10) {
                const { id, ...rest } = u;
                return rest;
            }
            return u;
        });

        // Use upsert. For items without ID, it will insert. For items with ID, it will update.
        const { error } = await supabase.from('units').upsert(dbUnits);
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
        const { data, error } = await supabase.from('people').select('*, roles(name)');
        if (error) throw error;
        return data.map(mapPerson);
    },
    addPerson: async (person: Person): Promise<void> => {
        const { error } = await supabase.from('people').insert({
            name: person.name,
            role_id: person.roleId,
            email: person.email,
            phone: person.phone,
            unit_id: person.unitId,
            avatar_url: person.avatarUrl,
            username: person.username,
            password: person.password, // In a real app, hash this!
            must_change_password: person.mustChangePassword,
            active: person.active !== undefined ? person.active : true
        });
        if (error) throw error;
    },
    updatePerson: async (person: Person): Promise<void> => {
        const { error } = await supabase.from('people').update({
            name: person.name,
            role_id: person.roleId,
            email: person.email,
            phone: person.phone,
            unit_id: person.unitId,
            avatar_url: person.avatarUrl,
            username: person.username,
            // Password is updated via changePassword usually, but allowing here if needed
            ...(person.password ? { password: person.password } : {}),
            ...(person.mustChangePassword !== undefined ? { must_change_password: person.mustChangePassword } : {}),
            ...(person.active !== undefined ? { active: person.active } : {})
        }).eq('id', person.id);
        if (error) throw error;
    },

    resetPassword: async (id: string): Promise<void> => {
        const { error } = await supabase.from('people').update({
            password: '123', // Default password
            must_change_password: true
        }).eq('id', id);
        if (error) throw error;
    },

    toggleActive: async (id: string, active: boolean): Promise<void> => {
        const { error } = await supabase.from('people').update({
            active: active
        }).eq('id', id);
        if (error) throw error;
    },

    // Auth
    login: async (username: string, password: string): Promise<Person | null> => {
        const { data, error } = await supabase
            .from('people')
            .select('*, roles(name)')
            .eq('username', username)
            .eq('password', password) // Warning: Plain text check for MVP
            .single();

        if (error || !data) return null;

        // Check if active
        if (data.active === false) {
            throw new Error("Usuário inativo.");
        }

        return {
            ...mapPerson(data),
            roleName: data.roles?.name
        };
    },

    changePassword: async (id: string, newPassword: string): Promise<void> => {
        const { error } = await supabase.from('people').update({
            password: newPassword,
            must_change_password: false
        }).eq('id', id);
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
    },

    // Permissions
    getPermissions: async (): Promise<RolePermission[]> => {
        const { data, error } = await supabase.from('role_permissions').select('*, roles(name)').order('role_id').order('resource');
        if (error) throw error;
        return data.map((p: any) => ({
            id: p.id,
            roleId: p.role_id,
            roleName: p.roles?.name,
            resource: p.resource,
            canView: p.can_view,
            canCreate: p.can_create,
            canEdit: p.can_edit,
            canDelete: p.can_delete
        }));
    },
    updatePermission: async (id: string, updates: Partial<RolePermission>): Promise<void> => {
        const dbUpdates: any = {};
        if (updates.canView !== undefined) dbUpdates.can_view = updates.canView;
        if (updates.canCreate !== undefined) dbUpdates.can_create = updates.canCreate;
        if (updates.canEdit !== undefined) dbUpdates.can_edit = updates.canEdit;
        if (updates.canDelete !== undefined) dbUpdates.can_delete = updates.canDelete;

        const { error } = await supabase.from('role_permissions').update(dbUpdates).eq('id', id);
        if (error) throw error;
    },

    // Create default permissions for a new role
    initRolePermissions: async (roleId: string): Promise<void> => {
        const resources = ['dashboard', 'units', 'people', 'packages', 'parking', 'access_control'];
        const permissions = resources.map(resource => ({
            role_id: roleId,
            resource,
            can_view: false,
            can_create: false,
            can_edit: false,
            can_delete: false
        }));

        const { error } = await supabase.from('role_permissions').insert(permissions);
        if (error) throw error;
    }
};
