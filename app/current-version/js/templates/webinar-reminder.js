/**
 * Webinar Reminder Preview Renderer
 */

function renderWebinarReminderPreview(formData, uploadedImages) {
    let html = '';
    
    // Main table
    html += '<table width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">';
    
    // Hero Image
    html += '<tr><td>';
    if(uploadedImages["hero-image"]) {
        html += `<img src="${uploadedImages["hero-image"]}" width="600" style="display:block;width:100%;">`;
    } else {
        html += '<div class="preview-placeholder" style="height:200px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;">Hero Image</div>';
    }
    html += '</td></tr>';
    
    // Main Content
    html += '<tr><td style="padding:40px 60px;">';
    
    // Body Copy
    if(formData["body-copy"]) {
        let body = formData["body-copy"];
        html += `<div style="font-family:Arial,sans-serif;font-size:16px;color:#333;line-height:1.6;margin-bottom:24px;">${body}</div>`;
    }
    
    html += '</td></tr>';
    html += '</table>';
    
    return html;
}
