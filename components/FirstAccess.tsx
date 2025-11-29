import React, { useState } from 'react';
import { Lock, CheckCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Person } from '../types';

interface FirstAccessProps {
    user: Person;
    onSuccess: () => void;
}

export const FirstAccess: React.FC<FirstAccessProps> = ({ user, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        setIsLoading(true);

        try {
            if ('changePassword' in storageService) {
                await (storageService as any).changePassword(user.id, password);
                onSuccess();
            } else {
                setError("Serviço de alteração de senha indisponível.");
            }
        } catch (err) {
            console.error(err);
            setError("Erro ao definir nova senha.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-8 bg-slate-50 border-b border-slate-100 text-center">
                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Primeiro Acesso</h1>
                    <p className="text-slate-500 mt-1">Olá, {user.name}. Defina sua senha pessoal.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Nova Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Confirmar Senha</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="Repita a senha"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-600/20 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <CheckCircle size={20} />
                                Definir Senha e Entrar
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
