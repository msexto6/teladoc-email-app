// IndexedDB Storage Module for Email Briefing App
// Provides clean API similar to localStorage but with 50GB+ capacity

const DB_NAME = 'EmailBriefingDB';
const DB_VERSION = 1;
let db = null;

// ============================================
// DATABASE INITIALIZATION
// ============================================

async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => {
            console.error('IndexedDB failed to open:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            db = request.result;
            console.log('✓ IndexedDB initialized successfully');
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object stores (tables)
            if (!db.objectStoreNames.contains('designs')) {
                const designsStore = db.createObjectStore('designs', { keyPath: 'id' });
                designsStore.createIndex('timestamp', 'timestamp', { unique: false });
                designsStore.createIndex('projectName', 'projectName', { unique: false });
                console.log('✓ Created "designs" object store');
            }
            
            if (!db.objectStoreNames.contains('exports')) {
                const exportsStore = db.createObjectStore('exports', { keyPath: 'id' });
                exportsStore.createIndex('timestamp', 'timestamp', { unique: false });
                exportsStore.createIndex('projectName', 'projectName', { unique: false });
                console.log('✓ Created "exports" object store');
            }
            
            if (!db.objectStoreNames.contains('folders')) {
                const foldersStore = db.createObjectStore('folders', { keyPath: 'id' });
                foldersStore.createIndex('name', 'name', { unique: false });
                console.log('✓ Created "folders" object store');
            }
            
            if (!db.objectStoreNames.contains('metadata')) {
                const metadataStore = db.createObjectStore('metadata', { keyPath: 'key' });
                console.log('✓ Created "metadata" object store');
            }
        };
    });
}

// ============================================
// CORE STORAGE OPERATIONS
// ============================================

// Save a design or export
async function saveItem(storeName, id, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        const item = {
            id: id,
            timestamp: Date.now(),
            ...data
        };
        
        const request = store.put(item);
        
        request.onsuccess = () => resolve(item);
        request.onerror = () => reject(request.error);
    });
}

// Get a single item by ID
async function getItem(storeName, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Get all items from a store
async function getAllItems(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

// Delete an item
async function deleteItem(storeName, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

// Clear entire store
async function clearStore(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

// ============================================
// CONVENIENCE WRAPPERS (localStorage-like API)
// ============================================

const EmailBriefingDB = {
    // Initialize database (call on app load)
    init: async function() {
        await initDB();
    },
    
    // Designs
    saveDesign: async function(id, data) {
        return await saveItem('designs', id, data);
    },
    
    getDesign: async function(id) {
        return await getItem('designs', id);
    },
    
    getAllDesigns: async function() {
        return await getAllItems('designs');
    },
    
    deleteDesign: async function(id) {
        return await deleteItem('designs', id);
    },
    
    // Exports
    saveExport: async function(id, data) {
        return await saveItem('exports', id, data);
    },
    
    getExport: async function(id) {
        return await getItem('exports', id);
    },
    
    getAllExports: async function() {
        return await getAllItems('exports');
    },
    
    deleteExport: async function(id) {
        return await deleteItem('exports', id);
    },
    
    // Folders
    saveFolder: async function(id, data) {
        return await saveItem('folders', id, data);
    },
    
    getFolder: async function(id) {
        return await getItem('folders', id);
    },
    
    getAllFolders: async function() {
        return await getAllItems('folders');
    },
    
    deleteFolder: async function(id) {
        return await deleteItem('folders', id);
    },
    
    // Metadata (for app settings, folder structure, etc.)
    saveMeta: async function(key, value) {
        return await saveItem('metadata', key, { value: value });
    },
    
    getMeta: async function(key) {
        const item = await getItem('metadata', key);
        return item ? item.value : null;
    },
    
    deleteMeta: async function(key) {
        return await deleteItem('metadata', key);
    },
    
    // Utility: Get all items (designs + exports combined)
    getAllItems: async function() {
        const designs = await getAllItems('designs');
        const exports = await getAllItems('exports');
        return [...designs, ...exports];
    },
    
    // Utility: Check if item exists
    itemExists: async function(id) {
        let item = await getItem('designs', id);
        if (item) return true;
        item = await getItem('exports', id);
        return !!item;
    }
};

// Initialize on load
console.log('IndexedDB module loaded, waiting for init...');
