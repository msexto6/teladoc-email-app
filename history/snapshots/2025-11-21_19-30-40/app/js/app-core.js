/**
 * Email Briefing Tool - Main Application Controller
 * Version: 5.0 - Firebase Integration
 * Last Updated: November 2025
 */

// ============================================
// APPLICATION STATE
// ============================================
let currentTemplate = null;
let currentTemplateKey = null; // ADDED: Track the template key directly
let formData = {};
let uploadedImages = {};

// Flag to distinguish between loading a fresh template vs a saved design
let isLoadingSavedDesign = false;
let savedDesignName = null;
let savedDesignTemplateName = null;

// ============================================
// INITIALIZATION
// ============================================

async function init() {
    // Firebase auto-connects, no initialization needed
    console.log('✓ Database initialized successfully');
    
    populateTemplateSelector();
    setupEventListeners();
}


function populateTemplateSelector() {
    const sel = document.getElementById("template-selector");
    Object.keys(templates).forEach(key => {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = templates[key].name;
        sel.appendChild(opt);
    });
}


function setupEventListeners() {
    document.getElementById("template-selector").addEventListener("change", handleTemplateChange);
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
            formData["creative-direction"] = e.target.value;
        });
    }
}

// ============================================
// TEMPLATE HANDLING
// ============================================

// ============================================
// INITIALIZE APP ON LOAD
// ============================================
document.addEventListener('DOMContentLoaded', init);
