/**
 * Email Briefing Tool - Main Application Controller
 * Version: 3.5 - Batch 1 Templates Added
 * Last Updated: October 2025
 */

// ============================================
// APPLICATION STATE
// ============================================
let currentTemplate = null;
let formData = {};
let uploadedImages = {};

// ============================================
// INITIALIZATION
// ============================================
function init() {
    populateTemplateSelector();
    setupEventListeners();
}

function populateTemplateSelector() {
    const sel = document.getElementById("template-selector");
    Object.keys(templates).forEach(key => {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = templates[key].name;
        sel.appendChild(opt);
    });
}

function setupEventListeners() {
    document.getElementById("template-selector").addEventListener("change", handleTemplateChange);
    document.getElementById("save-btn").addEventListener("click", showSaveModal);
    document.getElementById("load-btn").addEventListener("click", () => document.getElementById("load-file-input").click());
    document.getElementById("load-file-input").addEventListener("change", loadProject);
    document.getElementById("export-btn").addEventListener("click", showExportModal);
    document.getElementById("desktop-view").addEventListener("click", switchToDesktop);
    document.getElementById("mobile-view").addEventListener("click", switchToMobile);
    
    const creativeDropdown = document.getElementById("creative-direction-top");
    if(creativeDropdown) {
        creativeDropdown.addEventListener("change", (e) => {
            formData["creative-direction"] = e.target.value;
        });
    }
}

// ============================================
// TEMPLATE HANDLING
// ============================================
function handleTemplateChange(e) {
    const val = e.target.value;
    const creativeSection = document.getElementById("creative-direction-section");
    const actionButtons = document.getElementById("action-buttons");
    
    if(!val) {
        currentTemplate = null;
        document.getElementById("email-form").innerHTML = "";
        actionButtons.classList.remove("active");
        creativeSection.classList.remove("active");
        updatePreview();
        return;
    }
    
    currentTemplate = templates[val];
    
    // Initialize with default content for specific templates
    if(val === "webinar-invite") {
        formData = {
            "eyebrow": "Webinar",
            "headline": "This is your headline",
            "datetime": "June 10, 2025 | 11:30-12:30 PM ET",
            "body-copy": "Introduce your webinar here - provide a high-level description of the topic.<br><br><strong>What you will learn</strong><br>• Bullet point 1<br>• Bullet point 2<br>• Bullet point 3",
            "signature-name": "Kristen Moody",
            "signature-title": "Chief Client Officer",
            "signature-company": "Teladoc Health",
            "cta": "Register today",
            "speaker-1": "Kristen Moody, Chief Client Officer, Teladoc Health",
            "speaker-2": "Eddie Swafford, Senior Vice President, Operations, Teladoc Health",
            "speaker-3": "Brian Serfass, Senior Vice President, Consumer Marketing, Teladoc Health"
        };
    } else if(val === "webinar-reg-confirmation") {
        formData = {
            "headline": "Registration Confirmation",
            "body-copy": "Thank you for registering! The details are below.",
            "date": "September 9, 2025",
            "time": "2:30 PM ET",
            "link": "Access the webinar",
            "contact-info": "If you have questions, please reach out.",
            "cta": "Add to calendar"
        };
    } else if(val === "webinar-reminder") {
        formData = {
            "body-copy": `<div>Thank you for registering for the webinar.</div><div><br></div><div>The event will start promptly at <strong>11:30AM ET</strong>.</div><div><br></div><div>Here is your access link for the webinar:</div><div><a href="https://www.example.com" style="color:#6240E8;">Access the webinar</a></div><div><br></div><div>If you are unable to join us live, we'll share a recording of the webinar so you can watch it at your convenience.</div><div><br></div><div>Thank you,</div><div><br></div><div><strong>The Teladoc Health Team</strong></div>`
        };
    } else if(val === "webinar-post-attendee") {
        formData = {
            "headline": "Virtual Mental Health: The Next Chapter",
            "body-copy": "<p>Thank you for joining us at the September Client Connections webinar. I hope you found the discussion valuable and walked away with actionable insights to support your population.</p><p>If you'd like to revisit any part of the conversation—or share it with colleagues—the full recording is <a href='#' style='color:#6240E8;'>now available to watch on demand</a>.</p><p>Thank you again for your continued partnership.</p>",
            "cta": "Watch now",
            "highlighted-title": "Want more insights like this?",
            "highlighted-copy": "<p>Be sure to join us for our next <em>Client Connections</em> webinar on <a href='#' style='color:#6240E8;'>Tuesday, November 5 at 11:30 AM ET</a>. You'll hear directly from clinical and strategy leaders as they unveil new advancements and share how Teladoc Health is orchestrating more connected, personalized support across our solutions.</p>",
            "cta-2": "Register now"
        };
    } else if(val === "webinar-post-noshow") {
        formData = {};
    } else if(val === "education-drip-employer") {
        formData = {
            "headline": "Care that meets women where they are",
            "body-copy": `Women are skipping preventive care—and it's impacting health and productivity. <a href="#" style="color:#6240E8;text-decoration:underline;">Teladoc Health helps</a> close the gap with virtual-first primary care that's built for women, with personalized access to trusted providers and comprehensive services.`,
            "cta": "Read the full article",
            "highlight-headline": "Questions?",
            "highlight-body": `If you'd like to explore how such programs could benefit your organization, feel free to reach out to one of our team members for a <a href="#" style="color:#6240E8;text-decoration:underline;">personalized consultation.</a>`
        };
    } else {
        formData = {};
    }
    
    uploadedImages = {};
    creativeSection.classList.add("active");
    document.getElementById("creative-direction-top").value = "[Choose one]";
    actionButtons.classList.add("active");
    
    generateForm();
    populateFormFields();
    updatePreview();
}

