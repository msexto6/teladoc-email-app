// Export-related functions for Email Briefing App
// Handles Excel, HTML, PDF exports and download functionality
// PHASE 3: Ephemeral exports with metadata-only Firestore saves
// Updated: 2025-11-23 - Exports now download directly, metadata saved to Firestore
// Updated: 2025-11-23 - Legacy export cards removed from marketer UI
// Updated: 2025-11-23 - Removed folder selection UI from export modal
// Updated: 2025-11-23 - Modal closes immediately after download triggers
// SPRINT A: Added validation gate for export functionality
// SPRINT: Fixed image filenames in ZIP - no more URL-based subfolders
// SPRINT G: Added export preloader overlay
// ============================================
// EXPORT OVERLAY FUNCTIONS (SPRINT G - PART 1B)
// ============================================

/**
 * Set the export overlay state (loading or success)
 * @param {string} state - Either 'loading' or 'success'
 */
function setExportOverlayState(state) {
    const loadingEl = document.getElementById('export-overlay-loading');
    const successEl = document.getElementById('export-overlay-success');

    if (!loadingEl || !successEl) return;

    if (state === 'loading') {
        loadingEl.style.display = '';
        successEl.style.display = 'none';
    } else if (state === 'success') {
        loadingEl.style.display = 'none';
        successEl.style.display = '';
    }
}

/**
 * Attach event listeners to overlay buttons
 * Should be called once on DOM ready
 */
function attachExportOverlayEvents() {
    const closeBtn = document.getElementById('export-overlay-close');
    if (!closeBtn) return;

    closeBtn.addEventListener('click', () => {
        hideExportOverlay();
    });
}

// Initialize overlay events when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachExportOverlayEvents);
} else {
    attachExportOverlayEvents();
}

function showExportOverlay() {
    const overlay = document.getElementById('export-overlay');
    if (overlay) {
        setExportOverlayState('loading'); // Always start in loading state
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
    }
}

function hideExportOverlay() {
    const overlay = document.getElementById('export-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
    }
}

// ============================================
// EXPORT MODAL FUNCTIONS
// ============================================

function openExportModal() {
    const modal = document.getElementById('export-modal');
    if (modal) {
        // No folder selection needed - auto-assigned from source design
        modal.classList.add('active');
    }
}

