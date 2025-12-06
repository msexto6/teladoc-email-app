// ============================================
// DROPDOWN ANIMATION WITH GSAP - FIXED VERSION
// Stable dropdown that stays open when hovering between trigger and menu
// ============================================

(function() {
    'use strict';
    
    const dropdown = document.querySelector('.templates-dropdown');
    const navItem = document.querySelector('.nav-item-with-dropdown');
    
    if (!dropdown || !navItem) {
        console.warn('⚠️ Dropdown elements not found');
        return;
    }
    
    let currentTween;
    let isOpen = false;
    
    // Set initial state
    gsap.set(dropdown, {
        opacity: 0,
        y: -15,
        visibility: 'hidden'
    });
    
    // Open animation
    function openDropdown() {
        if (isOpen) return;
        isOpen = true;
        
        // Kill any running animations
        if (currentTween) {
            currentTween.kill();
        }
        
        // Make visible immediately for pointer events
        gsap.set(dropdown, { visibility: 'visible' });
        
        currentTween = gsap.to(dropdown, {
            duration: 0.4,
            opacity: 1,
            y: 0,
            ease: 'back.out(1.2)'
        });
        
        console.log('✅ Dropdown opened');
    }
    
    // Close animation
    function closeDropdown() {
        if (!isOpen) return;
        isOpen = false;
        
        // Kill any running animations
        if (currentTween) {
            currentTween.kill();
        }
        
        currentTween = gsap.to(dropdown, {
            duration: 0.3,
            opacity: 0,
            y: -15,
            ease: 'power2.in',
            onComplete: () => {
                gsap.set(dropdown, { visibility: 'hidden' });
            }
        });
        
        console.log('✅ Dropdown closed');
    }
    
    // CRITICAL FIX: Attach listeners to PARENT element (navItem) only
    // This prevents flickering when moving from trigger text to dropdown
    navItem.addEventListener('mouseenter', () => {
        openDropdown();
    });
    
    navItem.addEventListener('mouseleave', (event) => {
        // Only close if mouse actually left the entire nav item (including dropdown)
        const related = event.relatedTarget;
        if (!related || !navItem.contains(related)) {
            closeDropdown();
        }
    });
    
    // Optional: Click-outside-to-close behavior
    document.addEventListener('click', (event) => {
        if (isOpen && !navItem.contains(event.target)) {
            closeDropdown();
        }
    });
    
    console.log('✅ Dropdown animation initialized (fixed version)');
    
})();
