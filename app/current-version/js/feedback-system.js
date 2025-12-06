/**
 * Feedback System Module
 * Sprint: Interactive Help & Feedback Layer
 * UPDATED: Now saves feedback to Firestore instead of mailto
 * 
 * Manages:
 * - Feedback form within Help panel
 * - Form submission to Firestore
 * - Status messages
 * - Dynamic placeholder text based on feedback type
 * 
 * Global API:
 * - window.FeedbackForm.setLocation(text)
 * - window.FeedbackForm.reset()
 */

(function() {
    'use strict';

    // ============================================
    // STATE
    // ============================================

    let elements = {};

    // Placeholder text for different feedback types
    const PLACEHOLDERS = {
        bug: "What happened? What were you trying to do?",
        enhancement: "What features or changes would you like to see implemented?"
    };

    // ============================================
    // INITIALIZATION
    // ============================================

    function initFeedback() {
        console.log("📬 Initializing Feedback System...");

        // Cache DOM elements
        elements = {
            form: document.getElementById("feedback-form"),
            typeSelect: document.getElementById("feedback-type"),
            descriptionTextarea: document.getElementById("feedback-description"),
            submitBtn: document.getElementById("feedback-submit-btn"),
            cancelBtn: document.getElementById("feedback-cancel-btn"),
            statusBox: document.getElementById("feedback-status")
        };

        // Event listeners
        if (elements.form) {
            elements.form.addEventListener("submit", onSubmit);
        }

        if (elements.cancelBtn) {
            elements.cancelBtn.addEventListener("click", (e) => {
                e.preventDefault();
                reset();
                // Switch back to help tab
                if (window.HelpSystem) {
                    // The tab switching is handled by help-system.js
                    // We just need to trigger the Help tab
                    const helpTab = document.getElementById("help-tab-btn");
                    if (helpTab) {
                        helpTab.click();
                    }
                }
            });
        }

        // Add event listener for type selection change
        if (elements.typeSelect && elements.descriptionTextarea) {
            elements.typeSelect.addEventListener("change", updatePlaceholder);
            // Set initial placeholder based on default selection
            updatePlaceholder();
        }

        // Expose global API
        window.FeedbackForm = {
            setLocation,
            reset
        };

        console.log("📬 Feedback System initialized");
    }

    // ============================================
    // PLACEHOLDER MANAGEMENT
    // ============================================

    function updatePlaceholder() {
        if (!elements.typeSelect || !elements.descriptionTextarea) return;

        const selectedType = elements.typeSelect.value;
        const placeholder = PLACEHOLDERS[selectedType] || PLACEHOLDERS.bug;
        
        elements.descriptionTextarea.placeholder = placeholder;
        console.log(`📬 Placeholder updated for type: ${selectedType}`);
    }

    // ============================================
    // FORM SUBMISSION
    // ============================================

    async function onSubmit(e) {
        e.preventDefault();

        if (!elements.form) return;

        // Check if Firebase is available
        if (typeof EmailBriefingDB === 'undefined') {
            showStatus("Feedback system not available. Please try again later.", "error");
            console.error("EmailBriefingDB not found");
            return;
        }

        // Disable submit button while processing
        if (elements.submitBtn) {
            elements.submitBtn.disabled = true;
            elements.submitBtn.textContent = "Sending...";
        }

        // Gather form data
        const formData = new FormData(elements.form);
        const payload = {
            type: formData.get("type") || "bug",
            description: formData.get("description") || "",
            location: formData.get("location") || "",
            blocking: formData.get("blocking") === "on",
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            url: window.location.href
        };

        // Validate
        if (!payload.description.trim()) {
            showStatus("Please provide a description", "error");
            if (elements.submitBtn) {
                elements.submitBtn.disabled = false;
                elements.submitBtn.textContent = "Send feedback";
            }
            return;
        }

        try {
            // Save to Firestore
            await EmailBriefingDB.saveFeedback(payload);

            // Show success message
            showStatus("Thank you! Your feedback has been submitted.", "success");

            // Reset form after delay
            setTimeout(() => {
                reset();
                // Switch back to help tab
                const helpTab = document.getElementById("help-tab-btn");
                if (helpTab) {
                    helpTab.click();
                }
            }, 2000);

            console.log("📬 Feedback submitted to Firestore");
        } catch (error) {
            console.error("Failed to submit feedback:", error);
            showStatus("Failed to submit feedback. Please try again.", "error");
        } finally {
            // Re-enable submit button
            if (elements.submitBtn) {
                elements.submitBtn.disabled = false;
                elements.submitBtn.textContent = "Send feedback";
            }
        }
    }

    // ============================================
    // STATUS MESSAGES
    // ============================================

    function showStatus(message, type = "success") {
        if (!elements.statusBox) return;

        elements.statusBox.textContent = message;
        elements.statusBox.className = "visible " + type;
        elements.statusBox.style.display = "block";

        console.log(`📬 Status: ${message} (${type})`);
    }

    function hideStatus() {
        if (!elements.statusBox) return;

        elements.statusBox.classList.remove("visible");
        elements.statusBox.className = "";
        elements.statusBox.textContent = "";
        elements.statusBox.style.display = "none";
    }

    // ============================================
    // FORM HELPERS
    // ============================================

    function setLocation(text) {
        if (!elements.form) return;

        const locationInput = elements.form.elements["location"];
        if (locationInput) {
            locationInput.value = text;
        }

        console.log(`📬 Location set to: ${text}`);
    }

    function reset() {
        if (!elements.form) return;

        elements.form.reset();
        hideStatus();
        
        // Reset placeholder to default (bug)
        updatePlaceholder();

        console.log("📬 Feedback form reset");
    }

    // ============================================
    // DOCUMENT READY
    // ============================================

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initFeedback);
    } else {
        initFeedback();
    }

})();
