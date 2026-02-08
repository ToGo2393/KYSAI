const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export type EightDResponse = {
    report_id: number;
    problem_description?: string;
    d1_team: string[];
    d2_problem: string;
    d3_interim_actions: string[];
    d4_root_causes: string[];
    d4_occurrence_causes: string[];
    d4_escape_causes: string[];
    d4_fishbone: Record<string, string[]>;
    d5_chosen_pca: string[];
    d6_implemented_pca: string[];
    d7_prevention: string[];
    d8_recognition: string[];
};

export interface ReportSummary {
    id: number;
    title: string;
    status: 'draft' | 'finalized';
    created_at: string;
    problem_description?: string;
}

export const generate8DSuggestions = async (description: string, language: 'en' | 'tr' = 'en'): Promise<EightDResponse> => {
    const response = await fetch(`${API_URL}/generate-8d`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problem_description: description, language }),
    });

    if (!response.ok) {
        throw new Error('Failed to generate suggestions');
    }

    return response.json();
};

export const finalizeReport = async (reportId: number, notes: string) => {
    const response = await fetch(`${API_URL}/reports/${reportId}/finalize`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ technical_notes: notes }),
    });

    if (!response.ok) {
        throw new Error('Failed to finalize report');
    }
    return response.json();
};

export const getReports = async (search?: string): Promise<ReportSummary[]> => {
    let url = `${API_URL}/reports`;
    if (search) {
        url += `?search=${encodeURIComponent(search)}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch reports');
    }
    return response.json();
}

export const getReport = async (id: number): Promise<EightDResponse> => {
    const response = await fetch(`${API_URL}/reports/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch report');
    }
    return response.json();
};

export const getDashboardStats = async () => {
    try {
        const response = await fetch(`${API_URL}/reports/stats`);
        if (!response.ok) return null;
        return response.json();
    } catch (e) {
        return null;
    }
};


export interface HSEAnalysisResponse {
    non_conformities: string[];
    corrective_actions: string[];
    image_path: string;
}

export interface HSEReportData {
    image_path: string;
    non_conformities: string[];
    user_observations: string;
    corrective_actions: string[];
}

export const uploadHSEImage = async (file: File): Promise<HSEAnalysisResponse & { image_path: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/analyze-hse-image`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to analyze image');
    }

    // We need the image path from the server to save it later. 
    // The current backend analysis endpoint returns non_conformities and corrective_actions.
    // However, it saves the file. It should probably return the saved file path too.
    // I need to update backend api/ai.py to return image_path or construct it here?
    // The current implementation in api/ai.py does NOT return image_path. 
    // I should update api/ai.py to return it.

    return response.json();
};

export const createHSEReport = async (data: HSEReportData) => {
    const response = await fetch(`${API_URL}/reports/hse`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to create HSE report');
    }
    return response.json();
};