// ============================================
// FORM GENERATION
// ============================================
function generateForm() {
    const form = document.getElementById("email-form");
    form.innerHTML = "";
    currentTemplate.fields.forEach(f => form.appendChild(createFormField(f)));
}

function createFormField(field) {
    const div = document.createElement("div");
    div.className = "form-field";
    
    const label = document.createElement("label");
    label.textContent = field.label;
    div.appendChild(label);
    
    if(field.type === "image") {
        div.appendChild(createImageUpload(field));
    } else if(field.type === "textarea") {
        div.appendChild(createTextarea(field));
    } else {
        div.appendChild(createTextInput(field));
    }
    
    return div;
}

// ============================================
// IMAGE UPLOAD HANDLING
// ============================================
function createImageUpload(field) {
    const div = document.createElement("div");
    const zone = document.createElement("div");
    zone.className = "image-drop-zone";
    zone.id = field.id + "-zone";
    zone.innerHTML = `
        <svg class="drop-zone-icon" viewBox="0 0 24 24" fill="none">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
        </svg>
        <div class="drop-zone-text">Drop image or click</div>
    `;
    
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    input.id = field.id + "-input";
    
    function displayImage(dataUrl) {
        zone.innerHTML = `
            <div class="image-preview-container">
                <img src="${dataUrl}" class="image-preview">
                <button type="button" class="image-remove-btn" onclick="removeImage('${field.id}')">&times;</button>
            </div>
        `;
    }
    
    zone.addEventListener("click", (e) => {
        if(!e.target.classList.contains('image-remove-btn')) {
            input.click();
        }
    });
    
    zone.addEventListener("dragover", e => {
        e.preventDefault();
        zone.classList.add("drag-active");
    });
    
    zone.addEventListener("dragleave", e => {
        e.preventDefault();
        zone.classList.remove("drag-active");
    });
    
    zone.addEventListener("drop", e => {
        e.preventDefault();
        zone.classList.remove("drag-active");
        
        const file = e.dataTransfer.files[0];
        if(file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                uploadedImages[field.id] = evt.target.result;
                displayImage(evt.target.result);
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });
    
    input.addEventListener("change", e => {
        const file = e.target.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                uploadedImages[field.id] = evt.target.result;
                displayImage(evt.target.result);
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });
    
    div.appendChild(zone);
    div.appendChild(input);
    return div;
}

function removeImage(fieldId) {
    delete uploadedImages[fieldId];
    const zone = document.getElementById(fieldId + "-zone");
    const input = document.getElementById(fieldId + "-input");
    if(input) input.value = "";
    zone.innerHTML = `
        <svg class="drop-zone-icon" viewBox="0 0 24 24" fill="none">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
        </svg>
        <div class="drop-zone-text">Drop image or click</div>
    `;
    updatePreview();
}

// ============================================
// FORM INPUT HANDLING
// ============================================
function createTextInput(field) {
    const div = document.createElement("div");
    
    // Check if this field should have rich text (link field)
    if(field.id === "link") {
        const toolbar = document.createElement("div");
        toolbar.className = "formatting-toolbar";
        toolbar.innerHTML = `
            <button type="button" class="format-btn" data-format="bold" title="Bold">
                <strong>B</strong>
            </button>
            <button type="button" class="format-btn" data-format="italic" title="Italic">
                <em>I</em>
            </button>
            <button type="button" class="format-btn" data-format="underline" title="Underline">
                <u>U</u>
            </button>
            <button type="button" class="format-btn" data-format="link" title="Insert Link">
                🔗
            </button>
        `;
        div.appendChild(toolbar);
        
        const editor = document.createElement("div");
        editor.id = field.id;
        editor.className = "form-input rich-text-editor";
        editor.contentEditable = "true";
        editor.setAttribute("data-placeholder", field.placeholder || "");
        editor.style.minHeight = "60px";
        
        div.appendChild(editor);
        
        toolbar.addEventListener("click", (e) => {
            const btn = e.target.closest(".format-btn");
            if(!btn) return;
            
            const format = btn.dataset.format;
            applyRichFormat(editor, format);
        });
        
        editor.addEventListener("input", () => {
            formData[field.id] = getEditorHTML(editor);
            if(field.maxChars) {
                updateCharacterCounterFromEditor(editor, field.maxChars);
            }
            updatePreview();
        });
        
        if(field.maxChars) {
            const counter = document.createElement("div");
            counter.className = "char-counter";
            counter.innerHTML = `
                <span class="char-count">0 / ${field.maxChars}</span>
                <div class="char-progress-bar">
                    <div class="char-progress-fill safe" style="width:0%"></div>
                </div>
            `;
            div.appendChild(counter);
        }
    } else {
        // Regular text input
        const input = document.createElement("input");
        input.type = "text";
        input.id = field.id;
        input.className = "form-input";
        input.placeholder = field.placeholder || "";
        
        div.appendChild(input);
        
        if(field.maxChars) {
            const counter = document.createElement("div");
            counter.className = "char-counter";
            counter.innerHTML = `
                <span class="char-count">0 / ${field.maxChars}</span>
                <div class="char-progress-bar">
                    <div class="char-progress-fill safe" style="width:0%"></div>
                </div>
            `;
            div.appendChild(counter);
            
            input.addEventListener("input", e => {
                formData[field.id] = e.target.value;
                updateCharacterCounter(input, field.maxChars);
                updatePreview();
            });
        } else {
            input.addEventListener("input", e => {
                formData[field.id] = e.target.value;
                updatePreview();
            });
        }
    }
    
    return div;
}

function createTextarea(field) {
    const div = document.createElement("div");
    
    // Add formatting toolbar for body-copy and highlight-body fields
    if(field.id === "body-copy" || field.id === "highlight-body") {
        const toolbar = document.createElement("div");
        toolbar.className = "formatting-toolbar";
        toolbar.innerHTML = `
            <button type="button" class="format-btn" data-format="bold" title="Bold">
                <strong>B</strong>
            </button>
            <button type="button" class="format-btn" data-format="italic" title="Italic">
                <em>I</em>
            </button>
            <button type="button" class="format-btn" data-format="underline" title="Underline">
                <u>U</u>
            </button>
            <button type="button" class="format-btn" data-format="link" title="Insert Link">
                🔗
            </button>
            <button type="button" class="format-btn" data-format="bulletList" title="Bullet List">
                ≡
            </button>
        `;
        div.appendChild(toolbar);
        
        // Create contenteditable div instead of textarea for rich text
        const editor = document.createElement("div");
        editor.id = field.id;
        editor.className = "form-input form-textarea rich-text-editor";
        editor.contentEditable = "true";
        editor.setAttribute("data-placeholder", field.placeholder || "");
        
        div.appendChild(editor);
        
        // Add event listeners for formatting buttons
        toolbar.addEventListener("click", (e) => {
            const btn = e.target.closest(".format-btn");
            if(!btn) return;
            
            const format = btn.dataset.format;
            applyRichFormat(editor, format);
        });
        
        // Handle input events
        editor.addEventListener("input", () => {
            formData[field.id] = getEditorHTML(editor);
            if(field.maxChars) {
                updateCharacterCounterFromEditor(editor, field.maxChars);
            }
            updatePreview();
        });
        
    } else {
        // Regular textarea for non-body-copy fields
        const textarea = document.createElement("textarea");
        textarea.id = field.id;
        textarea.className = "form-input form-textarea";
        textarea.placeholder = field.placeholder || "";
        
        div.appendChild(textarea);
        
        textarea.addEventListener("input", e => {
            formData[field.id] = e.target.value;
            if(field.maxChars) {
                updateCharacterCounter(textarea, field.maxChars);
            }
            updatePreview();
        });
    }
    
    if(field.maxChars) {
        const counter = document.createElement("div");
        counter.className = "char-counter";
        counter.innerHTML = `
            <span class="char-count">0 / ${field.maxChars}</span>
            <div class="char-progress-bar">
                <div class="char-progress-fill safe" style="width:0%"></div>
            </div>
        `;
        div.appendChild(counter);
    }
    
    return div;
}

// ============================================
// RICH TEXT EDITING
// ============================================
function applyRichFormat(editor, format) {
    editor.focus();
    
    if(format === 'link') {
        const url = prompt("Enter URL:", "https://");
        if(url) {
            document.execCommand('createLink', false, url);
            // Apply purple color to newly created links
            setTimeout(() => {
                const links = editor.querySelectorAll('a');
                links.forEach(link => {
                    if(!link.style.color) {
                        link.style.color = '#6240E8';
                    }
                });
                formData[editor.id] = getEditorHTML(editor);
                updatePreview();
            }, 10);
        }
    } else if(format === 'bold') {
        document.execCommand('bold', false, null);
    } else if(format === 'italic') {
        document.execCommand('italic', false, null);
    } else if(format === 'underline') {
        document.execCommand('underline', false, null);
    } else if(format === 'bulletList') {
        document.execCommand('insertUnorderedList', false, null);
    }
    
    // Update formData
    formData[editor.id] = getEditorHTML(editor);
    updatePreview();
}

function getEditorHTML(editor) {
    return editor.innerHTML;
}

function setEditorHTML(editor, html) {
    editor.innerHTML = html;
}

function updateCharacterCounterFromEditor(editor, maxChars) {
    const counter = editor.parentElement.querySelector(".char-counter");
    const progressFill = editor.parentElement.querySelector(".char-progress-fill");
    
    if(counter && progressFill) {
        const len = editor.textContent.length;
        const countSpan = counter.querySelector(".char-count");
        countSpan.textContent = len + " / " + maxChars;
        
        const percentage = Math.min((len/maxChars)*100, 100);
        progressFill.style.width = percentage + "%";
        
        progressFill.classList.remove("safe", "warning", "danger");
        countSpan.classList.remove("over-limit");
        
        if(len > maxChars) {
            progressFill.classList.add("danger");
            countSpan.classList.add("over-limit");
        } else if(len > maxChars * 0.8) {
            progressFill.classList.add("warning");
        } else {
            progressFill.classList.add("safe");
        }
    }
}

// ============================================
// CHARACTER COUNTER
// ============================================
function updateCharacterCounter(input, maxChars) {
    const counter = input.parentElement.querySelector(".char-counter");
    const progressFill = input.parentElement.querySelector(".char-progress-fill");
    
    if(counter && progressFill) {
        const len = input.value.length;
        const countSpan = counter.querySelector(".char-count");
        countSpan.textContent = len + " / " + maxChars;
        
        const percentage = Math.min((len/maxChars)*100, 100);
        progressFill.style.width = percentage + "%";
        
        progressFill.classList.remove("safe", "warning", "danger");
        countSpan.classList.remove("over-limit");
        
        if(len > maxChars) {
            progressFill.classList.add("danger");
            countSpan.classList.add("over-limit");
        } else if(len > maxChars * 0.8) {
            progressFill.classList.add("warning");
        } else {
            progressFill.classList.add("safe");
        }
    }
}

// ============================================
// FORM POPULATION
// ============================================
function populateFormFields() {
    currentTemplate.fields.forEach(field => {
        if(formData[field.id]) {
            const input = document.getElementById(field.id);
            if(input) {
                if(input.contentEditable === "true") {
                    // Rich text editor
                    setEditorHTML(input, formData[field.id]);
                    if(field.maxChars) {
                        updateCharacterCounterFromEditor(input, field.maxChars);
                    }
                } else {
                    // Regular input/textarea
                    input.value = formData[field.id];
                    if(field.maxChars) {
                        updateCharacterCounter(input, field.maxChars);
                    }
                }
            }
        }
        
        if(uploadedImages[field.id]) {
            const zone = document.getElementById(field.id + "-zone");
            if(zone) {
                zone.innerHTML = `
                    <div class="image-preview-container">
                        <img src="${uploadedImages[field.id]}" class="image-preview">
                        <button type="button" class="image-remove-btn" onclick="removeImage('${field.id}')">&times;</button>
                    </div>
                `;
            }
        }
    });
}

// ============================================
// VIEW SWITCHING
// ============================================
function switchToDesktop() {
    document.getElementById("desktop-view").classList.add("active");
    document.getElementById("mobile-view").classList.remove("active");
    document.querySelector(".preview-email").classList.remove("mobile-view");
}

function switchToMobile() {
    document.getElementById("mobile-view").classList.add("active");
    document.getElementById("desktop-view").classList.remove("active");
    document.querySelector(".preview-email").classList.add("mobile-view");
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function parseLinks(text) {
    if(!text) return '';
    return text;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// PREVIEW UPDATE (ROUTER)
// ============================================
function updatePreview() {
    const content = document.getElementById("preview-content");
    if(!currentTemplate) {
        content.innerHTML = '<p style="text-align:center;padding:80px 20px;color:#9B8FC7;">Select a template to see preview</p>';
        return;
    }
    
    const templateKey = Object.keys(templates).find(key => templates[key] === currentTemplate);
    
    let html = "";
    html += '<div class="preview-logo"><img src="assets/images/teladoc-logo.png" alt="Teladoc Health"></div>';
    
    // Route to the appropriate template renderer
    if(templateKey === 'webinar-reg-confirmation') {
        html += renderWebinarRegConfirmation(formData, uploadedImages);
    } else if(templateKey === 'webinar-invite') {
        html += renderWebinarInvite(formData, uploadedImages);
    } else if(templateKey === 'webinar-reminder') {
        html += renderWebinarReminderPreview(formData, uploadedImages);
    } else if(templateKey === 'webinar-post-attendee') {
        html += renderWebinarPostAttendeePreview(formData, uploadedImages);
    } else if(templateKey === 'webinar-post-noshow') {
        html += renderWebinarPostNoshowPreview(formData, uploadedImages);
    } else if(templateKey === 'education-drip-employer') {
        html += renderEducationDripEmployerPreview(formData);
    } else if(templateKey === 'education-drip-hp') {
        html += renderEducationDripHpPreview(formData, uploadedImages);
    } else {
        html += renderDefaultTemplate();
    }
    
    content.innerHTML = html;
}

function renderDefaultTemplate() {
    let html = '<div class="preview-content-body">';
    html += '<p style="text-align:center;padding:40px 20px;color:#9B8FC7;">Preview for this template coming soon</p>';
    html += '</div>';
    return html;
}

// ============================================
// MODAL HANDLING
// ============================================
function showSaveModal() {
    document.getElementById("save-modal").classList.add("active");
    document.getElementById("project-name-input").focus();
}

function closeSaveModal() {
    document.getElementById("save-modal").classList.remove("active");
}

function showExportModal() {
    document.getElementById("export-modal").classList.add("active");
}

function closeExportModal() {
    document.getElementById("export-modal").classList.remove("active");
}

// ============================================
// PROJECT SAVE/LOAD
// ============================================
function saveToComputer() {
    const projectName = document.getElementById("project-name-input").value.trim();
    if(!projectName) {
        alert("Please enter a project name");
        return;
    }
    
    const templateKey = Object.keys(templates).find(key => templates[key] === currentTemplate);
    
    const saveData = {
        projectName: projectName,
        template: templateKey,
        formData: formData,
        uploadedImages: uploadedImages,
        savedDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(saveData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = projectName + '.json';
    link.click();
    
    closeSaveModal();
}

function loadProject(e) {
    const file = e.target.files[0];
    if(!file) return;
    
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const saveData = JSON.parse(evt.target.result);
            
            document.getElementById("template-selector").value = saveData.template;
            currentTemplate = templates[saveData.template];
            formData = saveData.formData;
            uploadedImages = saveData.uploadedImages;
            
            document.getElementById("action-buttons").classList.add("active");
            document.getElementById("creative-direction-section").classList.add("active");
            generateForm();
            populateFormFields();
            updatePreview();
            
            alert("Project loaded: " + saveData.projectName);
        } catch(err) {
            alert("Error loading project file: " + err.message);
        }
    };
    reader.readAsText(file);
    
    e.target.value = "";
}

// ============================================
// EXPORT FUNCTIONS
// ============================================
async function exportAsExcel() {
    if(!currentTemplate) {
        alert("Please select a template first");
        closeExportModal();
        return;
    }
    
    const projectName = formData.headline ? 
        formData.headline.substring(0, 30).replace(/[^a-z0-9]/gi, "-") : 
        "email-brief";
    
    const zip = new JSZip();
    let htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; vertical-align: top; }
        th { background-color: #351F65; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
    </style>
</head>
<body>
    <h1>Email Content Brief - ${projectName}</h1>
    <table>
        <tr>
            <th>Field</th>
            <th>Content</th>
            <th>Character Count</th>
            <th>Max Characters</th>
        </tr>`;
    
    const imagesFolder = zip.folder("images");
    
    if(formData["creative-direction"]) {
        htmlContent += `
        <tr>
            <td><strong>I need the creative team to...</strong></td>
            <td>${formData["creative-direction"]}</td>
            <td>N/A</td>
            <td>N/A</td>
        </tr>`;
    }
    
    currentTemplate.fields.forEach(field => {
        const value = formData[field.id] || "";
        const elem = document.getElementById(field.id);
        const charCount = elem && elem.contentEditable === "true" ? 
            elem.textContent.length : 
            value.length;
        const maxChars = field.maxChars || "N/A";
        
        htmlContent += `<tr><td><strong>${field.label}</strong></td>`;
        
        if(field.type === "image") {
            if(uploadedImages[field.id]) {
                const imageData = uploadedImages[field.id];
                const imageExtension = imageData.substring(imageData.indexOf("/") + 1, imageData.indexOf(";"));
                const imageName = `${field.label.replace(/[^a-z0-9]/gi, "_")}.${imageExtension}`;
                const base64Data = imageData.split(",")[1];
                imagesFolder.file(imageName, base64Data, {base64: true});
                htmlContent += `<td>See: images/${imageName}</td>`;
            } else {
                htmlContent += `<td>[No image uploaded]</td>`;
            }
            htmlContent += `<td>N/A</td><td>N/A</td>`;
        } else {
            // Export with HTML formatting preserved
            const displayValue = value;
            htmlContent += `<td>${displayValue}</td><td>${charCount}</td><td>${maxChars}</td>`;
        }
        
        htmlContent += `</tr>`;
    });
    
    htmlContent += `
    </table>
</body>
</html>`;
    
    zip.file(projectName + ".xls", htmlContent);
    
    const zipBlob = await zip.generateAsync({type: "blob"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = projectName + ".zip";
    link.click();
    
    closeExportModal();
}

async function exportAsHTML() {
    alert("HTML export feature coming soon!");
    closeExportModal();
}

// ============================================
// INITIALIZE APP ON LOAD
// ============================================
document.addEventListener('DOMContentLoaded', init);

// ============================================
// SAVE TO MY DESIGNS FUNCTION
// ============================================
function saveToMyDesigns() {
    const projectName = document.getElementById('project-name-input').value.trim();
    if(!projectName) {
        alert('Please enter a project name');
        return;
    }
    
    const templateKey = Object.keys(templates).find(key => templates[key] === currentTemplate);
    
    const saveData = {
        projectName: projectName,
        templateId: templateKey,
        formData: formData,
        uploadedImages: uploadedImages,
        savedDate: new Date().toISOString()
    };
    
    // Save to localStorage
    const storageKey = 'email-project-' + Date.now();
    localStorage.setItem(storageKey, JSON.stringify(saveData));
    
    closeSaveModal();
    alert('Project saved to My Designs!');
}
