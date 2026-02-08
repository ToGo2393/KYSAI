import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { EightDGenerator } from './pages/EightDGenerator';
import { ReportsList } from './pages/ReportsList';
import { Login } from './pages/Login';
import { HSEAudit } from './pages/HSEAudit';
import { Settings } from './pages/Settings';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { useEffect, useState } from 'react';
import { getDashboardStats } from './services/api';
import ErrorBoundary from './components/ErrorBoundary';

function ProtectedRoute({ children }: { children: JSX.Element }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

function LoggedInRoute({ children }: { children: JSX.Element }) {
    const { user } = useAuth();
    if (user) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
}

function Dashboard() {
    const [stats, setStats] = useState({ total_reports: 0, open_issues: 0, pending_approvals: 0 });
    const { user } = useAuth();

    useEffect(() => {
        getDashboardStats().then(data => {
            if (data) setStats(data);
        }).catch(err => console.error("Dashboard stats error:", err));
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-slate-800">Welcome Back, {user?.name}</h1>
            <p className="text-slate-500 mt-2">Your AI-Powered Quality Management System</p>

            <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-4xl font-bold text-blue-600 mb-2">{stats.total_reports}</div>
                    <div className="text-sm text-slate-500 font-medium">Total Reports</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-4xl font-bold text-emerald-600 mb-2">
                        {stats.total_reports > 0 ? Math.round(((stats.total_reports - stats.open_issues) / stats.total_reports) * 100) : 100}%
                    </div>
                    <div className="text-sm text-slate-500 font-medium">Closure Rate</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-4xl font-bold text-amber-600 mb-2">{stats.open_issues}</div>
                    <div className="text-sm text-slate-500 font-medium">Open Issues</div>
                </div>
            </div>

            {/* Admin Action Tracker */}
            {user?.role === 'admin' && (
                <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Pending Actions (Admin View)</h2>
                    <div className="p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 text-sm">
                        Showing actions from recently finalized reports requires Action Tracking Module (Coming Soon).
                    </div>
                </div>
            )}
        </div>
    );
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={
                <LoggedInRoute>
                    <Login />
                </LoggedInRoute>
            } />

            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Layout>
                        <Dashboard />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/8d-generator" element={
                <ProtectedRoute>
                    <Layout>
                        <EightDGenerator />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/reports" element={
                <ProtectedRoute>
                    <Layout>
                        <ReportsList />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/hse-audit" element={
                <ProtectedRoute>
                    <Layout>
                        <HSEAudit />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/settings" element={
                <ProtectedRoute>
                    <Layout>
                        <Settings />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes >
    );
}

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <LanguageProvider>
                    <BrowserRouter>
                        <AppRoutes />
                    </BrowserRouter>
                </LanguageProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
