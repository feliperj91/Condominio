import React, { useState, useMemo } from 'react';
import { Unit } from '../types';
import { Building, Plus, Trash2, ArrowLeft, LayoutGrid, Layers } from 'lucide-react';

interface UnitsProps {
  units: Unit[];
  onAddUnits: (newUnits: Unit[]) => void;
  onDeleteUnit: (id: string) => void;
  onDeleteBlock: (blockName: string) => void;
}

export const Units: React.FC<UnitsProps> = ({ units, onAddUnits, onDeleteUnit, onDeleteBlock }) => {
  // Generator State
  const [blockInput, setBlockInput] = useState('');
  const [floors, setFloors] = useState<number>(0);
  const [aptsPerFloor, setAptsPerFloor] = useState<number>(0);
  
  // View State
  const [viewBlock, setViewBlock] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!blockInput || floors <= 0 || aptsPerFloor <= 0) return;

    const blockNames = blockInput.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);
    const newUnits: Unit[] = [];
    
    blockNames.forEach(blockName => {
        for (let f = 1; f <= floors; f++) {
          for (let a = 1; a <= aptsPerFloor; a++) {
            const aptNumber = (f * 100) + a;
            newUnits.push({
              id: `gen-${blockName}-${aptNumber}-${Date.now()}-${Math.random()}`,
              block: blockName,
              floor: f,
              number: aptNumber.toString()
            });
          }
        }
    });
    
    onAddUnits(newUnits);
    setBlockInput('');
    setFloors(0);
    setAptsPerFloor(0);
  };

  // Grouping Logic
  const blocks = useMemo(() => {
    const groups: Record<string, Unit[]> = {};
    units.forEach(u => {
      if (!groups[u.block]) groups[u.block] = [];
      groups[u.block].push(u);
    });
    return groups;
  }, [units]);

  const blockNames = Object.keys(blocks).sort();

  // Detail View Logic
  const getFloorsForBlock = (block: string) => {
    const blockUnits = blocks[block] || [];
    const floors: Record<number, Unit[]> = {};
    blockUnits.forEach(u => {
      if (!floors[u.floor]) floors[u.floor] = [];
      floors[u.floor].push(u);
    });
    return floors;
  };

  return (
    <div className="space-y-6">
       {/* Generator Form */}
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Plus className="mr-2 text-blue-600" /> Gerador de Blocos e Unidades
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
             <div className="md:col-span-1">
               <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Blocos (Separe por vírgula)</label>
               <input 
                 type="text" 
                 value={blockInput}
                 onChange={e => setBlockInput(e.target.value)}
                 className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-300"
                 placeholder="Ex: A, B, C, TORRE 1"
               />
             </div>
             <div>
               <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nº de Andares</label>
               <input 
                 type="number" 
                 value={floors || ''}
                 onChange={e => setFloors(parseInt(e.target.value))}
                 className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                 placeholder="Ex: 10"
               />
             </div>
             <div>
               <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Aptos por Andar</label>
               <input 
                 type="number" 
                 value={aptsPerFloor || ''}
                 onChange={e => setAptsPerFloor(parseInt(e.target.value))}
                 className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                 placeholder="Ex: 4"
               />
             </div>
             <button 
               onClick={handleGenerate}
               disabled={!blockInput || !floors || !aptsPerFloor}
               className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
             >
               <Layers size={18} />
               Gerar Estrutura
             </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            * Dica: Digite "A, B, C" para criar 3 blocos idênticos de uma vez.
          </p>
       </div>

       {/* Visualization */}
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
         
         {!viewBlock ? (
            // Blocks Overview
            <>
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                  <LayoutGrid className="mr-2 text-slate-600" /> Visão Geral dos Condomínios
              </h3>
              
              {units.length === 0 ? (
                <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                  Nenhuma unidade cadastrada. Use o gerador acima.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {blockNames.map(block => (
                    <div key={block} className="relative group">
                        <button 
                          onClick={() => setViewBlock(block)}
                          className="w-full flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:shadow-md transition-all"
                        >
                          <Building size={48} className="text-slate-300 group-hover:text-blue-500 mb-4 transition-colors" />
                          <span className="text-xl font-bold text-slate-700 group-hover:text-blue-700">Bloco {block}</span>
                          <span className="text-sm text-slate-500 mt-2">{blocks[block].length} Unidades</span>
                        </button>
                        <button 
                             onClick={(e) => {
                                e.stopPropagation();
                                if(confirm(`ATENÇÃO: Deseja excluir TODO o Bloco ${block} e suas unidades?`)) {
                                    onDeleteBlock(block);
                                }
                             }}
                             className="absolute top-2 right-2 p-2 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all border border-slate-100 z-10"
                             title="Excluir Bloco Inteiro"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                  ))}
                </div>
              )}
            </>
         ) : (
           // Single Block Detail View
           <>
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                 <div className="flex items-center">
                    <button 
                      onClick={() => setViewBlock(null)}
                      className="mr-4 p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Bloco {viewBlock}</h3>
                      <p className="text-sm text-slate-500">Detalhes das unidades por andar</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500">Total: {blocks[viewBlock].length} unidades</span>
                 </div>
              </div>

              <div className="space-y-6 overflow-y-auto max-h-[600px] pr-2">
                 {Object.entries(getFloorsForBlock(viewBlock))
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([floor, floorUnits]) => (
                    <div key={floor} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                       <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center">
                         <span className="bg-slate-200 px-2 py-1 rounded mr-2 text-slate-600">{floor}º Andar</span>
                       </h4>
                       <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                          {floorUnits.sort((a,b) => parseInt(a.number) - parseInt(b.number)).map(unit => (
                            <div key={unit.id} className="relative group bg-white border border-slate-200 p-2 rounded-lg text-center hover:border-red-200 transition-colors">
                               <span className="font-semibold text-slate-700">{unit.number}</span>
                               <button 
                                 onClick={() => {
                                   if (confirm(`Excluir unidade ${unit.number} do Bloco ${unit.block}?`)) {
                                     onDeleteUnit(unit.id);
                                   }
                                 }}
                                 className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-200 z-10"
                                 title="Excluir Unidade"
                               >
                                 <Trash2 size={12} />
                               </button>
                            </div>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>
           </>
         )}

       </div>
    </div>
  );
};