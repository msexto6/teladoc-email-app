/**
 * Standard Template Preview Renderer
 * Mirrors Education Drip – HP layout but WITHOUT bullet list
 * DEC 2025: Added hero banner toggle support
 * DEC 2025: Added show-photos toggle for featured content images
 */
function renderStandardTemplatePreview(formData, uploadedImages = {}) {
    // DEC 2025: Check if hero should be shown
    const showHero = (formData['show-hero'] === "true" || formData['show-hero'] === true);
    
    // DEC 2025: Check if photos should be shown in featured content
    const showPhotos = (formData['show-photos'] === "true" || formData['show-photos'] === true);
    
    const heroImage = uploadedImages['hero-image'];
    const headline = formData['headline'] || 'Lorem ipsum dolor sit amet consectetur';
    const bodyCopy = parseLinks(
        formData['body-copy'] || 
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    );

    // Hero image (with placeholder) - only render if toggle is on
    const heroHTML = showHero ? (heroImage 
        ? `<div class="preview-hero-container">
               <img src="${heroImage}" alt="Hero image" class="preview-hero-image">
           </div>`
        : `<div class="preview-placeholder">Hero Image</div>`) 
        : ''; // No hero section if toggle is off

    // CTA
    const cta = formData['cta'] || 'Lorem ipsum';
    const ctaUrl = formData['cta-url'] || '#';

    // Featured content section
    const featuredTitle = formData['featured-title'] || 'Featured content';

    const feature1Image = uploadedImages['feature-1-image'];
    const feature1Title = formData['feature-1-title'] || 'Lorem ipsum dolor sit amet';
    const feature1TitleUrl = formData['feature-1-title-url'] || '#';
    const feature1Body = formData['feature-1-body'] || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

    const feature2Image = uploadedImages['feature-2-image'];
    const feature2Title = formData['feature-2-title'] || 'Lorem ipsum dolor sit amet';
    const feature2TitleUrl = formData['feature-2-title-url'] || '#';
    const feature2Body = formData['feature-2-body'] || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

    // Only show images if toggle is on
    const feature1ImageHTML = showPhotos ? (feature1Image 
        ? `<img src="${feature1Image}" alt="${feature1Title}" class="preview-feature-image">`
        : `<div class="preview-placeholder" style="height: 180px; margin-bottom: 16px;">Feature Image 1</div>`)
        : ''; // No image if toggle is off

    const feature2ImageHTML = showPhotos ? (feature2Image 
        ? `<img src="${feature2Image}" alt="${feature2Title}" class="preview-feature-image">`
        : `<div class="preview-placeholder" style="height: 180px; margin-bottom: 16px;">Feature Image 2</div>`)
        : ''; // No image if toggle is off

    const feature1Card = `
        <div class="preview-feature-card">
            ${feature1ImageHTML}
            <h4 class="preview-feature-title">
                <a href="${feature1TitleUrl}" style="color: #00B5E2; text-decoration: underline;">${feature1Title}</a>
            </h4>
            <div class="preview-body" style="margin-bottom: 0;">${feature1Body}</div>
        </div>
    `;

    const feature2Card = `
        <div class="preview-feature-card">
            ${feature2ImageHTML}
            <h4 class="preview-feature-title">
                <a href="${feature2TitleUrl}" style="color: #00B5E2; text-decoration: underline;">${feature2Title}</a>
            </h4>
            <div class="preview-body" style="margin-bottom: 0;">${feature2Body}</div>
        </div>
    `;

    const featuredSection = `
        <div class="preview-speakers-section">
            <h3 class="preview-speakers-title">${featuredTitle}</h3>
            <div class="preview-features-grid">
                ${feature1Card}
                ${feature2Card}
            </div>
        </div>
    `;

    // Highlighted statement
    const highlightText = parseLinks(
        formData['highlight-text'] || 
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    );
    const highlightSection = `
        <div class="preview-highlight-section">
            <div class="preview-body" style="margin-bottom: 0;">${highlightText}</div>
        </div>
    `;

    // NOTE: No bulletsHTML here – bullets are intentionally removed

    return `
        ${heroHTML}
        <div class="preview-content-body">
            <h2 class="preview-headline">${headline}</h2>
            <div class="preview-body">${bodyCopy}</div>

            <div class="preview-cta-container">
                <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" class="preview-cta">${cta}</a>
            </div>

            ${featuredSection}
            ${highlightSection}
        </div>
    `;
}
