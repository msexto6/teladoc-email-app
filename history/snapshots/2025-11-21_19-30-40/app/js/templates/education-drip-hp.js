/**
 * Education Drip - HP Preview Renderer
 */

function renderEducationDripHpPreview(formData, uploadedImages = {}) {
    const heroImage = uploadedImages['hero-image'];
    const headline = formData['headline'] || 'Why sleep became a game-changer for cardiometabolic health';
    const bodyCopy = parseLinks(formData['body-copy'] || 'Emerging research in cardiometabolic health points us to a deeper understanding of its crucial role in cardiovascular and metabolic health, impacting glucose, emotional resilience, cognitive function and overall well-being—and health plans are paying attention.<br><br>In this article, Dr. Carlin Wu, Clinical Strategy Director of Cardiometabolic Health, explores elements of the new guidance that redefine it in a powerful new way.');
    
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
    const feature1Title = formData['feature-1-title'] || 'Support for diabetes remission';
    const feature1TitleUrl = formData['feature-1-title-url'] || '#';
    const feature1Body = formData['feature-1-body'] || 'Discover how Teladoc Health empowers diabetes remission through clinical care and sustained support.';
    
    const feature2Image = uploadedImages['feature-2-image'];
    const feature2Title = formData['feature-2-title'] || 'Better obesity care, lower costs';
    const feature2TitleUrl = formData['feature-2-title-url'] || '#';
    const feature2Body = formData['feature-2-body'] || 'AHIP session recap: Cost-effective obesity care for Medicare Advantage, Medicaid & Duals populations.';
    
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
    const highlightText = parseLinks(formData['highlight-text'] || 'Looking to boost engagement or drive greater value? <a href="#">Let\'s connect</a> to create a healthier, more connected member experience together.');
    const highlightSection = `
        <div class="preview-highlight-section">
            <div class="preview-body" style="margin-bottom: 0;">${highlightText}</div>
        </div>
    `;
    
    return `
        ${heroHTML}
        <div class="preview-content-body">
            <h2 class="preview-headline">${headline}</h2>
            
            <div class="preview-body">${bodyCopy}</div>
            
            ${bulletsHTML}
            
            <div class="preview-cta-container">
                <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" class="preview-cta">${cta}</a>
            </div>
            
            ${featuredSection}
            
            ${highlightSection}
        </div>
    `;
}
