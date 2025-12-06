/**
 * Education Drip - HP Preview Renderer
 * SPRINT N2: Updated to convert plain text paragraph breaks (\n\n) to HTML
 */

function renderEducationDripHpPreview(formData, uploadedImages = {}) {
    const heroImage = uploadedImages['hero-image'];
    const headline = formData['headline'] || 'Why sleep became a game-changer for cardiometabolic health';
    const bodyCopy = formData['body-copy'] || 'Body copy goes here...';
    
    // SPRINT N2: Convert plain text with \n\n paragraph breaks to HTML
    const bodyHtml = window.convertPlainTextToHtmlParagraphs 
        ? window.convertPlainTextToHtmlParagraphs(bodyCopy)
        : `<p>${bodyCopy}</p>`;
    
    // Build hero image with placeholder if no image uploaded
    const heroHTML = heroImage 
        ? `<div class="preview-hero-container">
               <img src="${heroImage}" alt="Hero image" class="preview-hero-image">
           </div>`
        : `<div class="preview-placeholder">Hero Image</div>`;
    
    // Build bullets - use defaults if not provided
    const bullet1 = formData['bullet-1'] || 'Why Teladoc Health is integrating sleep into its care model';
    const bullet2 = formData['bullet-2'] || 'How a focus on quality sleep can translate into better blood sugar management and overall feeling better';
    const bullet3 = formData['bullet-3'] || 'How improving sleep has a compounding impact on other healthy behaviors, such as eating better';
    
    const bullets = [bullet1, bullet2, bullet3].filter(b => b);
    
    const bulletsHTML = bullets.length > 0 
        ? `<ul class="preview-bullets">${bullets.map(b => `<li>${b}</li>`).join('')}</ul>`
        : '';
    
    const cta = formData['cta'] || 'Read the article';
    const ctaUrl = formData['cta-url'] || '#';
    
    // Build featured content section - use defaults if not provided
    const featuredTitle = formData['featured-title'] || 'Featured content';
    
    const feature1Image = uploadedImages['feature-1-image'];
    const feature1Title = formData['feature-1-title'] || 'Support for diabetes';
    const feature1TitleUrl = formData['feature-1-title-url'] || '#';
    const feature1Body = formData['feature-1-body'] || 'Discover how Teladoc Health supports people with diabetes through clinical care and sustained support';
    
    const feature2Image = uploadedImages['feature-2-image'];
    const feature2Title = formData['feature-2-title'] || 'Better obesity care, start to finish';
    const feature2TitleUrl = formData['feature-2-title-url'] || '#';
    const feature2Body = formData['feature-2-body'] || 'Our ANCP session recap highlights the powerful advantages Medicaid & Duals populations gain with coordinated care';
    
    // Create image HTML with placeholder if no image
    const feature1ImageHTML = feature1Image 
        ? `<img src="${feature1Image}" alt="${feature1Title}" class="preview-feature-image">`
        : `<div class="preview-placeholder" style="height: 180px; margin-bottom: 16px;">Feature Image 1</div>`;
    
    const feature2ImageHTML = feature2Image 
        ? `<img src="${feature2Image}" alt="${feature2Title}" class="preview-feature-image">`
        : `<div class="preview-placeholder" style="height: 180px; margin-bottom: 16px;">Feature Image 2</div>`;
    
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
    
    // Build highlighted text section - use default if not provided
    const highlightText = formData['highlight-text'] || 'Looking to boost engagement or drive greater value from your Teladoc Health experience together? Let\'s connect.';
    
    // SPRINT N2: Convert highlight text to HTML paragraphs
    const highlightHtml = window.convertPlainTextToHtmlParagraphs
        ? window.convertPlainTextToHtmlParagraphs(highlightText)
        : `<p>${highlightText}</p>`;
    
    const highlightSection = `
        <div class="preview-highlight-section">
            <div class="preview-body" style="margin-bottom: 0;">${highlightHtml}</div>
        </div>
    `;
    
    return `
        ${heroHTML}
        <div class="preview-content-body">
            <h2 class="preview-headline">${headline}</h2>
            
            <div class="preview-body">${bodyHtml}</div>
            
            ${bulletsHTML}
            
            <div class="preview-cta-container">
                <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" class="preview-cta">${cta}</a>
            </div>
            
            ${featuredSection}
            
            ${highlightSection}
        </div>
    `;
}
