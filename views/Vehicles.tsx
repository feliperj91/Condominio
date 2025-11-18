import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Vehicle, Person, Block, Apartment } from '../types';
import Modal from '../components/Modal';
import { PlusCircleIcon, PrinterIcon } from '../components/icons';

type VehicleWithPersonInfo = Vehicle & {
    personId: string;
    personName: string;
    apartmentInfo: { fullNumber: string; id: string; blockId: string; } | null;
};

const Vehicles = () => {
    const { getAllVehicles, people, blocks, apartments, addVehicle, updateVehicle, deleteVehicle } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<VehicleWithPersonInfo | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBlock, setFilterBlock] = useState('');
    const [filterApartment, setFilterApartment] = useState('');
    
    const allVehicles = useMemo(() => getAllVehicles(), [getAllVehicles]);

    const filteredVehiclesForTable = useMemo(() => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        if (!lowerCaseSearch) return allVehicles;
        return allVehicles.filter(vehicle =>
            vehicle.plate.toLowerCase().includes(lowerCaseSearch) ||
            vehicle.model.toLowerCase().includes(lowerCaseSearch) ||
            vehicle.personName.toLowerCase().includes(lowerCaseSearch) ||
            (vehicle.apartmentInfo && vehicle.apartmentInfo.fullNumber.toLowerCase().includes(lowerCaseSearch))
        );
    }, [allVehicles, searchTerm]);

    const filteredVehiclesForReport = useMemo(() => {
        return allVehicles.filter(vehicle => {
            if (!vehicle.apartmentInfo) return false;
            if (filterBlock && vehicle.apartmentInfo.blockId !== filterBlock) return false;
            if (filterApartment && vehicle.apartmentInfo.id !== filterApartment) return false;
            return true;
        });
    }, [allVehicles, filterBlock, filterApartment]);


    const handleOpenAddModal = () => {
        setEditingVehicle(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (vehicle: VehicleWithPersonInfo) => {
        setEditingVehicle(vehicle);
        setIsModalOpen(true);
    };

    const handleDeleteVehicle = (vehicle: VehicleWithPersonInfo) => {
        if (window.confirm(`Tem certeza que deseja excluir o veículo ${vehicle.model} - ${vehicle.plate}?`)) {
            deleteVehicle(vehicle.personId, vehicle.id);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <div className="print:hidden">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-brand-dark">Veículos</h1>
                    <button
                        onClick={handleOpenAddModal}
                        className="flex items-center gap-2 bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-sky-700 transition-colors"
                    >
                        <PlusCircleIcon />
                        Novo Veículo
                    </button>
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Buscar por placa, modelo, morador ou apartamento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                    />
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-brand-secondary">
                            <thead className="text-xs text-brand-secondary uppercase bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Placa</th>
                                    <th scope="col" className="px-6 py-3">Modelo</th>
                                    <th scope="col" className="px-6 py-3">Morador</th>
                                    <th scope="col" className="px-6 py-3">Apartamento</th>
                                    <th scope="col" className="px-6 py-3">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVehiclesForTable.map(vehicle => (
                                    <tr key={vehicle.id} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-mono text-brand-dark tracking-wider">{vehicle.plate}</td>
                                        <td className="px-6 py-4">{vehicle.model}</td>
                                        <td className="px-6 py-4">{vehicle.personName}</td>
                                        <td className="px-6 py-4">{vehicle.apartmentInfo?.fullNumber || 'N/A'}</td>
                                        <td className="px-6 py-4 flex items-center gap-4">
                                            <button onClick={() => handleOpenEditModal(vehicle)} className="font-medium text-brand-primary hover:underline">Editar</button>
                                            <button onClick={() => handleDeleteVehicle(vehicle)} className="font-medium text-red-600 hover:underline">Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredVehiclesForTable.length === 0 && (
                        <p className="text-center text-brand-secondary p-8">Nenhum veículo encontrado.</p>
                    )}
                </div>

                <div className="mt-8">
                    <h2 className="text-2xl font-semibold text-brand-dark mb-4">Relatórios de Veículos</h2>
                    <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex flex-col md:flex-row md:items-center md:gap-4">
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow">
                             <select value={filterBlock} onChange={e => {setFilterBlock(e.target.value); setFilterApartment('')}} className="block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary">
                                <option value="">Todos os Blocos</option>
                                {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                            <select value={filterApartment} onChange={e => setFilterApartment(e.target.value)} className="block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary" disabled={!filterBlock}>
                                <option value="">Todos os Aptos</option>
                                {apartments.filter(a => a.blockId === filterBlock).map(a => <option key={a.id} value={a.id}>{a.number}</option>)}
                            </select>
                        </div>
                         <div className="flex-shrink-0 mt-4 md:mt-0">
                            <button
                                onClick={handlePrint}
                                className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-slate-700 transition-colors"
                            >
                                <PrinterIcon />
                                Imprimir / Salvar PDF
                            </button>
                        </div>
                    </div>
                </div>


                <VehicleFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    vehicleToEdit={editingVehicle}
                    people={people}
                    blocks={blocks}
                    apartments={apartments}
                    addVehicle={addVehicle}
                    updateVehicle={updateVehicle}
                />
            </div>
            <div className="hidden print:block p-8">
                <h1 className="text-3xl font-bold text-center mb-2">CondoGenius</h1>
                <h2 className="text-xl text-center mb-4">Relatório de Veículos</h2>
                <p className="text-center text-sm mb-6">Gerado em: {new Date().toLocaleString()}</p>
                <div className="mb-6 p-4 border rounded-md">
                    <h3 className="font-semibold mb-2">Filtros Aplicados:</h3>
                    <p className="text-sm"><strong>Bloco:</strong> {blocks.find(b => b.id === filterBlock)?.name || 'Todos'}</p>
                    <p className="text-sm"><strong>Apartamento:</strong> {apartments.find(a => a.id === filterApartment)?.number || 'Todos'}</p>
                </div>
                <table className="w-full text-sm border-collapse border border-slate-400">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="border border-slate-300 p-2 text-left">Placa</th>
                            <th className="border border-slate-300 p-2 text-left">Modelo</th>
                            <th className="border border-slate-300 p-2 text-left">Morador</th>
                            <th className="border border-slate-300 p-2 text-left">Apartamento</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVehiclesForReport.map(vehicle => (
                            <tr key={vehicle.id} className="border-b">
                                <td className="border border-slate-300 p-2 font-mono">{vehicle.plate}</td>
                                <td className="border border-slate-300 p-2">{vehicle.model}</td>
                                <td className="border border-slate-300 p-2">{vehicle.personName}</td>
                                <td className="border border-slate-300 p-2">{vehicle.apartmentInfo?.fullNumber || 'N/A'}</td>
                            </tr>
                        ))}
                         {filteredVehiclesForReport.length === 0 && (
                            <tr>
                                <td colSpan={4} className="border border-slate-300 p-4 text-center">Nenhum veículo encontrado para os filtros selecionados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* // FIX: Removed unsupported <style jsx> tag and replaced 'input-style' class with equivalent Tailwind CSS classes. */}
        </>
    );
};

interface VehicleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicleToEdit: VehicleWithPersonInfo | null;
    people: Person[];
    blocks: Block[];
    apartments: Apartment[];
    addVehicle: (personId: string, vehicle: Omit<Vehicle, 'id'>) => void;
    updateVehicle: (personId: string, vehicle: Vehicle) => void;
}

const VehicleFormModal: React.FC<VehicleFormModalProps> = ({ isOpen, onClose, vehicleToEdit, people, blocks, apartments, addVehicle, updateVehicle }) => {
    const [blockId, setBlockId] = useState('');
    const [apartmentId, setApartmentId] = useState('');
    const [personId, setPersonId] = useState('');
    const [model, setModel] = useState('');
    const [plate, setPlate] = useState('');

    const residentsInApt = useMemo(() => {
        if (!apartmentId) return [];
        return people.filter(p => p.roles.isResident && p.isActive && p.apartmentId === apartmentId);
    }, [people, apartmentId]);

    const resetForm = () => {
        setBlockId('');
        setApartmentId('');
        setPersonId('');
        setModel('');
        setPlate('');
    };
    
    useEffect(() => {
        if (isOpen) {
            if (vehicleToEdit && vehicleToEdit.apartmentInfo) {
                setBlockId(vehicleToEdit.apartmentInfo.blockId);
                setApartmentId(vehicleToEdit.apartmentInfo.id);
                setPersonId(vehicleToEdit.personId);
                setModel(vehicleToEdit.model);
                setPlate(vehicleToEdit.plate);
            } else {
                resetForm();
            }
        }
    }, [vehicleToEdit, isOpen]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!personId || !model || !plate) {
            alert("Todos os campos são obrigatórios.");
            return;
        }

        if (vehicleToEdit) {
            updateVehicle(vehicleToEdit.personId, { id: vehicleToEdit.id, model, plate });
        } else {
            addVehicle(personId, { model, plate });
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={vehicleToEdit ? "Editar Veículo" : "Adicionar Novo Veículo"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-brand-secondary">Bloco</label>
                    <select
                        value={blockId}
                        onChange={e => {setBlockId(e.target.value); setApartmentId(''); setPersonId('');}}
                        className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed"
                        required
                        disabled={!!vehicleToEdit}
                    >
                        <option value="">Selecione um bloco...</option>
                        {blocks.sort((a,b) => a.name.localeCompare(b.name)).map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-secondary">Apartamento</label>
                    <select
                        value={apartmentId}
                        onChange={e => {setApartmentId(e.target.value); setPersonId('');}}
                        className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed"
                        required
                        disabled={!!vehicleToEdit || !blockId}
                    >
                        <option value="">Selecione um apartamento...</option>
                        {apartments.filter(a => a.blockId === blockId).sort((a,b)=> a.number.localeCompare(b.number)).map(apt => (
                            <option key={apt.id} value={apt.id}>{apt.number}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-brand-secondary">Morador</label>
                    <select
                        value={personId}
                        onChange={e => setPersonId(e.target.value)}
                        className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed"
                        required
                        disabled={!!vehicleToEdit || !apartmentId}
                    >
                        <option value="">Selecione um morador...</option>
                        {residentsInApt.sort((a,b) => a.name.localeCompare(b.name)).map(res => (
                            <option key={res.id} value={res.id}>{res.name}</option>
                        ))}
                         {apartmentId && residentsInApt.length === 0 && <option disabled>Nenhum morador nesta unidade</option>}
                    </select>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-secondary">Modelo do Veículo</label>
                        <input type="text" value={model} onChange={e => setModel(e.target.value)} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-secondary">Placa</label>
                        <input type="text" value={plate} onChange={e => setPlate(e.target.value.toUpperCase())} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" required />
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-200 text-brand-secondary font-semibold rounded-lg hover:bg-slate-300">Cancelar</button>
                    <button type="submit" className="py-2 px-4 bg-brand-primary text-white font-semibold rounded-lg hover:bg-sky-700">Salvar</button>
                </div>
            </form>
            {/* // FIX: Removed unsupported <style jsx> tag and replaced 'input-style' class with equivalent Tailwind CSS classes. */}
        </Modal>
    );
};

export default Vehicles;