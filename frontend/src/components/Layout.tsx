import React, { useState } from 'react';
import { LayoutDashboard, FileText, ClipboardCheck, Settings, Menu, X, Archive, Globe, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const NavItem = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active: boolean }) => (
    <Link
        to={to}
        className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
            active
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
        )}
    >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
    </Link>
);

export const Sidebar = ({ open, setOpen }: SidebarProps) => {
    const location = useLocation();
    const { t } = useLanguage();
    const path = location.pathname;

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 z-20 lg:hidden",
                    open ? "block" : "hidden"
                )}
                onClick={() => setOpen(false)}
            />

            <aside className={cn(
                "fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:transform-none select-none",
                open ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">K</div>
                        <span className="text-xl font-bold text-slate-800">KYSAI</span>
                    </div>
                    <button onClick={() => setOpen(false)} className="lg:hidden">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    <NavItem to="/dashboard" icon={LayoutDashboard} label={t('dashboard')} active={path === "/dashboard" || path === "/"} />
                    <NavItem to="/8d-generator" icon={FileText} label={t('generator')} active={path === "/8d-generator"} />
                    <NavItem to="/hse-audit" icon={ClipboardCheck} label={t('hseAudit')} active={path === "/hse-audit"} />
                    <NavItem to="/reports" icon={Archive} label={t('reports')} active={path === "/reports"} />
                    <NavItem to="/settings" icon={Settings} label={t('settings')} active={path === "/settings"} />
                </nav>
            </aside>
        </>
    );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const { language, setLanguage, t } = useLanguage();
    const { user, logout } = useAuth();

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            <Sidebar open={open} setOpen={setOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Global Header */}
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                        >
                            <Globe className="w-4 h-4 text-slate-500" />
                            {language.toUpperCase()}
                        </button>

                        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                        <div className="flex items-center gap-3 pl-2">
                            <div className="hidden md:block text-right">
                                <div className="text-sm font-semibold text-slate-800">{user?.name}</div>
                                <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
                            </div>
                            <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                                {user?.name.charAt(0)}
                            </div>
                            <button
                                onClick={logout}
                                className="text-sm text-red-600 hover:text-red-700 font-medium ml-2 px-3 py-1 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                                {t('logout')}
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 bg-slate-50">
                    <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
