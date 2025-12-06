// Debug Patch for FormData Issue
// This code will help us track exactly what's happening with formData

console.log("🔍 DEBUG PATCH LOADED");

// Store original functions
const originalCreateTextInput = window.createTextInput;
const originalHandleSave = window.handleSave;

// Track formData changes
let formDataProxy = new Proxy({}, {
    set(target, property, value) {
        console.log(`📝 formData["${property}"] = "${value?.substring?.(0, 50)}..."`);
        target[property] = value;
        return true;
    },
    get(target, property) {
        return target[property];
    }
});

// Override the global formData
Object.defineProperty(window, 'formData', {
    get() {
        return formDataProxy;
    },
    set(value) {
        console.log("⚠️ formData completely replaced with:", value);
        Object.keys(value).forEach(key => {
            formDataProxy[key] = value[key];
        });
    }
});

// Add input tracking
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('form-input') || e.target.contentEditable === "true") {
        console.log(`✏️ Input event on #${e.target.id}:`, {
            value: e.target.value || e.target.innerHTML?.substring(0, 50),
            hasEventListener: !!e.target._hasInputListener,
            formDataKeys: Object.keys(window.formData)
        });
    }
}, true);

// Track save button clicks
document.addEventListener('click', function(e) {
    if (e.target.textContent === 'Save') {
        console.log("💾 Save clicked! Current formData:", window.formData);
        console.log("Template Key:", window.currentTemplateKey);
        console.log("Current Template:", window.currentTemplate);
    }
}, true);

// Monitor when fields are created
if (window.createTextInput) {
    window.createTextInput = function(field) {
        console.log(`🏗️ Creating text input for field:`, field.id, {
            hasMaxChars: !!field.maxChars,
            placeholder: field.placeholder
        });
        
        const result = originalCreateTextInput.call(this, field);
        
        // Mark input as having listener
        setTimeout(() => {
            const input = document.getElementById(field.id);
            if (input) {
                input._hasInputListener = true;
                console.log(`✅ Field ${field.id} created and marked`);
            }
        }, 0);
        
        return result;
    };
}

console.log("🎯 Debug patch ready! Try these steps:");
console.log("1. Select a template (Partner Essentials)");
console.log("2. Change the headline field");
console.log("3. Click Save");
console.log("4. Check the console for the tracked events");
