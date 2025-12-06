// Quick fix for exportAsExcel - Replace lines 323-471 in app-save-load.js

async function exportAsExcel() {
    if (!currentTemplate) {
        alert("Please select a template first");
        closeExportModal();
        return;
    }

    const projectName = window.currentProjectName || "email-brief";
    
    // Close modal immediately
    closeExportModal();

    try {
        // Show alert with progress
        alert("Generating export package...\n\nThis may take a moment.");

        const zip = new JSZip();
        
        // 1. Generate Excel file (HTML table format)
        let htmlContent = `<!DOCTYPE html>
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
            htmlContent += `
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

            htmlContent += `<tr><td><strong>${field.label}</strong></td>`;

            if (field.type === "image") {
                if (uploadedImages[field.id]) {
                    const imageData = uploadedImages[field.id];
                    const imageExtension = imageData.substring(imageData.indexOf("/") + 1, imageData.indexOf(";"));
                    const imageName = `${field.label.replace(/[^a-z0-9]/gi, "_")}.${imageExtension}`;
                    const base64Data = imageData.split(",")[1];
                    imagesFolder.file(imageName, base64Data, { base64: true });
                    htmlContent += `<td>See: images/${imageName}</td>`;
                } else {
                    htmlContent += `<td>[No image uploaded]</td>`;
                }
                htmlContent += `<td>N/A</td><td>N/A</td>`;
            } else {
                const displayValue = value;
                htmlContent += `<td>${displayValue}</td><td>${charCount}</td><td>${maxChars}</td>`;
            }

            htmlContent += `</tr>`;
        });

        htmlContent += `
    </table>
</body>
</html>`;

        zip.file(projectName + ".xls", htmlContent);

        // 2. Generate PDF of email preview
        const previewContent = document.getElementById('preview-content');
        if (previewContent) {
            const clonedPreview = previewContent.cloneNode(true);
            
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.width = '600px';
            tempContainer.appendChild(clonedPreview);
            document.body.appendChild(tempContainer);

            try {
                // Use html2canvas with allowTaint to handle images
                const canvas = await html2canvas(clonedPreview, {
                    scale: 2,
                    allowTaint: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });

                // Create PDF using jsPDF
                const { jsPDF } = window.jspdf;
                const imgWidth = 210; // A4 width in mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                
                const pdfBlob = pdf.output('blob');
                zip.file(projectName + "-preview.pdf", pdfBlob);

            } finally {
                document.body.removeChild(tempContainer);
            }
        }

        // 3. Generate and download the final zip file
        const zipBlob = await zip.generateAsync({ type: "blob" });

        // Trigger download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(zipBlob);
        link.download = projectName + ".zip";
        link.click();

        alert("Export package downloaded successfully!\n\nIncludes:\n• Excel brief\n• Email preview PDF\n• Images folder");

    } catch (err) {
        console.error("Export error:", err);
        alert("Error creating export package: " + err.message);
    }
}
