/**
 * Help System Module
 * Sprint: Interactive Help & Feedback Layer
 * GSAP ANIMATIONS UPDATE: Added smooth slide animations for panel
 * 
 * Manages:
 * - Help panel visibility with GSAP slide animations
 * - Persona selection (marketer/creative)
 * - Exclusive accordion sections (only one open)
 * - Context-aware help snippets
 * - Image lightbox for screenshots
 * 
 * Global API:
 * - window.HelpSystem.showPanel()
 * - window.HelpSystem.hidePanel()
 * - window.HelpSystem.showContextSnippet(key)
 * - window.HelpSystem.setPersona(persona)
 */

(function() {
    'use strict';

    // ============================================
    // DATA MODEL
    // ============================================

    const helpSnippets = {
        templateSelection: {
            title: "Choosing the right template",
            body: "Use Templates for new emails and choose the one that matches your Marketo campaign. If unsure, choose the closest option and add notes for Creative/MOPs in Workfront."
        },
        creativeAskDropdown: {
            title: "What should I ask the creative team to do?",
            body: `
                • <strong>Proofread & brand check:</strong> for light edits and polish.<br>
                • <strong>Tweak the copy:</strong> for moderate changes while preserving core message.<br>
                • <strong>Re-write the copy:</strong> for a fresh approach using your draft as guidance.
            `
        },
        folders: {
            title: "Where should I save this?",
            body: "Marketers save drafts in your personal folder. Creatives save final versions in folders named by Workfront ID, e.g., EM-12345_v1, EM-12345_final."
        }
    };

    const helpSections = [
        {
            id: "overview",
            label: "What this app is for",
            persona: "all",
            html: `
                <p>This app helps marketers and creatives draft, edit, and package email content for Marketo campaigns. It does not send email and does not replace Workfront. Approvals and proofs stay in Workfront.</p>
            `
        },
        {
            id: "marketer-flow",
            label: "Marketer workflow (Steps 1–5)",
            persona: "marketer",
            html: `
                <div class="help-step">
                    <h4 class="help-step-title">Step 1: Choose your template</h4>
                    <p class="help-step-description">Click Templates, then select the one matching your Marketo campaign type.</p>
                    <img src="assets/images/help-imagery/templates.png" alt="Choose your template" class="help-step-image">
                </div>
                
                <div class="help-step">
                    <h4 class="help-step-title">Step 2: Set creative direction</h4>
                    <p class="help-step-description">Use the dropdown to tell the creative team how much latitude they have: proofread only, light edits, or full rewrite.</p>
                    <img src="assets/images/help-imagery/creative-direction.png" alt="Set creative direction" class="help-step-image">
                </div>
                
                <div class="help-step">
                    <h4 class="help-step-title">Step 3: Fill in your content</h4>
                    <p class="help-step-description">Enter subject line, preview text, headline, and body copy. Use the character counters as guidelines.</p>
                    <img src="assets/images/help-imagery/fill-in-your-content.png" alt="Fill in your content" class="help-step-image">
                </div>
                
                <div class="help-step">
                    <h4 class="help-step-title">Step 4: Save to your folder</h4>
                    <p class="help-step-description">Click Save, name your project, and choose your personal folder.</p>
                    <img src="assets/images/help-imagery/save.png" alt="Click Save button" class="help-step-image">
                    <img src="assets/images/help-imagery/save-to.png" alt="Save to your folder" class="help-step-image">
                </div>
                
                <div class="help-step">
                    <h4 class="help-step-title">Step 5: Share with the team</h4>
                    <p class="help-step-description">Click Copy Link and paste it into your Workfront ticket so the creative team can access it.</p>
                    <img src="assets/images/help-imagery/link.png" alt="Share with the team" class="help-step-image">
                </div>
            `
        },
        {
            id: "creative-flow",
            label: "Creative workflow (Steps 6–10)",
            persona: "creative",
            html: `
                <div class="help-step">
                    <h4 class="help-step-title">Step 6: Open the link from Workfront</h4>
                    <p class="help-step-description">The marketer will provide a link in the Workfront ticket. Click it to open the draft.</p>
                    <img src="assets/images/help-imagery/workfront-link.png" alt="Open the link from Workfront" class="help-step-image">
                </div>
                
                <div class="help-step">
                    <h4 class="help-step-title">Step 7: Review creative direction</h4>
                    <p class="help-step-description">Check the "I want the creative team to..." dropdown at the top to understand your scope.</p>
                    <img src="assets/images/help-imagery/creative-direction.png" alt="Review creative direction" class="help-step-image">
                </div>
                
                <div class="help-step">
                    <h4 class="help-step-title">Step 8: Edit content & images</h4>
                    <p class="help-step-description">Update copy, swap images, and refine the design. Watch the live preview as you work.</p>
                    <img src="assets/images/help-imagery/fill-in-your-content.png" alt="Edit content & images" class="help-step-image">
                </div>
                
                <div class="help-step">
                    <h4 class="help-step-title">Step 9: Save versions with Workfront ID</h4>
                    <p class="help-step-description">Use Save As to create version folders like "EM-12345_v1", "EM-12345_v2", etc. Save the new design into the Creative emails folder.</p>
                    <img src="assets/images/help-imagery/save-as.png" alt="Click Save As button" class="help-step-image">
                    <img src="assets/images/help-imagery/save-as-creative.png" alt="Save versions with Workfront ID" class="help-step-image">
                </div>
                
                <div class="help-step">
                    <h4 class="help-step-title">Step 10: Export and deliver</h4>
                    <p class="help-step-description">Click Export to generate a PDF for Workfront review. Once approved, export the final bundle for MOPs.</p>
                    <img src="assets/images/help-imagery/export.png" alt="Click Export button" class="help-step-image">
                    <img src="assets/images/help-imagery/export-package.png" alt="Export package" class="help-step-image">
                </div>
            `
        },
        {
            id: "folders",
            label: "Folder & naming conventions",
            persona: "all",
            html: `
                <p><strong>Marketers:</strong> Use your personal folder for drafts (e.g., "Jen Mercer email briefs").</p>
                <p><strong>Creatives:</strong> Use Workfront-based folder names for production (e.g., EM-12345_v1, EM-12345_final).</p>
            `
        },
        {
            id: "workfront",
            label: "How this fits with Workfront & MOPs",
            persona: "all",
            html: `
                <p>Workfront remains the source of truth for approvals and proofing. This app is for drafting and packaging content. Final sends happen in Marketo, managed by MOPs.</p>
            `
        }
    ];

    // ============================================
    // STATE
    // ============================================

    let currentPersona = "all";
    let elements = {};

    // ============================================
    // INITIALIZATION
    // ============================================

    function initHelpSystem() {
        console.log("📚 Initializing Help System...");

        // Cache DOM elements
        elements = {
            tab: document.getElementById("help-tab"),
            mobileHelpLink: document.getElementById("mobile-help-link"),
            panel: document.getElementById("help-panel"),
            backdrop: document.getElementById("help-panel-backdrop"),
            closeBtn: document.getElementById("close-help-btn"),
            helpTab: document.getElementById("help-tab-btn"),
            feedbackTab: document.getElementById("feedback-tab-btn"),
            helpContent: document.getElementById("help-content"),
            feedbackContent: document.getElementById("feedback-content"),
            personaButtons: document.querySelectorAll(".help-persona-btn"),
            accordionContainer: document.getElementById("help-accordion"),
            contextSnippet: document.getElementById("help-context-snippet")
        };

        // Set initial state for GSAP animations
        if (elements.panel && typeof gsap !== 'undefined') {
            gsap.set(elements.panel, { x: '-100%' });
        }

        // Build accordion content
        buildAccordion();

        // Event listeners
        if (elements.tab) {
            elements.tab.addEventListener("click", showPanel);
        }

        // Mobile help link (in hamburger menu)
        if (elements.mobileHelpLink) {
            elements.mobileHelpLink.addEventListener("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                showPanel();
                // Close mobile menu after opening help
                const navMenu = document.getElementById('nav-menu');
                const hamburger = document.getElementById('hamburger');
                if (navMenu && hamburger) {
                    navMenu.classList.remove('mobile-active');
                    hamburger.classList.remove('active');
                }
            });
        }

        if (elements.closeBtn) {
            elements.closeBtn.addEventListener("click", hidePanel);
        }

        if (elements.backdrop) {
            elements.backdrop.addEventListener("click", hidePanel);
        }

        if (elements.helpTab) {
            elements.helpTab.addEventListener("click", () => showTab("help"));
        }

        if (elements.feedbackTab) {
            elements.feedbackTab.addEventListener("click", () => showTab("feedback"));
        }

        // Persona buttons
        elements.personaButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                setPersona(btn.dataset.persona);
            });
        });

        // EXCLUSIVE ACCORDION WITH GSAP ANIMATIONS: Only one section open at a time
        if (elements.accordionContainer) {
            elements.accordionContainer.addEventListener("click", (e) => {
                const header = e.target.closest(".help-section-header");
                if (!header) return;
                
                const section = header.parentElement;
                const body = section.querySelector(".help-section-content");
                if (!body) return;
                
                const wasOpen = section.classList.contains("open");
                
                // Close all sections with GSAP animation
                const allSections = elements.accordionContainer.querySelectorAll(".help-section");
                allSections.forEach(sec => {
                    const secBody = sec.querySelector(".help-section-content");
                    if (secBody && sec.classList.contains("open")) {
                        sec.classList.remove("open");
                        // Animate close with GSAP
                        if (typeof window.animateAccordionClose === 'function') {
                            window.animateAccordionClose(secBody);
                        } else {
                            // Fallback if animation helper not loaded
                            secBody.style.display = "none";
                        }
                    }
                });
                
                // Open clicked section if it wasn't already open
                if (!wasOpen) {
                    section.classList.add("open");
                    // Animate open with GSAP
                    if (typeof window.animateAccordionOpen === 'function') {
                        window.animateAccordionOpen(body);
                    } else {
                        // Fallback if animation helper not loaded
                        body.style.display = "block";
                    }
                }
            });
        }

        // Image lightbox handler
        document.addEventListener("click", (e) => {
            if (e.target.classList.contains("help-step-image")) {
                showImageLightbox(e.target.src);
            }
        });

        // Expose global API
        window.HelpSystem = {
            showPanel,
            hidePanel,
            showContextSnippet,
            setPersona
        };

        console.log("📚 Help System initialized with GSAP animations");
    }

    // ============================================
    // ACCORDION BUILDER
    // ============================================

    function buildAccordion() {
        if (!elements.accordionContainer) return;

        elements.accordionContainer.innerHTML = "";

        helpSections.forEach(section => {
            const wrapper = document.createElement("div");
            wrapper.className = "help-section";
            wrapper.dataset.persona = section.persona;

            wrapper.innerHTML = `
                <button type="button" class="help-section-header">${section.label}</button>
                <div class="help-section-content">${section.html}</div>
            `;

            elements.accordionContainer.appendChild(wrapper);
        });
    }

    // ============================================
    // PANEL VISIBILITY WITH GSAP ANIMATIONS
    // ============================================

    function showPanel() {
        if (!elements.panel || !elements.backdrop) return;

        // Add class for CSS fallback and state management
        elements.panel.classList.add("open");
        elements.backdrop.classList.add("visible");

        // Animate panel slide-in with GSAP
        if (typeof gsap !== 'undefined') {
            // Kill any existing animations
            gsap.killTweensOf(elements.panel);
            gsap.killTweensOf(elements.backdrop);

            // Slide panel in from left (0.18s)
            gsap.to(elements.panel, {
                x: '0%',
                duration: 0.18,
                ease: 'power3.out'
            });

            // Fade backdrop in
            gsap.to(elements.backdrop, {
                opacity: 1,
                duration: 0.18,
                ease: 'power2.out'
            });
        } else {
            // Fallback: CSS transition handles it
            console.warn('GSAP not available, using CSS fallback');
        }

        // Default to Help tab
        showTab("help");

        console.log("📚 Help panel opened with GSAP slide animation");
    }

    function hidePanel() {
        if (!elements.panel || !elements.backdrop) return;

        // Animate panel slide-out with GSAP
        if (typeof gsap !== 'undefined') {
            // Kill any existing animations
            gsap.killTweensOf(elements.panel);
            gsap.killTweensOf(elements.backdrop);

            // Slide panel out to left (0.2s)
            gsap.to(elements.panel, {
                x: '-100%',
                duration: 0.12,
                ease: 'power3.in',
                onComplete: () => {
                    // Remove classes after animation completes
                    elements.panel.classList.remove("open");
                }
            });

            // Fade backdrop out
            gsap.to(elements.backdrop, {
                opacity: 0,
                duration: 0.12,
                ease: 'power2.in',
                onComplete: () => {
                    elements.backdrop.classList.remove("visible");
                }
            });
        } else {
            // Fallback: CSS transition handles it
            elements.panel.classList.remove("open");
            elements.backdrop.classList.remove("visible");
            console.warn('GSAP not available, using CSS fallback');
        }

        // Clear context snippet
        hideContextSnippet();

        console.log("📚 Help panel closed with GSAP slide animation");
    }

    // ============================================
    // TAB SWITCHING
    // ============================================

    function showTab(tabName) {
        if (tabName === "help") {
            // Show help content
            if (elements.helpContent) {
                elements.helpContent.classList.remove("hidden");
            }
            if (elements.feedbackContent) {
                elements.feedbackContent.classList.remove("visible");
            }

            // Update tab buttons
            if (elements.helpTab) {
                elements.helpTab.classList.add("active");
            }
            if (elements.feedbackTab) {
                elements.feedbackTab.classList.remove("active");
            }
        } else if (tabName === "feedback") {
            // Show feedback content
            if (elements.helpContent) {
                elements.helpContent.classList.add("hidden");
            }
            if (elements.feedbackContent) {
                elements.feedbackContent.classList.add("visible");
            }

            // Update tab buttons
            if (elements.helpTab) {
                elements.helpTab.classList.remove("active");
            }
            if (elements.feedbackTab) {
                elements.feedbackTab.classList.add("active");
            }
        }

        console.log(`📚 Switched to ${tabName} tab`);
    }

    // ============================================
    // PERSONA SELECTION
    // ============================================

    function setPersona(persona) {
        currentPersona = persona;

        // Update persona button states
        elements.personaButtons.forEach(btn => {
            btn.classList.toggle("active", btn.dataset.persona === persona);
        });

        // Filter accordion sections
        const sections = elements.accordionContainer.querySelectorAll(".help-section");
        sections.forEach(sec => {
            const p = sec.dataset.persona;
            const show = (p === "all" || p === persona);
            sec.style.display = show ? "block" : "none";
        });

        console.log(`📚 Persona set to: ${persona}`);
    }

    // ============================================
    // CONTEXT SNIPPETS
    // ============================================

    function showContextSnippet(key) {
        const snippet = helpSnippets[key];
        if (!snippet || !elements.contextSnippet) {
            hideContextSnippet();
            return;
        }

        elements.contextSnippet.classList.add("visible");
        elements.contextSnippet.innerHTML = `
            <h3>${snippet.title}</h3>
            <p>${snippet.body}</p>
        `;

        console.log(`📚 Context snippet shown: ${key}`);
    }

    function hideContextSnippet() {
        if (!elements.contextSnippet) return;

        elements.contextSnippet.classList.remove("visible");
        elements.contextSnippet.innerHTML = "";
    }

    // ============================================
    // IMAGE LIGHTBOX
    // ============================================

    function showImageLightbox(imageSrc) {
        let lightbox = document.getElementById("help-image-lightbox");
        
        if (!lightbox) {
            // Create lightbox if it doesn't exist
            lightbox = document.createElement("div");
            lightbox.id = "help-image-lightbox";
            lightbox.innerHTML = `
                <button id="help-image-lightbox-close" type="button" aria-label="Close">×</button>
                <img src="" alt="Help Screenshot">
            `;
            document.body.appendChild(lightbox);
            
            // Close handlers
            lightbox.addEventListener("click", (e) => {
                if (e.target === lightbox) hideImageLightbox();
            });
            
            const closeBtn = document.getElementById("help-image-lightbox-close");
            if (closeBtn) {
                closeBtn.addEventListener("click", hideImageLightbox);
            }
        }
        
        const img = lightbox.querySelector("img");
        if (img) {
            img.src = imageSrc;
        }
        
        lightbox.classList.add("visible");
    }

    function hideImageLightbox() {
        const lightbox = document.getElementById("help-image-lightbox");
        if (lightbox) {
            lightbox.classList.remove("visible");
        }
    }

    // ============================================
    // DOCUMENT READY
    // ============================================

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initHelpSystem);
    } else {
        initHelpSystem();
    }

})();
