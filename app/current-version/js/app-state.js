/**
 * Email Briefing App - Centralized State Management
 * Version: 1.0 - TASK-003
 * 
 * Provides centralized reset functions for app state to prevent:
 * - Template bleedthrough
 * - Ghost values
 * - Stale preview content
 * - State corruption
 * 
 * This module wraps existing global state and provides safe reset paths for:
 * - New Project creation
 * - Template switching
 * - Project loading
 */

const AppState = (function() {
    'use strict';
    
    // ============================================
    // INTERNAL STATE REGISTRY
    // ============================================
    
    // References to actual global state objects/variables
    let _refs = {
        // Core form state
        formData: null,
        uploadedImages: null,
        
        // Template state
        currentTemplate: null,
        currentTemplateKey: null,
        
        // Project/design state
        currentDesignId: null,
        currentFileHandle: null,
        currentProjectName: null,
        currentLocalStorageKey: null,
        
        // Builder mode
        builderMode: null
    };
    
    // ============================================
    // REGISTRATION
    // ============================================
    
    /**
     * Register global state references.
     * Call once during app initialization.
     * 
     * @param {Object} globalRefs - Object containing references to global state
     */
    function registerGlobals(globalRefs) {
        console.log('AppState: Registering global state references');
        
        // Validate and store references
        if (globalRefs.formData) _refs.formData = globalRefs.formData;
        if (globalRefs.uploadedImages) _refs.uploadedImages = globalRefs.uploadedImages;
        if (globalRefs.currentTemplate !== undefined) _refs.currentTemplate = globalRefs.currentTemplate;
        if (globalRefs.currentTemplateKey !== undefined) _refs.currentTemplateKey = globalRefs.currentTemplateKey;
        if (globalRefs.currentDesignId !== undefined) _refs.currentDesignId = globalRefs.currentDesignId;
        if (globalRefs.currentFileHandle !== undefined) _refs.currentFileHandle = globalRefs.currentFileHandle;
        if (globalRefs.currentProjectName !== undefined) _refs.currentProjectName = globalRefs.currentProjectName;
        if (globalRefs.currentLocalStorageKey !== undefined) _refs.currentLocalStorageKey = globalRefs.currentLocalStorageKey;
        if (globalRefs.builderMode !== undefined) _refs.builderMode = globalRefs.builderMode;
        
        console.log('AppState: Registration complete');
    }
    
    // ============================================
    // INTERNAL RESET HELPERS
    // ============================================
    
    /**
     * Clear formData object without breaking references
     */
    function _resetFormData() {
        if (_refs.formData && typeof _refs.formData === 'object') {
            Object.keys(_refs.formData).forEach(key => delete _refs.formData[key]);
            console.log('  ✓ formData cleared');
        }
    }
    
    /**
     * Clear uploadedImages object without breaking references
     */
    function _resetImages() {
        if (_refs.uploadedImages && typeof _refs.uploadedImages === 'object') {
            Object.keys(_refs.uploadedImages).forEach(key => delete _refs.uploadedImages[key]);
            console.log('  ✓ uploadedImages cleared');
        }
    }
    
    /**
     * Clear preview content area
     */
    function _resetPreview() {
        const previewContent = document.getElementById('preview-content');
        if (previewContent) {
            previewContent.innerHTML = '<p style="text-align:center;padding:80px 20px;color:#9B8FC7;">Select a template to see preview</p>';
            console.log('  ✓ preview cleared');
        }
    }
    
    /**
     * Reset template references
     */
    function _resetTemplate() {
        if (_refs.currentTemplate !== undefined) {
            _refs.currentTemplate.value = null;
        }
        if (_refs.currentTemplateKey !== undefined) {
            _refs.currentTemplateKey.value = null;
        }
        
        // Also sync to window properties
        window.currentTemplate = null;
        window.currentTemplateKey = null;
        
        console.log('  ✓ template references cleared');
    }
    
    /**
     * Update template references to new template
     */
    function _setTemplate(templateKey, templateDef) {
        if (_refs.currentTemplateKey !== undefined) {
            _refs.currentTemplateKey.value = templateKey;
        }
        if (_refs.currentTemplate !== undefined) {
            _refs.currentTemplate.value = templateDef;
        }
        
        // Sync to window properties
        window.currentTemplateKey = templateKey;
        window.currentTemplate = templateDef;
        
        console.log('  ✓ template set:', templateKey);
    }
    
    // ============================================
    // PUBLIC RESET FUNCTIONS
    // ============================================
    
    /**
     * Reset all state for a new project.
     * Clears all project data and returns to clean template state.
     */
    function resetForNewProject() {
        console.log('AppState: resetForNewProject()');
        
        // Clear form and images
        _resetFormData();
        _resetImages();
        
        // Clear project identifiers
        if (window.currentDesignId !== undefined) {
            window.currentDesignId = null;
            console.log('  ✓ currentDesignId = null');
        }
        
        if (window.currentFileHandle !== undefined) {
            window.currentFileHandle = null;
            console.log('  ✓ currentFileHandle cleared');
        }
        
        if (window.currentProjectName !== undefined) {
            window.currentProjectName = null;
            console.log('  ✓ currentProjectName cleared');
        }
        
        if (window.currentLocalStorageKey !== undefined) {
            window.currentLocalStorageKey = null;
            console.log('  ✓ currentLocalStorageKey cleared');
        }
        
        // Set builder mode to template
        if (window.builderMode !== undefined) {
            window.builderMode = 'template';
            console.log('  ✓ builderMode = template');
        }
        
        // Clear preview
        _resetPreview();
        
        console.log('AppState: ✅ New project reset complete');
    }
    
    /**
     * Reset state for template change.
     * Clears template-specific data but keeps project identity.
     * 
     * @param {string} newTemplateKey - The new template key
     * @param {Object} newTemplateDef - The new template definition (optional)
     */
    function resetForTemplateChange(newTemplateKey, newTemplateDef) {
        console.log('AppState: resetForTemplateChange()', newTemplateKey);
        
        // Clear form and images (template-specific data)
        _resetFormData();
        _resetImages();
        
        // Update template references
        if (newTemplateDef) {
            _setTemplate(newTemplateKey, newTemplateDef);
        } else {
            // Try to find template definition
            const templates = window.templates || window.templateDefinitions || {};
            const templateDef = templates[newTemplateKey];
            if (templateDef) {
                _setTemplate(newTemplateKey, templateDef);
            } else {
                console.warn('  ⚠️ Template definition not found for:', newTemplateKey);
            }
        }
        
        // Clear preview (will be regenerated)
        _resetPreview();
        
        // NOTE: currentDesignId is NOT cleared - project identity persists
        
        console.log('AppState: ✅ Template change reset complete');
    }
    
    /**
     * Reset state before loading a project.
     * Prepares clean slate for incoming project data.
     * 
     * @param {string} projectId - The design ID being loaded
     */
    function resetBeforeLoad(projectId) {
        console.log('AppState: resetBeforeLoad()', projectId);
        
        // Clear form and images (will be repopulated from loaded data)
        _resetFormData();
        _resetImages();
        
        // Set project ID immediately
        if (window.currentDesignId !== undefined) {
            window.currentDesignId = projectId;
            console.log('  ✓ currentDesignId =', projectId);
        }
        
        // Set builder mode to design
        if (window.builderMode !== undefined) {
            window.builderMode = 'design';
            console.log('  ✓ builderMode = design');
        }
        
        // Clear preview (will be regenerated from loaded data)
        _resetPreview();
        
        console.log('AppState: ✅ Pre-load reset complete');
    }
    
    // ============================================
    // PUBLIC API
    // ============================================
    
    return {
        registerGlobals,
        resetForNewProject,
        resetForTemplateChange,
        resetBeforeLoad
    };
})();

// Expose globally
window.AppState = AppState;
