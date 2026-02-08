import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EightDResponse } from './api';
import { translations } from '../translations';
import { robotoBase64 } from './fonts';

const setRobotoFont = (doc: any) => {
    try {
        if (!doc.existsFileInVFS('Roboto-Regular.ttf')) {
            doc.addFileToVFS('Roboto-Regular.ttf', robotoBase64);
            doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        }
        doc.setFont('Roboto');
    } catch (e) {
        console.warn("Font set error", e);
    }
};

export class PdfService {
    static async generate8DReport(report: EightDResponse, lang: 'en' | 'tr', fishboneImgData?: string | null) {
        console.log('PDF Generation Started: 8D Report', { id: report.report_id, lang });
        const doc = new (jsPDF as any)();
        const t = translations[lang];

        // 1. Ensure Font Loaded Globally First
        setRobotoFont(doc);
        console.log("Custom font loaded from embedded source");

        // --- PAGE 1: D1 - D4 ---

        // Header
        try {
            setRobotoFont(doc); // Ensure font for autoTable
            autoTable(doc, {
                startY: 15,
                head: [['KYSAI - Quality Management System', lang === 'tr' ? '8D Problem Çözme Raporu' : '8D Problem Solving Report']],
                body: [
                    [`ID: #${report.report_id}`, `Date: ${new Date().toLocaleDateString()}`]
                ],
                theme: 'grid',
                styles: {
                    halign: 'center',
                    valign: 'middle',
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1,
                    font: 'Roboto', // Explicitly set font in styles
                    fontStyle: 'normal'
                },
                headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 14, fontStyle: 'bold', minCellHeight: 15 },
                columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 'auto' } }
            });
        } catch (e) {
            console.error("autoTable Header failed", e);
        }

        let yPos = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : 30;

        // D1: Team
        if (report.d1_team && report.d1_team.length > 0) {
            setRobotoFont(doc); // Set for text
            doc.setFontSize(11);
            doc.setTextColor(0);
            doc.text(t.team, 14, yPos);
            yPos += 5;

            try {
                setRobotoFont(doc); // Set for autoTable
                autoTable(doc, {
                    startY: yPos,
                    head: [[lang === 'tr' ? 'Ekip Üyeleri' : 'Team Members']],
                    body: report.d1_team.map(m => [m]),
                    theme: 'plain',
                    styles: { font: 'Roboto', fontSize: 10, cellPadding: 1 },
                    headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold', font: 'Roboto' }
                });
                yPos = doc.lastAutoTable.finalY + 10;
            } catch (e) {
                console.error("autoTable D1 failed", e);
            }
        }

        // D2: Problem
        setRobotoFont(doc);
        doc.setFontSize(11);
        doc.text(t.problemDesc, 14, yPos);
        yPos += 5;
        setRobotoFont(doc); // Ensure font before splitTextToSize
        const splitDesc = doc.splitTextToSize(report.problem_description || '', 180);
        doc.setFontSize(10);
        doc.text(splitDesc, 14, yPos);
        yPos = yPos + (splitDesc.length * 5) + 10;

        // D3: Interim Actions
        if (report.d3_interim_actions && report.d3_interim_actions.length > 0) {
            setRobotoFont(doc);
            doc.setFontSize(11);
            doc.text(t.interim, 14, yPos);
            yPos += 5;
            try {
                setRobotoFont(doc);
                autoTable(doc, {
                    startY: yPos,
                    head: [['#', lang === 'tr' ? 'Aksiyon' : 'Action Item']],
                    body: report.d3_interim_actions.map((action, i) => [`${i + 1}`, action]),
                    theme: 'striped',
                    headStyles: { fillColor: [241, 196, 15], textColor: 0, font: 'Roboto' },
                    styles: { font: 'Roboto', overflow: 'linebreak', fontStyle: 'normal' },
                    columnStyles: { 1: { cellWidth: 160 } }
                });
                yPos = doc.lastAutoTable.finalY + 10;
            } catch (e) {
                console.error("autoTable D3 failed", e);
            }
        }

        // D4: Root Cause (Occurrence & Escape)
        setRobotoFont(doc);
        doc.setFontSize(11);
        doc.text(t.rootCause, 14, yPos);
        yPos += 5;

        // Occurrence
        if (report.d4_occurrence_causes && report.d4_occurrence_causes.length > 0) {
            try {
                setRobotoFont(doc);
                autoTable(doc, {
                    startY: yPos,
                    head: [['type', t.occurrenceRootCause]],
                    body: report.d4_occurrence_causes.map((cause) => ['OCC', cause]),
                    theme: 'grid',
                    headStyles: { fillColor: [231, 76, 60], textColor: 255, font: 'Roboto' },
                    styles: { font: 'Roboto', overflow: 'linebreak', fontStyle: 'normal' },
                    columnStyles: { 1: { cellWidth: 150 } }
                });
                yPos = doc.lastAutoTable.finalY + 5;
            } catch (e) {
                console.error("autoTable D4 Occurrence failed", e);
            }
        }

        // Escape
        if (report.d4_escape_causes && report.d4_escape_causes.length > 0) {
            try {
                setRobotoFont(doc);
                autoTable(doc, {
                    startY: yPos,
                    head: [['type', t.escapeRootCause]],
                    body: report.d4_escape_causes.map((cause) => ['ESC', cause]),
                    theme: 'grid',
                    headStyles: { fillColor: [142, 68, 173], textColor: 255, font: 'Roboto' },
                    styles: { font: 'Roboto', overflow: 'linebreak', fontStyle: 'normal' },
                    columnStyles: { 1: { cellWidth: 150 } }
                });
            } catch (e) {
                console.error("autoTable D4 Escape failed", e);
            }
        }

        // --- PAGE 2: LANDSCAPE (Fishbone Diagram) ---
        if (fishboneImgData) {
            doc.addPage('a4', 'l');
            setRobotoFont(doc);
            doc.setFontSize(16);
            doc.text(t.fishbone, 14, 20);

            const pageWidth = 297;
            const pageHeight = 210;
            const margin = 10;
            const availableWidth = pageWidth - (margin * 2);
            const availableHeight = pageHeight - 40;

            const imgProps = doc.getImageProperties(fishboneImgData);
            let imgWidth = imgProps.width;
            let imgHeight = imgProps.height;

            const targetWidth = availableWidth * 0.95; // 95% Width
            const ratio = targetWidth / imgWidth;

            let finalWidth = targetWidth;
            let finalHeight = imgHeight * ratio;

            if (finalHeight > availableHeight) {
                const hRatio = availableHeight / finalHeight;
                finalHeight = availableHeight;
                finalWidth = finalWidth * hRatio;
            }

            const xPos = (pageWidth - finalWidth) / 2;
            const yPos = 30 + (availableHeight - finalHeight) / 2;

            if (fishboneImgData.length > 100) {
                try {
                    doc.addImage(fishboneImgData, 'PNG', xPos, yPos, finalWidth, finalHeight);
                } catch (e) {
                    console.error("Fishbone image add failed", e);
                }
            }
        }

        // --- PAGE 3: D5 - D8 ---
        doc.addPage('a4', 'p');
        yPos = 20;

        // D5: Chosen PCA
        if (report.d5_chosen_pca && report.d5_chosen_pca.length > 0) {
            setRobotoFont(doc);
            doc.setFontSize(11);
            doc.text(t.chosenPCA, 14, yPos);
            yPos += 5;
            try {
                setRobotoFont(doc);
                autoTable(doc, {
                    startY: yPos,
                    body: report.d5_chosen_pca.map(item => [`• ${item}`]),
                    theme: 'plain',
                    styles: { font: 'Roboto', fontSize: 10, fontStyle: 'normal' }
                });
                yPos = doc.lastAutoTable.finalY + 10;
            } catch (e) {
                console.error("autoTable D5 failed", e);
            }
        }

        // D6: Implemented PCA
        if (report.d6_implemented_pca && report.d6_implemented_pca.length > 0) {
            setRobotoFont(doc);
            doc.setFontSize(11);
            doc.text(t.implementedPCA, 14, yPos);
            yPos += 5;
            try {
                setRobotoFont(doc);
                autoTable(doc, {
                    startY: yPos,
                    body: report.d6_implemented_pca.map(item => [`✓ ${item}`]),
                    theme: 'plain',
                    styles: { font: 'Roboto', fontSize: 10, textColor: [0, 100, 0], fontStyle: 'normal' }
                });
                yPos = doc.lastAutoTable.finalY + 10;
            } catch (e) {
                console.error("autoTable D6 failed", e);
            }
        }

        // D7: Prevention
        if (report.d7_prevention && report.d7_prevention.length > 0) {
            setRobotoFont(doc);
            doc.setFontSize(11);
            doc.setTextColor(0);
            doc.text(t.prevention, 14, yPos);
            yPos += 5;
            try {
                setRobotoFont(doc);
                autoTable(doc, {
                    startY: yPos,
                    body: report.d7_prevention.map(item => [`• ${item}`]),
                    theme: 'plain',
                    styles: { font: 'Roboto', fontSize: 10, fontStyle: 'normal' }
                });
                yPos = doc.lastAutoTable.finalY + 10;
            } catch (e) {
                console.error("autoTable D7 failed", e);
            }
        }

        // D8: Recognition
        if (report.d8_recognition && report.d8_recognition.length > 0) {
            setRobotoFont(doc);
            doc.setFontSize(11);
            doc.text(t.recognition, 14, yPos);
            yPos += 5;
            try {
                setRobotoFont(doc);
                autoTable(doc, {
                    startY: yPos,
                    body: report.d8_recognition.map(item => [`"${item}"`]),
                    theme: 'plain',
                    styles: { font: 'Roboto', fontSize: 10, fontStyle: 'italic', textColor: [50, 50, 150] }
                });
            } catch (e) {
                console.error("autoTable D8 failed", e);
            }
        }

        // Save or Open with Fallback
        const filename = `KYSAI_8D_${report.report_id}_${lang.toUpperCase()}.pdf`;
        triggerDownload(doc, filename);
    }

    static async generateHSEReport(data: { image_path: string, non_conformities: string[], corrective_actions: string[], user_observations: string }, lang: 'en' | 'tr', imageBase64?: string | null) {
        console.log("PDF Generation Started: HSE Report");
        const doc = new (jsPDF as any)();

        // Load font
        setRobotoFont(doc);

        // Header
        try {
            setRobotoFont(doc); // Ensure font for Header
            autoTable(doc, {
                startY: 15,
                head: [['KYSAI - HSE Audit Module', lang === 'tr' ? 'İSG Denetim Raporu' : 'HSE Audit Report']],
                body: [
                    [`Date: ${new Date().toLocaleDateString()}`, `Status: Draft`]
                ],
                theme: 'grid',
                styles: {
                    halign: 'center',
                    valign: 'middle',
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1,
                    font: 'Roboto',
                    fontStyle: 'normal'
                },
                headStyles: { fillColor: [220, 53, 69], textColor: 255, fontSize: 14, fontStyle: 'bold', minCellHeight: 15, font: 'Roboto' },
                columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 'auto' } }
            });
        } catch (e) { console.error("autoTable header failed", e); }

        let yPos = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : 30;

        // Image
        if (imageBase64 && imageBase64.length > 100) {
            try {
                const pageWidth = 190; // A4 width inside margins roughly
                const maxHeight = 80;

                const imgProps = doc.getImageProperties(imageBase64);
                let imgWidth = imgProps.width;
                let imgHeight = imgProps.height;

                // Scale to fit width
                let ratio = pageWidth / imgWidth;
                let finalWidth = pageWidth;
                let finalHeight = imgHeight * ratio;

                // Check height constrain
                if (finalHeight > maxHeight) {
                    ratio = maxHeight / finalHeight;
                    finalHeight = maxHeight;
                    finalWidth = finalWidth * ratio;
                }

                // Center image
                const xPos = (210 - finalWidth) / 2; // A4 width is 210mm

                doc.addImage(imageBase64, 'JPEG', xPos, yPos, finalWidth, finalHeight);
                yPos += finalHeight + 10;
            } catch (e) {
                console.error("Error adding image to PDF", e);
            }
        }

        // Non-Conformities
        if (data.non_conformities && data.non_conformities.length > 0) {
            setRobotoFont(doc);
            doc.setFontSize(12);
            doc.setTextColor(220, 53, 69); // Red
            doc.text(lang === 'tr' ? 'Tespit Edilen Uygunsuzluklar' : 'Identified Non-Conformities', 14, yPos);
            yPos += 5;

            try {
                setRobotoFont(doc);
                autoTable(doc, {
                    startY: yPos,
                    body: data.non_conformities.map(item => [`• ${item}`]),
                    theme: 'striped',
                    headStyles: { fillColor: [255, 230, 230], textColor: 0, font: 'Roboto' },
                    styles: { font: 'Roboto', fontSize: 10, cellPadding: 2, fontStyle: 'normal' }
                });
            } catch (e) { console.error("autoTable NC failed", e); }
            yPos = doc.lastAutoTable.finalY + 10;
        }

        // User Observations
        if (data.user_observations) {
            setRobotoFont(doc);
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text(lang === 'tr' ? 'Kullanıcı Gözlemleri' : 'User Observations', 14, yPos);
            yPos += 5;

            setRobotoFont(doc);
            const splitText = doc.splitTextToSize(data.user_observations, 180);
            doc.setFontSize(10);
            doc.text(splitText, 14, yPos);
            yPos += (splitText.length * 5) + 10;
        }

        // Corrective Actions
        if (data.corrective_actions && data.corrective_actions.length > 0) {
            // Check for page break
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            setRobotoFont(doc);
            doc.setFontSize(12);
            doc.setTextColor(40, 167, 69); // Green
            doc.text(lang === 'tr' ? 'Önerilen Düzeltici Faaliyetler' : 'Suggested Corrective Actions', 14, yPos);
            yPos += 5;

            try {
                setRobotoFont(doc);
                autoTable(doc, {
                    startY: yPos,
                    body: data.corrective_actions.map(item => [`✓ ${item}`]),
                    theme: 'striped',
                    styles: { font: 'Roboto', fontSize: 10, cellPadding: 2, fontStyle: 'normal' }
                });
            } catch (e) { console.error("autoTable Actions failed", e); }
            yPos = doc.lastAutoTable.finalY + 20;
        }

        // Signatures
        if (yPos > 240) {
            doc.addPage();
            yPos = 40;
        }

        setRobotoFont(doc);
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.line(20, yPos, 80, yPos);
        doc.text("Auditor / Denetçi", 20, yPos + 5);

        doc.line(120, yPos, 180, yPos);
        doc.text("Responsible / Sorumlu", 120, yPos + 5);

        // Save
        const filename = `HSE_Audit_${new Date().getTime()}.pdf`;
        triggerDownload(doc, filename);
    }
}

function triggerDownload(doc: any, filename: string) {
    try {
        console.log("Attempting to save PDF...");
        doc.save(filename);
        console.log("PDF download triggered.");
    } catch (e) {
        console.warn("doc.save() blocked/failed, attempting blob fallback...", e);
        try {
            const blob = doc.output('blob');
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log("PDF download triggered via Blob.");
        } catch (blobErr) {
            console.warn("Blob fallback failed, trying dataurlnewwindow...", blobErr);
            try {
                doc.output('dataurlnewwindow');
            } catch (finalErr) {
                console.error("All PDF export methods failed", finalErr);
                alert("PDF export failed. Please check console permissions.");
            }
        }
    }
}
