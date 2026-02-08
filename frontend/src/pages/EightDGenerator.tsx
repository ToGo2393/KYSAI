import React, { useState, useRef } from 'react';
import { generate8DSuggestions, finalizeReport, EightDResponse } from '../services/api';
import { Sparkles, AlertCircle, CheckCircle2, Save, FileDown, FileText, ArrowRight } from 'lucide-react';
import { FishboneDiagram } from '../components/FishboneDiagram';
import html2canvas from 'html2canvas';
import { PdfService } from '../services/PdfService';
import { useLanguage } from '../context/LanguageContext';

export const EightDGenerator = () => {
    // State
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<EightDResponse | null>(null);
    const [error, setError] = useState('');

    // Finalization
    const [notes, setNotes] = useState('');
    const [isFinalized, setIsFinalized] = useState(false);
    const [finalizing, setFinalizing] = useState(false);

    // Language
    const { language } = useLanguage();

    // Translations
    const pageT = {
        en: {
            title: "8D Problem Solving Generator",
            subtitle: "AI-Powered Quality Management Assistant",
            problemDesc: "Problem Description",
            placeholder: "Describe the issue in detail...",
            aiPowered: "Powered by Gemini 1.5 Flash",
            analyzing: "Analyzing...",
            regenerate: "Regenerate Analysis",
            generate: "Generate 8D Analysis",
            exportPdf: "Export PDF Report",
            draftSaved: "Draft Saved",
            team: "D1: Team Formation",
            interim: "D3: Interim Containment Actions",
            occurrenceRootCause: "D4: Root Cause (Occurrence)",
            escapeRootCause: "D4: Root Cause (Escape)",
            fishbone: "Fishbone Diagram (Ishikawa)",
            chosenPCA: "D5: Chosen Permanent Corrective Actions",
            implementedPCA: "D6: Implemented Permanent Corrective Actions",
            prevention: "D7: Prevention of Recurrence",
            recognition: "D8: Team Recognition",
            techNotes: "Engineer's Technical Notes / Final Remarks",
            notesPlaceholder: "Add specific technical details...",
            saving: "Finalizing...",
            finalize: "Finalize & Save Report",
            finalizedHeader: "Report Finalized",
            finalizedBody: "This 8D report has been successfully saved and locked."
        },
        tr: {
            title: "8D Problem Çözme Oluşturucu",
            subtitle: "Yapay Zeka Destekli Kalite Yönetim Asistanı",
            problemDesc: "Problem Tanımı",
            placeholder: "Sorunu detaylıca açıklayın...",
            aiPowered: "Gemini 1.5 Flash ile Güçlendirilmiştir",
            analyzing: "Analiz Ediliyor...",
            regenerate: "Analizi Yeniden Oluştur",
            generate: "8D Analizi Oluştur",
            exportPdf: "PDF Olarak Dışa Aktar",
            draftSaved: "Taslak Kaydedildi",
            team: "D1: Ekip Kurulumu",
            interim: "D3: Geçici Önlemler",
            occurrenceRootCause: "D4: Kök Neden (Oluşum)",
            escapeRootCause: "D4: Kök Neden (Kaçış)",
            fishbone: "Balık Kılçığı Diyagramı (Ishikawa)",
            chosenPCA: "D5: Seçilen Kalıcı Düzeltici Faaliyetler",
            implementedPCA: "D6: Uygulanan Kalıcı Düzeltici Faaliyetler",
            prevention: "D7: Tekrarı Önleme",
            recognition: "D8: Ekip Takdiri",
            techNotes: "Mühendis Teknik Notları / Son Açıklamalar",
            notesPlaceholder: "Teknik detayları buraya ekleyin...",
            saving: "Tamamlanıyor...",
            finalize: "Raporu Tamamla ve Kaydet",
            finalizedHeader: "Rapor Tamamlandı",
            finalizedBody: "Bu 8D raporu başarıyla kaydedildi ve kilitlendi."
        }
    };

    const pt = pageT[language] || pageT.en;
    const fishboneRef = useRef<HTMLDivElement>(null);

    const handleGenerate = async () => {
        if (!description.trim()) return;
        setLoading(true);
        setError('');
        setIsFinalized(false);
        try {
            const data = await generate8DSuggestions(description, language);
            setResult(data);
        } catch (err) {
            console.error(err);
            setError('Failed to generate suggestions. Please check backend connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalize = async () => {
        if (!result) return;
        setFinalizing(true);
        try {
            await finalizeReport(result.report_id, notes);
            setIsFinalized(true);
        } catch (err) {
            console.error(err);
            setError("Failed to finalize report.");
        } finally {
            setFinalizing(false);
        }
    };

    const generatePDF = async () => {
        if (!result) return;
        try {
            let fishboneImgData = null;
            if (fishboneRef.current) {
                try {
                    // Small delay to ensure DOM is ready
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const canvas = await html2canvas(fishboneRef.current, { scale: 2 });
                    fishboneImgData = canvas.toDataURL('image/png');
                } catch (e) {
                    console.error("Fishbone capture failed", e);
                }
            }
            await PdfService.generate8DReport(result, language, fishboneImgData);
        } catch (error) {
            console.error("PDF Export Failed", error);
            alert("Failed to export PDF. Please check console for details.");
        }
    };

    return (
        <div className="space-y-8 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6 mt-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{pt.title}</h1>
                    <p className="text-slate-500 mt-2 text-lg">{pt.subtitle}</p>
                </div>
                <div className="flex gap-3 items-center">
                    {isFinalized && (
                        <button onClick={generatePDF} type="button" className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 transition-all shadow-md active:scale-95">
                            <FileDown className="w-5 h-5" />
                            {pt.exportPdf}
                        </button>
                    )}
                    {result && !isFinalized && (
                        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200 animate-in fade-in shadow-sm">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-medium">{pt.draftSaved} <span className="text-sm opacity-75">#{result.report_id}</span></span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h2 className="font-semibold text-xl text-slate-800">{pt.problemDesc}</h2>
                        </div>
                        <textarea
                            className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all disabled:opacity-60 disabled:bg-slate-100 text-slate-700 leading-relaxed custom-scrollbar"
                            placeholder={pt.placeholder}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isFinalized || loading}
                        />
                        <div className="mt-6 flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">{pt.aiPowered}</span>
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !description.trim() || isFinalized}
                                className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95 font-medium"
                            >
                                {loading ? (
                                    <>
                                        <Sparkles className="w-5 h-5 animate-spin" />
                                        {pt.analyzing}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        {result ? pt.regenerate : pt.generate}
                                        {!result && <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />}
                                    </>
                                )}
                            </button>
                        </div>
                        {error && (
                            <div className="mt-4 p-4 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-3 border border-red-100">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-7 space-y-6">
                    {loading ? (
                        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm animate-pulse space-y-6">
                            <div className="h-8 bg-slate-100 rounded w-1/3"></div>
                            <div className="space-y-4">
                                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-100 rounded w-full"></div>
                                <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                            </div>
                            <div className="h-64 bg-slate-50 rounded-lg border border-slate-100"></div>
                        </div>
                    ) : result ? (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800">{pt.team}</h3>
                                </div>
                                <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {result.d1_team?.map((member, i) => (
                                        <li key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-700 font-medium text-center">{member}</li>
                                    ))}
                                </ul>
                            </section>

                            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
                                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-xl text-slate-800">{pt.interim}</h3>
                                </div>
                                <ul className="space-y-3">
                                    {result.d3_interim_actions.map((action, i) => (
                                        <li key={i} className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 group hover:bg-emerald-50/50 hover:border-emerald-100 transition-colors">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                                            <span className="leading-relaxed">{action}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <div className="grid gap-6 md:grid-cols-2">
                                {result.d4_occurrence_causes?.length > 0 && (
                                    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                                                <AlertCircle className="w-5 h-5" />
                                            </div>
                                            <h3 className="font-bold text-lg text-slate-800">{pt.occurrenceRootCause}</h3>
                                        </div>
                                        <ul className="space-y-3">
                                            {result.d4_occurrence_causes.map((cause, i) => (
                                                <li key={i} className="text-sm text-slate-600 pl-4 border-l-2 border-amber-200 leading-relaxed">{cause}</li>
                                            ))}
                                        </ul>
                                    </section>
                                )}
                                {result.d4_escape_causes?.length > 0 && (
                                    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                                                <AlertCircle className="w-5 h-5" />
                                            </div>
                                            <h3 className="font-bold text-lg text-slate-800">{pt.escapeRootCause}</h3>
                                        </div>
                                        <ul className="space-y-3">
                                            {result.d4_escape_causes.map((cause, i) => (
                                                <li key={i} className="text-sm text-slate-600 pl-4 border-l-2 border-purple-200 leading-relaxed">{cause}</li>
                                            ))}
                                        </ul>
                                    </section>
                                )}
                            </div>

                            <section ref={fishboneRef} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-6">
                                    <h3 className="font-bold text-xl text-slate-800 border-b-2 border-slate-100 pb-1">{pt.fishbone}</h3>
                                </div>
                                <FishboneDiagram data={result.d4_fishbone} />
                            </section>

                            <div className="grid gap-6 md:grid-cols-2">
                                <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="font-bold text-lg text-slate-800 mb-4">{pt.chosenPCA}</h3>
                                    <ul className="space-y-2">
                                        {result.d5_chosen_pca?.map((pca, i) => (
                                            <li key={i} className="flex gap-2 items-start text-sm text-slate-700"><span className="text-blue-500 font-bold">•</span>{pca}</li>
                                        ))}
                                    </ul>
                                </section>
                                <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="font-bold text-lg text-slate-800 mb-4">{pt.implementedPCA}</h3>
                                    <ul className="space-y-2">
                                        {result.d6_implemented_pca?.map((pca, i) => (
                                            <li key={i} className="flex gap-2 items-start text-sm text-slate-700"><span className="text-green-500 font-bold">✓</span>{pca}</li>
                                        ))}
                                    </ul>
                                </section>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="font-bold text-lg text-slate-800 mb-4">{pt.prevention}</h3>
                                    <ul className="space-y-2">
                                        {result.d7_prevention?.map((item, i) => (
                                            <li key={i} className="text-sm text-slate-700 bg-slate-50 p-2 rounded">{item}</li>
                                        ))}
                                    </ul>
                                </section>
                                <section className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="font-bold text-lg text-indigo-900 mb-4">{pt.recognition}</h3>
                                    <ul className="space-y-2">
                                        {result.d8_recognition?.map((item, i) => (
                                            <li key={i} className="text-sm text-indigo-800 italic">"{item}"</li>
                                        ))}
                                    </ul>
                                </section>
                            </div>

                            {!isFinalized ? (
                                <section className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner">
                                    <label className="block text-sm font-semibold text-slate-700 mb-3 ml-1">{pt.techNotes}</label>
                                    <textarea
                                        className="w-full h-32 p-4 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 outline-none resize-none transition-all shadow-sm mb-4 text-slate-700"
                                        placeholder={pt.notesPlaceholder}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                    <div className="flex justify-end">
                                        <button onClick={handleFinalize} disabled={finalizing} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50 shadow-md font-medium">
                                            <Save className="w-5 h-5" />
                                            {finalizing ? pt.saving : pt.finalize}
                                        </button>
                                    </div>
                                </section>
                            ) : (
                                <div className="p-8 bg-blue-50 text-blue-900 rounded-xl border border-blue-100 text-center animate-in zoom-in-95 shadow-sm">
                                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-blue-600 drop-shadow-sm" />
                                    <h3 className="font-bold text-2xl mb-2">{pt.finalizedHeader}</h3>
                                    <p className="opacity-80 text-lg">{pt.finalizedBody}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-12 text-center min-h-[500px]">
                            <div className="bg-slate-50 p-6 rounded-full mb-4">
                                <Sparkles className="w-12 h-12 opacity-20 text-slate-600" />
                            </div>
                            <p className="text-lg font-medium text-slate-500 max-w-sm">Enter a problem description in the left panel.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
