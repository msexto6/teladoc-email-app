// Initialize folder and trash functionality
document.addEventListener('DOMContentLoaded', async function() {
    await setupTrashBin();
    setupNewFolderButton();
    updateBreadcrumb();
});
