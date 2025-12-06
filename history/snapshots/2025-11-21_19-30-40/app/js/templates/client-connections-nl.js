/**
 * Client Connections NL Preview Renderer
 */

function renderClientConnectionsNlPreview(formData, uploadedImages = {}) {
    // Use permanent header image
    const header = `<img src="assets/images/client-connections.jpg" alt="Hero Banner" style="width: 100%; height: auto; display: block; margin-bottom: 30px;">`;
    
    const headline = formData['headline'] || 'Newsletter Headline';
    const bodyCopy = formData['body-copy'] || 'Newsletter body copy goes here...';
    
    // Bullet points
    const bullet1 = formData['bullet-1'] || 'Key takeaway 1';
    const bullet2 = formData['bullet-2'] || 'Key takeaway 2';
    
    const bullets = `
        <ul class="preview-bullets">
            <li>${bullet1}</li>
            ${bullet2 ? `<li>${bullet2}</li>` : ''}
        </ul>
    `;
    
    // Highlight section
    const highlightHeadline = formData['highlight-headline'] || 'Highlighted Section Headline';
    const highlightBody = formData['highlight-body'] || 'Highlighted section body copy...';
    const highlightCta = formData['highlight-cta'] || 'Learn more';
    const highlightCtaUrl = formData['highlight-cta-url'] || '#';
    
    const highlightSection = `
        <div style="background: #F5F3FB; padding: 30px; border-radius: 12px; margin-top: 40px;">
            <h2 class="preview-headline" style="text-align: center;">${highlightHeadline}</h2>
            <div class="preview-body" style="font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 20px;">${highlightBody}</div>
            <div class="preview-cta-container">
                <a href="${highlightCtaUrl}" target="_blank" rel="noopener noreferrer" class="preview-cta">${highlightCta}</a>
            </div>
        </div>
    `;
    
    return `
        ${header}
        
        <div class="preview-content-body">
            <h2 class="preview-headline">${headline}</h2>
            
            <div class="preview-body">${bodyCopy}</div>
            
            ${bullets}
            
            ${highlightSection}
        </div>
    `;
}
