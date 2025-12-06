// Admin Panel Module for Email Briefing App
// Provides hidden admin access to export history and feedback
// UPDATED: Added Feedback tab with Firestore integration

// ============================================
// ADMIN PANEL CONTROLS
// ============================================

function openAdminPanel() {
    const panel = document.getElementById("admin-panel");
    if (!panel) return;
    
    panel.classList.remove("hidden");
    // Load export history by default
    switchAdminTab('export');
}

function closeAdminPanel() {
    const panel = document.getElementById("admin-panel");
    if (!panel) return;
    
    panel.classList.add("hidden");
}

// ============================================
// TAB SWITCHING
// ============================================

function switchAdminTab(tab) {
    // Update tab buttons
    const exportTabBtn = document.getElementById("admin-export-tab-btn");
    const feedbackTabBtn = document.getElementById("admin-feedback-tab-btn");
    const exportContent = document.getElementById("admin-export-content");
    const feedbackContent = document.getElementById("admin-feedback-content");
    
    if (!exportTabBtn || !feedbackTabBtn || !exportContent || !feedbackContent) return;
    
    if (tab === 'export') {
        exportTabBtn.classList.add("active");
        feedbackTabBtn.classList.remove("active");
        exportContent.style.display = "block";
        feedbackContent.style.display = "none";
        loadExportHistory();
    } else if (tab === 'feedback') {
        exportTabBtn.classList.remove("active");
        feedbackTabBtn.classList.add("active");
        exportContent.style.display = "none";
        feedbackContent.style.display = "block";
        loadFeedback();
    }
}

// ============================================
// LOAD EXPORT HISTORY FROM FIREBASE
// ============================================

async function loadExportHistory() {
    const body = document.getElementById("admin-export-content");
    if (!body) return;

    body.innerHTML = "<p style='text-align:center;padding:40px;color:#9B8FC7;'>Loading export history...</p>";

    try {
        // Get date range (last 7 days)
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);

        // Fetch export logs from Firebase
        const logs = await EmailBriefingDB.getExportLogs({
            startDate: sevenDaysAgo,
            endDate: today
        });

        // Render table
        body.innerHTML = renderExportHistoryTable(logs);
        
    } catch (error) {
        console.error("Failed to load export history", error);
        body.innerHTML = "<p style='text-align:center;padding:40px;color:#FF4757;'>Failed to load export history.</p>";
    }
}

// ============================================
// LOAD FEEDBACK FROM FIREBASE
// ============================================

async function loadFeedback(statusFilter = null) {
    const body = document.getElementById("admin-feedback-content");
    if (!body) return;

    body.innerHTML = "<p style='text-align:center;padding:40px;color:#9B8FC7;'>Loading feedback...</p>";

    try {
        // Fetch feedback from Firebase
        const feedbackEntries = await EmailBriefingDB.getAllFeedback({ status: statusFilter });

        // Render table
        body.innerHTML = renderFeedbackTable(feedbackEntries);
        
    } catch (error) {
        console.error("Failed to load feedback", error);
        body.innerHTML = "<p style='text-align:center;padding:40px;color:#FF4757;'>Failed to load feedback.</p>";
    }
}

// ============================================
// RENDER EXPORT HISTORY TABLE
// ============================================

