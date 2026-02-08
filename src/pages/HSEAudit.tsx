import React, { useState } from 'react';
import { Upload, AlertTriangle, CheckCircle, FileText, Loader2, Save } from 'lucide-react';
import { uploadHSEImage, createHSEReport, HSEAnalysisResponse } from '../services/api';
import { PdfService } from '../services/PdfService';

export const HSEAudit = () => {
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<HSEAnalysisResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [observations, setObservations] = useState('');
    const [saving, setSaving] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setAnalysis(null); // Reset analysis on new image
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setLoading(true);
        try {
            const result = await uploadHSEImage(image);
            setAnalysis(result);
        } catch (error) {
            console.error(error);
            alert('Failed to analyze image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveReport = async () => {
        if (!analysis || !image) return;
        setSaving(true);
        try {
            await createHSEReport({
                image_path: analysis.image_path,
                non_conformities: analysis.non_conformities,
                corrective_actions: analysis.corrective_actions,
                user_observations: observations
            });
            alert('Report saved successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to save report.');
        } finally {
            setSaving(false);
        }
    };

    const handleGeneratePdf = async () => {
        if (!analysis || !preview) return;
        try {
            // We pass the preview (base64) for the PDF generation so we don't need to fetch it again
            await PdfService.generateHSEReport({
                image_path: analysis.image_path, // Not used for PDF generation as we pass preview
                non_conformities: analysis.non_conformities,
                corrective_actions: analysis.corrective_actions,
                user_observations: observations
            }, 'en', preview);
        } catch (error) {
            console.error("PDF Export Failed", error);
            alert("Failed to export PDF. Please check console for details.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">HSE AI Audit</h1>
                <p className="text-slate-500">Upload a workplace image to detect safety hazards.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column: Upload & Preview */}
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <label className="block w-full cursor-pointer">
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                                <Upload className="w-10 h-10 text-slate-400 mb-3" />
                                <span className="text-slate-600 font-medium">Click to upload image</span>
                                <span className="text-xs text-slate-400 mt-1">JPG, PNG supported</span>
                            </div>
                        </label>

                        {preview && (
                            <div className="mt-4 relative rounded-lg overflow-hidden border border-slate-200">
                                <img src={preview} alt="Workplace Preview" className="w-full h-64 object-cover" />
                            </div>
                        )}

                        <button
                            onClick={handleAnalyze}
                            disabled={!image || loading}
                            className={`w-full mt-4 py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${!image || loading
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertTriangle className="w-5 h-5" />}
                            {loading ? 'Analyzing...' : 'Analyze Safety Hazards'}
                        </button>
                    </div>

                    {/* User Observations */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-slate-500" />
                            User Observations
                        </h3>
                        <textarea
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[100px]"
                            placeholder="Add your own observations or comments here..."
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                        />
                    </div>
                </div>

                {/* Right Column: Results */}
                <div className="space-y-4">
                    {analysis ? (
                        <>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    Identified Non-Conformities
                                </h3>
                                <ul className="space-y-2">
                                    {analysis.non_conformities.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-slate-700 bg-red-50 p-3 rounded-lg border border-red-100">
                                            <span className="font-bold text-red-500">•</span>
                                            {item}
                                        </li>
                                    ))}
                                    {analysis.non_conformities.length === 0 && (
                                        <p className="text-slate-500 italic">No non-conformities detected.</p>
                                    )}
                                </ul>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="font-bold text-emerald-600 mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Suggested Corrective Actions
                                </h3>
                                <ul className="space-y-2">
                                    {analysis.corrective_actions.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-slate-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                            <span className="font-bold text-emerald-500">✓</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleSaveReport}
                                    disabled={saving}
                                    className="flex-1 py-3 px-4 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 font-medium"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Save Report
                                </button>
                                <button
                                    onClick={handleGeneratePdf}
                                    type="button"
                                    className="flex-1 py-3 px-4 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 font-medium"
                                >
                                    <FileText className="w-5 h-5" />
                                    Download PDF
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 border-2 border-dashed border-slate-200 rounded-xl">
                            <AlertTriangle className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-center">Upload an image and run analysis<br />to see safety insights here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
