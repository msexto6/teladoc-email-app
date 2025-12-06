/**
 * UI ANIMATIONS - GSAP Enhancement Layer
 * Provides smooth, consistent animations for accordions, notifications, and modals
 * Non-breaking: Falls back gracefully if GSAP fails to load
 */

// ============================================
// ACCORDION ANIMATIONS
// ============================================

/**
 * Animate accordion section opening with GSAP
 * Falls back to instant display if GSAP unavailable
 * TUNED: Slower, dramatic (0.6s) with power3
 * FIX: Accounts for padding in height calculation
 */
function animateAccordionOpen(bodyEl) {
    if (!bodyEl) return;

    // Fallback if GSAP isn't available
    if (typeof gsap === "undefined") {
        bodyEl.style.display = "block";
        bodyEl.style.opacity = "1";
        bodyEl.style.height = "auto";
        bodyEl.style.overflow = "visible";
        return;
    }

    gsap.killTweensOf(bodyEl);

    // Prepare element
    bodyEl.style.display = "block";
    bodyEl.style.overflow = "hidden";

    // Get natural height including content + padding (12px top + 16px bottom = 28px)
    const contentHeight = bodyEl.scrollHeight;
    const targetHeight = contentHeight + 28;

    gsap.fromTo(
        bodyEl,
        { height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0 },
        {
            height: targetHeight,
            opacity: 1,
            paddingTop: 12,
            paddingBottom: 16,
            duration: 0.6,
            ease: "power3.inOut",
            onComplete: () => {
                // Only change overflow, prevent snap
                bodyEl.style.overflow = "visible";
            }
        }
    );
}

/**
 * Animate accordion section closing with GSAP
 * Falls back to instant hide if GSAP unavailable
 * TUNED: Slower, dramatic (0.6s) with power3
 * FIX: Animates padding to prevent snap
 */
function animateAccordionClose(bodyEl) {
    if (!bodyEl) return;

    if (typeof gsap === "undefined") {
        bodyEl.style.display = "none";
        bodyEl.style.opacity = "0";
        bodyEl.style.height = "0";
        return;
    }

    gsap.killTweensOf(bodyEl);

    const currentHeight = bodyEl.offsetHeight || bodyEl.scrollHeight;
    bodyEl.style.overflow = "hidden";

    gsap.fromTo(
        bodyEl,
        { height: currentHeight, opacity: 1, paddingTop: 12, paddingBottom: 16 },
        {
            height: 0,
            opacity: 0,
            paddingTop: 0,
            paddingBottom: 0,
            duration: 0.6,
            ease: "power3.inOut",
            onComplete: () => {
                bodyEl.style.display = "none";
            }
        }
    );
}

// ============================================
// NOTIFICATION/TOAST ANIMATIONS
// ============================================

/**
 * Animate notification/toast entry with GSAP
 * Slides and fades in from right
 */
function animateNotificationIn(el) {
    if (!el) return;
    if (typeof gsap === "undefined") {
        el.style.opacity = "1";
        el.style.transform = "none";
        return;
    }

    gsap.killTweensOf(el);

    gsap.fromTo(
        el,
        { autoAlpha: 0, x: 400 },
        {
            autoAlpha: 1,
            x: 0,
            duration: 0.25,
            ease: "power2.out"
        }
    );
}

/**
 * Animate notification/toast exit with GSAP
 * Slides and fades out to right
 */
function animateNotificationOut(el, onComplete) {
    if (!el) return;
    if (typeof gsap === "undefined") {
        el.style.display = "none";
        if (typeof onComplete === "function") onComplete();
        return;
    }

    gsap.killTweensOf(el);

    gsap.to(el, {
        autoAlpha: 0,
        x: 400,
        duration: 0.18,
        ease: "power2.in",
        onComplete: () => {
            if (typeof onComplete === "function") onComplete();
        }
    });
}

// ============================================
// MODAL ANIMATIONS - SYMMETRIC OPEN/CLOSE
// ============================================

/**
 * Animate modal opening with GSAP
 * Fades in overlay and scales/slides in dialog
 * TUNED: Dramatic scale (0.7) with power3, 0.4s duration
 */
function animateModalOpen(backdropEl) {
    if (!backdropEl) return;

    const dialog = backdropEl.querySelector(".modal-dialog");

    // Add active class first so CSS display: flex kicks in
    backdropEl.classList.add("active");

    // Fallback when GSAP is not available
    if (typeof gsap === "undefined") {
        backdropEl.style.display = "flex";
        backdropEl.style.opacity = "1";
        if (dialog) {
            dialog.style.opacity = "1";
            dialog.style.transform = "none";
        }
        return;
    }

    gsap.killTweensOf(backdropEl);
    if (dialog) gsap.killTweensOf(dialog);

    // Make sure it's visible for animation
    backdropEl.style.display = "flex";

    gsap.fromTo(
        backdropEl,
        { autoAlpha: 0 },
        {
            autoAlpha: 1,
            duration: 0.4,
            ease: "power3.out"
        }
    );

    if (dialog) {
        gsap.fromTo(
            dialog,
            { y: 0, scale: 0.7, autoAlpha: 0 },
            {
                y: 0,
                scale: 1,
                autoAlpha: 1,
                duration: 0.4,
                ease: "power3.out"
            }
        );
    }
}

/**
 * Animate modal closing with GSAP
 * Reverses the opening animation
 * TUNED: Fast close (0.2s) for snappy dismissal
 */
function animateModalClose(backdropEl, onComplete) {
    if (!backdropEl) return;

    const dialog = backdropEl.querySelector(".modal-dialog");

    // Fallback when GSAP not available
    if (typeof gsap === "undefined") {
        backdropEl.style.display = "none";
        backdropEl.classList.remove("active");
        if (typeof onComplete === "function") onComplete();
        return;
    }

    gsap.killTweensOf(backdropEl);
    if (dialog) gsap.killTweensOf(dialog);

    const tl = gsap.timeline({
        onComplete: () => {
            backdropEl.style.display = "none";
            backdropEl.classList.remove("active");
            if (typeof onComplete === "function") onComplete();
        }
    });

    if (dialog) {
        tl.to(dialog, {
            y: 0,
            scale: 0.7,
            autoAlpha: 0,
            duration: 0.2,
            ease: "power3.in"
        }, 0);
    }

    tl.to(
        backdropEl,
        {
            autoAlpha: 0,
            duration: 0.2,
            ease: "power3.in"
        },
        0
    );
}

// Make functions available globally
window.animateAccordionOpen = animateAccordionOpen;
window.animateAccordionClose = animateAccordionClose;
window.animateNotificationIn = animateNotificationIn;
window.animateNotificationOut = animateNotificationOut;
window.animateModalOpen = animateModalOpen;
window.animateModalClose = animateModalClose;

console.log("✨ GSAP UI Animations loaded (v5 - Fixed height calculation)");
