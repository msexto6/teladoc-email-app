/* ============================================
   GSAP BUTTON EFFECTS
   Subtle Scale + Circular Wipe animations
   ============================================ */

(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initButtonEffects);
    } else {
        initButtonEffects();
    }

    function initButtonEffects() {
        initMagneticButtons();
        initCircularWipeEffect();
        initClickBlur();
        console.log('✨ Button effects initialized');
    }

    // ================= CLICK BLUR (PREVENT STUCK HOVER STATE) =================
    function initClickBlur() {
        const wipeButtons = document.querySelectorAll('.wipe-btn');
        
        wipeButtons.forEach(btn => {
            const overlay = btn.querySelector('.circular-wipe-overlay');
            
            btn.addEventListener('click', function() {
                // Blur the button to remove focus state
                this.blur();
                
                // Force reset GSAP animations
                gsap.killTweensOf(this);
                gsap.killTweensOf(overlay);
                
                // Reset scale based on button type
                if (this.classList.contains('landing-btn')) {
                    gsap.set(this, { scale: 0.9 }); // Landing buttons default to 0.9
                } else {
                    gsap.set(this, { scale: 1 }); // All other buttons default to 1
                }
                
                // Reset overlay
                if (overlay) {
                    gsap.set(overlay, { clipPath: 'circle(0% at 50% 50%)' });
                }
            });
        });

        console.log(`👆 Click blur applied to ${wipeButtons.length} buttons`);
    }

    // ================= SUBTLE SCALE EFFECT (NO MAGNETIC PULL) =================
    function initMagneticButtons() {
        const magneticElements = document.querySelectorAll('.magnetic-btn');
        
        magneticElements.forEach((btn) => {
            // Disable CSS transitions that conflict with GSAP
            btn.style.transition = 'none';
            btn.style.willChange = 'transform';

            // Set initial scale based on button type - CRITICAL for proper sizing on load
            if (btn.classList.contains('landing-btn')) {
                gsap.set(btn, { scale: 0.9 }); // Landing buttons start at 0.9
            } else {
                gsap.set(btn, { scale: 1 }); // All other buttons start at 1
            }

            btn.addEventListener('mouseenter', () => {
                // Get current scale and add subtle increase
                const currentScale = btn.classList.contains('landing-btn') ? 0.9 : 1;
                const hoverScale = currentScale * 1.03;
                
                gsap.to(btn, {
                    scale: hoverScale,
                    duration: 0.3,
                    ease: 'power2.out',
                    force3D: false
                });
            });

            btn.addEventListener('mouseleave', () => {
                // Return to base scale
                const baseScale = btn.classList.contains('landing-btn') ? 0.9 : 1;
                
                gsap.to(btn, {
                    scale: baseScale,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.3)',
                    force3D: false
                });
            });
        });

        console.log(`🧲 Scale effects applied to ${magneticElements.length} buttons`);
    }

    // ================= CIRCULAR WIPE EFFECT =================
    function initCircularWipeEffect() {
        const wipeButtons = document.querySelectorAll('.wipe-btn');
        
        wipeButtons.forEach(btn => {
            const overlay = btn.querySelector('.circular-wipe-overlay');
            if (!overlay) return;

            // Set initial state
            gsap.set(overlay, {
                clipPath: 'circle(0% at 50% 50%)'
            });

            btn.addEventListener('mouseenter', (e) => {
                // Kill any existing animations immediately
                gsap.killTweensOf(overlay);

                // Calculate mouse position relative to button
                const rect = btn.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;

                // Start wipe from mouse position
                gsap.fromTo(overlay, {
                    clipPath: `circle(0% at ${x}% ${y}%)`
                }, {
                    clipPath: `circle(150% at ${x}% ${y}%)`,
                    duration: 0.5,
                    ease: 'power2.inOut',
                    immediateRender: true,
                    overwrite: 'auto'
                });
            });

            btn.addEventListener('mouseleave', (e) => {
                // Kill animations and start exit immediately
                gsap.killTweensOf(overlay);

                // Calculate mouse position for exit animation
                const rect = btn.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;

                gsap.to(overlay, {
                    clipPath: `circle(0% at ${x}% ${y}%)`,
                    duration: 0.35,
                    ease: 'power2.inOut',
                    immediateRender: true,
                    overwrite: 'auto'
                });
            });
        });

        console.log(`🎯 Circular wipe effect applied to ${wipeButtons.length} buttons`);
    }

})();
