import React from 'react';
import { PackageStatus, VehicleLog, VehicleLogStatus } from '../types';
import { useApp } from '../context/AppContext';
import { 
    BuildingIcon, CarIcon, HomeIcon, PackageIcon, UsersIcon, 
    PlusCircleIcon, ArrowRightCircleIcon, ArrowLeftCircleIcon 
} from '../components/icons';

interface StatCardProps {
    title: string;
    value: React.ReactNode;
    icon: React.ReactNode;
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, className }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 transition-transform duration-200 hover:-translate-y-1 ${className}`}>
        <div className="bg-brand-primary/10 text-brand-primary p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-brand-secondary font-medium">{title}</p>
            <p className="text-3xl font-bold text-brand-dark">{value}</p>
        </div>
    </div>
);

interface QuickActionButtonProps {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
}
const QuickActionButton: React.FC<QuickActionButtonProps> = ({ label, icon, onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-brand-secondary hover:text-brand-primary"
    >
        {icon}
        <span className="text-sm font-semibold text-center">{label}</span>
    </button>
);


const Dashboard = () => {
    const { people, packages, blocks, apartments, vehicleLogs, getLogDetailsString } = useApp();

    const packagesWaiting = packages.filter(p => p.status === PackageStatus.WaitingPickup).length;
    const residentsCount = people.filter(p => p.isActive && p.roles.isResident).length;
    const blocksCount = blocks.length;
    const apartmentsCount = apartments.length;
    const vehiclesInsideCount = vehicleLogs.filter(log => log.status === VehicleLogStatus.Inside).length;

    const recentLogs = [...vehicleLogs]
        .sort((a, b) => {
            const timeA = a.exitTime?.getTime() || a.entryTime.getTime();
            const timeB = b.exitTime?.getTime() || b.entryTime.getTime();
            return timeB - timeA;
        })
        .slice(0, 5);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-brand-dark">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Moradores Ativos" value={residentsCount} icon={<UsersIcon />} />
                <StatCard title="Encomendas Aguardando" value={packagesWaiting} icon={<PackageIcon />} />
                <StatCard title="Veículos no Condomínio" value={vehiclesInsideCount} icon={<CarIcon />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-brand-dark mb-4">Ações Rápidas</h2>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <QuickActionButton 
                                label="Registrar Entrada" 
                                icon={<PlusCircleIcon />} 
                                onClick={() => alert("Para registrar uma entrada, navegue até a aba 'Entrada/Saída'.")}
                            />
                            <QuickActionButton 
                                label="Nova Encomenda" 
                                icon={<PackageIcon />} 
                                onClick={() => alert("Para registrar uma nova encomenda, navegue até a aba 'Encomendas'.")}
                             />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <StatCard title="Blocos" value={blocksCount} icon={<BuildingIcon />} className="p-4" />
                        <StatCard title="Apartamentos" value={apartmentsCount} icon={<HomeIcon />} className="p-4" />
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-brand-dark mb-2">Atividade Recente de Veículos</h2>
                    {recentLogs.length > 0 ? (
                        <ul className="mt-4 space-y-4">
                            {recentLogs.map((log: VehicleLog) => (
                                <li key={log.id} className="flex items-center space-x-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                                    <div>
                                        {log.exitTime ? (
                                            <ArrowLeftCircleIcon className="w-8 h-8 text-red-500" />
                                        ) : (
                                            <ArrowRightCircleIcon className="w-8 h-8 text-green-500" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-brand-dark">
                                            <span className="font-mono tracking-wider">{log.plate}</span>
                                            <span className="text-brand-secondary font-normal"> - {log.model}</span>
                                        </p>
                                        <p className="text-sm text-brand-secondary">{getLogDetailsString(log)}</p>
                                    </div>
                                    <div className="text-right text-xs text-slate-500">
                                        <p className="font-semibold">
                                            {(log.exitTime || log.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p>
                                            {(log.exitTime || log.entryTime).toLocaleDateString()}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-brand-secondary pt-8">Nenhuma atividade de veículos registrada recentemente.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;