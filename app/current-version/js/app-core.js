/**
 * Email Briefing Tool - Main Application Controller
 * Version: 6.0 - Load Pipeline v2
 * Last Updated: November 2025
 * 
 * LOAD PIPELINE V2: Unified loading system for all design sources
 * TASK-003: Integrated centralized AppState management
 */

// ============================================
// APPLICATION STATE - GLOBAL UNIFIED STATE
// ============================================

// CRITICAL FIX: Initialize as window properties FIRST for global access
window.formData = window.formData || {};
window.uploadedImages = window.uploadedImages || {};

// Create local references that point to the same objects
let currentTemplate = null;
let currentTemplateKey = null;
let formData = window.formData;
let uploadedImages = window.uploadedImages;

// Flag to distinguish between loading a fresh template vs a saved design
let isLoadingSavedDesign = false;
let savedDesignName = null;
let savedDesignTemplateName = null;

// TASK I: Builder mode flag to differentiate Template Mode vs Design Mode
window.builderMode = 'template'; // Can be 'template' or 'design'

// ============================================
// LOAD PIPELINE V2 - GLOBAL LOAD STATE
// ============================================

// Global load state flag
window.isLoadingProject = false;

/**
 * Begin a project load cycle.
 * @param {string} source - e.g. "load-from-card", "load-from-file", "share-link"
 */
window.beginProjectLoad = function(source) {
    window.isLoadingProject = true;
    console.log("🔄 Begin project load:", source);
};

/**
 * End a project load cycle.
 */
window.endProjectLoad = function() {
    window.isLoadingProject = false;
    console.log("✅ Project load complete");
};

// ============================================
// SPRINT N2: TEXT PROCESSING UTILITIES
// ============================================

/**
 * Convert plain text with double line breaks (\n\n) into HTML paragraphs.
 * Treats blank lines (two consecutive line breaks) as paragraph separators.
 * 
 * @param {string} text - Plain text with paragraph breaks marked by \n\n
 * @returns {string} HTML with proper <p> tags for each paragraph
 * 
 * Example:
 *   Input:  "First paragraph.\n\nSecond paragraph."
 *   Output: "<p>First paragraph.</p><p>Second paragraph.</p>"
 */
window.convertPlainTextToHtmlParagraphs = function(text) {
    if (!text) return '';
    
    // Split on double line breaks (blank lines)
    const paragraphs = text.split(/\n\n+/);
    
    // Wrap each paragraph in <p> tags, filtering out empty ones
    const htmlParagraphs = paragraphs
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(p => {
            // Replace single line breaks within paragraphs with <br>
            const formatted = p.replace(/\n/g, '<br>');
            return `<p>${formatted}</p>`;
        });
    
    return htmlParagraphs.join('');
};

// ============================================
// INITIALIZATION
// ============================================

async function init() {
    // Firebase auto-connects, no initialization needed
    console.log('✓ Database initialized successfully');
    
    // TASK-003: Register global state references with AppState
    if (typeof window.AppState !== 'undefined' && typeof window.AppState.registerGlobals === 'function') {
        window.AppState.registerGlobals({
            formData: window.formData,
            uploadedImages: window.uploadedImages,
            currentTemplate: { value: currentTemplate },
            currentTemplateKey: { value: currentTemplateKey },
            currentDesignId: window,
            currentFileHandle: window,
            currentProjectName: window,
            currentLocalStorageKey: window,
            builderMode: window
        });
        console.log('✓ AppState registered successfully');
    } else {
        console.warn('⚠️ AppState not available - state management will be manual');
    }
    
    setupEventListeners();
    
    // Load template from URL or sessionStorage
    const params = new URLSearchParams(window.location.search);
    const keyFromUrl = params.get("template") || sessionStorage.getItem("selectedTemplateKey");
    
    if (keyFromUrl) {
        window.loadTemplateByKey(keyFromUrl);
    }
}

