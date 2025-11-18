import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Person, Vehicle, PersonRoles, Block, Apartment } from '../types';
import Modal from '../components/Modal';
import { PlusCircleIcon } from '../components/icons';

const People = () => {
    const { people, apartments, blocks, addPerson, updatePerson, deletePerson, setPersonStatus } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fullApartmentInfo = useMemo(() => {
        const blockMap = new Map(blocks.map(b => [b.id, b.name]));
        return apartments.map(apt => {
            const blockName = blockMap.get(apt.blockId) || 'N/A';
            return {
                ...apt,
                blockName,
                fullNumber: `${blockName} - ${apt.number}`
            };
        });
    }, [apartments, blocks]);

    const filteredPeople = useMemo(() => {
        return people.filter(person => {
            const apartmentInfo = person.apartmentId ? fullApartmentInfo.find(a => a.id === person.apartmentId) : null;
            const lowerCaseSearch = searchTerm.toLowerCase();
            return (
                person.name.toLowerCase().includes(lowerCaseSearch) ||
                (apartmentInfo && apartmentInfo.fullNumber.toLowerCase().includes(lowerCaseSearch)) ||
                person.vehicles.some(v => v.plate.toLowerCase().includes(lowerCaseSearch))
            );
        }).sort((a,b) => a.name.localeCompare(b.name));
    }, [people, searchTerm, fullApartmentInfo]);

    const getPersonApartmentInfo = (apartmentId?: string) => {
        if (!apartmentId) return 'N/A';
        return fullApartmentInfo.find(a => a.id === apartmentId)?.fullNumber || 'N/A';
    };

    const handleOpenEdit = (person: Person) => {
        setEditingPerson(person);
        setIsModalOpen(true);
    }
    
    const handleOpenAdd = () => {
        setEditingPerson(null);
        setIsModalOpen(true);
    }

    const handleDelete = (person: Person) => {
        if (window.confirm(`Tem certeza que deseja excluir ${person.name}? Esta ação não pode ser desfeita.`)) {
            deletePerson(person.id);
        }
    }
    
    const handleToggleStatus = (person: Person) => {
        const action = person.isActive ? 'inativar' : 'ativar';
        if (window.confirm(`Tem certeza que deseja ${action} ${person.name}?`)) {
            setPersonStatus(person.id, !person.isActive);
        }
    }
    
    const getRolesString = (roles: PersonRoles) => {
        const activeRoles = [];
        if (roles.isResident) activeRoles.push('Morador');
        if (roles.isAdmin) activeRoles.push('Admin');
        if (roles.isDoorman) activeRoles.push('Porteiro');
        if (roles.isManager) activeRoles.push('Síndico');
        if (roles.isServiceProvider) activeRoles.push('Serviço');
        return activeRoles.join(', ') || 'Nenhum';
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-brand-dark">Pessoas</h1>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-2 bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-sky-700 transition-colors"
                >
                    <PlusCircleIcon />
                    Nova Pessoa
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar por nome, apartamento ou placa..."
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
                                <th scope="col" className="px-6 py-3">Nome</th>
                                <th scope="col" className="px-6 py-3">Papéis</th>
                                <th scope="col" className="px-6 py-3">Apartamento</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPeople.map(person => (
                                <tr key={person.id} className={`border-b hover:bg-slate-50 ${!person.isActive ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}>
                                    <td className="px-6 py-4 font-medium text-brand-dark">{person.name}</td>
                                    <td className="px-6 py-4 text-xs">{getRolesString(person.roles)}</td>
                                    <td className="px-6 py-4">{getPersonApartmentInfo(person.apartmentId)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${person.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {person.isActive ? 'ATIVO' : 'INATIVO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-4 text-xs font-semibold">
                                        <button onClick={() => handleOpenEdit(person)} className="text-brand-primary hover:underline">Editar</button>
                                        <button onClick={() => handleToggleStatus(person)} className="text-yellow-600 hover:underline">{person.isActive ? 'Inativar' : 'Ativar'}</button>
                                        <button onClick={() => handleDelete(person)} className="text-red-600 hover:underline">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {filteredPeople.length === 0 && (
                    <p className="text-center text-brand-secondary p-8">Nenhuma pessoa encontrada.</p>
                 )}
            </div>

            <PersonFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                personToEdit={editingPerson}
                apartments={apartments}
                blocks={blocks}
            />
        </div>
    );
};


interface PersonFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    personToEdit: Person | null;
    apartments: Apartment[];
    blocks: Block[];
}

const PersonFormModal: React.FC<PersonFormModalProps> = ({ isOpen, onClose, personToEdit, apartments, blocks }) => {
    const { addPerson, updatePerson } = useApp();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [blockId, setBlockId] = useState('');
    const [apartmentId, setApartmentId] = useState('');
    const [roles, setRoles] = useState<PersonRoles>({ isResident: true, isAdmin: false, isDoorman: false, isManager: false, isServiceProvider: false });
    const [vehicles, setVehicles] = useState<Omit<Vehicle, 'id'>[]>([]);
    const [vehicleModel, setVehicleModel] = useState('');
    const [vehiclePlate, setVehiclePlate] = useState('');

    const isEditing = !!personToEdit;

    useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                setName(personToEdit.name);
                setEmail(personToEdit.email);
                setPhone(personToEdit.phone);
                setRoles(personToEdit.roles);
                setVehicles(personToEdit.vehicles);

                if (personToEdit.apartmentId) {
                    const apt = apartments.find(a => a.id === personToEdit.apartmentId);
                    setBlockId(apt?.blockId || '');
                    setApartmentId(personToEdit.apartmentId);
                } else {
                    setBlockId('');
                    setApartmentId('');
                }

            } else {
                // Reset form
                setName('');
                setEmail('');
                setPhone('');
                setBlockId('');
                setApartmentId('');
                setRoles({ isResident: true, isAdmin: false, isDoorman: false, isManager: false, isServiceProvider: false });
                setVehicles([]);
                setVehicleModel('');
                setVehiclePlate('');
            }
        }
    }, [isOpen, personToEdit, isEditing, apartments]);

    const handleRoleChange = (role: keyof PersonRoles) => {
        const newRoles = { ...roles, [role]: !roles[role] };
        if (role === 'isResident' && !newRoles.isResident) {
            setBlockId('');
            setApartmentId('');
            setVehicles([]);
        }
        setRoles(newRoles);
    }
    
    const handleAddVehicle = () => {
        if (vehicleModel && vehiclePlate) {
            setVehicles([...vehicles, { model: vehicleModel, plate: vehiclePlate.toUpperCase() }]);
            setVehicleModel('');
            setVehiclePlate('');
        }
    };
    
    const handleRemoveVehicle = (index: number) => {
        setVehicles(vehicles.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            alert("O nome é obrigatório.");
            return;
        }
        if (roles.isResident && !apartmentId) {
            alert("Para moradores, o apartamento é obrigatório.");
            return;
        }

        const personData = {
            name, email, phone, roles,
            apartmentId: roles.isResident ? apartmentId : undefined,
            vehicles: roles.isResident ? vehicles.map(v => ( 'id' in v ? v : {...v, id: crypto.randomUUID()})) as Vehicle[] : [],
        };

        if (isEditing) {
            updatePerson(personToEdit.id, personData);
        } else {
            addPerson(personData);
        }
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Pessoa" : "Cadastrar Nova Pessoa"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-secondary">Nome Completo</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-brand-secondary">Telefone (WhatsApp)</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-secondary">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" />
                </div>

                <div className="pt-4 border-t">
                    <h4 className="text-md font-semibold text-brand-dark mb-2">Papéis / Funções</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {(Object.keys(roles) as Array<keyof PersonRoles>).map(role => (
                            <label key={role} className="flex items-center">
                                <input type="checkbox" checked={roles[role]} onChange={() => handleRoleChange(role)} className="focus:ring-brand-primary h-4 w-4 text-brand-primary border-slate-300 rounded" />
                                <span className="ml-2 text-sm text-brand-dark">
                                    { {isResident: 'Morador', isAdmin: 'Admin', isDoorman: 'Porteiro', isManager: 'Síndico', isServiceProvider: 'Serviço'}[role] }
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
                
                {roles.isResident && (
                    <>
                        <div className="pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-brand-secondary">Bloco</label>
                                <select value={blockId} onChange={e => { setBlockId(e.target.value); setApartmentId(''); }} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" required={roles.isResident}>
                                    <option value="">Selecione...</option>
                                    {blocks.sort((a,b) => a.name.localeCompare(b.name)).map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-brand-secondary">Apartamento</label>
                                <select value={apartmentId} onChange={e => setApartmentId(e.target.value)} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" required={roles.isResident} disabled={!blockId}>
                                    <option value="">Selecione...</option>
                                    {apartments.filter(a => a.blockId === blockId).sort((a,b) => a.number.localeCompare(b.number, undefined, { numeric: true })).map(apt => (
                                        <option key={apt.id} value={apt.id}>{apt.number}</option>
                                    ))}
                                </select>
                             </div>
                        </div>
                        <div className="pt-4 border-t">
                            <h4 className="text-md font-semibold text-brand-dark mb-2">Veículos</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-brand-secondary">Modelo</label>
                                    <input type="text" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-brand-secondary">Placa</label>
                                    <input type="text" value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value.toUpperCase())} className="mt-1 block w-full py-2 px-3 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-slate-100 disabled:cursor-not-allowed" />
                                </div>
                                <div className="md:col-span-1">
                                    <button type="button" onClick={handleAddVehicle} className="w-full bg-slate-200 text-brand-secondary font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors">Adicionar</button>
                                </div>
                            </div>
                            <ul className="mt-2 space-y-1">
                                {vehicles.map((v, i) => (
                                    <li key={i} className="flex justify-between items-center text-sm text-brand-secondary bg-slate-50 p-1 rounded">
                                        <span>{v.model} - {v.plate}</span>
                                        <button type="button" onClick={() => handleRemoveVehicle(i)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Remover</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}
                
                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-200 text-brand-secondary font-semibold rounded-lg hover:bg-slate-300">Cancelar</button>
                    <button type="submit" className="py-2 px-4 bg-brand-primary text-white font-semibold rounded-lg hover:bg-sky-700">{isEditing ? 'Salvar Alterações' : 'Salvar Pessoa'}</button>
                </div>
            </form>
            {/* // FIX: Removed unsupported <style jsx> tag and replaced 'input-style' class with equivalent Tailwind CSS classes. */}
        </Modal>
    );
}

export default People;