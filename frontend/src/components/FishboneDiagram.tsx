import React from 'react';

interface FishboneProps {
    data: Record<string, string[]>;
}

export const FishboneDiagram: React.FC<FishboneProps> = ({ data }) => {
    // Categories mappings for standard layout
    const topCategories = ['Measurement', 'Material', 'Man'];
    const bottomCategories = ['Environment', 'Method', 'Machine'];

    return (
        <div className="w-full overflow-x-auto p-4 bg-white rounded-xl border border-slate-200">
            <h3 className="text-center font-bold text-slate-700 mb-8 tracking-wider uppercase">Fishbone / Ishikawa Diagram</h3>

            <div className="relative min-w-[800px] h-[500px] flex items-center">

                {/* Main Spine */}
                <div className="absolute left-10 right-32 h-1 bg-slate-800 rounded-full z-0"></div>

                {/* Effect Box (Head) */}
                <div className="absolute right-4 w-28 h-28 border-2 border-slate-800 rounded-lg flex items-center justify-center bg-slate-100 z-10 shadow-sm">
                    <span className="text-center font-bold text-slate-800 px-2">Defect Root Cause</span>
                </div>

                {/* Top Ribs */}
                {topCategories.map((cat, idx) => {
                    const leftPos = 20 + idx * 25; // % position
                    return (
                        <div key={cat} className="absolute top-10 h-[200px]" style={{ left: `${leftPos}%` }}>
                            {/* Box */}
                            <div className="absolute -top-6 left-0 transform -translate-x-1/2 border border-blue-200 bg-blue-50 text-blue-800 px-4 py-1.5 rounded-md font-semibold text-sm shadow-sm">
                                {cat}
                            </div>
                            {/* Rib Line */}
                            <div className="absolute bottom-0 left-0 w-1 bg-slate-400 h-full transform -rotate-[30deg] origin-bottom-left"></div>

                            {/* Causes List */}
                            <div className="absolute top-8 -left-16 w-48 space-y-2">
                                {data[cat]?.map((cause, i) => (
                                    <div key={i} className="text-xs bg-white border border-slate-100 p-1.5 rounded shadow-sm relative">
                                        <span className="w-2 h-0.5 bg-slate-300 absolute -right-2 top-1/2"></span>
                                        {cause}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Bottom Ribs */}
                {bottomCategories.map((cat, idx) => {
                    const leftPos = 20 + idx * 25; // % position
                    return (
                        <div key={cat} className="absolute bottom-10 h-[200px]" style={{ left: `${leftPos}%` }}>
                            {/* Rib Line */}
                            <div className="absolute top-0 left-0 w-1 bg-slate-400 h-full transform rotate-[30deg] origin-top-left"></div>
                            {/* Box */}
                            <div className="absolute -bottom-6 left-0 transform -translate-x-1/2 border border-blue-200 bg-blue-50 text-blue-800 px-4 py-1.5 rounded-md font-semibold text-sm shadow-sm">
                                {cat}
                            </div>

                            {/* Causes List */}
                            <div className="absolute bottom-8 -left-16 w-48 space-y-2">
                                {data[cat]?.map((cause, i) => (
                                    <div key={i} className="text-xs bg-white border border-slate-100 p-1.5 rounded shadow-sm relative">
                                        <span className="w-2 h-0.5 bg-slate-300 absolute -right-2 top-1/2"></span>
                                        {cause}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
    );
};
