import React from 'react';
import { LayoutDashboard, Users, Package, Car, Building, LogOut, Shield, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isOpenMobile: boolean;
  closeMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  isCollapsed,
  toggleCollapse,
  isOpenMobile,
  closeMobile
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'units', label: 'Blocos e Unidades', icon: Building },
    { id: 'people', label: 'Pessoas', icon: Users },
    { id: 'packages', label: 'Encomendas', icon: Package },
    { id: 'parking', label: 'Estacionamento', icon: Car },
    { id: 'role_management', label: 'Perfis', icon: Shield },
    { id: 'access_control', label: 'Acessos', icon: Shield },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 h-screen bg-slate-900 text-white z-50 transition-all duration-300 shadow-xl flex flex-col
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        w-64
      `}>
        {/* Header */}
        <div className={`p-6 border-b border-slate-800 flex items-center justify-between ${isCollapsed ? 'lg:justify-center lg:p-4' : ''}`}>
          <div className={`${isCollapsed ? 'lg:hidden' : 'block'}`}>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent whitespace-nowrap">
              CondoGest
            </h1>
            <p className="text-xs text-slate-400 mt-1">Sistema de Gestão</p>
          </div>

          {/* Mobile Close Button */}
          <button onClick={closeMobile} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>

          {/* Desktop Collapse Icon (Logo replacement when collapsed) */}
          {isCollapsed && (
            <div className="hidden lg:flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg font-bold text-xl">
              C
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  closeMobile();
                }}
                title={isCollapsed ? item.label : ''}
                className={`
                  w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isCollapsed ? 'justify-center' : 'space-x-3'}
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          {/* Collapse Toggle (Desktop Only) */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex w-full items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white transition-colors"
            title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <button
            onClick={onLogout}
            title={isCollapsed ? "Sair" : ''}
            className={`
              w-full flex items-center px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors
              ${isCollapsed ? 'justify-center' : 'space-x-3'}
            `}
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span className={`whitespace-nowrap ${isCollapsed ? 'lg:hidden' : 'block'}`}>Sair</span>
          </button>
        </div>
      </div>
    </>
  );
};