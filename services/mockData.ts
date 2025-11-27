import { Unit, Person, Vehicle, ParkingSpot, Role, Package, AccessLog } from '../types';

export const generateMockData = () => {
  const units: Unit[] = [
    { id: 'u1', block: 'A', number: '101', floor: 1 },
    { id: 'u2', block: 'A', number: '102', floor: 1 },
    { id: 'u3', block: 'A', number: '201', floor: 2 },
    { id: 'u4', block: 'B', number: '101', floor: 1 },
  ];

  const people: Person[] = [
    { id: 'p1', name: 'Ana Silva', role: Role.ADMIN, email: 'admin@condominio.com.br', phone: '(11) 99999-0101', avatarUrl: 'https://picsum.photos/200' },
    { id: 'p2', name: 'Roberto Santos', role: Role.RESIDENT, email: 'roberto@email.com', phone: '(11) 99999-0102', unitId: 'u1', avatarUrl: 'https://picsum.photos/201' },
    { id: 'p3', name: 'Carlos Dias', role: Role.RESIDENT, email: 'carlos@email.com', phone: '(11) 99999-0103', unitId: 'u2', avatarUrl: 'https://picsum.photos/202' },
    { id: 'p4', name: 'Diana Prince', role: Role.STAFF, email: 'staff@condominio.com.br', phone: '(11) 99999-0199', avatarUrl: 'https://picsum.photos/203' },
  ];

  const vehicles: Vehicle[] = [
    { id: 'v1', plate: 'ABC-1234', model: 'Toyota Corolla', color: 'Prata', ownerId: 'p2', unitId: 'u1' },
    { id: 'v2', plate: 'XYZ-9876', model: 'Honda Civic', color: 'Preto', ownerId: 'p3', unitId: 'u2' },
  ];

  const parkingSpots: ParkingSpot[] = Array.from({ length: 20 }).map((_, i) => ({
    id: `ps${i}`,
    code: `V-${i + 1}`,
    isOccupied: i < 5, // Simulating some occupied spots
    type: i < 15 ? 'RESIDENT' : 'VISITOR',
    currentVehicleId: i === 0 ? 'v1' : (i === 1 ? 'v2' : undefined)
  }));

  const packages: Package[] = [
    { id: 'pkg1', trackingCode: 'AMZ-999', receivedAt: new Date().toISOString(), receivedByStaffId: 'p4', unitId: 'u1', recipientName: 'Roberto Santos', location: 'Portaria - Estante A', status: 'WAITING_PICKUP' },
  ];

  const logs: AccessLog[] = [
    { id: 'l1', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'ENTRY', vehiclePlate: 'ABC-1234', isRegistered: true, spotId: 'ps0' },
    { id: 'l2', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'EXIT', vehiclePlate: 'XYZ-9876', isRegistered: true },
  ];

  return { units, people, vehicles, parkingSpots, packages, logs };
};