function closeExportModal() {
    const modal = document.getElementById('export-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * SPRINT A TASK A4: Export Modal with Pre-flight Validation
 * Gates the export modal behind validation checks
 */
function showExportModal() {
    console.log("🔍 SPRINT A: Checking validation before export...");
    
    // Run validation
    const validation = window.validateCurrentDesign();
    
    // Clear any previous errors
    if (typeof window.clearFieldErrors === 'function') {
        window.clearFieldErrors();
    }
    
    // If validation fails, show errors and block modal
    if (!validation.isValid) {
        console.log("❌ Validation failed, showing errors:", validation.errors);
        
        validation.errors.forEach(err => {
            if (typeof window.setFieldError === 'function') {
                window.setFieldError(err.fieldId, err.message);
            }
        });
        
        // Show toast notification
        showToast("Please complete the highlighted fields before exporting.");
        return; // Don't open modal
    }
    
    // If valid, open modal as normal
    console.log("✅ Validation passed, opening export modal");
    openExportModal();
}

/**
 * SPRINT A: Simple toast notification system
 * @param {string} message - Message to display
 */
function showToast(message) {
    // Remove existing toast if present
    const existing = document.querySelector('.validation-toast');
    if (existing) {
        existing.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'validation-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * SPRINT G: Success notification system
 * @param {string} message - Message to display
 * @param {string} type - Notification type ('success', 'error', 'info')
 */
function showNotification(message, type = 'success') {
    showToast(message);
}

// Expose functions globally
window.showExportModal = showExportModal;
window.showToast = showToast;
window.showNotification = showNotification;

// ============================================
// UTILITY: TRIGGER CLIENT-SIDE DOWNLOAD
// ============================================

/**
 * Triggers a client-side file download
 * @param {Blob} blob - File content as a Blob
 * @param {string} fileName - Name for the downloaded file
 */
function triggerDownload(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log(`✅ Download triggered: ${fileName} (${blob.size} bytes)`);
}

// ============================================
// STATIC ASSETS COLLECTION
// ============================================

/**
 * Get file extension from path or URL
 * @param {string} path - File path or URL
 * @returns {string} Extension with dot (e.g., ".png")
 */
function getExtensionFromPath(path) {
    const match = /\.(\w+)(?:$|\?)/.exec(path || '');
    return match ? '.' + match[1] : '';
}

/**
 * SPRINT FIX: Sanitize filename for ZIP - removes URL paths, query params, fragments
 * Ensures flat filenames with no subfolder creation from slashes
 * @param {string} url - Full URL or path
 * @param {string} fallbackName - Fallback name if URL parsing fails
 * @returns {string} Clean, flat filename safe for ZIP
 */
function sanitizeImageFilename(url, fallbackName) {
    if (!url) {
        return fallbackName || 'image.jpg';
    }
    
    // Handle base64 data URLs - they don't have a filename
    if (url.startsWith('data:')) {
        // Extract extension from MIME type: data:image/png;base64,...
        const mimeMatch = url.match(/^data:image\/(\w+)/);
        const ext = mimeMatch ? mimeMatch[1] : 'jpg';
        return fallbackName ? `${fallbackName}.${ext}` : `image.${ext}`;
    }
    
    // Strip query params and fragments first
    let cleanUrl = url.split('?')[0].split('#')[0];
    
    // Get just the filename from the path (last segment after /)
    let rawName = cleanUrl.split('/').pop() || '';
    
    // Remove any remaining problematic characters
    // Keep only alphanumeric, dash, underscore, and dot
    rawName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    // If empty or suspicious after cleaning, use fallback
    if (!rawName || rawName === '_' || rawName.length < 2) {
        rawName = fallbackName || 'image';
    }
    
    // Ensure it has an extension
    if (!/\.\w{2,5}$/.test(rawName)) {
        // Try to get extension from original URL
        const ext = getExtensionFromPath(url) || '.jpg';
        rawName = rawName + ext;
    }
    
    // Limit filename length to prevent issues
    if (rawName.length > 100) {
        const ext = rawName.substring(rawName.lastIndexOf('.'));
        rawName = rawName.substring(0, 95) + ext;
    }
    
    console.log(`📝 Filename sanitized: "${url.substring(0, 50)}..." → "${rawName}"`);
    return rawName;
}

/**
 * Generate export filename for an image entry (uses sanitization)
 * @param {Object} entry - Image entry with sourceType and key
 * @param {string} entry.sourceType - 'uploaded' or 'static'
 * @param {string} entry.key - Image identifier
 * @param {string} entry.src - Image source path
 * @returns {string} Filename for use in ZIP
 */
function makeExportFileName(entry) {
    // Use the slot key as a fallback name prefix
    const fallbackPrefix = entry.sourceType === 'static' 
        ? `static-${entry.key || 'asset'}`
        : (entry.key || 'image');
    
    return sanitizeImageFilename(entry.src, fallbackPrefix);
}

/**
 * Collect all static assets defined in current template
 * @returns {Array} Array of static asset entries
 */
function collectStaticAssets() {
    const activeTemplateKey = window.currentTemplateKey || null;
    if (!activeTemplateKey) {
        console.log('📦 No active template, skipping static assets');
        return [];
    }
    
    const template = templates[activeTemplateKey];
    if (!template || !template.staticAssets) {
        console.log('📦 Template has no staticAssets defined');
        return [];
    }
    
    const assets = [];
    template.staticAssets.forEach(asset => {
        if (asset.export) {
            assets.push({
                sourceType: 'static',
                key: asset.id,
                src: asset.src
            });
        }
    });
    
    console.log(`📦 Collected ${assets.length} static assets from template:`, assets.map(a => a.src));
    return assets;
}

// ============================================
// MAIN EXPORT FUNCTION (EPHEMERAL ZIP)
// ============================================

async function exportAsExcel() {
    if (!currentTemplate) {
        showModal("Template Required", "Please select a template first.");
        closeExportModal();
        return;
    }

    console.log("=== Starting Export (Phase 3: Ephemeral) ===");

    // Use current project name exactly as it is
    const projectName = window.currentProjectName || "email-brief";
    const exportFileName = projectName + ".zip";

    try {
        // SPRINT G: Show overlay before starting export
        closeExportModal();
        showExportOverlay();

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
        
        // Track used filenames to avoid duplicates
        const usedFilenames = new Set();
        
        /**
         * Get unique filename, appending number if needed
         */
        function getUniqueFilename(baseName) {
            let filename = baseName;
            let counter = 1;
            while (usedFilenames.has(filename.toLowerCase())) {
                const ext = baseName.substring(baseName.lastIndexOf('.'));
                const nameWithoutExt = baseName.substring(0, baseName.lastIndexOf('.'));
                filename = `${nameWithoutExt}_${counter}${ext}`;
                counter++;
            }
            usedFilenames.add(filename.toLowerCase());
            return filename;
        }

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
                    // SPRINT FIX: Use sanitized filename for Excel section too
                    const sanitizedLabel = field.label.replace(/[^a-z0-9]/gi, "_");
                    const imageName = sanitizeImageFilename(imageData, sanitizedLabel);
                    const uniqueImageName = getUniqueFilename(imageName);
                    
                    // Handle base64 data
                    if (imageData.startsWith('data:')) {
                        const base64Data = imageData.split(",")[1];
                        imagesFolder.file(uniqueImageName, base64Data, { base64: true });
                    }
                    // Note: URL-based images handled in main collection below
                    
                    excelContent += `<td>See: images/${uniqueImageName}</td>`;
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
        console.log("✅ Excel file created");

        // ============================================
        // 2. COLLECT ALL IMAGES
        // ============================================
        
        console.log("📦 Collecting images for export...");
        const allImages = [];
        
        // User-uploaded images
        for (const [slotKey, imageUrl] of Object.entries(uploadedImages || {})) {
            if (!imageUrl) continue;
            allImages.push({
                sourceType: 'uploaded',
                key: slotKey,
                src: imageUrl
            });
        }
        
        // Static assets from template
        const staticAssets = collectStaticAssets();
        allImages.push(...staticAssets);
        
        console.log('🖼 Export images:', {
            uploaded: allImages.filter(i => i.sourceType === 'uploaded').length,
            static: allImages.filter(i => i.sourceType === 'static').length,
            total: allImages.length
        });
        
        // Bundle images into ZIP
        for (const entry of allImages) {
            try {
                // SPRINT FIX: Use sanitized filename
                const rawFilename = makeExportFileName(entry);
                const filename = getUniqueFilename(rawFilename);
                
                console.log(`📥 Fetching ${entry.sourceType}: ${entry.src.substring(0, 60)}... → ${filename}`);
                
                // Skip base64 images - already handled in Excel section above
                if (entry.src.startsWith('data:')) {
                    console.log(`⏭ Skipping base64 image (already added): ${filename}`);
                    continue;
                }
                
                let response;
                if (entry.src.startsWith('http') || entry.src.startsWith('data:')) {
                    response = await fetch(entry.src);
                } else {
                    response = await fetch(entry.src);
                }
                
                if (!response.ok) {
                    console.error(`⚠️ Failed to fetch ${entry.src}: ${response.statusText}`);
                    continue;
                }
                
                const blob = await response.blob();
                imagesFolder.file(filename, blob);
                console.log(`✅ Added ${filename} (${blob.size} bytes)`);
                
            } catch (err) {
                console.error(`❌ Error adding ${entry.src}:`, err);
            }
        }

        // ============================================
        // 3. CREATE PDF FILE
        // ============================================
        console.log("📄 Starting PDF generation...");
        
        let pdfCreated = false;
        try {
            const previewElement = document.getElementById('preview-content');
            if (previewElement && typeof html2canvas !== 'undefined' && typeof jspdf !== 'undefined') {
                const cloneElement = previewElement.cloneNode(true);
                
                const images = cloneElement.querySelectorAll('img');
                images.forEach(img => {
                    img.crossOrigin = 'anonymous';
                });
                
                cloneElement.style.position = 'absolute';
                cloneElement.style.left = '-9999px';
                cloneElement.style.width = previewElement.offsetWidth + 'px';
                document.body.appendChild(cloneElement);
                
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const canvas = await html2canvas(cloneElement, {
                    scale: 1.2,
                    backgroundColor: '#ffffff',
                    logging: false,
                    useCORS: true,
                    allowTaint: true
                });
                
                document.body.removeChild(cloneElement);
                
                const imgData = canvas.toDataURL('image/jpeg', 0.92);
                const { jsPDF } = jspdf;
                
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
                
                const pdfBlob = pdf.output('blob');
                zip.file(projectName + "-email-preview.pdf", pdfBlob);
                console.log("✅ PDF added to ZIP");
                pdfCreated = true;
            }
        } catch (pdfError) {
            console.error("❌ PDF generation failed:", pdfError);
        }

        // ============================================
        // 4. GENERATE ZIP & TRIGGER DOWNLOAD
        // ============================================
        console.log("Generating ZIP...");
        const zipBlob = await zip.generateAsync({ type: "blob" });
        console.log("Export: ZIP blob size (bytes):", zipBlob.size);
        console.log("Export: triggering download:", exportFileName);
        
        // Trigger client-side download
        triggerDownload(zipBlob, exportFileName);
        
        // ============================================
        // 5. SAVE METADATA TO FIRESTORE (AUTO-FOLDER)
        // ============================================
        try {
            if (typeof EmailBriefingDB !== 'undefined' && EmailBriefingDB.saveExportMetadata) {
                await EmailBriefingDB.saveExportMetadata({
                    designId: window.currentLocalStorageKey || null,
                    designName: projectName,
                    templateKey: window.currentTemplateKey || currentTemplate.key,
                    sizeBytes: zipBlob.size,
                    createdAt: Date.now(),
                    fileName: exportFileName
                });
                console.log("✅ Export metadata saved to Firestore (folder auto-assigned)");
            }
        } catch (metadataError) {
            console.warn("Export file created, but metadata could not be saved:", metadataError);
            showToast("Export downloaded. History entry could not be saved, but your ZIP file is fine.");
        }
        
        // ============================================
        // ============================================
        // 6. SWITCH TO SUCCESS STATE
        // ============================================
        setExportOverlayState("success");
        
        console.log("=== Export Complete (Phase 3) ===");
        console.log("=== Export Complete (Phase 3) ===");
        
    } catch (error) {
        console.error("Export failed:", error);
        
        // Hide overlay on error
        hideExportOverlay();
        
        // Show error notification
        showNotification(
            'There was a problem creating your export package.',
            'error'
        );
        
        showModal(
            "Export Failed",
            "We couldn't generate your export file. Please try again. If the problem persists, contact the creative team."
        );
    }
}

// ============================================
// LEGACY DOWNLOAD FUNCTIONS (DEPRECATED)
// Phase 3: These functions are deprecated and safe
// ============================================

/**
 * Downloads an export ZIP file from legacy storage
 * @deprecated This function is for legacy exports only. 
 * Phase 3 exports download immediately and don't store ZIP files.
 * This path is deprecated - exports are now accessed via Admin panel.
 */
async function downloadExportFromCard(exportKey) {
    console.warn("[LegacyExport] downloadExportFromCard called - this path is deprecated in Phase 3");
    console.log("[LegacyExport] Export key:", exportKey);
    
    // Safety check: If no export key provided
    if (!exportKey) {
        console.warn("[LegacyExport] downloadExportFromCard called with missing exportKey. This path is deprecated.");
        return;
    }
    
    try {
        // Attempt to fetch from IndexedDB (legacy)
        const dataStr = await dbGet(exportKey);
        
        if (!dataStr) {
            // Show helpful message instead of crashing
            console.log("[LegacyExport] No legacy export data found in IndexedDB");
            showModal(
                "Export History Moved", 
                "Export files are now accessed through the Admin → Export History panel.\n\n" +
                "Phase 3 exports download immediately and don't store ZIP files.\n\n" +
                "To re-export this design, open it and click Export."
            );
            return;
        }
        
        const rawData = JSON.parse(dataStr);
        const exportData = rawData.data || rawData;
        
        if (!exportData.isExport) {
            console.warn("[LegacyExport] Data exists but is not marked as export");
            showModal(
                "Export Unavailable", 
                "This doesn't appear to be a valid export file."
            );
            return;
        }
        
        let filename = exportData.fileName || exportData.projectName || 'export.zip';
        
        // Base64 legacy format
        if (exportData.fileData) {
            try {
                const parts = exportData.fileData.split(',');
                const mimeString = parts[0].split(':')[1].split(';')[0];
                const byteString = atob(parts[1]);
                
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                
                const blob = new Blob([ab], { type: mimeString });
                triggerDownload(blob, filename);
                
                console.log("✅ Legacy export downloaded");
            } catch (base64Error) {
                console.error("[LegacyExport] Failed to process export:", base64Error);
                showModal(
                    "Export Error", 
                    "Error processing export file. The file may be corrupted."
                );
            }
        } else {
            console.log("[LegacyExport] No fileData in export record");
            showModal(
                "Export Unavailable",
                "Exports are downloaded when you create them. This history entry shows what was exported, but does not store the ZIP file.\n\n" +
                "To re-export, open the design and export again."
            );
        }
        
    } catch (err) {
        console.error("[LegacyExport] ERROR in downloadExportFromCard:", err);
        
        // Safe error handling - don't crash the app
        showModal(
            "Export Error", 
            "Error accessing export file. This type of export card is no longer supported.\n\n" +
            "Please re-open the design and use the new Export flow."
        );
    }
}

/**
 * Legacy function redirect
 * @deprecated Use Admin panel for export history instead
 */
async function downloadExportFile(exportKey) {
    console.warn("[LegacyExport] downloadExportFile (legacy) → downloadExportFromCard");
    await downloadExportFromCard(exportKey);
}

// Expose functions globally (required for legacy card onclick handlers)
window.downloadExportFromCard = downloadExportFromCard;
window.downloadExportFile = downloadExportFile;
