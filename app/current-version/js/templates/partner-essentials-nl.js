/**
 * Partner Essentials NL Preview Renderer
 * SPRINT N2: Updated to convert plain text paragraph breaks (\n\n) to HTML
 */

function renderPartnerEssentialsNlPreview(formData, uploadedImages = {}) {
    // Use permanent header image
    const header = `<div style="margin-bottom: 30px;"><img src="assets/images/partner-essentials.jpg" style="width: 100%; height: auto; display: block;"></div>`;
    
    const headline = formData['headline'] || 'A smarter way to address cardiometabolic health';
    const bodyCopy = formData['body-copy'] || 'Body copy goes here...';
    const cta = formData['cta'] || 'Read the case study';
    const ctaUrl = formData['cta-url'] || '#';
    
    // SPRINT N2: Convert plain text with \n\n paragraph breaks to HTML
    const bodyHtml = window.convertPlainTextToHtmlParagraphs 
        ? window.convertPlainTextToHtmlParagraphs(bodyCopy)
        : `<p>${bodyCopy}</p>`;
    
    // Member testimonial section with light purple background
    const testimonialHeadline = formData['highlight-headline'] || 'Member testimonial: Meet Jose';
    const testimonialCopy = formData['highlight-copy'] || 'Testimonial copy goes here...';
    const testimonialCta = formData['highlight-cta'] || 'Meet Jose';
    const testimonialCtaUrl = formData['highlight-cta-url'] || '#';
    
    // SPRINT N2: Convert testimonial text to HTML paragraphs
    const testimonialHtml = window.convertPlainTextToHtmlParagraphs
        ? window.convertPlainTextToHtmlParagraphs(testimonialCopy)
        : `<p>${testimonialCopy}</p>`;
    
    const testimonialSection = `
        <div style="background: #F5F3FB; padding: 30px; border-radius: 12px; margin-top: 40px;">
            <h2 class="preview-headline">${testimonialHeadline}</h2>
            <div class="preview-body">${testimonialHtml}</div>
            <div class="preview-cta-container">
                <a href="${testimonialCtaUrl}" target="_blank" class="preview-cta" style="background: #6240E8;">${testimonialCta}</a>
            </div>
        </div>
    `;
    
    return `
        ${header}
        
        <div class="preview-content-body">
            <h2 class="preview-headline">${headline}</h2>
            
            <div class="preview-body">${bodyHtml}</div>
            
            <div class="preview-cta-container">
                <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" class="preview-cta">${cta}</a>
            </div>
            
            ${testimonialSection}
        </div>
    `;
}
