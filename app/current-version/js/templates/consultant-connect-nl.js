/**
 * Consultant Connect NL Preview Renderer
 * SPRINT N2: Updated to convert plain text paragraph breaks (\n\n) to HTML
 */

function renderConsultantConnectNlPreview(formData, uploadedImages = {}) {
    // Use permanent header image
    const header = `<div style="margin-bottom: 30px;"><img src="assets/images/consultant-connect.jpg" style="width: 100%; height: auto; display: block;"></div>`;
    
    const date = formData['date'] || 'September 2025';
    const headline = formData['headline'] || 'Newsletter Headline';
    const bodyCopy = formData['body-copy'] || 'Newsletter body copy goes here...';
    const cta = formData['cta'] || 'Read more';
    const ctaUrl = formData['cta-url'] || '#';
    
    // SPRINT N2: Convert plain text with \n\n paragraph breaks to HTML
    const bodyHtml = window.convertPlainTextToHtmlParagraphs 
        ? window.convertPlainTextToHtmlParagraphs(bodyCopy)
        : `<p>${bodyCopy}</p>`;
    
    // Resources section
    const defaultResources = `Resource Title\n\nResource description and link`;
    const resourcesContent = formData['resources-section'] || defaultResources;
    
    // SPRINT N2: Convert resources text to HTML paragraphs
    const resourcesHtml = window.convertPlainTextToHtmlParagraphs
        ? window.convertPlainTextToHtmlParagraphs(resourcesContent)
        : resourcesContent;
    
    const resourcesSection = `
        <div style="background: #F5F3FB; padding: 30px; border-radius: 12px; margin-top: 40px;">
            <h2 class="preview-headline" style="text-align: center;">Resources</h2>
            <div class="preview-body">${resourcesHtml}</div>
        </div>
    `;
    
    // In the news section
    const defaultNews = `News Title\n\nNews description and link`;
    const newsContent = formData['news-section'] || defaultNews;
    
    // SPRINT N2: Convert news text to HTML paragraphs
    const newsHtml = window.convertPlainTextToHtmlParagraphs
        ? window.convertPlainTextToHtmlParagraphs(newsContent)
        : newsContent;
    
    const newsSection = `
        <div style="margin-top: 40px; padding-top: 40px; border-top: 1px solid #E5E5E5;">
            <h2 class="preview-headline">In the news</h2>
            <div class="preview-body">${newsHtml}</div>
        </div>
    `;
    
    return `
        ${header}
        
        <div class="preview-content-body">
            <p style="font-size: 12px; color: #666; margin-bottom: 20px;">${date}</p>
            
            <h2 class="preview-headline">${headline}</h2>
            
            <div class="preview-body">${bodyHtml}</div>
            
            <div class="preview-cta-container">
                <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" class="preview-cta">${cta}</a>
            </div>
            
            ${resourcesSection}
            ${newsSection}
        </div>
    `;
}
