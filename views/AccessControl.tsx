import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { VehicleLog, VehicleLogStatus, VehicleLogType } from '../types';
import Modal from '../components/Modal';
import { PlusCircleIcon, ArrowLeftOnRectangleIcon, PrinterIcon } from '../components/icons';

const LimitSelector: React.FC<{limit: number, setLimit: (limit: number) => void, total: number}> = ({ limit, setLimit, total }) => {
    const options = [5, 10, 20, 50];
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="text-brand-secondary">Exibir:</span>
            <select 
                value={limit} 
                onChange={e => setLimit(parseInt(e.target.value, 10))}
                className="p-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:border-brand-primary"
                aria-label="Selecionar quantidade de itens por página"
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
             <span className="text-brand-secondary">de {total} registros.</span>
        </div>
    );
};

const AccessControl = () => {
    const { vehicleLogs, blocks, apartments, getLogDetailsString, registerVehicleExit } = useApp();
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    const [insideLimit, setInsideLimit] = useState(10);
    const [historyLimit, setHistoryLimit] = useState(10);
    
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterBlock, setFilterBlock] = useState('');
    const [filterApartment, setFilterApartment] = useState('');

    const allVehiclesInside = useMemo(() => {
        return vehicleLogs.filter(log => log.status === VehicleLogStatus.Inside)
            .sort((a, b) => b.entryTime.getTime() - a.entryTime.getTime());
    }, [vehicleLogs]);
    
    const filteredHistoryLogs = useMemo(() => {
        let logs = [...vehicleLogs];
        
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            logs = logs.filter(log => log.entryTime >= start);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            logs = logs.filter(log => log.entryTime <= end);
        }
        if (filterBlock) {
            const aptsInBlock = apartments.filter(a => a.blockId === filterBlock).map(a => a.id);
            logs = logs.filter(log => aptsInBlock.includes(log.apartmentId));
        }
        if (filterApartment) {
            logs = logs.filter(log => log.apartmentId === filterApartment);
        }

        return logs.sort((a,b) => b.entryTime.getTime() - a.entryTime.getTime());

    }, [vehicleLogs, startDate, endDate, filterBlock, filterApartment, apartments]);

    const vehiclesInside = useMemo(() => allVehiclesInside.slice(0, insideLimit), [allVehiclesInside, insideLimit]);
    const historyLogs = useMemo(() => filteredHistoryLogs.slice(0, historyLimit), [filteredHistoryLogs, historyLimit]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <div className="print:hidden">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-brand-dark">Controle de Acesso de Veículos</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsExitModalOpen(true)}
                            className="flex items-center gap-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition-colors"
                        >
                            <ArrowLeftOnRectangleIcon />
                            Registrar Saída
                        </button>
                        <button
                            onClick={() => setIsEntryModalOpen(true)}
                            className="flex items-center gap-2 bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-sky-700 transition-colors"
                        >
                            <PlusCircleIcon />
                            Registrar Entrada
                        </button>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-brand-dark">Veículos Presentes</h2>
                        <LimitSelector limit={insideLimit} setLimit={setInsideLimit} total={allVehiclesInside.length} />
                    </div>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-brand-secondary">
                                <thead className="text-xs text-brand-secondary uppercase bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Placa</th>
                                        <th scope="col" className="px-6 py-3">Modelo</th>
                                        <th scope="col" className="px-6 py-3">Detalhes</th>
                                        <th scope="col" className="px-6 py-3">Entrada</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vehiclesInside.map(log => (
                                        <tr key={log.id} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-6 py-4 font-mono text-brand-dark tracking-wider">{log.plate}</td>
                                            <td className="px-6 py-4">{log.model}</td>
                                            <td className="px-6 py-4">{getLogDetailsString(log)}</td>
                                            <td className="px-6 py-4">{log.entryTime.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {allVehiclesInside.length === 0 && <p className="text-center text-brand-secondary p-8">Nenhum veículo no condomínio.</p>}
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-brand-dark">Histórico de Movimentação</h2>
                        <LimitSelector limit={historyLimit} setLimit={setHistoryLimit} total={filteredHistoryLogs.length} />
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-brand-secondary">
                                <thead className="text-xs text-brand-secondary uppercase bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Placa</th>
                                        <th scope="col" className="px-6 py-3">Detalhes</th>
                                        <th scope="col" className="px-6 py-3">Entrada</th>
                                        <th scope="col" className="px-6 py-3">Saída</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyLogs.map(log => (
                                        <tr key={log.id} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-6 py-4 font-mono text-brand-dark tracking-wider">{log.plate}</td>
                                            <td className="px-6 py-4">{getLogDetailsString(log)}</td>
                                            <td className="px-6 py-4">{log.entryTime.toLocaleString()}</td>
                                            <td className="px-6 py-4">{log.exitTime?.toLocaleString() || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${log.status === VehicleLogStatus.Inside ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {log.status === VehicleLogStatus.Inside ? 'DENTRO' : 'FORA'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredHistoryLogs.length === 0 && <p className="text-center text-brand-secondary p-8">Nenhum registro encontrado para os filtros selecionados.</p>}
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-md mt-6 flex flex-col md:flex-row md:items-center md:gap-4">
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow">
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary" />
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary" />
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

                <RegisterEntryModal isOpen={isEntryModalOpen} onClose={() => setIsEntryModalOpen(false)} />
                <RegisterExitModal isOpen={isExitModalOpen} onClose={() => setIsExitModalOpen(false)} />
                {/* // FIX: Removed unsupported <style jsx> tag and replaced 'input-style' class with equivalent Tailwind CSS classes. */}
            </div>
            <div className="hidden print:block p-8">
                <h1 className="text-3xl font-bold text-center mb-2">CondoGenius</h1>
                <h2 className="text-xl text-center mb-4">Relatório de Movimentação de Veículos</h2>
                <p className="text-center text-sm mb-6">Gerado em: {new Date().toLocaleString()}</p>
                <div className="mb-6 p-4 border rounded-md">
                    <h3 className="font-semibold mb-2">Filtros Aplicados:</h3>
                    <p className="text-sm"><strong>Período:</strong> de {startDate || 'N/A'} até {endDate || 'N/A'}</p>
                    <p className="text-sm"><strong>Bloco:</strong> {blocks.find(b => b.id === filterBlock)?.name || 'Todos'}</p>
                    <p className="text-sm"><strong>Apartamento:</strong> {apartments.find(a => a.id === filterApartment)?.number || 'Todos'}</p>
                </div>
                <table className="w-full text-sm border-collapse border border-slate-400">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="border border-slate-300 p-2 text-left">Placa</th>
                            <th className="border border-slate-300 p-2 text-left">Detalhes</th>
                            <th className="border border-slate-300 p-2 text-left">Entrada</th>
                            <th className="border border-slate-300 p-2 text-left">Saída</th>
                            <th className="border border-slate-300 p-2 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHistoryLogs.map(log => (
                            <tr key={log.id} className="border-b">
                                <td className="border border-slate-300 p-2 font-mono">{log.plate}</td>
                                <td className="border border-slate-300 p-2">{getLogDetailsString(log)}</td>
                                <td className="border border-slate-300 p-2">{log.entryTime.toLocaleString()}</td>
                                <td className="border border-slate-300 p-2">{log.exitTime?.toLocaleString() || '-'}</td>
                                <td className="border border-slate-300 p-2">
                                    {log.status === VehicleLogStatus.Inside ? 'DENTRO' : 'FORA'}
                                </td>
                            </tr>
                        ))}
                         {filteredHistoryLogs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="border border-slate-300 p-4 text-center">Nenhum registro encontrado para os filtros selecionados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

interface RegisterEntryModalProps { isOpen: boolean; onClose: () => void; }

const RegisterEntryModal: React.FC<RegisterEntryModalProps> = ({ isOpen, onClose }) => {
    const { apartments, blocks, getAllVehicles, registerVehicleEntry } = useApp();
    const [plate, setPlate] = useState('');
    const [model, setModel] = useState('');
    const [blockId, setBlockId] = useState('');
    const [apartmentId, setApartmentId] = useState('');
    const [entryType, setEntryType] = useState<VehicleLogType>(VehicleLogType.Visitor);
    const [contactPhone, setContactPhone] = useState('');
    const [isResidentVehicle, setIsResidentVehicle] = useState(false);
    const [personId, setPersonId] = useState<string | undefined>(undefined);
    const [feedback, setFeedback] = useState('');

    const allVehicles = useMemo(() => getAllVehicles(), [getAllVehicles]);
    
    useEffect(() => {
        if (isOpen) { // Reset state when modal opens
            setPlate(''); setModel(''); setBlockId(''); setApartmentId(''); setEntryType(VehicleLogType.Visitor); setContactPhone('');
            setIsResidentVehicle(false); setPersonId(undefined); setFeedback('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (!plate) {
            setModel(''); setBlockId(''); setApartmentId(''); setIsResidentVehicle(false); setPersonId(undefined); return;
        }
        const foundVehicle = allVehicles.find(v => v.plate.toUpperCase() === plate.toUpperCase());
        if (foundVehicle && foundVehicle.apartmentInfo) {
            const apt = apartments.find(a => a.id === foundVehicle.apartmentInfo!.id);
            if(apt) {
                setModel(foundVehicle.model);
                setBlockId(apt.blockId);
                setApartmentId(apt.id);
                setIsResidentVehicle(true);
                setPersonId(foundVehicle.personId);
            }
        } else {
            setIsResidentVehicle(false); setPersonId(undefined);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [plate, allVehicles, apartments]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback('');
        if (!plate || !model || !apartmentId) {
            setFeedback('Erro: Placa, Modelo e Apartamento são obrigatórios.'); return;
        }
        if (!isResidentVehicle && !contactPhone) {
            setFeedback('Erro: Telefone de contato é obrigatório para visitantes e prestadores.'); return;
        }

        try {
            registerVehicleEntry({
                plate: plate.toUpperCase(), model, apartmentId,
                type: isResidentVehicle ? VehicleLogType.Resident : entryType,
                personId: isResidentVehicle ? personId : undefined,
                contactPhone: isResidentVehicle ? undefined : contactPhone,
            });
            onClose();
        } catch (error) {
            if (error instanceof Error) setFeedback(`Erro: ${error.message}`);
            else setFeedback('Ocorreu um erro desconhecido.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Entrada de Veículo">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-secondary">Placa</label>
                        <input type="text" value={plate} onChange={e => setPlate(e.target.value.toUpperCase())} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-secondary">Modelo</label>
                        <input type="text" value={model} onChange={e => setModel(e.target.value)} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" required disabled={isResidentVehicle} />
                    </div>
                </div>
                {!isResidentVehicle && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-brand-secondary">Tipo</label>
                            <select value={entryType} onChange={e => setEntryType(e.target.value as VehicleLogType)} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed">
                                <option value={VehicleLogType.Visitor}>Visitante</option>
                                <option value={VehicleLogType.ServiceProvider}>Prestador de Serviço</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-brand-secondary">Telefone de Contato</label>
                            <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" required={!isResidentVehicle}/>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-brand-secondary">Bloco de Destino</label>
                        <select value={blockId} onChange={(e) => { setBlockId(e.target.value); setApartmentId(''); }} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" required disabled={isResidentVehicle}>
                            <option value="">Selecione...</option>
                            {blocks.map(b => ( <option key={b.id} value={b.id}>{b.name}</option> ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-secondary">Apartamento de Destino</label>
                        <select value={apartmentId} onChange={e => setApartmentId(e.target.value)} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" required disabled={isResidentVehicle || !blockId}>
                            <option value="">Selecione...</option>
                            {apartments.filter(a => a.blockId === blockId).map(apt => (
                                <option key={apt.id} value={apt.id}>{apt.number}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {isResidentVehicle && <p className="text-sm text-green-700 bg-green-100 p-2 rounded-md">Veículo de morador detectado. Informações preenchidas automaticamente.</p>}
                {feedback && <p className="text-sm text-red-700 bg-red-100 p-2 rounded-md">{feedback}</p>}
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-200 text-brand-secondary font-semibold rounded-lg hover:bg-slate-300">Cancelar</button>
                    <button type="submit" className="py-2 px-4 bg-brand-primary text-white font-semibold rounded-lg hover:bg-sky-700">Registrar Entrada</button>
                </div>
            </form>
             {/* // FIX: Removed unsupported <style jsx> tag and replaced 'input-style' class with equivalent Tailwind CSS classes. */}
        </Modal>
    );
};

interface RegisterExitModalProps { isOpen: boolean; onClose: () => void; }

const RegisterExitModal: React.FC<RegisterExitModalProps> = ({ isOpen, onClose }) => {
    const { vehicleLogs, registerVehicleExit, getLogDetailsString } = useApp();
    const [searchTerm, setSearchTerm] = useState('');

    const vehiclesInside = useMemo(() => {
        return vehicleLogs.filter(log => log.status === VehicleLogStatus.Inside)
            .sort((a, b) => b.entryTime.getTime() - a.entryTime.getTime());
    }, [vehicleLogs]);
    
    const filteredVehicles = useMemo(() => {
        if (!searchTerm) return vehiclesInside;
        return vehiclesInside.filter(v => v.plate.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [vehiclesInside, searchTerm]);

    const handleExit = (logId: string) => {
        registerVehicleExit(logId);
        setSearchTerm('');
        if (filteredVehicles.length <=1) {
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Saída de Veículo">
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Buscar por placa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                    className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
                <div className="max-h-96 overflow-y-auto">
                    {filteredVehicles.length > 0 ? (
                        <ul className="divide-y divide-slate-200">
                        {filteredVehicles.map(log => (
                            <li key={log.id} className="flex justify-between items-center py-3">
                                <div>
                                    <p className="font-mono text-brand-dark tracking-wider">{log.plate} - <span className="font-sans font-normal text-brand-secondary">{log.model}</span></p>
                                    <p className="text-sm text-slate-500">{getLogDetailsString(log)}</p>
                                </div>
                                <button
                                    onClick={() => handleExit(log.id)}
                                    className="text-sm bg-red-100 text-red-800 font-semibold py-1 px-3 rounded-lg hover:bg-red-200 transition-colors"
                                >
                                    Registrar Saída
                                </button>
                            </li>
                        ))}
                    </ul>
                    ) : (
                        <p className="text-center text-brand-secondary p-8">Nenhum veículo encontrado.</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};


export default AccessControl;