function setupEventListeners() {
    document.getElementById("save-btn").addEventListener("click", handleSave);
    
    // Add Save As button handler
    const saveAsBtn = document.getElementById("save-as-btn");
    if (saveAsBtn) {
        saveAsBtn.addEventListener("click", handleSaveAs);
    }
    
    // Add Copy Link button handler
    const copyLinkBtn = document.getElementById("copy-link-btn");
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener("click", copyShareableLink);
    }
    
    document.getElementById("load-file-input").addEventListener("change", loadProject);
    document.getElementById("export-btn").addEventListener("click", showExportModal);
    document.getElementById("desktop-view").addEventListener("click", switchToDesktop);
    document.getElementById("mobile-view").addEventListener("click", switchToMobile);
    
    const creativeDropdown = document.getElementById("creative-direction-top");
    if(creativeDropdown) {
        creativeDropdown.addEventListener("change", (e) => {
            window.formData["creative-direction"] = e.target.value;
        });
        
        // SPRINT: Help & Feedback - Show context snippet on focus
        creativeDropdown.addEventListener("focus", () => {
            if (typeof window.HelpSystem !== 'undefined' && typeof window.HelpSystem.showContextSnippet === 'function') {
                window.HelpSystem.showContextSnippet("creativeAskDropdown");
            }
        });
    }
}

// ============================================
// TEMPLATE HANDLING
// ============================================

