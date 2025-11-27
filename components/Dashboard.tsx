import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Package, Car, Users, AlertCircle } from 'lucide-react';
import { AccessLog } from '../types';

interface DashboardProps {
  stats: {
    totalSpots: number;
    occupiedSpots: number;
    pendingPackages: number;
    totalResidents: number;
  };
  logs: AccessLog[];
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, logs }) => {
  const occupancyData = [
    { name: 'Ocupado', value: stats.occupiedSpots },
    { name: 'Livre', value: stats.totalSpots - stats.occupiedSpots },
  ];
  
  const COLORS = ['#3b82f6', '#e2e8f0'];

  // Process logs for simple chart (Last 24h entries vs exits)
  const activityData = [
    { name: '00-06h', entries: 12, exits: 5 },
    { name: '06-12h', entries: 45, exits: 30 },
    { name: '12-18h', entries: 35, exits: 40 },
    { name: '18-24h', entries: 50, exits: 25 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Cards */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Encomendas Pendentes</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.pendingPackages}</h3>
          </div>
          <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
            <Package size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Ocupação Estacionamento</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">
              {Math.round((stats.occupiedSpots / (stats.totalSpots || 1)) * 100)}%
            </h3>
          </div>
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <Car size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total de Moradores</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.totalResidents}</h3>
          </div>
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <Users size={24} />
          </div>
        </div>

         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Alertas</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">0</h3>
          </div>
          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parking Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Status das Vagas</h3>
          <div className="h-64 flex items-center justify-center relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center">
                    <span className="text-2xl font-bold text-slate-800">{stats.occupiedSpots}</span>
                    <span className="text-xs text-slate-400 block">Ocupadas</span>
                 </div>
              </div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Atividade da Portaria (24h)</h3>
           <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activityData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Bar dataKey="entries" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="exits" name="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
         <h3 className="text-lg font-bold text-slate-800 mb-4">Últimos Acessos</h3>
         <div className="overflow-x-auto">
           <table className="w-full text-sm text-left">
             <thead className="text-xs text-slate-500 uppercase bg-slate-50">
               <tr>
                 <th className="px-4 py-3">Horário</th>
                 <th className="px-4 py-3">Tipo</th>
                 <th className="px-4 py-3">Veículo/Placa</th>
                 <th className="px-4 py-3">Status</th>
               </tr>
             </thead>
             <tbody>
               {logs.slice(0, 5).map(log => (
                 <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                   <td className="px-4 py-3 text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</td>
                   <td className="px-4 py-3">
                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.type === 'ENTRY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                       {log.type === 'ENTRY' ? 'Entrada' : 'Saída'}
                     </span>
                   </td>
                   <td className="px-4 py-3 font-medium text-slate-800">{log.vehiclePlate}</td>
                   <td className="px-4 py-3 text-slate-500">{log.isRegistered ? 'Cadastrado' : 'Visitante'}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
};