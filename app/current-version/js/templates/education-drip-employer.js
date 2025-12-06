/**
 * Education Drip - Employer Preview Renderer
 */

function renderEducationDripEmployerPreview(formData, uploadedImages = {}) {
    const heroImage = uploadedImages['hero-image'] 
        ? `<img src="${uploadedImages['hero-image']}" alt="Hero" class="preview-hero-image">`
        : '<div class="preview-placeholder">Hero Image</div>';
    
    const headline = formData['headline'] || 'Care that meets women where they are';
    
    const defaultBodyCopy = `Women are skipping preventive care—and it's impacting health and productivity. <a href="#" style="color:#6240E8;text-decoration:underline;">Teladoc Health helps</a> close the gap with virtual-first primary care that's built for women, with personalized access to trusted providers and comprehensive services.`;
    
    const bodyCopy = formData['body-copy'] || defaultBodyCopy;
    const cta = formData['cta'] || 'Read the full article';
    const ctaUrl = formData['cta-url'] || '#';
    
    const highlightHeadline = formData['highlight-headline'] || 'Questions?';
    
    const defaultHighlightBody = `If you'd like to explore how such programs could benefit your organization, feel free to reach out to one of our team members for a <a href="#" style="color:#6240E8;text-decoration:underline;">personalized consultation.</a>`;
    
    const highlightBody = formData['highlight-body'] || defaultHighlightBody;
    
    // Build highlighted section with light purple background
    const highlightSection = `
        <div style="background: #F5F3FB; padding: 30px; border-radius: 12px; margin-top: 40px;">
            <h3 class="preview-speakers-title" style="text-align: center;">${highlightHeadline}</h3>
            <div class="preview-body">${highlightBody}</div>
        </div>
    `;
    
    return `
        ${heroImage}
        
        <div class="preview-content-body">
            <h2 class="preview-headline">${headline}</h2>
            
            <div class="preview-body">${bodyCopy}</div>
            
            <div class="preview-cta-container">
                <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" class="preview-cta">${cta}</a>
            </div>
            
            ${highlightSection}
        </div>
    `;
}
