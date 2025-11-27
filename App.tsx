import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Parking } from './components/Parking';
import { Packages } from './components/Packages';
import { Units } from './components/Units';
import { People } from './components/People';
import { storageService } from './services/storageService';
import { Unit, Person, Vehicle, ParkingSpot, Package, AccessLog } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // App State
  const [units, setUnits] = useState<Unit[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [u, p, v, s, pk, l] = await Promise.all([
        storageService.getUnits(),
        storageService.getPeople(),
        storageService.getVehicles(),
        storageService.getParkingSpots(),
        storageService.getPackages(),
        storageService.getLogs(),
      ]);
      setUnits(u);
      setPeople(p);
      setVehicles(v);
      setSpots(s);
      setPackages(pk);
      setLogs(l);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Handlers
  const handleEntry = (plate: string, unitId: string, type: string) => {
    // Basic logic to simulate entry
    const registered = vehicles.find(v => v.plate === plate);
    const newLog: AccessLog = {
      id: Math.random().toString(36),
      timestamp: new Date().toISOString(),
      type: 'ENTRY',
      vehiclePlate: plate,
      isRegistered: !!registered,
      spotId: registered ? 'assigned' : 'visitor-spot',
      notes: `Unidade ID: ${unitId} | Tipo: ${type}`
    };
    setLogs([newLog, ...logs]);

    // Update spots visual (simplified allocation)
    // In a real scenario, this would select specific spots based on type
    const freeSpotIndex = spots.findIndex(s => !s.isOccupied && (type === 'RESIDENT' ? s.type === 'RESIDENT' : s.type === 'VISITOR'));

    if (freeSpotIndex >= 0) {
      const updatedSpots = [...spots];
      updatedSpots[freeSpotIndex] = {
        ...updatedSpots[freeSpotIndex],
        isOccupied: true,
        currentVehicleId: plate // Store plate temporarily as ID for UI matching
      };
      setSpots(updatedSpots);
    } else {
      alert("Atenção: Não há vagas disponíveis para este perfil.");
    }
  };

  const handleExit = (plateOrId: string) => {
    // Find spot by vehicle ID (simulated)
    const updatedSpots = spots.map(s => {
      if (s.currentVehicleId === plateOrId) {
        return { ...s, isOccupied: false, currentVehicleId: undefined };
      }
      return s;
    });
    setSpots(updatedSpots);

    // Add Log
    const newLog: AccessLog = {
      id: Math.random().toString(36),
      timestamp: new Date().toISOString(),
      type: 'EXIT',
      vehiclePlate: plateOrId, // Using ID/Plate loosely for mock
      isRegistered: true
    };
    setLogs([newLog, ...logs]);
  };

  const handleAddPackage = (pkg: Package) => {
    setPackages([pkg, ...packages]);
    storageService.addPackage(pkg);
  };

  const handlePickupPackage = (id: string) => {
    const updatedPackages = packages.map(p => p.id === id ? { ...p, status: 'DELIVERED' as const, pickedUpAt: new Date().toISOString() } : p);
    setPackages(updatedPackages);
    storageService.updatePackage(id, { status: 'DELIVERED', pickedUpAt: new Date().toISOString() });
  };

  const handleAddUnits = async (newUnits: Unit[]) => {
    const updatedUnits = [...units, ...newUnits];
    setUnits(updatedUnits);
    await storageService.saveUnits(updatedUnits);
  };

  const handleDeleteUnit = async (id: string) => {
    const updatedUnits = units.filter(u => u.id !== id);
    setUnits(updatedUnits);
    await storageService.deleteUnit(id);
  };

  const handleDeleteBlock = async (blockName: string) => {
    const updatedUnits = units.filter(u => u.block !== blockName);
    setUnits(updatedUnits);
    await storageService.deleteBlock(blockName);
  };

  const handleAddPerson = (person: Person) => {
    setPeople([...people, person]);
    storageService.addPerson(person);
  };

  // Derived Stats
  const stats = {
    totalSpots: spots.length,
    occupiedSpots: spots.filter(s => s.isOccupied).length,
    pendingPackages: packages.filter(p => p.status === 'WAITING_PICKUP').length,
    totalResidents: people.filter(p => p.role === 'RESIDENT').length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Helper to get title text
  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Visão Geral';
      case 'units': return 'Gestão de Unidades';
      case 'people': return 'Cadastro de Pessoas';
      case 'packages': return 'Encomendas';
      case 'parking': return 'Estacionamento';
      default: return '';
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="ml-64 flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 capitalize">{getTitle()}</h2>
            <p className="text-slate-500">Bem-vindo(a), Administrador</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700">Ana Silva</p>
              <p className="text-xs text-slate-500">Síndica</p>
            </div>
            <img src="https://picsum.photos/40" alt="Profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
          </div>
        </header>

        {activeTab === 'dashboard' && <Dashboard stats={stats} logs={logs} />}
        {activeTab === 'parking' && <Parking spots={spots} logs={logs} units={units} onEntry={handleEntry} onExit={handleExit} />}
        {activeTab === 'packages' && <Packages packages={packages} units={units} people={people} onAddPackage={handleAddPackage} onPickup={handlePickupPackage} />}
        {activeTab === 'units' && <Units units={units} onAddUnits={handleAddUnits} onDeleteUnit={handleDeleteUnit} onDeleteBlock={handleDeleteBlock} />}
        {activeTab === 'people' && <People people={people} units={units} onAddPerson={handleAddPerson} />}

      </main>
    </div>
  );
};

export default App;