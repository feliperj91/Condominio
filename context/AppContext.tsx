import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Block, Apartment, Person, Package, PackageStatus, Vehicle, VehicleLog, VehicleLogStatus, VehicleLogType, PersonRoles } from '../types';

interface AppContextType {
  blocks: Block[];
  apartments: Apartment[];
  people: Person[];
  packages: Package[];
  addBatchBlocksAndApartments: (prefix: string, numBlocks: number, floors: number, aptsPerFloor: number, blockSuffixType: 'letters' | 'numbers', aptPrefix: string) => { blocks: number, apartments: number };
  addPerson: (person: Omit<Person, 'id'|'isActive'>) => void;
  updatePerson: (personId: string, updatedData: Partial<Omit<Person, 'id'>>) => void;
  deletePerson: (personId: string) => void;
  setPersonStatus: (personId: string, isActive: boolean) => void;
  addPackage: (pkg: Omit<Package, 'id' | 'status' | 'deliveredAt' | 'deliveredTo'> & { receivedAt?: Date }) => void;
  updatePackage: (id: string, updatedData: {
    description: string;
    apartmentId: string;
    receivedAt?: Date;
    location?: string;
    personId?: string;
    recipientName?: string;
    recipientPhone?: string;
  }) => void;
  deliverPackage: (id: string, deliveredTo: string, deliveredAt: Date) => void;
  deleteBlock: (blockId: string) => void;
  deleteApartment: (apartmentId: string) => void;
  getApartmentInfo: (apartmentId: string) => { fullNumber: string, blockName: string, number: string, blockId: string } | null;
  getResidentsForApartment: (apartmentId: string) => Person[];
  getPackageRecipientInfo: (pkg: Package) => { name: string; phone?: string; email?: string; };
  getAllVehicles: () => (Vehicle & { personId: string; personName: string; apartmentInfo: { fullNumber: string; id: string; blockId: string; } | null; })[];
  addVehicle: (personId: string, vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (personId: string, vehicle: Vehicle) => void;
  deleteVehicle: (personId: string, vehicleId: string) => void;
  vehicleLogs: VehicleLog[];
  registerVehicleEntry: (entryData: { plate: string; model: string; type: VehicleLogType; personId?: string; apartmentId: string; contactPhone?: string; }) => void;
  registerVehicleExit: (logId: string) => void;
  getLogDetailsString: (log: VehicleLog) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateMockData = () => {
    const blocks: Block[] = [
        { id: 'b1', name: 'Bloco A' },
        { id: 'b2', name: 'Bloco B' },
    ];
    const apartments: Apartment[] = [
        { id: 'a1', blockId: 'b1', number: '101' },
        { id: 'a2', blockId: 'b1', number: '102' },
        { id: 'a3', blockId: 'b2', number: '101' },
    ];
    const people: Person[] = [
        { id: 'r1', name: 'João da Silva', email: 'joao@email.com', phone: '5511999998888', apartmentId: 'a1', vehicles: [{ id: 'v1', model: 'Honda Civic', plate: 'BRA2E19' }], roles: { isResident: true, isAdmin: false, isDoorman: false, isManager: false, isServiceProvider: false }, isActive: true },
        { id: 'r1a', name: 'Joana da Silva', email: 'joana@email.com', phone: '5511911112222', apartmentId: 'a1', vehicles: [], roles: { isResident: true, isAdmin: false, isDoorman: false, isManager: false, isServiceProvider: false }, isActive: true },
        { id: 'r2', name: 'Maria Oliveira', email: 'maria@email.com', phone: '5521988887777', apartmentId: 'a3', vehicles: [{id: 'v2', model: 'VW Gol', plate: 'BCB1A23'}], roles: { isResident: true, isAdmin: false, isDoorman: false, isManager: true, isServiceProvider: false }, isActive: true },
        { id: 'p1', name: 'Carlos (Porteiro)', email: 'carlos@email.com', phone: '5511988887777', vehicles: [], roles: { isResident: false, isAdmin: false, isDoorman: true, isManager: false, isServiceProvider: false }, isActive: true },
        { id: 'p2', name: 'Ana (Admin)', email: 'ana@email.com', phone: '5511988886666', vehicles: [], roles: { isResident: false, isAdmin: true, isDoorman: false, isManager: false, isServiceProvider: false }, isActive: false },
    ];
    const packages: Package[] = [
        { id: 'p1', apartmentId: 'a1', personId: 'r1', description: 'Caixa Média - Amazon', status: PackageStatus.WaitingPickup, receivedAt: new Date(Date.now() - 86400000), receivedBy: 'Carlos (Porteiro)', location: 'Prateleira A-1' },
        { id: 'p2', apartmentId: 'a3', personId: 'r2', description: 'Envelope - Documento', status: PackageStatus.WaitingPickup, receivedAt: new Date(), receivedBy: 'Carlos (Porteiro)', location: 'Gaveta 3' },
        { id: 'p4', apartmentId: 'a1', recipientName: 'Visitante Exemplo', recipientPhone: '5511987654321', description: 'Flores', status: PackageStatus.WaitingPickup, receivedAt: new Date(Date.now() - 3600000), receivedBy: 'Carlos (Porteiro)' },
        { id: 'p3', apartmentId: 'a1', personId: 'r1', description: 'Caixa Pequena - Mercado Livre', status: PackageStatus.Delivered, receivedAt: new Date(Date.now() - 2*86400000), receivedBy: 'Carlos (Porteiro)', deliveredAt: new Date(Date.now() - 86400000), deliveredTo: 'João da Silva', location: 'Prateleira A-1' },
    ];
    const vehicleLogs: VehicleLog[] = [
        { id: 'vl1', plate: 'BRA2E19', model: 'Honda Civic', type: VehicleLogType.Resident, personId: 'r1', apartmentId: 'a1', entryTime: new Date(Date.now() - 3 * 3600000), status: VehicleLogStatus.Inside },
        { id: 'vl2', plate: 'VIS1T0R', model: 'Fiat Mobi', type: VehicleLogType.Visitor, contactPhone: '5511912345678', apartmentId: 'a3', entryTime: new Date(Date.now() - 1 * 3600000), status: VehicleLogStatus.Inside },
        { id: 'vl3', plate: 'BCB1A23', model: 'VW Gol', type: VehicleLogType.Resident, personId: 'r2', apartmentId: 'a3', entryTime: new Date(Date.now() - 8 * 3600000), exitTime: new Date(Date.now() - 5 * 3600000), status: VehicleLogStatus.Outside },
        { id: 'vl4', plate: 'SRV4C32', model: 'Fiat Fiorino', type: VehicleLogType.ServiceProvider, contactPhone: '5521987654321', apartmentId: 'a2', entryTime: new Date(Date.now() - 2 * 3600000), status: VehicleLogStatus.Inside },
    ];

    return { blocks, apartments, people, packages, vehicleLogs };
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [blocks, setBlocks] = useState<Block[]>(generateMockData().blocks);
  const [apartments, setApartments] = useState<Apartment[]>(generateMockData().apartments);
  const [people, setPeople] = useState<Person[]>(generateMockData().people);
  const [packages, setPackages] = useState<Package[]>(generateMockData().packages);
  const [vehicleLogs, setVehicleLogs] = useState<VehicleLog[]>(generateMockData().vehicleLogs);

  const addBatchBlocksAndApartments = useCallback((prefix: string, numBlocks: number, floors: number, aptsPerFloor: number, blockSuffixType: 'letters' | 'numbers', aptPrefix: string) => {
    const newBlocks: Block[] = [];
    const newApartments: Apartment[] = [];
    
    let startSuffix: number;
    if (blockSuffixType === 'letters') {
      const letterBlocks = blocks.map(b => b.name.match(new RegExp(`^${prefix}\\s*([A-Z])$`))).filter(Boolean).map(match => (match as RegExpMatchArray)[1].charCodeAt(0));
      startSuffix = letterBlocks.length > 0 ? Math.max(...letterBlocks) + 1 : 65;
    } else {
      const numericBlocks = blocks.map(b => b.name.match(new RegExp(`^${prefix}\\s*(\\d+)$`))).filter(Boolean).map(match => parseInt((match as RegExpMatchArray)[1], 10));
      startSuffix = numericBlocks.length > 0 ? Math.max(...numericBlocks) + 1 : 1;
    }

    for (let i = 0; i < numBlocks; i++) {
        const currentSuffix = startSuffix + i;
        const blockSuffix = blockSuffixType === 'letters' ? String.fromCharCode(currentSuffix) : currentSuffix.toString();
        const blockName = `${prefix} ${blockSuffix}`;
        const blockId = crypto.randomUUID();
        newBlocks.push({ id: blockId, name: blockName });

        for (let j = 1; j <= floors; j++) {
            for (let k = 1; k <= aptsPerFloor; k++) {
                const aptNumberStr = `${j}${k.toString().padStart(2, '0')}`;
                const aptNumber = aptPrefix.trim() ? `${aptPrefix.trim()} ${aptNumberStr}` : aptNumberStr;
                newApartments.push({ id: crypto.randomUUID(), blockId, number: aptNumber });
            }
        }
    }
    
    setBlocks(prev => [...prev, ...newBlocks]);
    setApartments(prev => [...prev, ...newApartments]);
    return { blocks: newBlocks.length, apartments: newApartments.length };
  }, [blocks]);

  const addPerson = useCallback((person: Omit<Person, 'id' | 'isActive'>) => {
    const newPerson: Person = { ...person, id: crypto.randomUUID(), isActive: true };
    setPeople(prev => [...prev, newPerson]);
  }, []);

  const updatePerson = useCallback((personId: string, updatedData: Partial<Omit<Person, 'id'>>) => {
    setPeople(prev => prev.map(p => p.id === personId ? { ...p, ...updatedData } : p));
  }, []);

  const deletePerson = useCallback((personId: string) => {
    setPeople(prev => prev.filter(p => p.id !== personId));
  }, []);

  const setPersonStatus = useCallback((personId: string, isActive: boolean) => {
    setPeople(prev => prev.map(p => p.id === personId ? { ...p, isActive } : p));
  }, []);

  const addPackage = useCallback((pkg: Omit<Package, 'id' | 'status' | 'deliveredAt' | 'deliveredTo'> & { receivedAt?: Date }) => {
    const newPackage: Package = { ...pkg, id: crypto.randomUUID(), status: PackageStatus.WaitingPickup, receivedAt: pkg.receivedAt || new Date() };
    setPackages(prev => [newPackage, ...prev]);
  }, []);
  
  const updatePackage = useCallback((id: string, updatedData: {
    description: string; apartmentId: string; receivedAt?: Date; location?: string; personId?: string; recipientName?: string; recipientPhone?: string;
  }) => {
      setPackages(prev => prev.map(p => {
          if (p.id === id) {
              const updatedPackage = { ...p, ...updatedData };
              if (updatedData.personId) {
                  updatedPackage.recipientName = undefined;
                  updatedPackage.recipientPhone = undefined;
              } else if (updatedData.recipientName !== undefined) {
                  updatedPackage.personId = undefined;
              }
              return updatedPackage;
          }
          return p;
      }));
  }, []);

  const deliverPackage = useCallback((id: string, deliveredTo: string, deliveredAt: Date) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, status: PackageStatus.Delivered, deliveredTo, deliveredAt } : p));
  }, []);
  
  const deleteBlock = useCallback((blockId: string) => {
    const apartmentsInBlock = apartments.filter(a => a.blockId === blockId).map(a => a.id);
    const hasResidents = people.some(p => p.roles.isResident && apartmentsInBlock.includes(p.apartmentId || ''));
    if (hasResidents) throw new Error("Não é possível excluir o bloco. Existem moradores cadastrados nos apartamentos deste bloco.");
    const hasPackages = packages.some(p => apartmentsInBlock.includes(p.apartmentId));
    if (hasPackages) throw new Error("Não é possível excluir o bloco. Existem encomendas associadas a apartamentos deste bloco.");
    setApartments(prev => prev.filter(a => a.blockId !== blockId));
    setBlocks(prev => prev.filter(b => b.id !== blockId));
  }, [apartments, people, packages]);

  const deleteApartment = useCallback((apartmentId: string) => {
    const hasResidents = people.some(p => p.roles.isResident && p.apartmentId === apartmentId);
    if (hasResidents) throw new Error("Não é possível excluir o apartamento. Existem moradores cadastrados nesta unidade.");
    const hasPackages = packages.some(p => p.apartmentId === apartmentId);
    if (hasPackages) throw new Error("Não é possível excluir o apartamento. Existem encomendas associadas a esta unidade.");
    setApartments(prev => prev.filter(a => a.id !== apartmentId));
  }, [people, packages]);

  const getApartmentInfo = useCallback((apartmentId: string) => {
    const apt = apartments.find(a => a.id === apartmentId);
    if (!apt) return null;
    const block = blocks.find(b => b.id === apt.blockId);
    return { 
        fullNumber: `${block?.name || 'N/A'} - ${apt.number}`, 
        blockName: block?.name || 'N/A', 
        number: apt.number,
        blockId: apt.blockId
    };
  }, [apartments, blocks]);
  
  const getResidentsForApartment = useCallback((apartmentId: string) => {
    return people.filter(p => p.isActive && p.roles.isResident && p.apartmentId === apartmentId);
  }, [people]);

  const getPackageRecipientInfo = useCallback((pkg: Package) => {
      if (pkg.personId) {
          const person = people.find(p => p.id === pkg.personId);
          if (person) return { name: person.name, phone: person.phone, email: person.email };
      }
      if (pkg.recipientName) {
          return { name: pkg.recipientName, phone: pkg.recipientPhone };
      }
      const primaryResident = getResidentsForApartment(pkg.apartmentId)[0];
      return { name: primaryResident?.name || 'Morador Principal', phone: primaryResident?.phone, email: primaryResident?.email };
  }, [people, getResidentsForApartment]);
  
  const getAllVehicles = useCallback(() => {
    const allVehicles: (Vehicle & { personId: string; personName: string; apartmentInfo: { fullNumber: string; id: string; blockId: string; } | null })[] = [];
    people.filter(p => p.roles.isResident && p.isActive).forEach(person => {
        const apartmentInfo = person.apartmentId ? getApartmentInfo(person.apartmentId) : null;
        person.vehicles.forEach(vehicle => {
            allVehicles.push({
                ...vehicle,
                personId: person.id,
                personName: person.name,
                apartmentInfo: apartmentInfo ? { fullNumber: apartmentInfo.fullNumber, id: person.apartmentId!, blockId: apartmentInfo.blockId } : null,
            });
        });
    });
    return allVehicles;
  }, [people, getApartmentInfo]);

  const addVehicle = useCallback((personId: string, vehicle: Omit<Vehicle, 'id'>) => {
      setPeople(prev => prev.map(p => {
          if (p.id === personId) {
              const newVehicle = { ...vehicle, id: crypto.randomUUID() };
              return { ...p, vehicles: [...p.vehicles, newVehicle] };
          }
          return p;
      }));
  }, []);

  const updateVehicle = useCallback((personId: string, updatedVehicle: Vehicle) => {
      setPeople(prev => prev.map(p => {
          if (p.id === personId) {
              const updatedVehicles = p.vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v);
              return { ...p, vehicles: updatedVehicles };
          }
          return p;
      }));
  }, []);
  
  const deleteVehicle = useCallback((personId: string, vehicleId: string) => {
      setPeople(prev => prev.map(p => {
          if (p.id === personId) {
              const updatedVehicles = p.vehicles.filter(v => v.id !== vehicleId);
              return { ...p, vehicles: updatedVehicles };
          }
          return p;
      }));
  }, []);

  const registerVehicleEntry = useCallback((entryData: { plate: string; model: string; type: VehicleLogType; personId?: string; apartmentId: string; contactPhone?: string; }) => {
    const isAlreadyInside = vehicleLogs.some(log => log.plate.toUpperCase() === entryData.plate.toUpperCase() && log.status === VehicleLogStatus.Inside);
    if (isAlreadyInside) throw new Error(`Veículo com a placa ${entryData.plate} já se encontra dentro do condomínio.`);
    const newLog: VehicleLog = { ...entryData, id: crypto.randomUUID(), entryTime: new Date(), status: VehicleLogStatus.Inside };
    setVehicleLogs(prev => [newLog, ...prev]);
  }, [vehicleLogs]);

  const registerVehicleExit = useCallback((logId: string) => {
    setVehicleLogs(prev => prev.map(log => log.id === logId ? { ...log, status: VehicleLogStatus.Outside, exitTime: new Date() } : log));
  }, []);

  const getLogDetailsString = useCallback((log: VehicleLog) => {
      const aptInfo = getApartmentInfo(log.apartmentId);
      switch(log.type){
          case VehicleLogType.Resident:
              const person = people.find(p => p.id === log.personId);
              return `Morador: ${person?.name || 'N/A'} p/ ${aptInfo?.fullNumber || 'N/A'}`;
          case VehicleLogType.Visitor:
              return `Visitante p/ ${aptInfo?.fullNumber || 'N/A'} ${log.contactPhone ? `(${log.contactPhone})` : ''}`;
          case VehicleLogType.ServiceProvider:
              return `Prestador de Serviço p/ ${aptInfo?.fullNumber || 'N/A'} ${log.contactPhone ? `(${log.contactPhone})` : ''}`;
      }
  }, [getApartmentInfo, people]);

  const value = {
    blocks, apartments, people, packages,
    addBatchBlocksAndApartments, addPerson, updatePerson, deletePerson, setPersonStatus,
    addPackage, updatePackage, deliverPackage,
    deleteBlock, deleteApartment,
    getApartmentInfo, getResidentsForApartment, getPackageRecipientInfo,
    getAllVehicles, addVehicle, updateVehicle, deleteVehicle,
    vehicleLogs, registerVehicleEntry, registerVehicleExit, getLogDetailsString,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};