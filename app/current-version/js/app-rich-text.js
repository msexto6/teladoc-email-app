
function applyRichFormat(editor, format) {
    editor.focus();
    
    if(format === 'link') {
        const url = prompt("Enter URL:", "https://");
        if(url) {
            document.execCommand('createLink', false, url);
            // Apply purple color and target="_blank" to newly created links
            setTimeout(() => {
                const links = editor.querySelectorAll('a');
                links.forEach(link => {
                    if(!link.style.color) {
                        link.style.color = '#6240E8';
                    }
                    // Add target="_blank" to all links so they open in new tab
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener noreferrer');
                });
                formData[editor.id] = getEditorHTML(editor);
                updatePreview();
                // Mark as changed
                if (typeof markFormAsDirty === 'function') {
                    markFormAsDirty();
                }
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
