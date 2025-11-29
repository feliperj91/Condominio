import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { RolePermission } from '../types';

export const AccessControl: React.FC = () => {
    const [permissions, setPermissions] = useState<RolePermission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPermissions();
    }, []);

    const loadPermissions = async () => {
        try {
            setIsLoading(true);
            if ('getPermissions' in storageService) {
                const data = await (storageService as any).getPermissions();
                setPermissions(data);
            } else {
                setError("O serviço de armazenamento atual não suporta controle de acesso.");
            }
        } catch (err) {
            console.error(err);
            setError("Erro ao carregar permissões.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = async (id: string, field: keyof RolePermission) => {
        const perm = permissions.find(p => p.id === id);
        if (!perm) return;

        const newValue = !perm[field];

        // Optimistic update
        const updatedPermissions = permissions.map(p =>
            p.id === id ? { ...p, [field]: newValue } : p
        );
        setPermissions(updatedPermissions);

        try {
            if ('updatePermission' in storageService) {
                await (storageService as any).updatePermission(id, { [field]: newValue });
            }
        } catch (err) {
            console.error(err);
            // Revert on error
            setPermissions(permissions);
            alert("Erro ao salvar alteração.");
        }
    };

    if (isLoading) return <div className="p-8 text-center">Carregando permissões...</div>;
    if (error) return <div className="p-8 text-center text-red-600 flex items-center justify-center gap-2"><AlertCircle size={20} /> {error}</div>;

    // Group by RoleId
    const groupedPermissions = permissions.reduce((acc, curr) => {
        if (!acc[curr.roleId]) acc[curr.roleId] = [];
        acc[curr.roleId].push(curr);
        return acc;
    }, {} as Record<string, RolePermission[]>);

    const roleIds = Object.keys(groupedPermissions);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                    <Shield size={20} className="text-blue-600" />
                    Controle de Acesso por Perfil
                </h3>
            </div>

            {roleIds.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                    <p className="font-medium">Nenhuma permissão configurada</p>
                    <p className="text-sm mt-1">Crie perfis de usuário primeiro na aba de gerenciamento de perfis.</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {roleIds.map(roleId => {
                    const rolePerms = groupedPermissions[roleId];
                    const roleName = rolePerms[0]?.roleName || 'Perfil sem nome';

                    return (
                        <div key={roleId} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-4 border-b pb-2 flex justify-between items-center">
                                {roleName}
                                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                    {rolePerms.length} recursos
                                </span>
                            </h4>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="text-slate-500 border-b">
                                            <th className="pb-2 font-medium">Recurso</th>
                                            <th className="pb-2 font-medium text-center">Ver</th>
                                            <th className="pb-2 font-medium text-center">Criar</th>
                                            <th className="pb-2 font-medium text-center">Editar</th>
                                            <th className="pb-2 font-medium text-center">Excluir</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {rolePerms.map(perm => (
                                            <tr key={perm.id} className="hover:bg-slate-50">
                                                <td className="py-3 font-medium text-slate-700 capitalize">
                                                    {(() => {
                                                        const translations: Record<string, string> = {
                                                            'dashboard': 'Visão Geral',
                                                            'units': 'Unidades',
                                                            'people': 'Pessoas',
                                                            'packages': 'Encomendas',
                                                            'parking': 'Estacionamento',
                                                            'access_control': 'Controle de Acesso',
                                                            'role_management': 'Gerenciar Perfis'
                                                        };
                                                        return translations[perm.resource] || perm.resource.replace('_', ' ');
                                                    })()}
                                                </td>
                                                <td className="py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={perm.canView}
                                                        onChange={() => handleToggle(perm.id, 'canView')}
                                                        className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={perm.canCreate}
                                                        onChange={() => handleToggle(perm.id, 'canCreate')}
                                                        className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={perm.canEdit}
                                                        onChange={() => handleToggle(perm.id, 'canEdit')}
                                                        className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={perm.canDelete}
                                                        onChange={() => handleToggle(perm.id, 'canDelete')}
                                                        className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
