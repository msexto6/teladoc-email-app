// Firebase Storage Module for Email Briefing App
// Provides cloud storage with team collaboration
// PHASE 3: Updated exports to store metadata only (no ZIP blobs)
// SPRINT B: Added share snapshot API for short URL sharing
// FEEDBACK SYSTEM: Added feedback collection and retrieval methods

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
            // Process the design data to ensure images are URLs only
            const designData = { ...data };
            
            // If uploadedImages exists in the data, ensure they are URLs only
            if (designData.uploadedImages) {
                const processedImages = {};
                for (const [slot, imageData] of Object.entries(designData.uploadedImages)) {
                    // Store only the URL string (whether it's a Firebase Storage URL or legacy Base64)
                    processedImages[slot] = imageData;
                }
                designData.uploadedImages = processedImages;
            }
            
            // TASK 5: Safety guard to prevent Base64 bomb from crashing sync
            const documentToSave = {
                id: id,
                data: designData,
                timestamp: Date.now(),
                projectName: designData.projectName || 'Untitled',
                template: designData.template || 'standard-template',
                folderId: designData.folderId || null
            };
            
            const documentSize = JSON.stringify(documentToSave).length;
            if (documentSize > 950000) {
                console.warn(`Design too large (${documentSize} bytes) — images must be URLs.`);
                alert("Project too large to save. One or more images may not have uploaded properly. Please remove or re-upload large images.");
                return false;
            }
            
            await db.collection('designs').doc(id).set(documentToSave);
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
    // SHARE SNAPSHOTS (SPRINT B)
    // Collection: "shares"
    // Document shape:
    // {
    //   designKey: string,      // Source design key (for reference)
    //   templateKey: string,    // Template identifier
    //   formData: object,       // Form field values
    //   uploadedImages: object, // Image URLs
    //   projectName: string,    // Display name
    //   creativeDirection: string, // Creative direction value
    //   createdAt: number,      // Timestamp
    //   version: string         // Schema version
    // }
    // ============================================
    
    /**
     * Save a share snapshot to Firestore
     * Creates a document in the "shares" collection with design state
     * 
     * @param {string} designKey - The current design's storage key (may be null for unsaved designs)
     * @param {Object} payload - The share payload containing design state
     * @param {string} payload.templateKey - Template identifier
     * @param {Object} payload.formData - Form field values
     * @param {Object} payload.uploadedImages - Image URLs
     * @param {string} payload.projectName - Project display name
     * @param {string} payload.creativeDirection - Creative direction value
     * @returns {Promise<string>} The generated shareId
     */
    async saveShareSnapshot(designKey, payload) {
        await this.waitForFirebase();
        try {
            // Build the share document
            const shareDoc = {
                designKey: designKey || null,
                templateKey: payload.templateKey,
                formData: payload.formData || {},
                uploadedImages: payload.uploadedImages || {},
                projectName: payload.projectName || 'Shared Email',
                creativeDirection: payload.creativeDirection || '',
                createdAt: Date.now(),
                version: '2.0'
            };
            
            // Safety check: ensure document isn't too large
            const docSize = JSON.stringify(shareDoc).length;
            if (docSize > 950000) {
                console.error('✗ Share snapshot too large:', docSize, 'bytes');
                throw new Error('Share data too large. Please remove some images and try again.');
            }
            
            // Use Firestore auto-generated ID for the share
            const docRef = await db.collection('shares').add(shareDoc);
            const shareId = docRef.id;
            
            console.log('✓ Share snapshot saved to Firestore:', shareId);
            console.log('  Document size:', docSize, 'bytes');
            console.log('  Template:', shareDoc.templateKey);
            console.log('  Images:', Object.keys(shareDoc.uploadedImages).length);
            
            return shareId;
        } catch (error) {
            console.error('✗ Failed to save share snapshot:', error);
            throw error;
        }
    },
    
    /**
     * Load a share snapshot from Firestore
     * Retrieves the share document by its ID
     * 
     * @param {string} shareId - The share document ID
     * @returns {Promise<Object|null>} The share data or null if not found
     * Returns: { templateKey, formData, uploadedImages, designKey, projectName, creativeDirection, createdAt }
     */
    async loadShareSnapshot(shareId) {
        await this.waitForFirebase();
        try {
            if (!shareId || typeof shareId !== 'string') {
                console.error('✗ Invalid shareId provided:', shareId);
                return null;
            }
            
            const doc = await db.collection('shares').doc(shareId).get();
            
            if (!doc.exists) {
                console.warn('✗ Share snapshot not found:', shareId);
                return null;
            }
            
            const data = doc.data();
            
            console.log('✓ Share snapshot loaded from Firestore:', shareId);
            console.log('  Template:', data.templateKey);
            console.log('  Created:', new Date(data.createdAt).toLocaleString());
            
            // Return normalized shape
            return {
                templateKey: data.templateKey,
                formData: data.formData || {},
                uploadedImages: data.uploadedImages || {},
                designKey: data.designKey || null,
                projectName: data.projectName || 'Shared Email',
                creativeDirection: data.creativeDirection || '',
                createdAt: data.createdAt,
                version: data.version || '1.0'
            };
        } catch (error) {
            console.error('✗ Failed to load share snapshot:', error);
            return null;
        }
    },
    
    // ============================================
    // EXPORTS (PHASE 3: METADATA ONLY)
    // ============================================
    
    /**
     * Save export metadata to Firestore (no ZIP blob)
     * Automatically determines folder from the source design being exported.
     * If design has no folder, defaults to "My Designs" (root/null).
     * 
     * @param {Object} exportMeta - Export metadata object
     * @param {string} exportMeta.designId - Source design ID
     * @param {string} exportMeta.designName - Human-readable name
     * @param {string} exportMeta.templateKey - Template used
     * @param {number} exportMeta.sizeBytes - ZIP file size
     * @param {number} exportMeta.createdAt - Timestamp
     * @param {string} exportMeta.fileName - Download filename
     */
    async saveExportMetadata(exportMeta) {
        await this.waitForFirebase();
        try {
            // Auto-determine folder from source design
            let folderId = null;
            
            if (exportMeta.designId) {
                try {
                    const sourceDesign = await this.getDesign(exportMeta.designId);
                    if (sourceDesign && sourceDesign.folderId) {
                        folderId = sourceDesign.folderId;
                        console.log(`📁 Export inheriting folder from design: ${folderId}`);
                    } else {
                        console.log(`📁 Export defaulting to My Designs (root)`);
                    }
                } catch (err) {
                    console.warn('Could not retrieve source design folder, defaulting to root:', err);
                }
            }
            
            const exportDoc = {
                designId: exportMeta.designId || null,
                designName: exportMeta.designName || 'Untitled',
                templateKey: exportMeta.templateKey || null,
                sizeBytes: exportMeta.sizeBytes || null,
                fileName: exportMeta.fileName || null,
                folderId: folderId, // Auto-assigned from source design
                createdAt: exportMeta.createdAt || Date.now(),
                timestamp: Date.now() // For ordering
            };
            
            // Generate unique ID for export metadata
            const exportId = 'export-meta-' + Date.now();
            
            await db.collection('exports').doc(exportId).set(exportDoc);
            console.log('✅ Export metadata saved with auto-folder:', exportDoc);
            return true;
        } catch (error) {
            console.error('✗ Failed to save export metadata:', error);
            throw error;
        }
    },
    
    /**
     * Legacy saveExport - now redirects to metadata-only save
     * @deprecated Use saveExportMetadata instead
     */
    async saveExport(id, data) {
        console.warn('saveExport (legacy) called - redirecting to metadata-only save');
        
        // Extract metadata from old format
        const exportMeta = {
            designId: data.sourceProject || id,
            designName: data.projectName || 'Untitled',
            templateKey: data.template || null,
            sizeBytes: data.fileData ? data.fileData.length : null,
            fileName: data.fileName || data.projectName || 'export.zip',
            createdAt: Date.now()
        };
        
        return await this.saveExportMetadata(exportMeta);
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
            console.log('✓ Retrieved', exports.length, 'export metadata entries from Firestore');
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
            console.log('✓ Export metadata deleted from Firestore:', id);
            return true;
        } catch (error) {
            console.error('✗ Failed to delete export:', error);
            throw error;
        }
    },
    
    /**
     * Get export logs filtered by date range
     * @param {Object} options - Query options
     * @param {Date|string} options.startDate - Start date (inclusive)
     * @param {Date|string} options.endDate - End date (inclusive)
     * @returns {Promise<Array>} Array of export log entries
     */
    async getExportLogs({ startDate, endDate }) {
        await this.waitForFirebase();
        try {
            // Convert dates to timestamps
            let startTimestamp = startDate;
            let endTimestamp = endDate;
            
            if (startDate instanceof Date) {
                startTimestamp = startDate.getTime();
            } else if (typeof startDate === 'string') {
                startTimestamp = new Date(startDate).getTime();
            }
            
            if (endDate instanceof Date) {
                endTimestamp = endDate.getTime();
            } else if (typeof endDate === 'string') {
                endTimestamp = new Date(endDate).getTime();
            }
            
            // Query Firestore for exports in date range
            const snapshot = await db.collection('exports')
                .where('createdAt', '>=', startTimestamp)
                .where('createdAt', '<=', endTimestamp)
                .orderBy('createdAt', 'desc')
                .get();
            
            const logs = [];
            snapshot.forEach(doc => {
                logs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`✓ Retrieved ${logs.length} export logs between ${new Date(startTimestamp).toLocaleDateString()} and ${new Date(endTimestamp).toLocaleDateString()}`);
            return logs;
            
        } catch (error) {
            console.error('✗ Failed to get export logs:', error);
            return []; // Return empty array on error
        }
    },
    
    // ============================================
    // FEEDBACK
    // ============================================
    
    /**
     * Save feedback submission to Firestore
     * @param {Object} feedback - Feedback object
     * @param {string} feedback.type - "bug" or "enhancement"
     * @param {string} feedback.description - User's feedback description
     * @param {string} feedback.location - Where in the app
     * @param {boolean} feedback.blocking - Is it blocking work?
     * @param {string} feedback.userAgent - Browser user agent
     * @param {string} feedback.url - Current URL
     * @param {number} feedback.timestamp - When submitted
     * @returns {Promise<string>} The generated feedback ID
     */
    async saveFeedback(feedback) {
        await this.waitForFirebase();
        try {
            const feedbackDoc = {
                type: feedback.type || 'bug',
                description: feedback.description || '',
                location: feedback.location || '',
                blocking: feedback.blocking || false,
                userAgent: feedback.userAgent || '',
                url: feedback.url || '',
                timestamp: feedback.timestamp || Date.now(),
                status: 'unread', // Default status: unread, reviewed, resolved
                createdAt: feedback.timestamp || Date.now()
            };
            
            // Use Firestore auto-generated ID
            const docRef = await db.collection('feedback').add(feedbackDoc);
            const feedbackId = docRef.id;
            
            console.log('✓ Feedback saved to Firestore:', feedbackId);
            return feedbackId;
        } catch (error) {
            console.error('✗ Failed to save feedback:', error);
            throw error;
        }
    },
    
    /**
     * Get all feedback entries
     * @param {Object} options - Query options
     * @param {string} options.status - Filter by status: "unread", "reviewed", "resolved"
     * @returns {Promise<Array>} Array of feedback entries
     */
    async getAllFeedback({ status } = {}) {
        await this.waitForFirebase();
        try {
            let query = db.collection('feedback').orderBy('timestamp', 'desc');
            
            // Apply status filter if provided
            if (status) {
                query = query.where('status', '==', status);
            }
            
            const snapshot = await query.get();
            const feedback = [];
            snapshot.forEach(doc => {
                feedback.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`✓ Retrieved ${feedback.length} feedback entries from Firestore`);
            return feedback;
        } catch (error) {
            console.error('✗ Failed to get feedback:', error);
            return [];
        }
    },
    
    /**
     * Update feedback status
     * @param {string} feedbackId - The feedback document ID
     * @param {string} status - New status: "unread", "reviewed", "resolved"
     * @returns {Promise<boolean>} Success status
     */
    async updateFeedbackStatus(feedbackId, status) {
        await this.waitForFirebase();
        try {
            await db.collection('feedback').doc(feedbackId).update({
                status: status,
                updatedAt: Date.now()
            });
            console.log('✓ Feedback status updated:', feedbackId, '->', status);
            return true;
        } catch (error) {
            console.error('✗ Failed to update feedback status:', error);
            throw error;
        }
    },
    
    /**
     * Delete a feedback entry
     * @param {string} feedbackId - The feedback document ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteFeedback(feedbackId) {
        await this.waitForFirebase();
        try {
            await db.collection('feedback').doc(feedbackId).delete();
            console.log('✓ Feedback deleted from Firestore:', feedbackId);
            return true;
        } catch (error) {
            console.error('✗ Failed to delete feedback:', error);
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
            // TASK 5: Safety guard for metadata saves
            const documentToSave = {
                id: id,
                data: JSON.stringify(data),
                timestamp: Date.now()
            };
            
            const documentSize = JSON.stringify(documentToSave).length;
            if (documentSize > 950000) {
                console.warn(`Metadata too large (${documentSize} bytes) to save.`);
                return false;
            }
            
            await db.collection('metadata').doc(id).set(documentToSave);
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
    },
    
    // ============================================
    // FIREBASE STORAGE - IMAGE UPLOAD
    // ============================================
    
    async uploadImage(file) {
        await this.waitForFirebase();
        try {
            const uniqueName = 'images/' + Date.now() + '-' + file.name;
            const storageRef = firebase.storage().ref().child(uniqueName);
            await storageRef.put(file);
            const downloadURL = await storageRef.getDownloadURL();
            console.log('✓ Image uploaded to Firebase Storage:', uniqueName);
            return downloadURL;
        } catch (error) {
            console.error('✗ Failed to upload image:', error);
            throw error;
        }
    }
};
