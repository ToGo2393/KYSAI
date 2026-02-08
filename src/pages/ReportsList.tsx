import React, { useEffect, useState } from 'react';
import { getReports, getReport, ReportSummary } from '../services/api';
import { PdfService } from '../services/PdfService';
import { Search, FileText, CheckCircle2, Clock, Download } from 'lucide-react';

export const ReportsList = () => {
    const [reports, setReports] = useState<ReportSummary[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async (searchTerm?: string) => {
        setLoading(true);
        try {
            const data = await getReports(searchTerm);
            setReports(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadReports(search);
    };

    const handleDownload = async (id: number) => {
        try {
            // Force English for archive download for now, or add toggle
            const reportData = await getReport(id);
            await PdfService.generateReport(reportData, 'en', null);
        } catch (e) {
            console.error("Download failed", e);
            alert("Failed to download report. Please check connection.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Reports Archive</h1>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search reports by title or description..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </form>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-600">ID</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Title / Problem</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading reports...</td>
                            </tr>
                        ) : reports.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No reports found.</td>
                            </tr>
                        ) : (
                            reports.map((report) => (
                                <tr key={report.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-slate-500">#{report.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{report.title}</div>
                                        <div className="text-sm text-slate-500 truncate max-w-md">{report.problem_description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {report.status === 'finalized' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                <CheckCircle2 className="w-3 h-3" /> Finalized
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                                <Clock className="w-3 h-3" /> Draft
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDownload(report.id)}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Download className="w-4 h-4" /> Download
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
