import React, { useState, useMemo } from 'react';
import { ParkingSpot, AccessLog, Unit } from '../types';
import { Car, AlertTriangle, CheckCircle } from 'lucide-react';
import { analyzeParkingLogs } from '../services/geminiService';

interface ParkingProps {
  spots: ParkingSpot[];
  logs: AccessLog[];
  units: Unit[];
  onEntry: (plate: string, unitId: string, type: string) => void;
  onExit: (plate: string) => void;
}

export const Parking: React.FC<ParkingProps> = ({ spots, logs, units, onEntry, onExit }) => {
  const [newPlate, setNewPlate] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  
  const [entryType, setEntryType] = useState('VISITOR');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  const handleEntry = () => {
    if (!newPlate || !selectedUnitId) {
      alert("Placa e Unidade são obrigatórios.");
      return;
    }
    onEntry(newPlate, selectedUnitId, entryType);
    setNewPlate('');
    setSelectedBlock('');
    setSelectedUnitId('');
    setEntryType('VISITOR');
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    const recentLogs = JSON.stringify(logs.slice(0, 20));
    const result = await analyzeParkingLogs(recentLogs);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Gate Control */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Car className="mr-2 text-blue-600" /> Controle de Portaria
          </h3>
          <div className="space-y-4">
             {/* Plate */}
             <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Placa do Veículo *</label>
                <input
                  type="text"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                  placeholder="ABC-1234"
                  maxLength={8}
                  className="w-full text-lg font-mono border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-wider"
                />
             </div>
             
             {/* Two-step Unit Selection */}
             <div>
               <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Unidade Responsável *</label>
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
               
             {/* Type */}
             <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tipo de Entrada *</label>
                <select
                  value={entryType}
                  onChange={(e) => setEntryType(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="RESIDENT">Morador</option>
                  <option value="VISITOR">Visitante</option>
                  <option value="SERVICE">Prestador de Serviço</option>
                </select>
             </div>

            <button
              onClick={handleEntry}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-colors w-full shadow-lg shadow-green-600/20"
            >
              REGISTRAR ENTRADA
            </button>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1">
           <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <AlertTriangle className="mr-2 text-amber-500" /> Análise de Segurança
            </h3>
            <button 
              onClick={handleAIAnalysis}
              disabled={isAnalyzing}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full transition-colors"
            >
              {isAnalyzing ? 'Analisando...' : 'Rodar Análise IA'}
            </button>
           </div>
           {analysis ? (
             <div className="text-sm text-slate-600 whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-100 max-h-48 overflow-y-auto">
               {analysis}
             </div>
           ) : (
             <p className="text-sm text-slate-400 italic">Gere insights sobre padrões de entrada e saída.</p>
           )}
        </div>
      </div>

      {/* Parking Map */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Mapa do Estacionamento</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-4">
          {spots.map((spot) => (
            <div
              key={spot.id}
              className={`relative h-32 rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all cursor-pointer hover:shadow-md ${
                spot.isOccupied
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
              onClick={() => {
                if(spot.isOccupied) {
                  if(confirm(`Liberar vaga ${spot.code}?`)) {
                    onExit(spot.currentVehicleId || "DESCONHECIDO"); 
                  }
                }
              }}
            >
              <span className="absolute top-2 left-2 text-xs font-bold opacity-70">{spot.code}</span>
              {spot.isOccupied ? (
                <>
                  <Car size={32} className="mb-2" />
                  <span className="text-xs font-medium text-center truncate w-full">{spot.currentVehicleId}</span>
                </>
              ) : (
                <>
                  <CheckCircle size={32} className="mb-2 opacity-50" />
                  <span className="text-xs font-medium opacity-70">Livre</span>
                </>
              )}
              <span className="absolute bottom-1 right-2 text-[10px] uppercase font-bold tracking-wider opacity-60">
                {spot.type === 'RESIDENT' ? 'MOR' : (spot.type === 'VISITOR' ? 'VIS' : 'PCD')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};