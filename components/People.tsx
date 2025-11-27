import React, { useState, useMemo } from 'react';
import { Person, Role, Unit } from '../types';
import { Users, UserPlus, Briefcase, Home, Shield } from 'lucide-react';

interface PeopleProps {
  people: Person[];
  units: Unit[];
  onAddPerson: (person: Person) => void;
}

export const People: React.FC<PeopleProps> = ({ people, units, onAddPerson }) => {
  const [activeTab, setActiveTab] = useState<'RESIDENT' | 'STAFF'>('RESIDENT');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>(Role.RESIDENT);
  
  // Unit Selection State
  const [selectedBlock, setSelectedBlock] = useState('');
  const [unitId, setUnitId] = useState('');

  const handleAdd = () => {
    if (!name || !email) return;
    
    const newPerson: Person = {
      id: Math.random().toString(36),
      name,
      email,
      phone,
      role,
      unitId: role === Role.RESIDENT ? unitId : undefined,
      avatarUrl: `https://ui-avatars.com/api/?name=${name}&background=random`
    };

    onAddPerson(newPerson);
    // Reset
    setName('');
    setEmail('');
    setPhone('');
    setUnitId('');
    setSelectedBlock('');
  };

  const filteredPeople = people.filter(p => {
    if (activeTab === 'RESIDENT') return p.role === Role.RESIDENT;
    return p.role === Role.STAFF || p.role === Role.ADMIN;
  });

  // Get unique blocks
  const uniqueBlocks = useMemo(() => {
    return Array.from(new Set(units.map(u => u.block))).sort();
  }, [units]);

  // Filter units by selected block
  const availableUnits = useMemo(() => {
    if (!selectedBlock) return [];
    return units
      .filter(u => u.block === selectedBlock)
      .sort((a, b) => parseInt(a.number) - parseInt(b.number));
  }, [units, selectedBlock]);

  return (
    <div className="space-y-6">
      
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-slate-200">
        <button
          onClick={() => { setActiveTab('RESIDENT'); setRole(Role.RESIDENT); }}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'RESIDENT' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Home size={16} />
          Moradores
        </button>
        <button
          onClick={() => { setActiveTab('STAFF'); setRole(Role.STAFF); }}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'STAFF' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Briefcase size={16} />
          Funcionários e Admins
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1 max-w-md h-fit">
           <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
             <UserPlus className="mr-2 text-blue-600" /> 
             Novo {activeTab === 'RESIDENT' ? 'Morador' : 'Profissional'}
           </h3>
           
           <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nome Completo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Telefone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded-lg p-2" />
              </div>

              {activeTab === 'RESIDENT' ? (
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Bloco</label>
                        <select 
                          value={selectedBlock} 
                          onChange={e => {
                            setSelectedBlock(e.target.value);
                            setUnitId(''); // Reset unit when block changes
                          }} 
                          className="w-full border rounded-lg p-2 bg-white"
                        >
                          <option value="">Selecione...</option>
                          {uniqueBlocks.map(block => (
                            <option key={block} value={block}>{block}</option>
                          ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Apartamento</label>
                        <select 
                          value={unitId} 
                          onChange={e => setUnitId(e.target.value)} 
                          className="w-full border rounded-lg p-2 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                          disabled={!selectedBlock}
                        >
                          <option value="">Selecione...</option>
                          {availableUnits.map(u => (
                             <option key={u.id} value={u.id}>{u.number} ({u.floor}º)</option>
                          ))}
                        </select>
                    </div>
                 </div>
              ) : (
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nível de Acesso</label>
                    <select value={role} onChange={e => setRole(e.target.value as Role)} className="w-full border rounded-lg p-2 bg-white">
                      <option value={Role.STAFF}>Funcionário (Staff)</option>
                      <option value={Role.ADMIN}>Administrador</option>
                    </select>
                 </div>
              )}

              <button 
                onClick={handleAdd}
                className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 mt-4"
              >
                Cadastrar
              </button>
           </div>
        </div>

        {/* List */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Diretório ({filteredPeople.length})</h3>
           <div className="overflow-y-auto max-h-[500px]">
             <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Contato</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      {activeTab === 'RESIDENT' ? 'Unidade' : 'Cargo'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredPeople.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <img className="h-8 w-8 rounded-full mr-3" src={p.avatarUrl} alt="" />
                          <div className="text-sm font-medium text-slate-900">{p.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-slate-500">{p.email}</div>
                        <div className="text-xs text-slate-400">{p.phone}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                         {p.role === Role.RESIDENT ? (
                           <span className="text-sm text-slate-700 font-medium">
                             {units.find(u => u.id === p.unitId)?.number 
                               ? `Bl ${units.find(u => u.id === p.unitId)?.block} - ${units.find(u => u.id === p.unitId)?.number}`
                               : 'N/A'}
                           </span>
                         ) : (
                           <span className={`px-2 py-1 text-xs rounded-full font-medium ${p.role === Role.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                             {p.role === Role.ADMIN ? 'Administrador' : 'Funcionário'}
                           </span>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        </div>
      </div>

    </div>
  );
};