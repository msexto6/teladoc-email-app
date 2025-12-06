/**
 * Webinar Post-Event (Attendee) Preview Renderer
 */

function renderWebinarPostAttendeePreview(formData, uploadedImages) {
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
    
    // Headline - FIXED COLOR TO #351f65
    if(formData["headline"]) {
        html += `<h1 style="font-family:Georgia,serif;font-size:32px;color:#351f65;margin:0 0 24px 0;line-height:1.2;">${formData["headline"]}</h1>`;
    }
    
    // Body Copy
    if(formData["body-copy"]) {
        let body = formData["body-copy"];
        // Replace link colors with purple
        body = body.replace(/color:#[0-9A-Fa-f]{6}/g, 'color:#6240E8');
        html += `<div style="font-family:Arial,sans-serif;font-size:16px;color:#333;line-height:1.6;margin-bottom:24px;">${body}</div>`;
    }
    
    // Signature
    html += '<p style="font-family:Arial,sans-serif;font-size:16px;color:#333;line-height:1.6;margin:32px 0 4px 0;">Sincerely,</p>';
    html += '<p style="font-family:Arial,sans-serif;font-size:16px;color:#333;font-weight:700;margin:0;"><strong>Kristen Moody</strong></p>';
    html += '<p style="font-family:Arial,sans-serif;font-size:16px;color:#333;margin:0;">Chief Client Officer</p>';
    html += '<p style="font-family:Arial,sans-serif;font-size:16px;color:#333;margin:0 0 32px 0;">Teladoc Health</p>';
    
    // CTA Button
    if(formData["cta"]) {
        const ctaUrl = formData["cta-url"] || "#";
        html += '<div style="text-align:center;margin:40px 0;">';
        html += `<a href="${ctaUrl}" style="display:inline-block;padding:16px 48px;background:#6240E8;color:#fff;text-decoration:none;border-radius:50px;font-weight:700;font-size:18px;font-family:Arial,sans-serif;">${formData["cta"]}</a>`;
        html += '</div>';
    }
    
    html += '</td></tr>';
    
    // Highlighted Section (Want more insights like this?)
    if(formData["highlighted-title"] || formData["highlighted-copy"]) {
        html += '<tr><td style="padding:40px 60px;background:#f8f8f8;">';
        
        if(formData["highlighted-title"]) {
            html += `<h2 style="font-family:Georgia,serif;font-size:32px;color:#351f65;margin:0 0 24px 0;line-height:1.2;">${formData["highlighted-title"]}</h2>`;
        }
        
        if(formData["highlighted-copy"]) {
            let highlightCopy = formData["highlighted-copy"];
            // Replace link colors with purple
            highlightCopy = highlightCopy.replace(/color:#[0-9A-Fa-f]{6}/g, 'color:#6240E8');
            html += `<div style="font-family:Arial,sans-serif;font-size:16px;color:#333;line-height:1.6;margin-bottom:24px;">${highlightCopy}</div>`;
        }
        
        // CTA 2 Button
        if(formData["cta-2"]) {
            const cta2Url = formData["cta-2-url"] || "#";
            html += '<div style="text-align:center;margin:32px 0 0 0;">';
            html += `<a href="${cta2Url}" style="display:inline-block;padding:16px 48px;background:#6240E8;color:#fff;text-decoration:none;border-radius:50px;font-weight:700;font-size:18px;font-family:Arial,sans-serif;">${formData["cta-2"]}</a>`;
            html += '</div>';
        }
        
        html += '</td></tr>';
    }
    
    // ADD WHITESPACE ROW AFTER GRAY SECTION - THIS IS THE FIX
    if(formData["highlighted-title"] || formData["highlighted-copy"]) {
        html += '<tr><td style="padding:60px 0;"></td></tr>';
    }
    
    html += '</table>';
    
    return html;
}
