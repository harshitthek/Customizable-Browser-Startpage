// ==========================================
// PRIVACY & DATA MANAGEMENT MODULE
// ==========================================
// This module handles user privacy settings
// and data management (clear all data)
// ==========================================

/**
 * Initialize privacy controls and event listeners
 * Called on page load from main.js
 */
function initPrivacyControls() {
    // Get DOM elements
    const privacyBtn = document.getElementById('privacy-btn');
    const privacyPanel = document.getElementById('privacy-panel');
    const clearAllBtn = document.getElementById('clear-all-data-btn');

    // Guard clause: exit if elements don't exist
    if (!privacyBtn || !privacyPanel) {
        console.warn('Privacy panel elements not found');
        return;
    }

    // ========================================
    // Toggle Privacy Panel
    // ========================================
    privacyBtn.addEventListener('click', () => {
        // Toggle visibility of privacy panel
        privacyPanel.classList.toggle('hidden');

        // Close other panels when opening privacy panel
        document.querySelectorAll('.panel:not(#privacy-panel)').forEach(panel => {
            panel.classList.add('hidden');
        });
    });

    // ========================================
    // Clear All Data Handler
    // ========================================
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            // Double confirmation to prevent accidental data loss
            const confirmed = confirm(
                '⚠️ WARNING: This will delete ALL your data including:\\n' +
                '• Bookmarks\\n' +
                '• Settings\\n' +
                '• Themes\\n' +
                '• Background preferences\\n\\n' +
                'This action cannot be undone. Continue?'
            );

            if (confirmed) {
                // Final confirmation
                const doubleConfirm = confirm('Are you absolutely sure? This cannot be undone!');

                if (doubleConfirm) {
                    // Clear all localStorage data
                    localStorage.clear();

                    // Notify user and reload
                    alert('✅ All data has been cleared. Page will now reload.');
                    window.location.reload();
                }
            }
        });
    }
}

// ========================================
// AUTO-INITIALIZE when DOM is ready
// ========================================
// This ensures privacy controls are set up
// as soon as the page loads
// ========================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrivacyControls);
} else {
    initPrivacyControls();
}
