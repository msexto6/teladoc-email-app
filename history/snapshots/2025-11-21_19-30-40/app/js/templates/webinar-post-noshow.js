/**
 * Webinar Post-Event (No-Show) Preview Renderer
 */

function renderWebinarPostNoshowPreview(formData, uploadedImages = {}) {
    const heroImage = uploadedImages['hero-image'] 
        ? `<img src="${uploadedImages['hero-image']}" alt="Hero" class="preview-hero-image">`
        : '<div class="preview-placeholder">Hero Image</div>';
    
    const headline = formData['headline'] || 'Virtual Mental Health: The Next Chapter';
    
    // Body copy with proper default text including the link
    const defaultBodyCopy = `We missed you at the September Client Connections webinar—but the good news is you can still catch everything we covered.<br><br>The full recording is <a href="#" style="color:#6240E8;text-decoration:underline;">now available on demand</a>. I was joined by Teladoc Health leaders Dr. Russell DuBois and Matt Sopcich for a timely discussion on how we're continuing to innovate and support client success in 2025.<br><br>We explored:`;
    
    const bodyCopy = formData['body-copy'] || defaultBodyCopy;
    
    // Build bullets if any exist
    const bullets = [];
    if (formData['bullet-1']) bullets.push(formData['bullet-1']);
    if (formData['bullet-2']) bullets.push(formData['bullet-2']);
    if (formData['bullet-3']) bullets.push(formData['bullet-3']);
    
    // Default bullets
    if (bullets.length === 0) {
        bullets.push('What H.R. 1 means for the future of virtual care and three takeaways for plan sponsors');
        bullets.push('The future of virtual mental healthcare: how clinical outcomes are driving benefits strategy');
        bullets.push('<a href="#" style="color:#6240E8;text-decoration:underline;">Teladoc Health Wellbound</a>, our new EAP offering: designed to provide access and care continuity');
    }
    
    const bulletsHTML = `<ul class="preview-bullets">${bullets.map(b => `<li>${b}</li>`).join('')}</ul>`;
    
    // Signature section
    const signatureName = formData['signature-name'] || 'Kristen Moody';
    const signatureTitle = formData['signature-title'] || 'Chief Client Officer';
    const signatureCompany = formData['signature-company'] || 'Teladoc Health';
    
    const signatureHTML = `
        <div class="preview-body" style="margin-top: 20px;">
            Thank you for your continued partnership.<br><br>
            Sincerely,<br>
            <strong>${signatureName}</strong><br>
            ${signatureTitle}<br>
            ${signatureCompany}
        </div>
    `;
    
    const cta = formData['cta'] || 'Watch now';
    const ctaUrl = formData['cta-url'] || '#';
    
    const highlightedTitle = formData['highlighted-title'] || 'Want more insights like this?';
    
    // Default highlighted copy with proper formatting
    const defaultHighlightedCopy = `Be sure to join us for our next <em>Client Connections</em> webinar on <a href="#" style="color:#6240E8;text-decoration:underline;">Tuesday, November 5 at 11:30 AM ET</a>. You'll hear directly from clinical and strategy leaders as they unveil new advancements and share how Teladoc Health is orchestrating more connected, personalized support across our solutions.`;
    
    const highlightedCopy = formData['highlighted-copy'] || defaultHighlightedCopy;
    const cta2 = formData['cta-2'] || 'Register now';
    const cta2Url = formData['cta-2-url'] || '#';
    
    // Build highlighted section with light purple background and rounded corners
    const highlightSection = `
        <div style="background: #F5F3FB; padding: 30px; border-radius: 12px; margin-top: 40px;">
            <h3 class="preview-speakers-title" style="text-align: center;">${highlightedTitle}</h3>
            <div class="preview-body" style="margin-bottom: 30px;">${highlightedCopy}</div>
            <div class="preview-cta-container">
                <a href="${cta2Url}" target="_blank" rel="noopener noreferrer" class="preview-cta">${cta2}</a>
            </div>
        </div>
    `;
    
    return `
        ${heroImage}
        
        <div class="preview-content-body">
            <h2 class="preview-headline">${headline}</h2>
            
            <div class="preview-body">${bodyCopy}</div>
            
            ${bulletsHTML}
            
            ${signatureHTML}
            
            <div class="preview-cta-container">
                <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" class="preview-cta">${cta}</a>
            </div>
            
            ${highlightSection}
        </div>
    `;
}
