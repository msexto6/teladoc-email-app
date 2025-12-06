/**
 * Custom Alert and Confirm Dialogs
 * Replaces browser's alert() and confirm() with styled modals
 */

// Create custom alert modal
function customAlert(message) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'custom-dialog-overlay active';
        modal.innerHTML = `
            <div class="custom-dialog-content">
                <p class="custom-dialog-message">${message}</p>
                <div class="custom-dialog-buttons">
                    <button class="custom-dialog-btn">OK</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const btn = modal.querySelector('.custom-dialog-btn');
        btn.addEventListener('click', () => {
            modal.remove();
            resolve();
        });
    });
}

// Create custom confirm modal
function customConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'custom-dialog-overlay active';
        modal.innerHTML = `
            <div class="custom-dialog-content">
                <p class="custom-dialog-message">${message}</p>
                <div class="custom-dialog-buttons">
                    <button class="custom-dialog-btn custom-dialog-btn-primary">OK</button>
                    <button class="custom-dialog-btn custom-dialog-btn-ghost">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const okBtn = modal.querySelector('.custom-dialog-btn-primary');
        const cancelBtn = modal.querySelector('.custom-dialog-btn-ghost');
        
        okBtn.addEventListener('click', () => {
            modal.remove();
            resolve(true);
        });
        
        cancelBtn.addEventListener('click', () => {
            modal.remove();
            resolve(false);
        });
    });
}

// Override global alert and confirm
window.alert = customAlert;
window.confirm = customConfirm;