window.loadTemplateByKey = function(templateKey) {
    console.log("🔍 loadTemplateByKey called with:", templateKey);
    
    // Normalize and validate the key
    const key = (templateKey || "").trim();
    if (!key) {
        console.error("❌ loadTemplateByKey: Empty or invalid template key provided");
        return;
    }
    
    // Try multiple possible template source locations
    const allTemplates = window.templates || window.templateDefinitions || {};
    console.log("📚 Available template sources:", {
        "window.templates": !!window.templates,
        "window.templateDefinitions": !!window.templateDefinitions,
        "using": allTemplates === window.templates ? "window.templates" : "window.templateDefinitions"
    });
    
    // Check if template exists
    if (!allTemplates[key]) {
        console.error("❌ Template not found:", key);
        console.log("📋 Available template keys:", Object.keys(allTemplates));
        console.log("💡 Did you mean one of these?", Object.keys(allTemplates).filter(k => 
            k.toLowerCase().includes(key.toLowerCase()) || 
            key.toLowerCase().includes(k.toLowerCase())
        ));
        return;
    }
    
    // Template found - proceed with loading
    console.log("✅ Template found:", key);
    const templateDefinition = allTemplates[key];
    console.log("📄 Template details:", {
        name: templateDefinition.name,
        fields: templateDefinition.fields ? templateDefinition.fields.length : 0,
        type: templateDefinition.type || "unknown"
    });
    
    // --- Global state sync (critical) ---
    currentTemplateKey = key;
    currentTemplate = templateDefinition;
    
    // Mirror to window for debugging / external tools
    window.currentTemplateKey = currentTemplateKey;
    window.currentTemplate = currentTemplate;
    
    // TASK-003: Use AppState for centralized state reset
    if (typeof window.AppState !== 'undefined' && typeof window.AppState.resetForTemplateChange === 'function') {
        window.AppState.resetForTemplateChange(key, templateDefinition);
    } else {
        // Fallback: Manual state clearing if AppState not available
        Object.keys(window.formData).forEach(key => delete window.formData[key]);
        Object.keys(window.uploadedImages).forEach(key => delete window.uploadedImages[key]);
        console.log("🔄 State reset: formData and uploadedImages cleared (manual fallback)");
    }
    
    // SPRINT N3: Clear currentDesignId for fresh template (new design)
    if (typeof window.currentDesignId !== 'undefined') {
        window.currentDesignId = null;
        console.log("🆔 SPRINT N3: Cleared currentDesignId (new design)");
    }
    
    // --- SPRINT N3b: Always initialize + apply example defaults ---
    if (typeof window.initializeFormDataFromTemplate === "function") {
        window.initializeFormDataFromTemplate(templateDefinition);
    }

    if (typeof window.applyExampleDefaults === "function") {
        window.applyExampleDefaults(window.formData, templateDefinition.fields);
    }
    
    // BUG FIX: Show creative direction section and action buttons
    const creativeSection = document.getElementById("creative-direction-section");
    const actionButtons = document.getElementById("action-buttons");
    
    if (creativeSection) {
        creativeSection.classList.add("active");
        console.log("✅ Creative direction section activated");
    }
    
    if (actionButtons) {
        actionButtons.classList.add("active");
        console.log("✅ Action buttons activated");
    }
    
    // Reset creative direction dropdown to default
    const creativeDropdown = document.getElementById("creative-direction-top");
    if (creativeDropdown) {
        creativeDropdown.value = "[Choose one]";
        console.log("✅ Creative direction dropdown reset");
    }
    
    // TASK I: Set builder mode to 'template' and update header
    window.builderMode = 'template';
    updateBuilderHeader({
        mode: 'template',
        templateName: templateDefinition.name || key
    });
    
    // Pass template key and definition directly to generateForm
    if (typeof window.generateForm === "function") {
        console.log("📝 Calling generateForm() with templateKey and definition...", {
            templateKey: key,
            hasDefinition: !!templateDefinition,
            fieldCount: templateDefinition && templateDefinition.fields ? templateDefinition.fields.length : 0
        });
        window.generateForm(key, templateDefinition);
    } else {
        console.warn("⚠️ generateForm function not found");
    }
    
    if (typeof window.updatePreview === "function") {
        console.log("🖼️ Calling updatePreview()...");
        window.updatePreview();
    } else {
        console.warn("⚠️ updatePreview function not found");
    }
    
    console.log("✅ loadTemplateByKey completed successfully");
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// TASK I: Unified builder header update function
function updateBuilderHeader({ mode, templateName, designName }) {
    try {
        const titleEl = document.getElementById('builder-template-title');
        const projectInfoDisplay = document.getElementById('project-info-display');
        const projectNameDisplay = document.getElementById('project-name-display');
        
        // Safety check: ensure all elements exist
        if (!titleEl) {
            console.warn('⚠️ updateBuilderHeader: builder-template-title element not found');
            return;
        }
        
        if (mode === 'template') {
            // Template Mode: Show template name as main title, hide subtitle
            titleEl.textContent = templateName || 'Your Content';
            
            if (projectInfoDisplay) {
                projectInfoDisplay.style.display = 'none';
            }
            
            console.log('✅ Builder header set to Template Mode:', templateName);
            
        } else if (mode === 'design') {
            // Design Mode: Show design name as main title, template name as subtitle
            titleEl.textContent = designName || templateName || 'Your Content';
            
            if (projectInfoDisplay && projectNameDisplay && templateName) {
                projectNameDisplay.textContent = templateName;
                projectInfoDisplay.style.display = 'flex';
                console.log('✅ Builder header set to Design Mode:', designName, '→', templateName);
            } else if (projectInfoDisplay) {
                // Hide subtitle if template name is missing
                projectInfoDisplay.style.display = 'none';
                console.warn('⚠️ Template name missing in Design Mode, hiding subtitle');
            }
        }
    } catch (err) {
        console.error('❌ Failed to update builder header:', err);
    }
}

// Expose updateBuilderHeader globally for use in other modules
window.updateBuilderHeader = updateBuilderHeader;

// Legacy function - now redirects to updateBuilderHeader
function updateBuilderTemplateTitle(templateKey, templateDefinition) {
    const templateName = templateDefinition?.name || 
                        (window.templates && templateKey ? window.templates[templateKey]?.name : null) || 
                        templateKey?.replace(/-/g, ' ') || 
                        'Your Content';
    
    updateBuilderHeader({
        mode: 'template',
        templateName: templateName
    });
}

// ============================================
// INITIALIZE APP ON LOAD
// ============================================
document.addEventListener('DOMContentLoaded', init);