function renderExportHistoryTable(logs) {
    if (!logs || logs.length === 0) {
        return "<p style='text-align:center;padding:40px;color:#9B8FC7;'>No exports found in the last 7 days.</p>";
    }

    const rows = logs.map(log => {
        const date = new Date(log.createdAt || log.timestamp);
        const dateStr = date.toLocaleString();
        const sizeKb = log.sizeBytes ? Math.round(log.sizeBytes / 1024) : "—";
        const folder = (log.folderPath || []).join(" / ") || "—";
        const userName = log.userName || "Unknown";
        const designName = log.designName || "Untitled";
        const templateKey = log.templateKey || "—";
        const designId = log.designId || log.storageKey || "";

        return `
            <tr data-design-id="${designId}">
                <td>${dateStr}</td>
                <td>${userName}</td>
                <td>${designName}</td>
                <td>${templateKey}</td>
                <td>${folder}</td>
                <td>${sizeKb} KB</td>
                <td><button class="admin-open-design-btn">Open design</button></td>
            </tr>
        `;
    }).join("");

    return `
        <div class="admin-filters">
            <p>Showing ${logs.length} exports from the last 7 days.</p>
        </div>
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Design</th>
                    <th>Template</th>
                    <th>Folder</th>
                    <th>Size</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

// ============================================
// RENDER FEEDBACK TABLE
// ============================================

function renderFeedbackTable(feedbackEntries) {
    if (!feedbackEntries || feedbackEntries.length === 0) {
        return "<p style='text-align:center;padding:40px;color:#9B8FC7;'>No feedback entries found.</p>";
    }

    const rows = feedbackEntries.map(entry => {
        const date = new Date(entry.timestamp || entry.createdAt);
        const dateStr = date.toLocaleString();
        const type = entry.type || "bug";
        const typeLabel = type === "bug" ? "🐛 Bug" : "💡 Enhancement";
        const blocking = entry.blocking ? "⚠️ Blocking" : "";
        const description = entry.description || "";
        const location = entry.location || "—";
        const status = entry.status || "unread";
        const statusClass = status === "resolved" ? "status-resolved" : status === "reviewed" ? "status-reviewed" : "status-unread";
        
        // Truncate description to 100 chars
        const shortDesc = description.length > 100 ? description.substring(0, 100) + "..." : description;

        return `
            <tr data-feedback-id="${entry.id}">
                <td>${dateStr}</td>
                <td>${typeLabel} ${blocking}</td>
                <td>${location}</td>
                <td title="${description}">${shortDesc}</td>
                <td>
                    <select class="admin-status-dropdown ${statusClass}" data-feedback-id="${entry.id}">
                        <option value="unread" ${status === "unread" ? "selected" : ""}>Unread</option>
                        <option value="reviewed" ${status === "reviewed" ? "selected" : ""}>Reviewed</option>
                        <option value="resolved" ${status === "resolved" ? "selected" : ""}>Resolved</option>
                    </select>
                </td>
                <td><button class="admin-delete-feedback-btn" data-feedback-id="${entry.id}">Delete</button></td>
            </tr>
        `;
    }).join("");

    return `
        <div class="admin-filters">
            <p>Showing ${feedbackEntries.length} feedback entries.</p>
            <div class="admin-filter-buttons">
                <button class="admin-filter-btn" onclick="loadFeedback(null)">All</button>
                <button class="admin-filter-btn" onclick="loadFeedback('unread')">Unread</button>
                <button class="admin-filter-btn" onclick="loadFeedback('reviewed')">Reviewed</button>
                <button class="admin-filter-btn" onclick="loadFeedback('resolved')">Resolved</button>
            </div>
        </div>
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

// ============================================
// OPEN DESIGN FROM ADMIN PANEL
// ============================================

async function openDesignFromAdmin(designId) {
    console.log("[Admin] Open design for key:", designId);
    
    if (!designId) {
        console.error("[Admin] No design ID provided");
        return;
    }
    
    // Close admin panel
    closeAdminPanel();
    
    // Navigate to My Designs screen first
    showScreen('my-designs');
    
    // Small delay to allow screen transition
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Delegate to the existing Load Pipeline v2 loader
    console.log("[Admin] Delegating to loadDesignFromCard");
    
    if (typeof loadDesignFromCard === 'function') {
        try {
            await loadDesignFromCard(designId);
            console.log("[Admin] ✓ Design loaded successfully");
        } catch (error) {
            console.error("[Admin] ✗ Error loading design:", error);
            showModal("Error Loading Design", "Could not load this design. It may have been deleted or corrupted.");
        }
    } else {
        console.error("[Admin] loadDesignFromCard function not found");
        showModal("Error", "Design loading function not available. Please refresh the page.");
    }
}

// ============================================
// UPDATE FEEDBACK STATUS
// ============================================

async function updateFeedbackStatus(feedbackId, newStatus) {
    try {
        await EmailBriefingDB.updateFeedbackStatus(feedbackId, newStatus);
        console.log("[Admin] Feedback status updated:", feedbackId, "->", newStatus);
    } catch (error) {
        console.error("[Admin] Failed to update feedback status:", error);
    }
}

// ============================================
// DELETE FEEDBACK
// ============================================

async function deleteFeedback(feedbackId) {
    if (!confirm("Are you sure you want to delete this feedback entry?")) {
        return;
    }
    
    try {
        await EmailBriefingDB.deleteFeedback(feedbackId);
        console.log("[Admin] Feedback deleted:", feedbackId);
        // Reload feedback table
        loadFeedback();
    } catch (error) {
        console.error("[Admin] Failed to delete feedback:", error);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

// Close button
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById("admin-panel-close");
    if (closeBtn) {
        closeBtn.addEventListener("click", closeAdminPanel);
    }
    
    // Click backdrop to close
    const backdrop = document.querySelector(".admin-panel__backdrop");
    if (backdrop) {
        backdrop.addEventListener("click", closeAdminPanel);
    }
    
    // Tab buttons
    const exportTabBtn = document.getElementById("admin-export-tab-btn");
    const feedbackTabBtn = document.getElementById("admin-feedback-tab-btn");
    
    if (exportTabBtn) {
        exportTabBtn.addEventListener("click", () => switchAdminTab('export'));
    }
    
    if (feedbackTabBtn) {
        feedbackTabBtn.addEventListener("click", () => switchAdminTab('feedback'));
    }
});

// Delegated click handler for "Open design" buttons
document.addEventListener("click", (event) => {
    const btn = event.target.closest(".admin-open-design-btn");
    if (!btn) return;

    const row = btn.closest("tr");
    const designId = row?.dataset.designId;
    if (!designId) {
        console.warn("[Admin] No design ID found on row");
        return;
    }

    openDesignFromAdmin(designId);
});

// Delegated change handler for status dropdowns
document.addEventListener("change", (event) => {
    const dropdown = event.target.closest(".admin-status-dropdown");
    if (!dropdown) return;

    const feedbackId = dropdown.dataset.feedbackId;
    const newStatus = dropdown.value;
    
    if (!feedbackId) {
        console.warn("[Admin] No feedback ID found on dropdown");
        return;
    }

    updateFeedbackStatus(feedbackId, newStatus);
});

// Delegated click handler for "Delete feedback" buttons
document.addEventListener("click", (event) => {
    const btn = event.target.closest(".admin-delete-feedback-btn");
    if (!btn) return;

    const feedbackId = btn.dataset.feedbackId;
    if (!feedbackId) {
        console.warn("[Admin] No feedback ID found on button");
        return;
    }

    deleteFeedback(feedbackId);
});

// Admin hotspot click handlers (both subnav ribbons)
document.addEventListener('DOMContentLoaded', () => {
    const hotspot1 = document.getElementById("admin-access-hotspot");
    const hotspot2 = document.getElementById("admin-access-hotspot-mydesigns");
    
    if (hotspot1) {
        hotspot1.addEventListener("click", (event) => {
            openAdminPanel();
        });
    }
    
    if (hotspot2) {
        hotspot2.addEventListener("click", (event) => {
            openAdminPanel();
        });
    }
});

console.log('✓ Admin panel module loaded with feedback support');
