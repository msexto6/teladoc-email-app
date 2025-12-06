// ============================================
// DROPDOWN ANIMATION WITH GSAP
// Smooth animated reveal for Templates dropdown
// ============================================

(function() {
    'use strict';
    
    const dropdown = document.querySelector('.templates-dropdown');
    const navItem = document.querySelector('.nav-item-with-dropdown');
    
    let currentTween;
    let isOpen = false;
    
    // Set initial state - IMPORTANT: pointerEvents is always 'auto'
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
    }
    
    // Nav item event listeners
    navItem.addEventListener('mouseenter', openDropdown);
    navItem.addEventListener('mouseleave', closeDropdown);
    
    // Dropdown event listeners
    dropdown.addEventListener('mouseenter', openDropdown);
    dropdown.addEventListener('mouseleave', closeDropdown);
    
})();
