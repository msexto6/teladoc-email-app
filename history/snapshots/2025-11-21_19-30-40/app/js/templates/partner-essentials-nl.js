/**
 * Partner Essentials NL Preview Renderer
 */

function renderPartnerEssentialsNlPreview(formData, uploadedImages = {}) {
    // Use permanent header image
    const header = `<div style="margin-bottom: 30px;"><img src="assets/images/partner-essentials.jpg" style="width: 100%; height: auto; display: block;"></div>`;
    
    const headline = formData['headline'] || 'A smarter way to address cardiometabolic health';
    
    const defaultBodyCopy = `Managing cardiometabolic health is one of today's most pressing challenges for employers and plans. The Massachusetts Bankers Association partnered with Teladoc Health to take a more integrated approach—<a href="#" style="color:#6240E8;text-decoration:underline;">helping members with uncontrolled diabetes</a> lower A1C by 1.8% and enabling 50% to reach remission-level A1C in just six months. See how integrated care is improving lives.`;
    
    const bodyCopy = formData['body-copy'] || defaultBodyCopy;
    const cta = formData['cta'] || 'Read the full case study here';
    const ctaUrl = formData['cta-url'] || '#';
    
    // Member testimonial section with light purple background
    const testimonialHeadline = formData['highlight-headline'] || 'Member testimonial: Meet Jose';
    
    const defaultTestimonial = `Jose was overwhelmed by his cardiometabolic conditions until Teladoc Health helped him regain control. With virtual visits, connected devices and expert coaching, he lost nearly 50 pounds and lowered his A1C—discover how he's now feeling empowered and energized.`;
    
    const testimonialCopy = formData['highlight-copy'] || defaultTestimonial;
    const testimonialCta = formData['highlight-cta'] || 'Meet Jose';
    const testimonialCtaUrl = formData['highlight-cta-url'] || '#';
    
    const testimonialSection = `
        <div style="background: #F5F3FB; padding: 30px; border-radius: 12px; margin-top: 40px;">
            <h2 class="preview-headline">${testimonialHeadline}</h2>
            <div class="preview-body">${testimonialCopy}</div>
            <div class="preview-cta-container">
                <a href="${testimonialCtaUrl}" target="_blank" class="preview-cta" style="background: #6240E8;">${testimonialCta}</a>
            </div>
        </div>
    `;
    
    return `
        ${header}
        
        <div class="preview-content-body">
            <h2 class="preview-headline">${headline}</h2>
            
            <div class="preview-body">${bodyCopy}</div>
            
            <div class="preview-cta-container">
                <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" class="preview-cta">${cta}</a>
            </div>
            
            ${testimonialSection}
        </div>
    `;
}
