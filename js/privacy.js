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
    // Controls are unified in main.js
    const privacyPanel = document.getElementById('privacy-panel');
    if (!privacyPanel) return;
}

// Export for compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initPrivacyControls };
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
