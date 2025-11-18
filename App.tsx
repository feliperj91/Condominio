import React, { useState } from 'react';
import { View } from './types';
import { AppProvider } from './context/AppContext';
import Dashboard from './views/Dashboard';
import Setup from './views/Setup';
import People from './views/People';
import Packages from './views/Packages';
import Vehicles from './views/Vehicles';
import AccessControl from './views/AccessControl';
import { HomeIcon, BuildingIcon, UsersIcon, PackageIcon, CarIcon, ArrowRightLeftIcon } from './components/icons';

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

const MainLayout: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'setup':
        return <Setup />;
      case 'people':
        return <People />;
      case 'packages':
        return <Packages />;
      case 'vehicles':
        return <Vehicles />;
      case 'access_control':
        return <AccessControl />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-brand-light text-brand-dark">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon /> },
    { id: 'access_control', label: 'Entrada/Saída', icon: <ArrowRightLeftIcon /> },
    { id: 'packages', label: 'Encomendas', icon: <PackageIcon /> },
    { id: 'people', label: 'Pessoas', icon: <UsersIcon /> },
    { id: 'vehicles', label: 'Veículos', icon: <CarIcon /> },
    { id: 'setup', label: 'Configuração', icon: <BuildingIcon /> },
  ] as const;

  return (
    <aside className="w-64 bg-brand-dark text-white flex flex-col">
      <div className="p-6 text-2xl font-bold border-b border-slate-700">
        CondoGenius
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
              activeView === item.id
                ? 'bg-brand-primary text-white'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 text-xs text-slate-400 border-t border-slate-700">
        © 2024 CondoGenius
      </div>
    </aside>
  );
};

export default App;