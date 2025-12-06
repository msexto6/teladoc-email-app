/**
 * Webinar Registration Confirmation Preview Renderer
 */

function renderWebinarRegConfirmation(formData, uploadedImages) {
    let html = '';
    
    if(uploadedImages["hero-image"]) {
        html += `<img src="${uploadedImages["hero-image"]}" class="preview-hero-image">`;
    } else {
        html += '<div class="preview-placeholder">Hero Image</div>';
    }
    
    html += '<div class="preview-content-body">';
    
    if(formData.headline) {
        html += `<h1 class="preview-headline">${escapeHtml(formData.headline)}</h1>`;
    }
    
    if(formData["body-copy"]) {
        let body = formData["body-copy"];
        // Body is already HTML from the rich text editor, just use it directly
        html += `<div class="preview-body">${body}</div>`;
    }
    
    if(formData.date || formData.time) {
        html += '<div style="margin:24px 0;">';
        if(formData.date) {
            html += `<div style="font-size:16px;color:#000;margin-bottom:8px;"><strong>Date:</strong> ${escapeHtml(formData.date)}</div>`;
        }
        if(formData.time) {
            html += `<div style="font-size:16px;color:#000;margin-bottom:8px;"><strong>Time:</strong> ${escapeHtml(formData.time)}</div>`;
        }
        if(formData.link) {
            // Link field now contains HTML
            html += `<div style="font-size:16px;color:#000;"><strong>Link:</strong> ${formData.link}</div>`;
        }
        html += '</div>';
    }
    
    if(formData["contact-info"]) {
        let contact = formData["contact-info"];
        
        // Protect HTML tags
        const contactLinks = [];
        contact = contact.replace(/<a href="(.*?)">(.*?)<\/a>/g, (match, url, text) => {
            contactLinks.push({url, text});
            return `__LINK_${contactLinks.length - 1}__`;
        });
        
        const contactUnderlines = [];
        contact = contact.replace(/<u>(.*?)<\/u>/g, (match, text) => {
            contactUnderlines.push(text);
            return `__UNDERLINE_${contactUnderlines.length - 1}__`;
        });
        
        // Process markdown
        contact = contact.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        contact = contact.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Restore HTML
        contactLinks.forEach((link, index) => {
            contact = contact.replace(`__LINK_${index}__`, `<a href="${link.url}">${link.text}</a>`);
        });
        
        contactUnderlines.forEach((text, index) => {
            contact = contact.replace(`__UNDERLINE_${index}__`, `<u>${text}</u>`);
        });
        
        contact = contact.replace(/\n/g, '<br>');
        html += `<div class="preview-body">${contact}</div>`;
    }
    
    if(formData.cta) {
        const ctaUrl = formData["cta-url"] || "#";
        html += '<div class="preview-cta-container">';
        html += `<a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" class="preview-cta">${escapeHtml(formData.cta)}</a>`;
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}
