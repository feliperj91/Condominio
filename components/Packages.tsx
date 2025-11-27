import React, { useState, useMemo } from 'react';
import { Package, Unit, Person } from '../types';
import { Package as PackageIcon, Bell, Check, Search } from 'lucide-react';
import { generateSmartNotification } from '../services/geminiService';

interface PackagesProps {
  packages: Package[];
  units: Unit[];
  people: Person[];
  onAddPackage: (pkg: Package) => void;
  onPickup: (id: string) => void;
}

export const Packages: React.FC<PackagesProps> = ({ packages, units, people, onAddPackage, onPickup }) => {
  const [tracking, setTracking] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [location, setLocation] = useState('');
  
  const [draftNotification, setDraftNotification] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const predefinedLocations = ['Portaria', 'Caixa de Correio', 'Sala de Encomendas', 'Armário A', 'Armário B'];

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

  const handleRegister = async () => {
    if (!tracking || !recipient || !location || !selectedUnitId) return;

    setIsGenerating(true);
    const notif = await generateSmartNotification(recipient, tracking, location);
    setDraftNotification(notif);
    setIsGenerating(false);

    const newPackage: Package = {
      id: Math.random().toString(36).substr(2, 9),
      trackingCode: tracking,
      recipientName: recipient,
      unitId: selectedUnitId,
      location,
      receivedAt: new Date().toISOString(),
      receivedByStaffId: 'usuario-atual', 
      status: 'WAITING_PICKUP'
    };

    onAddPackage(newPackage);
    
    // Reset form
    setTracking('');
    setRecipient('');
    setDraftNotification('');
    setLocation('');
    setSelectedBlock('');
    setSelectedUnitId('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Registration Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1 max-w-2xl">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <PackageIcon className="mr-2 text-blue-600" /> Registrar Entrega
          </h3>
          
          <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Descrição / Código</label>
                    <input
                      type="text"
                      value={tracking}
                      onChange={e => setTracking(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Ex: Caixa Amazon, Carta..."
                    />
                </div>
                <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Local de Armazenamento</label>
                    <div className="relative">
                      <input 
                        list="locations"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        placeholder="Digite ou selecione..."
                      />
                      <datalist id="locations">
                        {predefinedLocations.map(loc => (
                          <option key={loc} value={loc} />
                        ))}
                      </datalist>
                    </div>
                </div>
             </div>
             
             {/* Two-step Unit Selection */}
             <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Unidade de Destino</label>
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                        <select
                          value={selectedBlock}
                          onChange={(e) => {
                            setSelectedBlock(e.target.value);
                            setSelectedUnitId(''); // Reset unit
                          }}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Bloco...</option>
                          {uniqueBlocks.map(block => (
                            <option key={block} value={block}>{block}</option>
                          ))}
                        </select>
                    </div>
                    <div className="col-span-2">
                         <select
                            value={selectedUnitId}
                            onChange={(e) => setSelectedUnitId(e.target.value)}
                            disabled={!selectedBlock}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                          >
                            <option value="">Selecione o Apto...</option>
                            {availableUnits.map(u => (
                                <option key={u.id} value={u.id}>Apto {u.number} ({u.floor}º Andar)</option>
                            ))}
                          </select>
                    </div>
                </div>
             </div>

             <div className="col-span-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nome do Destinatário</label>
                 <input
                  type="text"
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Quem vai receber?"
                />
             </div>
          </div>

          <div className="mt-6">
            <button 
              onClick={handleRegister}
              disabled={!tracking || !recipient || !location || !selectedUnitId}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium py-2 rounded-lg transition-colors flex justify-center items-center"
            >
               {isGenerating ? 'Registrando e Gerando Alerta...' : 'Registrar Encomenda'}
            </button>
          </div>

          {draftNotification && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-start gap-3">
                 <Bell className="text-blue-600 mt-1 flex-shrink-0" size={18} />
                 <div>
                   <h4 className="text-sm font-bold text-blue-800">Rascunho de Notificação (IA)</h4>
                   <p className="text-sm text-blue-700 mt-1">{draftNotification}</p>
                   <button className="text-xs text-blue-600 font-semibold mt-2 hover:underline">Enviar Agora</button>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* List */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[600px]">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Aguardando Retirada</h3>
              <div className="relative">
                 <Search className="absolute left-3 top-2 text-slate-400" size={16} />
                 <input type="text" placeholder="Buscar..." className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" />
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {packages.filter(p => p.status === 'WAITING_PICKUP').length === 0 && (
                <div className="text-center py-10 text-slate-400">Nenhuma encomenda pendente</div>
              )}
              {packages.filter(p => p.status === 'WAITING_PICKUP').map(pkg => (
                <div key={pkg.id} className="p-4 border border-slate-100 rounded-xl hover:shadow-md transition-shadow group relative">
                   <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-800">{pkg.recipientName}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {units.find(u => u.id === pkg.unitId) 
                                ? `Bl ${units.find(u => u.id === pkg.unitId)?.block} - ${units.find(u => u.id === pkg.unitId)?.number}`
                                : 'Unidade Desconhecida'}
                        </p>
                      </div>
                      <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Pendente</span>
                   </div>
                   <div className="mt-3 flex justify-between items-end">
                      <div>
                        <p className="text-sm text-slate-700">{pkg.trackingCode}</p>
                        <p className="text-xs text-slate-400 mt-1">Local: {pkg.location}</p>
                      </div>
                      <button 
                        onClick={() => onPickup(pkg.id)}
                        className="bg-slate-100 hover:bg-green-500 hover:text-white text-slate-600 p-2 rounded-lg transition-colors"
                        title="Marcar como Retirado"
                      >
                         <Check size={18} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};