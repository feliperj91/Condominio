import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Package, PackageStatus, Person } from '../types';
import Modal from '../components/Modal';
import { PlusCircleIcon, ArchiveBoxArrowDownIcon, PencilIcon, PrinterIcon } from '../components/icons';
import { generateNotificationMessage } from '../services/geminiService';

const Packages = () => {
    const { packages, blocks, apartments, addPackage, updatePackage, getApartmentInfo } = useApp();
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<Package | null>(null);
    const [isDeliverListModalOpen, setIsDeliverListModalOpen] = useState(false);
    const [isNotifyModalOpen, setIsNotifyModalOpen] = useState<Package | null>(null);
    
    // Filter states
    const [filterBlock, setFilterBlock] = useState('');
    const [filterApartment, setFilterApartment] = useState('');
    const [filterReceivedStart, setFilterReceivedStart] = useState('');
    const [filterReceivedEnd, setFilterReceivedEnd] = useState('');
    const [filterDeliveredStart, setFilterDeliveredStart] = useState('');
    const [filterDeliveredEnd, setFilterDeliveredEnd] = useState('');
    const [filterReceiver, setFilterReceiver] = useState('');

    const uniqueReceivers = useMemo(() => [...new Set(packages.map(p => p.receivedBy))], [packages]);

    const filteredPackages = useMemo(() => {
        return packages.filter(pkg => {
            const apt = apartments.find(a => a.id === pkg.apartmentId);
            if (filterBlock && apt?.blockId !== filterBlock) return false;
            if (filterApartment && pkg.apartmentId !== filterApartment) return false;
            if (filterReceiver && pkg.receivedBy !== filterReceiver) return false;

            if (filterReceivedStart) {
                const start = new Date(filterReceivedStart);
                start.setHours(0,0,0,0);
                if (pkg.receivedAt < start) return false;
            }
            if (filterReceivedEnd) {
                const end = new Date(filterReceivedEnd);
                end.setHours(23,59,59,999);
                if (pkg.receivedAt > end) return false;
            }

            if (filterDeliveredStart) {
                if (pkg.status !== PackageStatus.Delivered || !pkg.deliveredAt) return false;
                const start = new Date(filterDeliveredStart);
                start.setHours(0,0,0,0);
                if (pkg.deliveredAt < start) return false;
            }
             if (filterDeliveredEnd) {
                if (pkg.status !== PackageStatus.Delivered || !pkg.deliveredAt) return false;
                const end = new Date(filterDeliveredEnd);
                end.setHours(23,59,59,999);
                if (pkg.deliveredAt > end) return false;
            }
            
            return true;
        });
    }, [packages, apartments, filterBlock, filterApartment, filterReceivedStart, filterReceivedEnd, filterDeliveredStart, filterDeliveredEnd, filterReceiver]);

    const waitingPackages = useMemo(() => {
        return filteredPackages
            .filter(p => p.status === PackageStatus.WaitingPickup)
            .sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());
    }, [filteredPackages]);
    
    const deliveredPackages = useMemo(() => {
        return filteredPackages
            .filter(p => p.status === PackageStatus.Delivered)
            .sort((a,b) => b.deliveredAt!.getTime() - a.deliveredAt!.getTime());
    }, [filteredPackages]);


    const handleOpenEditModal = (pkg: Package) => {
        setEditingPackage(pkg);
        setIsRegisterModalOpen(true);
    };

    const handleCloseRegisterModal = () => {
        setIsRegisterModalOpen(false);
        setEditingPackage(null);
    };

    const handlePrint = () => {
        window.print();
    }

    return (
        <>
            <div className="print:hidden">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-brand-dark">Gestão de Encomendas</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsDeliverListModalOpen(true)}
                            className="flex items-center gap-2 bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-slate-700 transition-colors"
                        >
                            <ArchiveBoxArrowDownIcon />
                            Registrar Saída
                        </button>
                        <button
                            onClick={() => { setEditingPackage(null); setIsRegisterModalOpen(true); }}
                            className="flex items-center gap-2 bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-sky-700 transition-colors"
                        >
                            <PlusCircleIcon />
                            Registrar Encomenda
                        </button>
                    </div>
                </div>

                <h2 className="text-2xl font-semibold text-brand-dark mb-4">Aguardando Retirada</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {waitingPackages.map(pkg => (
                        <PackageCard 
                            key={pkg.id} 
                            pkg={pkg}
                            onNotifyClick={() => setIsNotifyModalOpen(pkg)}
                            onEditClick={() => handleOpenEditModal(pkg)}
                        />
                    ))}
                </div>
                {waitingPackages.length === 0 && <p className="text-brand-secondary p-4">Nenhuma encomenda aguardando retirada para os filtros selecionados.</p>}
                
                <h2 className="text-2xl font-semibold text-brand-dark my-6">Histórico de Entregas</h2>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-brand-secondary">
                            <thead className="text-xs text-brand-secondary uppercase bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Apto</th>
                                    <th scope="col" className="px-6 py-3">Destinatário</th>
                                    <th scope="col" className="px-6 py-3">Descrição</th>
                                    <th scope="col" className="px-6 py-3">Recebido Por</th>
                                    <th scope="col" className="px-6 py-3">Retirado Por</th>
                                    <th scope="col" className="px-6 py-3">Data Retirada</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveredPackages.map(pkg => <DeliveredPackageRow key={pkg.id} pkg={pkg}/>)}
                            </tbody>
                        </table>
                        {deliveredPackages.length === 0 && <p className="text-center text-brand-secondary p-8">Nenhum histórico encontrado para os filtros selecionados.</p>}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md mt-6">
                    <h3 className="font-semibold text-brand-dark mb-3">Filtros e Relatórios</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-brand-secondary mb-1">Recebimento (Início)</label>
                            <input type="date" value={filterReceivedStart} onChange={e => setFilterReceivedStart(e.target.value)} className="block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-secondary mb-1">Recebimento (Fim)</label>
                            <input type="date" value={filterReceivedEnd} onChange={e => setFilterReceivedEnd(e.target.value)} className="block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-secondary mb-1">Retirada (Início)</label>
                            <input type="date" value={filterDeliveredStart} onChange={e => setFilterDeliveredStart(e.target.value)} className="block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-secondary mb-1">Retirada (Fim)</label>
                            <input type="date" value={filterDeliveredEnd} onChange={e => setFilterDeliveredEnd(e.target.value)} className="block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary" />
                        </div>
                        <select value={filterBlock} onChange={e => {setFilterBlock(e.target.value); setFilterApartment('')}} className="block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary">
                            <option value="">Todos os Blocos</option>
                            {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        <select value={filterApartment} onChange={e => setFilterApartment(e.target.value)} className="block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary" disabled={!filterBlock}>
                            <option value="">Todos os Aptos</option>
                            {apartments.filter(a => a.blockId === filterBlock).map(a => <option key={a.id} value={a.id}>{a.number}</option>)}
                        </select>
                        <select value={filterReceiver} onChange={e => setFilterReceiver(e.target.value)} className="block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary">
                            <option value="">Todos os Recebedores</option>
                            {uniqueReceivers.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                         <div className="flex items-end">
                            <button
                                onClick={handlePrint}
                                className="w-full flex items-center justify-center gap-2 bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-slate-700 transition-colors"
                            >
                                <PrinterIcon />
                                Imprimir / Salvar PDF
                            </button>
                        </div>
                    </div>
                </div>


                <RegisterPackageModal 
                    isOpen={isRegisterModalOpen} 
                    onClose={handleCloseRegisterModal} 
                    addPackage={addPackage} 
                    updatePackage={updatePackage}
                    packageToEdit={editingPackage}
                />
                <DeliverPackagesListModal isOpen={isDeliverListModalOpen} onClose={() => setIsDeliverListModalOpen(false)} />
                {isNotifyModalOpen && <NotifyResidentModal pkg={isNotifyModalOpen} onClose={() => setIsNotifyModalOpen(null)} />}
                {/* // FIX: Removed unsupported <style jsx> tag and replaced 'input-style' class with equivalent Tailwind CSS classes. */}
            </div>
            <div className="hidden print:block p-4">
                <h1 className="text-3xl font-bold text-center mb-2">CondoGenius</h1>
                <h2 className="text-xl text-center mb-4">Relatório de Encomendas</h2>
                <p className="text-center text-sm mb-6">Gerado em: {new Date().toLocaleString()}</p>
                 <div className="mb-6 p-4 border rounded-md">
                    <h3 className="font-semibold mb-2">Filtros Aplicados:</h3>
                    <p className="text-sm"><strong>Recebimento:</strong> de {filterReceivedStart || 'N/A'} até {filterReceivedEnd || 'N/A'}</p>
                    <p className="text-sm"><strong>Retirada:</strong> de {filterDeliveredStart || 'N/A'} até {filterDeliveredEnd || 'N/A'}</p>
                    <p className="text-sm"><strong>Bloco:</strong> {blocks.find(b => b.id === filterBlock)?.name || 'Todos'}</p>
                    <p className="text-sm"><strong>Apartamento:</strong> {apartments.find(a => a.id === filterApartment)?.number || 'Todos'}</p>
                    <p className="text-sm"><strong>Recebedor:</strong> {filterReceiver || 'Todos'}</p>
                </div>
                 <table className="w-full text-sm border-collapse border border-slate-400">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="border border-slate-300 p-2 text-left">Status</th>
                            <th className="border border-slate-300 p-2 text-left">Apartamento</th>
                            <th className="border border-slate-300 p-2 text-left">Destinatário</th>
                            <th className="border border-slate-300 p-2 text-left">Recebido Em</th>
                             <th className="border border-slate-300 p-2 text-left">Retirado Em</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPackages.map(pkg => (
                            <tr key={pkg.id} className="border-b">
                                <td className="border border-slate-300 p-2">{pkg.status === PackageStatus.WaitingPickup ? 'Aguardando' : 'Entregue'}</td>
                                <td className="border border-slate-300 p-2">{getApartmentInfo(pkg.apartmentId)?.fullNumber}</td>
                                <td className="border border-slate-300 p-2">{useApp().getPackageRecipientInfo(pkg).name}</td>
                                <td className="border border-slate-300 p-2">{pkg.receivedAt.toLocaleString()}</td>
                                <td className="border border-slate-300 p-2">{pkg.deliveredAt?.toLocaleString() || '-'}</td>
                            </tr>
                        ))}
                         {filteredPackages.length === 0 && (
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

const PackageCard: React.FC<{ pkg: Package, onNotifyClick: () => void, onEditClick: () => void }> = ({ pkg, onNotifyClick, onEditClick }) => {
    const { getApartmentInfo, getPackageRecipientInfo } = useApp();
    const aptInfo = getApartmentInfo(pkg.apartmentId);
    const recipientInfo = getPackageRecipientInfo(pkg);
    
    return (
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between">
            <div>
                <p className="font-bold text-lg text-brand-dark">{aptInfo?.fullNumber}</p>
                <p className="text-sm text-brand-dark">Para: <span className="font-semibold">{recipientInfo.name}</span></p>
                <p className="text-brand-secondary mt-1">{pkg.description}</p>
                {pkg.location && (
                    <p className="text-sm text-slate-600 mt-1">
                        <span className="font-semibold">Local:</span> {pkg.location}
                    </p>
                )}
                <p className="text-xs text-slate-500 mt-2">
                    Recebido por {pkg.receivedBy} em {pkg.receivedAt.toLocaleDateString()} às {pkg.receivedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
            <div className="flex gap-2 mt-4">
                <button onClick={onEditClick} className="w-full flex items-center justify-center gap-1 text-sm bg-slate-100 text-slate-800 font-semibold py-2 px-3 rounded-lg hover:bg-slate-200 transition-colors">
                    <PencilIcon /> Editar
                </button>
                <button onClick={onNotifyClick} className="w-full text-sm bg-blue-100 text-blue-800 font-semibold py-2 px-3 rounded-lg hover:bg-blue-200 transition-colors">Notificar</button>
            </div>
        </div>
    );
};

const DeliveredPackageRow: React.FC<{ pkg: Package }> = ({ pkg }) => {
    const { getApartmentInfo, getPackageRecipientInfo } = useApp();
    const aptInfo = getApartmentInfo(pkg.apartmentId);
    const recipientInfo = getPackageRecipientInfo(pkg);
    return (
        <tr className="bg-white border-b hover:bg-slate-50">
            <td className="px-6 py-4 font-medium text-brand-dark">{aptInfo?.fullNumber}</td>
            <td className="px-6 py-4">{recipientInfo.name}</td>
            <td className="px-6 py-4">{pkg.description}</td>
            <td className="px-6 py-4">{pkg.receivedBy}</td>
            <td className="px-6 py-4">{pkg.deliveredTo}</td>
            <td className="px-6 py-4">{pkg.deliveredAt?.toLocaleString()}</td>
        </tr>
    );
};

type RegisterPackageModalProps = {
    isOpen: boolean,
    onClose: () => void,
    addPackage: (pkg: Omit<Package, 'id' | 'status' | 'deliveredAt' | 'deliveredTo'> & { receivedAt?: Date }) => void,
    updatePackage: (id: string, updatedData: {
        description: string;
        apartmentId: string;
        receivedAt?: Date;
        location?: string;
        personId?: string;
        recipientName?: string;
        recipientPhone?: string;
    }) => void,
    packageToEdit?: Package | null
}

const formatDateForInput = (date: Date) => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};


const RegisterPackageModal: React.FC<RegisterPackageModalProps> = ({isOpen, onClose, addPackage, updatePackage, packageToEdit}) => {
    const { apartments, blocks, getResidentsForApartment } = useApp();
    const [blockId, setBlockId] = useState('');
    const [apartmentId, setApartmentId] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [receivedBy, setReceivedBy] = useState('');
    const [receivedAt, setReceivedAt] = useState('');
    const [recipientType, setRecipientType] = useState<'resident' | 'other'>('resident');
    const [personId, setPersonId] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');
    const [residentsInApt, setResidentsInApt] = useState<Person[]>([]);
    const [feedback, setFeedback] = useState('');

    const isEditing = !!packageToEdit;

    const resetForm = () => {
        setBlockId('');
        setApartmentId('');
        setDescription('');
        setLocation('');
        setReceivedBy('');
        setReceivedAt(formatDateForInput(new Date()));
        setRecipientType('resident');
        setPersonId('');
        setRecipientName('');
        setRecipientPhone('');
        setResidentsInApt([]);
        setFeedback('');
    }

    useEffect(() => {
        if (apartmentId) {
            const residents = getResidentsForApartment(apartmentId);
            setResidentsInApt(residents);
            if (!isEditing || packageToEdit?.apartmentId !== apartmentId) {
              if (residents.length > 0) {
                  setPersonId(residents[0].id);
                  setRecipientType('resident');
              } else {
                  setPersonId('');
                  setRecipientType('other');
              }
            }
        } else {
            setResidentsInApt([]);
            setPersonId('');
        }
    }, [apartmentId, getResidentsForApartment, isEditing, packageToEdit]);

    useEffect(() => {
        if (isOpen) {
            if (packageToEdit) {
                const apt = apartments.find(a => a.id === packageToEdit.apartmentId);
                setBlockId(apt?.blockId || '');
                setApartmentId(packageToEdit.apartmentId);
                setDescription(packageToEdit.description);
                setReceivedBy(packageToEdit.receivedBy);
                setLocation(packageToEdit.location || '');
                setReceivedAt(formatDateForInput(packageToEdit.receivedAt));
                
                if (packageToEdit.personId) {
                    setRecipientType('resident');
                    setPersonId(packageToEdit.personId);
                    setRecipientName('');
                    setRecipientPhone('');
                } else if (packageToEdit.recipientName) {
                    setRecipientType('other');
                    setPersonId('');
                    setRecipientName(packageToEdit.recipientName);
                    setRecipientPhone(packageToEdit.recipientPhone || '');
                } else {
                    const residents = getResidentsForApartment(packageToEdit.apartmentId);
                    if (residents.length > 0) {
                        setRecipientType('resident');
                        setPersonId(residents[0].id);
                    } else {
                        setRecipientType('other');
                    }
                }
            } else {
                resetForm();
            }
        }
    }, [isOpen, packageToEdit, apartments, getResidentsForApartment]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback('');
        if (!apartmentId || !description || !receivedBy || !receivedAt) {
            setFeedback('Todos os campos, exceto Localização, são obrigatórios.');
            return;
        }
        if (recipientType === 'resident' && !personId) {
            setFeedback('Selecione um morador ou mude o tipo de destinatário para "Outro".');
            return;
        }
        if (recipientType === 'other' && !recipientName) {
            setFeedback('O nome do destinatário é obrigatório para o tipo "Outro".');
            return;
        }

        const commonData = {
            apartmentId, description, location,
            ...(recipientType === 'resident' && { personId: personId }),
            ...(recipientType === 'other' && { recipientName: recipientName, recipientPhone: recipientPhone }),
        };

        if (isEditing) {
            updatePackage(packageToEdit.id, { ...commonData, receivedAt: new Date(receivedAt) });
        } else {
            addPackage({ ...commonData, receivedBy, receivedAt: new Date(receivedAt) });
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Encomenda" : "Registrar Nova Encomenda"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-brand-secondary">Bloco</label>
                        <select value={blockId} onChange={e => {setBlockId(e.target.value); setApartmentId('');}} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" required>
                            <option value="">Selecione...</option>
                            {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-secondary">Apartamento</label>
                        <select value={apartmentId} onChange={e => setApartmentId(e.target.value)} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" required disabled={!blockId}>
                            <option value="">Selecione...</option>
                            {apartments.filter(a => a.blockId === blockId).map(apt => (
                                <option key={apt.id} value={apt.id}>{apt.number}</option>
                            ))}
                        </select>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-brand-secondary">Descrição da Encomenda</label>
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-brand-secondary">Localização (ex: Prateleira A-1)</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" placeholder="Opcional" />
                </div>
                
                <div className="pt-4 border-t">
                    <h4 className="text-md font-semibold text-brand-dark mb-2">Destinatário</h4>
                    <div className="flex gap-4 mb-3">
                        <label className="flex items-center">
                            <input type="radio" name="recipientType" value="resident" checked={recipientType === 'resident'} onChange={() => setRecipientType('resident')} className="focus:ring-brand-primary h-4 w-4 text-brand-primary border-slate-300" disabled={residentsInApt.length === 0} />
                            <span className="ml-2 text-sm text-brand-dark">Morador Cadastrado</span>
                        </label>
                         <label className="flex items-center">
                            <input type="radio" name="recipientType" value="other" checked={recipientType === 'other'} onChange={() => setRecipientType('other')} className="focus:ring-brand-primary h-4 w-4 text-brand-primary border-slate-300" />
                            <span className="ml-2 text-sm text-brand-dark">Outro / Visitante</span>
                        </label>
                    </div>

                    {recipientType === 'resident' ? (
                        <div>
                            <label className="block text-sm font-medium text-brand-secondary">Morador</label>
                            <select value={personId} onChange={e => setPersonId(e.target.value)} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" required disabled={residentsInApt.length === 0}>
                                {residentsInApt.length > 0 ? (
                                    residentsInApt.map(r => <option key={r.id} value={r.id}>{r.name}</option>)
                                ) : (
                                    <option value="">Nenhum morador cadastrado nesta unidade</option>
                                )}
                            </select>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-brand-secondary">Nome do Destinatário</label>
                                <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" required/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-secondary">Telefone (Opcional)</label>
                                <input type="tel" value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" />
                            </div>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-secondary">Recebido por (Funcionário)</label>
                        <input type="text" value={receivedBy} onChange={e => setReceivedBy(e.target.value)} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" required disabled={isEditing} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-secondary">Data e Hora do Recebimento</label>
                        <input type="datetime-local" value={receivedAt} onChange={e => setReceivedAt(e.target.value)} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" required />
                    </div>
                </div>

                {feedback && <p className="text-sm text-red-700 bg-red-100 p-2 rounded-md">{feedback}</p>}

                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-200 text-brand-secondary font-semibold rounded-lg hover:bg-slate-300">Cancelar</button>
                    <button type="submit" className="py-2 px-4 bg-brand-primary text-white font-semibold rounded-lg hover:bg-sky-700">{isEditing ? "Salvar Alterações" : "Registrar"}</button>
                </div>
            </form>
             {/* // FIX: Removed unsupported <style jsx> tag and replaced 'input-style' class with equivalent Tailwind CSS classes. */}
        </Modal>
    );
};

const DeliverPackagesListModal: React.FC<{isOpen: boolean, onClose: () => void}> = ({isOpen, onClose}) => {
    const { packages, blocks, apartments, getApartmentInfo, getPackageRecipientInfo, deliverPackage } = useApp();
    
    const [filterBlockId, setFilterBlockId] = useState('');
    const [filterApartmentId, setFilterApartmentId] = useState('');
    const [filterRecipient, setFilterRecipient] = useState('');
    const [filterReceiver, setFilterReceiver] = useState('');
    const [packageToConfirm, setPackageToConfirm] = useState<Package | null>(null);

    const waitingPackagesWithInfo = useMemo(() => {
        return packages
            .filter(p => p.status === PackageStatus.WaitingPickup)
            .map(p => ({
                ...p, 
                recipientInfo: getPackageRecipientInfo(p),
                apartmentInfo: getApartmentInfo(p.apartmentId)
            }));
    }, [packages, getPackageRecipientInfo, getApartmentInfo]);

    const uniqueReceivers = useMemo(() => [...new Set(packages.map(p => p.receivedBy))], [packages]);
    
    const filteredPackages = useMemo(() => {
        return waitingPackagesWithInfo.filter(pkg => {
            if (filterBlockId && pkg.apartmentInfo?.blockName !== blocks.find(b => b.id === filterBlockId)?.name) return false;
            if (filterApartmentId && pkg.apartmentId !== filterApartmentId) return false;
            if (filterRecipient && !pkg.recipientInfo.name.toLowerCase().includes(filterRecipient.toLowerCase())) return false;
            if (filterReceiver && pkg.receivedBy !== filterReceiver) return false;
            return true;
        });
    }, [waitingPackagesWithInfo, filterBlockId, filterApartmentId, filterRecipient, filterReceiver, blocks]);

    const handleConfirmDelivery = (id: string, deliveredTo: string, deliveredAt: Date) => {
        deliverPackage(id, deliveredTo, deliveredAt);
        setPackageToConfirm(null);
    };

    const handleClose = () => {
        setFilterBlockId(''); setFilterApartmentId(''); setFilterRecipient(''); setFilterReceiver('');
        setPackageToConfirm(null);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Registrar Saída de Encomenda" maxWidth="max-w-4xl">
            <div className="space-y-4 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-b">
                    <input type="text" placeholder="Filtrar por destinatário..." value={filterRecipient} onChange={e => setFilterRecipient(e.target.value)} className="block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary" />
                    <select value={filterReceiver} onChange={e => setFilterReceiver(e.target.value)} className="block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary">
                        <option value="">Filtrar por Recebedor...</option>
                        {uniqueReceivers.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <select value={filterBlockId} onChange={e => {setFilterBlockId(e.target.value); setFilterApartmentId('');}} className="block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary">
                        <option value="">Filtrar por Bloco...</option>
                        {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <select value={filterApartmentId} onChange={e => setFilterApartmentId(e.target.value)} className="block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary" disabled={!filterBlockId}>
                        <option value="">Filtrar por Apto...</option>
                        {apartments.filter(a => a.blockId === filterBlockId).map(apt => (
                            <option key={apt.id} value={apt.id}>{apt.number}</option>
                        ))}
                    </select>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                    {filteredPackages.length > 0 ? (
                    <ul className="divide-y divide-slate-200">
                        {filteredPackages.map(pkg => (
                            <li key={pkg.id} className="flex justify-between items-center py-3">
                                <div>
                                    <p className="font-semibold text-brand-dark">{pkg.apartmentInfo?.fullNumber} - Para: {pkg.recipientInfo.name}</p>
                                    <p className="text-sm text-brand-secondary">{pkg.description}</p>
                                    <p className="text-xs text-slate-500">Recebido por {pkg.receivedBy} em {pkg.receivedAt.toLocaleDateString()}</p>
                                </div>
                                <button onClick={() => setPackageToConfirm(pkg)} className="text-sm bg-green-100 text-green-800 font-semibold py-1 px-3 rounded-lg hover:bg-green-200 transition-colors">Entregar</button>
                            </li>
                        ))}
                    </ul>
                    ) : (
                        <p className="text-center text-brand-secondary p-8">Nenhuma encomenda encontrada com os filtros selecionados.</p>
                    )}
                </div>
                {packageToConfirm && (
                    <ConfirmDeliveryModal
                        pkg={packageToConfirm}
                        onClose={() => setPackageToConfirm(null)}
                        onConfirm={handleConfirmDelivery}
                    />
                )}
            </div>
            {/* // FIX: Removed unsupported <style jsx> tag and replaced 'input-style' class with equivalent Tailwind CSS classes. */}
        </Modal>
    )
}

const ConfirmDeliveryModal: React.FC<{pkg: Package, onClose: () => void, onConfirm: (id: string, deliveredTo: string, deliveredAt: Date) => void}> = ({pkg, onClose, onConfirm}) => {
    const [deliveredTo, setDeliveredTo] = useState('');
    const [deliveredAt, setDeliveredAt] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!deliveredTo || !deliveredAt) return;
        const [year, month, day] = deliveredAt.split('-').map(Number);
        const deliveryDate = new Date(year, month - 1, day, 12, 0, 0); // Use noon to avoid timezone issues
        onConfirm(pkg.id, deliveredTo, deliveryDate);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-2xl border w-full max-w-md">
                <h4 className="text-lg font-semibold text-brand-dark mb-4">Confirmar Entrega</h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm">Encomenda: <span className="font-medium">{pkg.description}</span></p>
                    <div>
                        <label className="block text-sm font-medium text-brand-secondary">Nome de quem retirou</label>
                        <input type="text" value={deliveredTo} onChange={e => setDeliveredTo(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-md" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-brand-secondary">Data da Retirada</label>
                        <input type="date" value={deliveredAt} onChange={e => setDeliveredAt(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-md" required />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-200 text-brand-secondary font-semibold rounded-lg hover:bg-slate-300">Cancelar</button>
                        <button type="submit" className="py-2 px-4 bg-brand-primary text-white font-semibold rounded-lg hover:bg-sky-700">Confirmar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const NotifyResidentModal: React.FC<{ pkg: Package, onClose: () => void }> = ({ pkg, onClose }) => {
    const { getPackageRecipientInfo, getApartmentInfo } = useApp();
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const recipientInfo = getPackageRecipientInfo(pkg);
    const aptInfo = getApartmentInfo(pkg.apartmentId);

    useEffect(() => {
        if (recipientInfo && aptInfo && recipientInfo.name !== 'Morador Principal') {
            generateNotificationMessage(recipientInfo.name, aptInfo.blockName, aptInfo.number)
                .then(setMessage)
                .finally(() => setIsLoading(false));
        } else {
            setMessage('Não foi possível encontrar dados nominais do destinatário para gerar a mensagem.');
            setIsLoading(false);
        }
    }, [pkg, recipientInfo, aptInfo]);
    
    const handleWhatsApp = () => {
        if(recipientInfo?.phone) {
             window.open(`https://api.whatsapp.com/send?phone=${recipientInfo.phone.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`, '_blank');
        }
    };
    
    const handleEmail = () => {
        if(recipientInfo?.email) {
            window.open(`mailto:${recipientInfo.email}?subject=Encomenda Disponível para Retirada&body=${encodeURIComponent(message)}`, '_blank');
        }
    }

    return (
        <Modal isOpen={true} onClose={onClose} title="Notificar Destinatário">
            {isLoading ? <p>Gerando mensagem com IA...</p> : (
                <div className="space-y-4">
                    <p>Destinatário: <span className="font-semibold">{recipientInfo?.name || 'Não encontrado'}</span></p>
                    <textarea className="w-full h-40 p-2 border rounded" value={message} onChange={e => setMessage(e.target.value)}></textarea>
                    <div className="flex justify-end gap-3">
                         <button onClick={handleWhatsApp} disabled={!recipientInfo?.phone} className="py-2 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:bg-slate-300">Enviar via WhatsApp</button>
                         <button onClick={handleEmail} disabled={!recipientInfo?.email} className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-slate-300">Enviar via Email</button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default Packages;