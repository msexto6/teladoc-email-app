/**
 * Webinar Invitation Preview Renderer
 */

function renderWebinarInvite(formData, uploadedImages) {
    let html = '';
    
    if(uploadedImages["hero-image"]) {
        html += `<img src="${uploadedImages["hero-image"]}" class="preview-hero-image">`;
    } else {
        html += '<div class="preview-placeholder">Hero Image</div>';
    }
    
    html += '<div class="preview-content-body">';
    
    if(formData.eyebrow) {
        html += `<div class="preview-eyebrow">${escapeHtml(formData.eyebrow)}</div>`;
    }
    
    if(formData.headline) {
        html += `<h1 class="preview-headline">${escapeHtml(formData.headline)}</h1>`;
    }
    
    if(formData.datetime) {
        html += `<div class="preview-datetime">${escapeHtml(formData.datetime)}</div>`;
    }
    
    if(formData["body-copy"]) {
        let body = formData["body-copy"];
        // Body is already HTML from the rich text editor, just use it directly
        html += `<div class="preview-body">${body}</div>`;
    }
    
    if(formData["signature-name"] || formData["signature-title"]) {
        html += '<div class="preview-signature">';
        html += '<div>Sincerely,</div>';
        if(formData["signature-name"]) {
            html += `<div class="preview-signature-name">${escapeHtml(formData["signature-name"])}</div>`;
        }
        if(formData["signature-title"]) {
            html += `<div class="preview-signature-title">${escapeHtml(formData["signature-title"])}</div>`;
        }
        if(formData["signature-company"]) {
            html += `<div>${escapeHtml(formData["signature-company"])}</div>`;
        }
        html += '</div>';
    }
    
    if(formData.cta) {
        const ctaUrl = formData["cta-url"] || "#";
        html += '<div class="preview-cta-container">';
        html += `<a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" class="preview-cta">${escapeHtml(formData.cta)}</a>`;
        html += '</div>';
    }
    
    const speakers = [];
    for(let i = 1; i <= 3; i++) {
        if(formData["speaker-" + i]) {
            speakers.push({
                name: formData["speaker-" + i],
                photo: uploadedImages["speaker-" + i + "-photo"]
            });
        }
    }
    
    if(speakers.length > 0) {
        html += '<div class="preview-speakers-section">';
        html += '<h2 class="preview-speakers-title">Speakers</h2>';
        html += '<div class="preview-speakers-grid">';
        speakers.forEach(sp => {
            html += '<div class="preview-speaker">';
            if(sp.photo) {
                html += `<img src="${sp.photo}" class="preview-speaker-photo">`;
            } else {
                html += '<div class="preview-speaker-photo"></div>';
            }
            const parts = sp.name.split(",");
            html += `<div class="preview-speaker-name">${escapeHtml(parts[0].trim())}</div>`;
            if(parts.length > 1) {
                html += `<div class="preview-speaker-title">${escapeHtml(parts.slice(1).join(",").trim())}</div>`;
            }
            html += '</div>';
        });
        html += '</div></div>';
    }
    
    html += '</div>';
    return html;
}
