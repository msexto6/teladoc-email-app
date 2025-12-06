/**
 * GSAP MODAL ANIMATIONS
 * Smooth fade + scale animations for all modals and accordions
 */

/**
 * Animate a modal opening
 * @param {HTMLElement} modal - The modal element to animate
 */
window.animateModalOpen = function(modal) {
    if (!modal || typeof gsap === 'undefined') {
        console.warn('GSAP not available or modal element missing');
        return;
    }
    
    // Set initial state
    gsap.set(modal, {
        opacity: 0,
        scale: 0.7
    });
    
    // Animate in
    gsap.to(modal, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'power3.out'
    });
};

/**
 * Animate a modal closing
 * @param {HTMLElement} modal - The modal element to animate
 * @param {Function} onComplete - Callback to execute after animation
 */
window.animateModalClose = function(modal, onComplete) {
    if (!modal || typeof gsap === 'undefined') {
        console.warn('GSAP not available or modal element missing');
        if (typeof onComplete === 'function') {
            onComplete();
        }
        return;
    }
    
    // Animate out
    gsap.to(modal, {
        opacity: 0,
        scale: 0.7,
        duration: 0.4,
        ease: 'power3.in',
        onComplete: function() {
            if (typeof onComplete === 'function') {
                onComplete();
            }
        }
    });
};

/**
 * Animate an accordion opening
 * @param {HTMLElement} content - The accordion content element
 */
window.animateAccordionOpen = function(content) {
    if (!content || typeof gsap === 'undefined') {
        console.warn('GSAP not available or content element missing');
        return;
    }
    
    // Get the natural height
    const height = content.scrollHeight;
    
    // Animate to natural height
    gsap.to(content, {
        height: height,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.inOut'
    });
};

/**
 * Animate an accordion closing
 * @param {HTMLElement} content - The accordion content element
 */
window.animateAccordionClose = function(content) {
    if (!content || typeof gsap === 'undefined') {
        console.warn('GSAP not available or content element missing');
        return;
    }
    
    // Animate to zero height
    gsap.to(content, {
        height: 0,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.inOut'
    });
};

/**
 * DEC 2025: Animate a form field appearing (for toggle show)
 * @param {HTMLElement} field - The form field element to show
 */
window.animateFieldShow = function(field) {
    if (!field || typeof gsap === 'undefined') {
        console.warn('GSAP not available or field element missing');
        field.style.display = '';
        return;
    }
    
    // Make visible first
    field.style.display = '';
    
    // Get the natural height
    const height = field.scrollHeight;
    
    // Set initial state
    gsap.set(field, {
        height: 0,
        opacity: 0,
        overflow: 'hidden'
    });
    
    // Animate to natural height
    gsap.to(field, {
        height: height,
        opacity: 1,
        duration: 0.4,
        ease: 'power3.out',
        onComplete: function() {
            // Reset height to auto after animation
            gsap.set(field, { height: 'auto', overflow: 'visible' });
        }
    });
};

/**
 * DEC 2025: Animate a form field disappearing (for toggle hide)
 * @param {HTMLElement} field - The form field element to hide
 */
window.animateFieldHide = function(field) {
    if (!field || typeof gsap === 'undefined') {
        console.warn('GSAP not available or field element missing');
        field.style.display = 'none';
        return;
    }
    
    // Animate to zero height
    gsap.to(field, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'power3.in',
        onComplete: function() {
            field.style.display = 'none';
            // Reset for next show
            gsap.set(field, { height: 'auto', opacity: 1 });
        }
    });
};

/**
 * DEC 2025: Animate preview element appearing
 * @param {HTMLElement} element - The preview element to show
 */
window.animatePreviewShow = function(element) {
    if (!element || typeof gsap === 'undefined') {
        console.warn('GSAP not available or element missing');
        return;
    }
    
    // Animate in with fade and slight scale
    gsap.fromTo(element, 
        {
            opacity: 0,
            scale: 0.95,
            y: -10
        },
        {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: 'power3.out'
        }
    );
};

/**
 * DEC 2025: Animate preview element disappearing
 * @param {HTMLElement} element - The preview element to hide
 */
window.animatePreviewHide = function(element) {
    if (!element || typeof gsap === 'undefined') {
        console.warn('GSAP not available or element missing');
        return;
    }
    
    // Animate out with fade and slight scale
    gsap.to(element, {
        opacity: 0,
        scale: 0.95,
        y: -10,
        duration: 0.4,
        ease: 'power3.in'
    });
};

console.log('✅ GSAP animation functions loaded');
