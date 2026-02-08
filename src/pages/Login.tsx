import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User } from 'lucide-react';

export const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState<'admin' | 'editor'>('editor');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock authentication
        login(role === 'admin' ? 'admin' : 'user', role);
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
                        <span className="text-white font-bold text-3xl">K</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
                    <p className="text-slate-500 mt-2">Sign in to KYSAI Quality System</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div
                            onClick={() => setRole('admin')}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${role === 'admin' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${role === 'admin' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-semibold text-slate-900">Quality Manager</div>
                                <div className="text-xs text-slate-500">Full Access (Admin)</div>
                            </div>
                        </div>

                        <div
                            onClick={() => setRole('editor')}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${role === 'editor' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${role === 'editor' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-semibold text-slate-900">Process Engineer</div>
                                <div className="text-xs text-slate-500">Report Generation</div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
                    >
                        Sign In as {role === 'admin' ? 'Manager' : 'Engineer'}
                    </button>
                </form>
            </div>
        </div>
    );
};
