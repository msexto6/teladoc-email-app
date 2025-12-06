// Firebase Storage Module for Email Briefing App
// Provides cloud storage with team collaboration

// Firebase Ready Flag
let firebaseReady = false;
let firebaseReadyPromise = new Promise((resolve) => {
    // Wait for Firebase to be initialized
    const checkFirebase = setInterval(() => {
        if (typeof db !== 'undefined' && db !== null) {
            clearInterval(checkFirebase);
            firebaseReady = true;
            console.log('✓ EmailBriefingDB (Firebase) ready');
            resolve();
        }
    }, 50);
});

const EmailBriefingDB = {
    // ============================================
    // WAIT FOR FIREBASE
    // ============================================
    
    async waitForFirebase() {
        if (!firebaseReady) {
            await firebaseReadyPromise;
        }
    },
    
    // ============================================
    // DESIGNS
    // ============================================
    
    async saveDesign(id, data) {
        await this.waitForFirebase();
        try {
            await db.collection('designs').doc(id).set({
                id: id,
                data: data,
                timestamp: Date.now(),
                projectName: data.projectName || 'Untitled',
                template: data.template || 'standard-template',
                folderId: data.folderId || null
            });
            console.log('✓ Design saved to Firestore:', id);
            return true;
        } catch (error) {
            console.error('✗ Failed to save design:', error);
            throw error;
        }
    },
    
    async getDesign(id) {
        await this.waitForFirebase();
        try {
            const doc = await db.collection('designs').doc(id).get();
            if (doc.exists) {
                return doc.data();
            }
            return null;
        } catch (error) {
            console.error('✗ Failed to get design:', error);
            return null;
        }
    },
    
    async getAllDesigns() {
        await this.waitForFirebase();
        try {
            const snapshot = await db.collection('designs').orderBy('timestamp', 'desc').get();
            const designs = [];
            snapshot.forEach(doc => {
                designs.push(doc.data());
            });
            console.log('✓ Retrieved', designs.length, 'designs from Firestore');
            return designs;
        } catch (error) {
            console.error('✗ Failed to get designs:', error);
            return []; // Return empty array on error
        }
    },
    
    async deleteDesign(id) {
        await this.waitForFirebase();
        try {
            await db.collection('designs').doc(id).delete();
            console.log('✓ Design deleted from Firestore:', id);
            return true;
        } catch (error) {
            console.error('✗ Failed to delete design:', error);
            throw error;
        }
    },
    
    // ============================================
    // EXPORTS
    // ============================================
    
    async saveExport(id, data) {
        await this.waitForFirebase();
        try {
            await db.collection('exports').doc(id).set({
                id: id,
                data: data,
                timestamp: Date.now(),
                projectName: data.projectName || 'Untitled',
                folderId: data.folderId || null
            });
            console.log('✓ Export saved to Firestore:', id);
            return true;
        } catch (error) {
            console.error('✗ Failed to save export:', error);
            throw error;
        }
    },
    
    async getExport(id) {
        await this.waitForFirebase();
        try {
            const doc = await db.collection('exports').doc(id).get();
            if (doc.exists) {
                return doc.data();
            }
            return null;
        } catch (error) {
            console.error('✗ Failed to get export:', error);
            return null;
        }
    },
    
    async getAllExports() {
        await this.waitForFirebase();
        try {
            const snapshot = await db.collection('exports').orderBy('timestamp', 'desc').get();
            const exports = [];
            snapshot.forEach(doc => {
                exports.push(doc.data());
            });
            console.log('✓ Retrieved', exports.length, 'exports from Firestore');
            return exports;
        } catch (error) {
            console.error('✗ Failed to get exports:', error);
            return []; // Return empty array on error
        }
    },
    
    async deleteExport(id) {
        await this.waitForFirebase();
        try {
            await db.collection('exports').doc(id).delete();
            console.log('✓ Export deleted from Firestore:', id);
            return true;
        } catch (error) {
            console.error('✗ Failed to delete export:', error);
            throw error;
        }
    },
    
    // ============================================
    // FOLDERS
    // ============================================
    
    async saveFolder(id, data) {
        await this.waitForFirebase();
        try {
            await db.collection('folders').doc(id).set({
                id: id,
                name: data.name,
                color: data.color || 'purple',
                pageType: data.pageType || 'designs',
                parentPath: data.parentPath || [],
                items: data.items || [],
                createdDate: data.createdDate || new Date().toISOString(),
                timestamp: Date.now()
            });
            console.log('✓ Folder saved to Firestore:', id);
            return true;
        } catch (error) {
            console.error('✗ Failed to save folder:', error);
            throw error;
        }
    },
    
    async getFolder(id) {
        await this.waitForFirebase();
        try {
            const doc = await db.collection('folders').doc(id).get();
            if (doc.exists) {
                return doc.data();
            }
            return null;
        } catch (error) {
            console.error('✗ Failed to get folder:', error);
            return null;
        }
    },
    
    async getAllFolders() {
        await this.waitForFirebase();
        try {
            const snapshot = await db.collection('folders').get();
            const folders = [];
            snapshot.forEach(doc => {
                folders.push(doc.data());
            });
            console.log('✓ Retrieved', folders.length, 'folders from Firestore');
            return folders;
        } catch (error) {
            console.error('✗ Failed to get folders:', error);
            return []; // Return empty array on error
        }
    },
    
    async deleteFolder(id) {
        await this.waitForFirebase();
        try {
            await db.collection('folders').doc(id).delete();
            console.log('✓ Folder deleted from Firestore:', id);
            return true;
        } catch (error) {
            console.error('✗ Failed to delete folder:', error);
            throw error;
        }
    },
    
    // ============================================
    // METADATA (for trash system)
    // ============================================
    
    async saveMeta(id, data) {
        await this.waitForFirebase();
        try {
            await db.collection('metadata').doc(id).set({
                id: id,
                data: JSON.stringify(data),
                timestamp: Date.now()
            });
            return true;
        } catch (error) {
            console.error('✗ Failed to save metadata:', error);
            throw error;
        }
    },
    
    async getMeta(id) {
        await this.waitForFirebase();
        try {
            const doc = await db.collection('metadata').doc(id).get();
            if (doc.exists) {
                return doc.data();
            }
            return null;
        } catch (error) {
            console.error('✗ Failed to get metadata:', error);
            return null;
        }
    },
    
    async getAllMeta() {
        await this.waitForFirebase();
        try {
            const snapshot = await db.collection('metadata').get();
            const metadata = [];
            snapshot.forEach(doc => {
                metadata.push(doc.data());
            });
            return metadata;
        } catch (error) {
            console.error('✗ Failed to get all metadata:', error);
            return []; // Return empty array on error
        }
    },
    
    async deleteMeta(id) {
        await this.waitForFirebase();
        try {
            await db.collection('metadata').doc(id).delete();
            return true;
        } catch (error) {
            console.error('✗ Failed to delete metadata:', error);
            throw error;
        }
    },
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    async getAllItems() {
        await this.waitForFirebase();
        try {
            const designs = await this.getAllDesigns();
            const exports = await this.getAllExports();
            const folders = await this.getAllFolders();
            return [...designs, ...exports, ...folders];
        } catch (error) {
            console.error('✗ Failed to get all items:', error);
            return []; // Return empty array on error
        }
    }
};
