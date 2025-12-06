/**
 * Consultant Connect NL Preview Renderer
 */

function renderConsultantConnectNlPreview(formData, uploadedImages = {}) {
    // Use permanent header image
    const header = `<div style="margin-bottom: 30px;"><img src="assets/images/consultant-connect.jpg" style="width: 100%; height: auto; display: block;"></div>`;
    
    const date = formData['date'] || 'September 2025';
    const headline = formData['headline'] || 'Newsletter Headline';
    const bodyCopy = formData['body-copy'] || 'Newsletter body copy goes here...';
    const cta = formData['cta'] || 'Read more';
    const ctaUrl = formData['cta-url'] || '#';
    
    // Resources section
    const defaultResources = `<strong>Resource Title</strong><br><br>Resource description and link`;
    const resourcesContent = formData['resources-section'] || defaultResources;
    
    const resourcesSection = `
        <div style="background: #F5F3FB; padding: 30px; border-radius: 12px; margin-top: 40px;">
            <h2 class="preview-headline" style="text-align: center;">Resources</h2>
            <div class="preview-body">${resourcesContent}</div>
        </div>
    `;
    
    // In the news section
    const defaultNews = `<strong>News Title</strong><br><br>News description and link`;
    const newsContent = formData['news-section'] || defaultNews;
    
    const newsSection = `
        <div style="margin-top: 40px; padding-top: 40px; border-top: 1px solid #E5E5E5;">
            <h2 class="preview-headline">In the news</h2>
            <div class="preview-body">${newsContent}</div>
        </div>
    `;
    
    return `
        ${header}
        
        <div class="preview-content-body">
            <p style="font-size: 12px; color: #666; margin-bottom: 20px;">${date}</p>
            
            <h2 class="preview-headline">${headline}</h2>
            
            <div class="preview-body">${bodyCopy}</div>
            
            <div class="preview-cta-container">
                <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" class="preview-cta">${cta}</a>
            </div>
            
            ${resourcesSection}
            ${newsSection}
        </div>
    `;
}
