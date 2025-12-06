// Export-related functions for Email Briefing App
// Handles Excel, HTML, PDF exports and download functionality

// ============================================
// EXPORT MODAL FUNCTIONS
// ============================================

function openExportModal() {
    const modal = document.getElementById('export-modal');
    if (modal) {
        // Populate folder hierarchy for export
        populateFolderHierarchyExport();
        modal.classList.add('active');
    }
}

function closeExportModal() {
    const modal = document.getElementById('export-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============================================
// HELPER FUNCTION TO EXPORT TELADOC LOGO
// ============================================

async function addTeladocLogoToZip(zip) {
    try {
        console.log("Adding Teladoc logo to ZIP...");
        
        // Fetch the logo directly from the assets folder
        const logoPath = 'assets/images/teladoc-logo.png';
        const response = await fetch(logoPath);
        
        if (!response.ok) {
            console.error("Failed to fetch logo:", response.statusText);
            return;
        }
        
        const blob = await response.blob();
        zip.file('images/teladoc-logo.png', blob);
        console.log("✓ Successfully added Teladoc logo to images folder");
        
    } catch (err) {
        console.error("Error adding Teladoc logo:", err);
    }
}

// ============================================
// MAIN EXPORT FUNCTION (ZIP PACKAGE)
// ============================================

async function exportAsExcel() {
    if (!currentTemplate) {
        alert("Please select a template first");
        closeExportModal();
        return;
    }

    console.log("=== Starting Export ===");

    // Use current project name exactly as it is
    const projectName = window.currentProjectName || "email-brief";

    const zip = new JSZip();
    
    // ============================================
    // 1. CREATE EXCEL FILE (Content Brief)
    // ============================================
    console.log("Creating Excel file...");
    let excelContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; vertical-align: top; }
        th { background-color: #351F65; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
    </style>
</head>
<body>
    <h1>Email Content Brief - ${projectName}</h1>
    <table>
        <tr>
            <th>Field</th>
            <th>Content</th>
            <th>Character Count</th>
            <th>Max Characters</th>
        </tr>`;

    const imagesFolder = zip.folder("images");

    // Export creative direction
    const creativeDirectionValue = document.getElementById("creative-direction-top").value;
    if (creativeDirectionValue && creativeDirectionValue !== "[Choose one]") {
        excelContent += `
        <tr>
            <td><strong>I need the creative team to...</strong></td>
            <td>${creativeDirectionValue}</td>
            <td>N/A</td>
            <td>N/A</td>
        </tr>`;
    }

    currentTemplate.fields.forEach(field => {
        const value = formData[field.id] || "";
        const elem = document.getElementById(field.id);
        const charCount = elem && elem.contentEditable === "true" ?
            elem.textContent.length :
            value.length;
        const maxChars = field.maxChars || "N/A";

        excelContent += `<tr><td><strong>${field.label}</strong></td>`;

        if (field.type === "image") {
            if (uploadedImages[field.id]) {
                const imageData = uploadedImages[field.id];
                const imageExtension = imageData.substring(imageData.indexOf("/") + 1, imageData.indexOf(";"));
                const imageName = `${field.label.replace(/[^a-z0-9]/gi, "_")}.${imageExtension}`;
                const base64Data = imageData.split(",")[1];
                imagesFolder.file(imageName, base64Data, { base64: true });
                excelContent += `<td>See: images/${imageName}</td>`;
            } else {
                excelContent += `<td>[No image uploaded]</td>`;
            }
            excelContent += `<td>N/A</td><td>N/A</td>`;
        } else {
            // Export with HTML formatting preserved
            const displayValue = value;
            excelContent += `<td>${displayValue}</td><td>${charCount}</td><td>${maxChars}</td>`;
        }

        excelContent += `</tr>`;
    });

    excelContent += `
    </table>
</body>
</html>`;

    zip.file(projectName + ".xls", excelContent);
    console.log("Excel file created");

    // Add Teladoc logo to images folder
    await addTeladocLogoToZip(zip);

    // ============================================
    // 2. CREATE PDF FILE (Email Preview) - BALANCED QUALITY
    // ============================================
    console.log("Starting PDF generation with images...");
    
    let pdfCreated = false;
    try {
        const previewElement = document.getElementById('preview-content');
        if (previewElement && typeof html2canvas !== 'undefined' && typeof jspdf !== 'undefined') {
            console.log("Libraries loaded, creating PDF...");
            
            // Clone the element
            const cloneElement = previewElement.cloneNode(true);
            
            // Keep images but add crossOrigin attribute
            const images = cloneElement.querySelectorAll('img');
            images.forEach(img => {
                img.crossOrigin = 'anonymous';
            });
            
            console.log("Found", images.length, "images in clone");
            
            // Temporarily add to document for rendering
            cloneElement.style.position = 'absolute';
            cloneElement.style.left = '-9999px';
            cloneElement.style.width = previewElement.offsetWidth + 'px';
            document.body.appendChild(cloneElement);
            
            // Wait for rendering
            await new Promise(resolve => setTimeout(resolve, 500));
            
            console.log("Generating canvas with balanced quality...");
            const canvas = await html2canvas(cloneElement, {
                scale: 1.2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true
            });
            
            console.log("Canvas created:", canvas.width, "x", canvas.height);
            
            // Remove temporary clone
            document.body.removeChild(cloneElement);
            
            console.log("Creating single-page PDF from canvas...");
            const imgData = canvas.toDataURL('image/jpeg', 0.92);
            const { jsPDF } = jspdf;
            
            // Calculate dimensions to fit on one page
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / imgHeight;
            
            const pageWidth = 210;
            const pageHeight = 297;
            
            let pdfWidth = pageWidth;
            let pdfHeight = pageWidth / ratio;
            
            if (pdfHeight > pageHeight) {
                pdfHeight = pageHeight;
                pdfWidth = pageHeight * ratio;
            }
            
            const pdf = new jsPDF({
                orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
                unit: 'mm',
                format: 'a4',
                compress: true
            });
            
            const xOffset = (pageWidth - pdfWidth) / 2;
            const yOffset = (pageHeight - pdfHeight) / 2;
            
            pdf.addImage(imgData, 'JPEG', xOffset, yOffset, pdfWidth, pdfHeight);
            
            console.log("PDF object created, generating blob...");
            const pdfBlob = pdf.output('blob');
            console.log("PDF blob size:", pdfBlob.size, "bytes =", (pdfBlob.size / 1024 / 1024).toFixed(2), "MB");
            
            zip.file(projectName + "-email-preview.pdf", pdfBlob);
            console.log("PDF added to ZIP");
            pdfCreated = true;
        } else {
            console.log("PDF generation skipped - missing element or libraries");
        }
    } catch (pdfError) {
        console.error("PDF generation error:", pdfError);
        alert("Note: PDF generation encountered an error. Continuing with other files.\nError: " + pdfError.message);
    }

    // ============================================
    // 3. GENERATE ZIP AND SAVE TO INDEXEDDB
    // ============================================
    console.log("Generating ZIP file...");
    const zipBlob = await zip.generateAsync({ type: "blob" });
    console.log("ZIP blob size:", zipBlob.size, "bytes =", (zipBlob.size / 1024 / 1024).toFixed(2), "MB");

    // Convert blob to base64 for storage
    const reader = new FileReader();
    reader.onloadend = async function () {
        const base64data = reader.result;

        // Create export entry in My Designs with .zip extension
        const exportKey = 'email-export-' + Date.now();
        
        try {
            const exportData = {
                projectName: projectName + ".zip",
                exportType: "zip",
                fileData: base64data,
                fileName: projectName + ".zip",
                sourceProject: window.currentLocalStorageKey || window.currentProjectName,
                exportDate: new Date().toISOString(),
                isExport: true
            };

            // Save to IndexedDB instead of localStorage
            await dbSave(exportKey, JSON.stringify(exportData));
            console.log("Export saved to IndexedDB");

            // Add to selected folder from Export modal
            if (selectedExportFolder && typeof addItemToFolder === 'function') {
                await addItemToFolder(selectedExportFolder, exportKey);
            }

            const successMessage = pdfCreated ? 
                "Export package saved to My Designs!\n\nContents:\n• Content Brief (.xls)\n• Email Preview PDF (single page with images)\n• Images folder (includes Teladoc logo)" :
                "Export package saved to My Designs!\n\nContents:\n• Content Brief (.xls)\n• Images folder\n\nNote: PDF generation failed";
            
            alert(successMessage);
            closeExportModal();

            // Return to folder view
            goBackFromBuilder();
            
        } catch (storageError) {
            // If storage fails, trigger direct download
            console.error("Storage failed, downloading directly:", storageError);
            const link = document.createElement("a");
            link.href = URL.createObjectURL(zipBlob);
            link.download = projectName + ".zip";
            link.click();
            
            alert("Unable to save to My Designs.\nDownloading directly to your computer instead.");
            closeExportModal();
        }
        
        console.log("=== Export Complete ===");
    };
    reader.readAsDataURL(zipBlob);
}

// ============================================
// DOWNLOAD EXPORT FROM MY DESIGNS (INDEXEDDB)
// ============================================

async function downloadExportFile(exportKey) {
    try {
        const dataStr = await dbGet(exportKey);
        if (!dataStr) {
            alert("Export file not found");
            return;
        }
        
        const exportData = JSON.parse(dataStr);
        if (!exportData.isExport) {
            alert("Invalid export file");
            return;
        }

        // Convert base64 back to blob
        const byteString = atob(exportData.fileData.split(',')[1]);
        const mimeString = exportData.fileData.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });

        // Trigger download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = exportData.fileName;
        link.click();

    } catch (err) {
        console.error("Error downloading export:", err);
        alert("Error downloading file: " + err.message);
    }
}
