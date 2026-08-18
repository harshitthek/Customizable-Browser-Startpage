// --- Element References ---
const clockElement = document.getElementById('clock');
const greetingElement = document.getElementById('greeting');
const nameElement = document.getElementById('name');
const dateElement = document.getElementById('date');
const linksContainer = document.getElementById('links-container');
const addLinkBtn = document.getElementById('add-link-btn');
const addLinkModal = document.getElementById('add-link-modal');
// Safely query elements that might be missing in some states
const closeBtn = addLinkModal ? addLinkModal.querySelector('.close-btn') : null;
const cancelBtn = document.getElementById('cancel-btn');
const addLinkForm = document.getElementById('add-link-form');
const linkNameInput = document.getElementById('link-name-input');
const linkUrlInput = document.getElementById('link-url-input');
const modalTitle = document.getElementById('modal-title');
const modalSubmitBtn = document.getElementById('modal-submit-btn');
const themeBtn = document.getElementById('theme-btn');
const themePanel = document.getElementById('theme-panel');
const customThemeBtn = document.getElementById('custom-theme-btn');
const customThemePanel = document.getElementById('custom-theme-panel');
const accentColorInput = document.getElementById('accent-color-input');
const saveCustomThemeBtn = document.getElementById('save-custom-theme-btn');
const backToThemesBtn = document.getElementById('back-to-themes-btn');
const contextMenu = document.getElementById('context-menu');
const contextEditBtn = document.getElementById('context-edit-btn');
const contextDeleteBtn = document.getElementById('context-delete-btn');

// --- Data & State ---
let links = [];
let editingLinkIndex = null;
let contextMenuLinkIndex = null;
let lastFocusedElement = null;
let interactiveEffectsInitialized = false;
let ghClickHandler = null;

// --- Functions ---
function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            alert('Storage quota exceeded. Cannot save settings or background image. Please use a smaller image or a URL.');
            console.error('Storage quota exceeded', e);
        } else {
            console.error('Error saving to localStorage', e);
        }
    }
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    const msgSpan = document.createElement('span');
    msgSpan.className = 'toast-message';
    msgSpan.textContent = message;
    toast.appendChild(msgSpan);
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
}

function trapFocus(element, e) {
    const focusableEls = element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="url"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (focusableEls.length === 0) return;
    
    const firstFocusableEl = focusableEls[0];  
    const lastFocusableEl = focusableEls[focusableEls.length - 1];

    if (e.key === 'Tab') {
        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstFocusableEl || document.activeElement === element) {
                lastFocusableEl.focus();
                e.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastFocusableEl) {
                firstFocusableEl.focus();
                e.preventDefault();
            }
        }
    }
}

function setDate() {
    if (!dateElement) return;
    const now = new Date();
    const format = localStorage.getItem('dateFormat') || 'full';
    
    if (format === 'short') {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString(undefined, options);
    } else if (format === 'iso') {
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        dateElement.textContent = `${year}-${month}-${day}`;
    } else {
        // Default: full
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString(undefined, options);
    }
}

function updateClock() {
    const clockElement = document.getElementById('clock');
    if (!clockElement) return;

    const savedFont = localStorage.getItem('clockFont');
    if (savedFont) {
        clockElement.style.fontFamily = savedFont;
    }

    const now = new Date();
    const use24Hr = localStorage.getItem('clock24hr') === 'true';
    const showSeconds = localStorage.getItem('clockSeconds') !== 'false';

    let hours = now.getHours();
    let minutes = now.getMinutes();
    const seconds = now.getSeconds();
    let ampm = '';

    if (!use24Hr) {
        ampm = hours >= 12 ? ' PM' : ' AM';
        hours = hours % 12 || 12;
    }

    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');

    if (showSeconds) {
        clockElement.textContent = `${h}:${m}:${s}${ampm}`;
    } else {
        clockElement.textContent = `${h}:${m}${ampm}`;
    }
}

function updateGreeting() {
    const now = new Date();
    const hour = now.getHours();
    const greetingText = hour < 12 ? "Good morning, "
        : hour < 18 ? "Good afternoon, "
            : "Good evening, ";
    if (greetingElement) {
        const textNode = Array.from(greetingElement.childNodes)
            .find(node => node.nodeType === Node.TEXT_NODE);
        if (textNode) textNode.textContent = greetingText;
    }
}

function handleName() {
    const savedName = localStorage.getItem('username');
    if (nameElement) nameElement.textContent = savedName || "Guest";
}

function renderLinks() {
    if (!linksContainer) return;
    linksContainer.replaceChildren();
    links.forEach((link, index) => {
        const linkItem = document.createElement('div');
        linkItem.className = 'link-item';
        linkItem.dataset.index = index;
        linkItem.draggable = true;
        linkItem.title = 'Drag to reorder';

        const linkAnchor = document.createElement('a');
        linkAnchor.className = 'link-anchor';
        linkAnchor.href = link.url;
        linkAnchor.target = '_blank';
        linkAnchor.rel = 'noopener noreferrer';

        const iconContainer = document.createElement('div');
        iconContainer.className = 'icon-container';
        const faviconImg = document.createElement('img');
        faviconImg.className = 'favicon';
        try { const hostname = new URL(link.url).hostname; faviconImg.src = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`; } catch { faviconImg.src = ''; }
        faviconImg.alt = link.name + ' favicon';
        faviconImg.onerror = () => {
            iconContainer.replaceChildren();
            const fallback = document.createElement('span');
            fallback.className = 'fallback-icon';
            fallback.textContent = (link.name || '?').charAt(0).toUpperCase();
            iconContainer.appendChild(fallback);
        };
        iconContainer.appendChild(faviconImg);

        const nameLabel = document.createElement('span');
        nameLabel.className = 'link-name';
        nameLabel.textContent = link.name;

        linkAnchor.appendChild(iconContainer);
        linkAnchor.appendChild(nameLabel);

        const linkActions = document.createElement('div');
        linkActions.className = 'link-actions';
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.title = 'Edit link';
        editBtn.setAttribute('aria-label', `Edit bookmark ${link.name}`);
        editBtn.textContent = '✏️';
        editBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openEditModal(index); });
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.title = 'Delete link';
        deleteBtn.setAttribute('aria-label', `Delete bookmark ${link.name}`);
        deleteBtn.textContent = 'x';
        deleteBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); deleteLink(index, linkItem); });
        linkActions.appendChild(editBtn);
        linkActions.appendChild(deleteBtn);

        linkItem.appendChild(linkAnchor);
        linkItem.appendChild(linkActions);
        linksContainer.appendChild(linkItem);
    });
}

function saveLinks() { safeSetItem('savedLinks', JSON.stringify(links)); }

function deleteLink(index, linkElement) {
    if (confirm("Are you sure you want to delete this link?")) {
        if (linkElement) linkElement.style.opacity = 0; // Basic fade out
        setTimeout(() => { links.splice(index, 1); saveLinks(); renderLinks(); }, 300);
    }
}
function loadLinks() {
    const savedLinks = localStorage.getItem('savedLinks');
    if (savedLinks) links = JSON.parse(savedLinks);
    renderLinks();
}

function applyAccentColor(color) { // Needed for custom theme
    document.body.style.setProperty('--accent-color', color);
}

function applyTheme(theme) {
    // Only remove custom accent if NOT applying custom theme
    if (theme !== 'custom') {
        document.body.style.removeProperty('--accent-color');
    }
    document.body.dataset.theme = theme;
    safeSetItem('savedTheme', theme);

    // Update active class on swatch cards
    document.querySelectorAll('.theme-swatch-card').forEach(card => {
        card.classList.toggle('active', card.dataset.theme === theme);
    });

    // Apply custom accent color if custom theme is active
    if (theme === 'custom') {
        const savedAccent = localStorage.getItem('customAccentColor');
        if (savedAccent) applyAccentColor(savedAccent);
    }
    // Dev Dashboard lifecycle management
    if (window.DevDashboard) {
        if (theme === 'dev') {
            window.DevDashboard.start();
        } else {
            window.DevDashboard.stop();
        }
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('savedTheme') || 'slate';
    applyTheme(savedTheme);
}

function openEditModal(index) {
    lastFocusedElement = document.activeElement;
    editingLinkIndex = index;
    const link = links[index];
    if (modalTitle) modalTitle.textContent = 'Edit Link';
    if (modalSubmitBtn) modalSubmitBtn.textContent = 'Save Changes';
    if (linkNameInput) linkNameInput.value = link.name;
    if (linkUrlInput) linkUrlInput.value = link.url;
    
    const previewImg = document.getElementById('modal-favicon-img');
    const previewName = document.getElementById('modal-preview-name');
    if (previewName) previewName.textContent = link.name;
    if (previewImg) {
        try {
            const parsed = new URL(link.url);
            previewImg.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(parsed.hostname)}&sz=128`;
        } catch {
            previewImg.src = 'https://www.google.com/s2/favicons?domain=example.com&sz=128';
        }
    }

    if (addLinkModal) addLinkModal.classList.remove('hidden');
    setTimeout(() => { if (linkNameInput) linkNameInput.focus(); }, 50);
}

function closeModal() {
    if (addLinkForm) addLinkForm.reset();
    if (addLinkModal) addLinkModal.classList.add('hidden');
    editingLinkIndex = null;
    if (modalTitle) modalTitle.textContent = 'Add New Link';
    if (modalSubmitBtn) modalSubmitBtn.textContent = 'Add Link';
    if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }
}

// REPLACE your existing initializeInteractiveEffects function with this one:
function initializeInteractiveEffects() {
    if (interactiveEffectsInitialized) return;
    interactiveEffectsInitialized = true;
    console.log("Initializing interactive effects..."); // Check if function runs

    // Hide context menu on any click outside
    document.addEventListener('click', (e) => {
        if (contextMenu && !contextMenu.contains(e.target) && !e.target.closest('.link-item')) {
            console.log("Clicked outside context menu, hiding.");
            contextMenu.classList.add('hidden');
        }
    }, true);

    // Event listeners attached ONCE to the container using delegation
    if (linksContainer) {
        console.log("Adding listeners to linksContainer...");

        // Handle mousemove for flashlight effect - TARGETING ANCHOR
        linksContainer.addEventListener('mousemove', (e) => {
            const linkAnchor = e.target.closest('.link-anchor'); // Find the anchor tag
            if (linkAnchor) {
                const linkItem = linkAnchor.parentElement; // Get the parent .link-item
                if (linkItem) {
                    const rect = linkItem.getBoundingClientRect(); // Use linkItem for position calculation
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    // console.log(`Mousemove on anchor: x=${x}, y=${y}`); // Uncomment for detailed tracking
                    linkItem.style.setProperty('--mouse-x', `${x}px`);
                    linkItem.style.setProperty('--mouse-y', `${y}px`);
                }
            }
        });

        // Handle context menu
        linksContainer.addEventListener('contextmenu', (e) => {
            const linkItem = e.target.closest('.link-item');
            if (linkItem) {
                console.log("Context menu triggered for item index:", linkItem.dataset.index);
                e.preventDefault();
                e.stopPropagation();
                contextMenuLinkIndex = parseInt(linkItem.dataset.index, 10);
                const { clientX: mouseX, clientY: mouseY } = e;
                if (contextMenu) {
                    const menuWidth = contextMenu.offsetWidth || 150;
                    const menuHeight = contextMenu.offsetHeight || 100;
                    const posX = mouseX + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 5 : mouseX;
                    const posY = mouseY + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 5 : mouseY;
                    contextMenu.style.top = `${posY}px`;
                    contextMenu.style.left = `${posX}px`;
                    contextMenu.classList.remove('hidden');
                    contextMenu.setAttribute('aria-expanded', 'true');
                    // Focus first item
                    const firstItem = contextMenu.querySelector('[role="menuitem"]');
                    if (firstItem) setTimeout(() => firstItem.focus(), 10);
                }
            }
        });

        // --- Drag & Drop Reordering ---
        linksContainer.addEventListener('dragstart', (e) => {
            const linkItem = e.target.closest('.link-item');
            if (!linkItem) return;
            linkItem.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', linkItem.dataset.index);
        });

        linksContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            const linkItem = e.target.closest('.link-item');
            if (!linkItem || linkItem.classList.contains('dragging')) return;
            linkItem.classList.add('drag-over');
        });

        linksContainer.addEventListener('dragleave', (e) => {
            const linkItem = e.target.closest('.link-item');
            if (!linkItem) return;
            linkItem.classList.remove('drag-over');
        });

        linksContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
            const targetItem = e.target.closest('.link-item');
            if (!targetItem) return;
            targetItem.classList.remove('drag-over');

            const targetIndex = parseInt(targetItem.dataset.index, 10);
            if (isNaN(draggedIndex) || isNaN(targetIndex) || draggedIndex < 0 || draggedIndex >= links.length || targetIndex < 0 || targetIndex >= links.length || draggedIndex === targetIndex) return;

            // Reorder array
            const [moved] = links.splice(draggedIndex, 1);
            if (!moved) return;
            links.splice(targetIndex, 0, moved);
            saveLinks();
            renderLinks();
        });

        linksContainer.addEventListener('dragend', (e) => {
            const linkItem = e.target.closest('.link-item');
            if (linkItem) linkItem.classList.remove('dragging');
            linksContainer.querySelectorAll('.link-item').forEach(item => item.classList.remove('drag-over'));
        });

    } else {
        console.error("linksContainer not found!");
    }
}

// --- Event Listeners (Attached Once on DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', () => {
    const drawerBackdrop = document.getElementById('drawer-backdrop');

    // Live Favicon Preview & Autocomplete in Bookmark Modal
    function updateBookmarkPreview() {
        const urlVal = linkUrlInput ? linkUrlInput.value.trim() : '';
        const nameVal = linkNameInput ? linkNameInput.value.trim() : '';
        const previewImg = document.getElementById('modal-favicon-img');
        const previewName = document.getElementById('modal-preview-name');

        if (previewName) {
            previewName.textContent = nameVal || 'New Bookmark';
        }

        if (previewImg) {
            try {
                let testUrl = urlVal;
                if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) {
                    testUrl = 'https://' + testUrl;
                }
                const parsed = new URL(testUrl);
                if (parsed.hostname && parsed.hostname.includes('.')) {
                    previewImg.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(parsed.hostname)}&sz=128`;
                    if (!nameVal && linkNameInput) {
                        const raw = parsed.hostname.replace(/^www\./, '').split('.')[0];
                        if (raw) {
                            linkNameInput.value = raw.charAt(0).toUpperCase() + raw.slice(1);
                            if (previewName) previewName.textContent = linkNameInput.value;
                        }
                    }
                }
            } catch {
                previewImg.src = 'https://www.google.com/s2/favicons?domain=example.com&sz=128';
            }
        }
    }

    if (linkUrlInput) {
        linkUrlInput.addEventListener('input', updateBookmarkPreview);
    }
    if (linkNameInput) {
        linkNameInput.addEventListener('input', updateBookmarkPreview);
    }

    // Quick Preset Chips in Bookmark Modal
    document.querySelectorAll('.preset-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            if (linkNameInput) linkNameInput.value = chip.dataset.name || '';
            if (linkUrlInput) linkUrlInput.value = chip.dataset.url || '';
            updateBookmarkPreview();
            if (linkNameInput) linkNameInput.focus();
        });
    });

    // Name editor with click and keyboard activation
    function handleNameEdit() {
        const currentName = localStorage.getItem('username') || "Guest";
        const newName = prompt("Enter your name:", currentName === "Guest" ? "" : currentName);
        if (newName !== null && newName.trim() !== "") {
            safeSetItem('username', newName.trim());
            if (nameElement) nameElement.textContent = newName.trim();
            showToast(`👋 Welcome, ${newName.trim()}!`);
        }
    }

    if (nameElement) {
        nameElement.setAttribute('tabindex', '0');
        nameElement.setAttribute('role', 'button');
        nameElement.addEventListener('click', handleNameEdit);
        nameElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNameEdit();
            }
        });
    }

    if (addLinkBtn) {
        addLinkBtn.addEventListener('click', () => {
            lastFocusedElement = document.activeElement;
            editingLinkIndex = null;
            if (modalTitle) modalTitle.textContent = 'Add New Link';
            if (modalSubmitBtn) modalSubmitBtn.textContent = 'Add Link';
            if (addLinkModal) addLinkModal.classList.remove('hidden');
            updateBookmarkPreview();
            setTimeout(() => { if (linkNameInput) linkNameInput.focus(); }, 50);
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (addLinkModal) addLinkModal.addEventListener('click', (e) => { if (e.target === addLinkModal) closeModal(); });

    if (addLinkForm) addLinkForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = sanitizeInput(linkNameInput.value.trim());
        let url = linkUrlInput.value.trim();

        try {
            url = normalizeUrl(url);
        } catch (error) {
            alert('Invalid URL: ' + error.message);
            linkUrlInput.value = '';
            linkUrlInput.focus();
            return;
        }

        if (!name || name.length > 100) {
            alert('Please enter a valid name (1-100 characters)');
            return;
        }

        if (!url || url.length > 2048) {
            alert('URL is too long');
            return;
        }

        if (editingLinkIndex !== null) {
            links[editingLinkIndex] = { name, url };
            showToast('✅ Link updated');
        } else {
            links.push({ name, url });
            showToast('✅ Link added');
        }
        saveLinks();
        renderLinks();
        closeModal();
    });

    let activeDrawerTrigger = null;

    // Function to close all slide panels and drawers
    function closeAllPanels() {
        document.querySelectorAll('.panel.drawer-panel, .panel.slide-panel, .panel#context-menu').forEach(p => p.classList.add('hidden'));
        document.querySelectorAll('.command-btn').forEach(btn => btn.classList.remove('active'));
        if (drawerBackdrop) drawerBackdrop.classList.add('hidden');
        if (activeDrawerTrigger) {
            activeDrawerTrigger.focus();
            activeDrawerTrigger = null;
        }
    }

    // Toggle specific panel and close others
    function togglePanel(panel, triggerBtn) {
        if (!panel) return;
        const isHidden = panel.classList.contains('hidden');
        closeAllPanels();
        if (isHidden) {
            panel.classList.remove('hidden');
            if (triggerBtn) {
                triggerBtn.classList.add('active');
                activeDrawerTrigger = triggerBtn;
            }
            if (drawerBackdrop) drawerBackdrop.classList.remove('hidden');
            const focusable = panel.querySelector('button, input, select, textarea, [tabindex="0"]');
            if (focusable) focusable.focus();
        }
    }

    // Escape key to close active panel
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openPanel = document.querySelector('.panel.drawer-panel:not(.hidden)');
            if (openPanel) closeAllPanels();
        }
    });

    if (drawerBackdrop) {
        drawerBackdrop.addEventListener('click', () => {
            closeAllPanels();
        });
    }

    // Bind close buttons on all panels
    document.querySelectorAll('.panel-close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllPanels();
        });
    });

    if (themeBtn && themePanel) {
        themeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePanel(themePanel, themeBtn);
        });
    }

    const bgSettingsBtn = document.getElementById('bg-settings-btn');
    const bgSettingsPanel = document.getElementById('bg-settings-panel');
    if (bgSettingsBtn && bgSettingsPanel) {
        bgSettingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePanel(bgSettingsPanel, bgSettingsBtn);
        });
    }

    const privacyBtn = document.getElementById('privacy-btn');
    const privacyPanel = document.getElementById('privacy-panel');
    if (privacyBtn && privacyPanel) {
        privacyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePanel(privacyPanel, privacyBtn);
            updatePrivacyStorageCount();
        });
    }

    const clockSettingsBtn = document.getElementById('clock-settings-btn');
    const clockSettingsPanel = document.getElementById('clock-settings-panel');
    if (clockSettingsBtn && clockSettingsPanel) {
        clockSettingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePanel(clockSettingsPanel, null);
        });
    }

    // Theme Panel Click Delegation
    if (themePanel) {
        themePanel.addEventListener('click', (e) => {
            const swatchCard = e.target.closest('.theme-swatch-card');
            if (swatchCard && swatchCard.id !== 'custom-theme-btn') {
                const theme = swatchCard.dataset.theme;
                if (theme) applyTheme(theme);
            } else if (e.target.closest('#custom-theme-btn') || swatchCard?.id === 'custom-theme-btn') {
                themePanel.classList.add('custom-view');
                if (customThemePanel) customThemePanel.classList.remove('hidden');
                const savedAccent = localStorage.getItem('customAccentColor') || '#38bdf8';
                if (accentColorInput) accentColorInput.value = savedAccent;
            } else if (e.target.id === 'save-custom-theme-btn') {
                if (accentColorInput) {
                    const newColor = accentColorInput.value;
                    safeSetItem('customAccentColor', newColor);
                    applyTheme('custom');
                    showToast('🎨 Custom accent color saved!');
                }
            } else if (e.target.id === 'back-to-themes-btn') {
                themePanel.classList.remove('custom-view');
                if (customThemePanel) customThemePanel.classList.add('hidden');
                loadTheme();
            }
        });
    }

    if (accentColorInput) {
        accentColorInput.addEventListener('input', () => {
            const val = accentColorInput.value;
            applyAccentColor(val);
            document.body.dataset.theme = 'custom';
            safeSetItem('theme', 'custom');
            safeSetItem('customAccentColor', val);
            const hexBadge = document.getElementById('accent-hex-value') || document.getElementById('custom-hex-val');
            if (hexBadge) hexBadge.textContent = val.toUpperCase();
        });
    }

    if (contextEditBtn) contextEditBtn.addEventListener('click', () => {
        if (contextMenuLinkIndex !== null) openEditModal(contextMenuLinkIndex);
        if (contextMenu) contextMenu.classList.add('hidden');
    });

    if (contextDeleteBtn) contextDeleteBtn.addEventListener('click', () => {
        if (contextMenuLinkIndex !== null) {
            const linkElement = linksContainer ? linksContainer.querySelector(`.link-item[data-index="${contextMenuLinkIndex}"]`) : null;
            deleteLink(contextMenuLinkIndex, linkElement);
        }
        if (contextMenu) contextMenu.classList.add('hidden');
    });

    // Privacy clear all data button
    const clearAllBtn = document.getElementById('clear-all-data-btn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all preferences, bookmarks, and wallpapers? This cannot be undone.')) {
                localStorage.clear();
                showToast('🗑️ All data wiped. Reloading...');
                setTimeout(() => window.location.reload(), 1000);
            }
        });
    }

    function updatePrivacyStorageCount() {
        const countEl = document.getElementById('privacy-storage-count');
        if (!countEl) return;
        let totalBytes = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const val = localStorage.getItem(key) || '';
            totalBytes += (key.length + val.length) * 2;
        }
        const kb = (totalBytes / 1024).toFixed(1);
        countEl.textContent = `${localStorage.length} items (${kb} KB)`;
    }

    // --- Initializations ---
    function startClock() {
        updateClock();
        updateGreeting();
        setDate();
        setInterval(updateClock, 1000);
        setInterval(updateGreeting, 60000); // Update greeting every minute
    }
    startClock();
    handleName();
    loadTheme();
    loadLinks(); 
    initializeInteractiveEffects();
    initKeyboardShortcuts();
    initClockSettings();
    initExportImport();
    initSearchEngineSwitcher();
});

// === KEYBOARD SHORTCUTS ===
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // 1. Context Menu Keyboard Navigation
        const contextMenu = document.getElementById('context-menu');
        if (contextMenu && !contextMenu.classList.contains('hidden')) {
            const items = Array.from(contextMenu.querySelectorAll('[role="menuitem"]'));
            if (items.length > 0) {
                const index = items.indexOf(document.activeElement);
                if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' ', 'Escape', 'Tab'].includes(e.key)) {
                    e.preventDefault();
                    switch(e.key) {
                        case 'ArrowDown':
                            if (index < items.length - 1) items[index + 1].focus();
                            else items[0].focus();
                            break;
                        case 'ArrowUp':
                            if (index > 0) items[index - 1].focus();
                            else items[items.length - 1].focus();
                            break;
                        case 'Home':
                            items[0].focus();
                            break;
                        case 'End':
                            items[items.length - 1].focus();
                            break;
                        case 'Enter':
                        case ' ':
                            if (index !== -1) items[index].click();
                            break;
                        case 'Escape':
                        case 'Tab':
                            contextMenu.classList.add('hidden');
                            contextMenu.setAttribute('aria-expanded', 'false');
                            const linkItem = document.querySelector(`.link-item[data-index="${contextMenuLinkIndex}"] .link-anchor`);
                            if (linkItem) linkItem.focus();
                            break;
                    }
                    return; // Stop processing other shortcuts
                }
            }
        }

        // 2. Modal Focus Trapping
        const openModal = document.querySelector('.modal-overlay:not(.hidden) .modal-content');
        if (openModal) {
            if (e.key === 'Tab') {
                trapFocus(openModal, e);
                return; // Prevent default tab flow if trapped
            }
        }

        // Don't trigger shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            // ESC to blur input
            if (e.key === 'Escape') {
                e.target.blur();
                document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
                if (typeof closeModal === 'function') closeModal();
            }
            return;
        }

        // Prevent default for our shortcuts
        const shortcuts = ['/', 'n', 'N', 'b', 'B', 't', 'T'];
        if (shortcuts.includes(e.key)) e.preventDefault();

        switch (e.key) {
            case '/':
                document.getElementById('main-search-input')?.focus();
                break;
            case 'n':
            case 'N':
                document.getElementById('add-link-btn')?.click();
                break;
            case 'b':
            case 'B':
                document.getElementById('bg-settings-btn')?.click();
                break;
            case 't':
            case 'T':
                document.getElementById('theme-btn')?.click();
                break;
            case 'Escape':
                document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
                if (typeof closeModal === 'function') closeModal();
                break;
        }
    });
}


// --- Particle Animation ---
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        draw() {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    for (let i = 0; i < 80; i++) particles.push(new Particle());
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// --- Search Widget ---
function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.link-item').forEach(item => {
            const name = item.querySelector('.link-name').textContent.toLowerCase();
            item.style.display = name.includes(query) ? '' : 'none';
        });
    });
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            document.querySelectorAll('.link-item').forEach(item => item.style.display = '');
        }
    });
}

// --- Quote Widget ---
const quotes = [
    { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
    { text: 'Simplicity is the prerequisite for reliability.', author: 'Edsger W. Dijkstra' },
    { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
    { text: 'Code is like humor. When you have to explain it, it is bad.', author: 'Cory House' },
    { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
    { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
    { text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.', author: 'Martin Fowler' }
];

function initQuote() {
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const widget = document.getElementById('quote-widget');
    const refreshBtn = document.getElementById('quote-refresh-btn');
    if (!quoteText || !quoteAuthor) return;

    function showQuote() {
        const q = quotes[Math.floor(Math.random() * quotes.length)];
        quoteText.style.opacity = '0';
        quoteAuthor.style.opacity = '0';
        setTimeout(() => {
            quoteText.textContent = `"${q.text}"`;
            quoteAuthor.textContent = `- ${q.author}`;
            quoteText.style.opacity = '1';
            quoteAuthor.style.opacity = '1';
        }, 150);
    }
    showQuote();

    if (widget) {
        widget.addEventListener('click', (e) => {
            if (!e.target.closest('#quote-refresh-btn')) showQuote();
        });
    }
    if (refreshBtn) {
        refreshBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showQuote();
        });
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initParticles();
        initSearch();
        initQuote();
        initBackgroundSettings();
        initGitHub();
    });
} else {
    initParticles();
    initSearch();
    initQuote();
    initBackgroundSettings();
    initGitHub();
}

// === GITHUB WIDGET ===
async function initGitHub() {
    const profileDiv = document.getElementById('github-profile');
    const reposDiv = document.getElementById('github-repos');
    const usernameInput = document.getElementById('gh-username-input');
    const updateBtn = document.getElementById('gh-update-btn');

    if (!profileDiv) return;

    const savedUsername = localStorage.getItem('githubUsername') || 'harshitthek';
    usernameInput.value = savedUsername;

    async function loadGitHubData(username) {
        try {
            profileDiv.innerHTML = '<div class="gh-profile-loading">Loading...</div>';
            reposDiv.innerHTML = '';

            const [profileRes, reposRes] = await Promise.all([
                fetch(`https://api.github.com/users/${username}`),
                fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`)
            ]);

            if (profileRes.status === 403 || reposRes.status === 403) {
                throw new Error('403 Forbidden - API Rate Limit');
            }
            if (!profileRes.ok) {
                throw new Error('User not found');
            }
            if (!reposRes.ok) {
                throw new Error('Repositories not found');
            }
            const profile = await profileRes.json();
            const rawRepos = await reposRes.json();
            const allRepos = Array.isArray(rawRepos) ? rawRepos : [];

            // Find top starred repo overall
            const topRepo = allRepos.reduce((max, repo) => (repo.stargazers_count > (max.stargazers_count || 0) ? repo : max), {});
            
            // Get most recently updated repos excluding the top starred repo if present
            const otherRepos = allRepos.filter(r => r.name !== topRepo.name);
            const repos = (topRepo.name && topRepo.stargazers_count > 0 ? otherRepos : allRepos).slice(0, 3);

            const langColors = {
                JavaScript: '#f1e05a',
                TypeScript: '#3178c6',
                Python: '#3572A5',
                HTML: '#e34c26',
                CSS: '#563d7c',
                Rust: '#dea584',
                Go: '#00ADD8',
                Java: '#b07219',
                'C++': '#f34b7d',
                C: '#555555',
                Shell: '#89e051',
                Vue: '#41b883'
            };

            const safeAvatar = isValidUrl(profile.avatar_url) ? profile.avatar_url : 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
            const safeLogin = sanitizeInput(profile.login || '');
            const safeName = sanitizeInput(profile.name || profile.login || 'Developer');
            const safeBio = sanitizeInput(profile.bio || 'No bio available');
            const safeReposCount = parseInt(profile.public_repos, 10) || 0;
            const safeFollowers = parseInt(profile.followers, 10) || 0;
            const safeFollowing = parseInt(profile.following, 10) || 0;
            const safeGists = parseInt(profile.public_gists, 10) || 0;

            profileDiv.innerHTML = `
                <div class="gh-profile-card">
                    <img src="${safeAvatar}" class="gh-avatar" alt="${safeLogin}">
                    <div class="gh-info">
                        <div class="gh-name">${safeName}</div>
                        <div class="gh-bio">${safeBio}</div>
                    </div>
                </div>
                <div class="gh-stats-grid">
                    <div class="gh-stat-box">
                        <span class="stat-value">${safeReposCount}</span>
                        <span class="stat-label">Repos</span>
                    </div>
                    <div class="gh-stat-box">
                        <span class="stat-value">${safeFollowers}</span>
                        <span class="stat-label">Followers</span>
                    </div>
                    <div class="gh-stat-box">
                        <span class="stat-value">${safeFollowing}</span>
                        <span class="stat-label">Following</span>
                    </div>
                    <div class="gh-stat-box">
                        <span class="stat-value">${safeGists}</span>
                        <span class="stat-label">Gists</span>
                    </div>
                </div>
                ${topRepo.name && topRepo.stargazers_count > 0 ? `
                    <div class="gh-top-repo gh-repo-link" data-url="${sanitizeInput(topRepo.html_url || '')}">
                        <div class="gh-top-repo-title">⭐ Most Starred</div>
                        <div class="gh-top-repo-name">${sanitizeInput(topRepo.name)}</div>
                        <div class="gh-top-repo-stars">${parseInt(topRepo.stargazers_count, 10) || 0} stars</div>
                    </div>
                ` : ''}
            `;

            reposDiv.innerHTML = repos.map(repo => {
                const safeRepoLang = sanitizeInput(repo.language || '');
                const dotColor = langColors[safeRepoLang] || 'var(--accent-color)';
                const safeRepoName = sanitizeInput(repo.name || '');
                const safeRepoDesc = sanitizeInput(repo.description || 'No description');
                const safeRepoUrl = sanitizeInput(repo.html_url || '');
                const safeStars = parseInt(repo.stargazers_count, 10) || 0;

                return `
                <div class="gh-repo gh-repo-link" data-url="${safeRepoUrl}">
                    <div class="gh-repo-name">${safeRepoName}</div>
                    <div class="gh-repo-desc">${safeRepoDesc}</div>
                    <div class="gh-repo-meta">
                        ${safeRepoLang ? `<span class="gh-lang"><span class="gh-lang-dot" style="background-color: ${dotColor}"></span>${safeRepoLang}</span>` : ''}
                        <span class="gh-stars">⭐ ${safeStars}</span>
                    </div>
                </div>
                `;
            }).join('');

            // Delegated event listener for CSP compliance
            if (ghClickHandler) {
                profileDiv.removeEventListener('click', ghClickHandler);
                reposDiv.removeEventListener('click', ghClickHandler);
            }
            ghClickHandler = (e) => {
                const linkElement = e.target.closest('.gh-repo-link');
                if (linkElement && linkElement.dataset.url) {
                    window.open(linkElement.dataset.url, '_blank');
                }
            };
            
            profileDiv.addEventListener('click', ghClickHandler);
            reposDiv.addEventListener('click', ghClickHandler);

            safeSetItem('githubUsername', username);
        } catch (error) {
            const is403 = error.message.includes('403') || error.message.includes('Forbidden');
            const errorMsg = is403
                ? 'GitHub API Rate Limit Exceeded'
                : error.message;
            const helpText = is403
                ? 'Too many requests. Try again in ~1 hour or use a different network.'
                : 'Check if username exists on GitHub';

            profileDiv.innerHTML = `
                <div class="gh-profile-loading" style="color: #ef4444; text-align: center; padding: 20px;">
                    <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
                    <div style="font-weight: 600; margin-bottom: 8px;">${errorMsg}</div>
                    <div style="font-size: 11px; opacity: 0.8; line-height: 1.5;">${helpText}</div>
                </div>
            `;
        }
    }

    if (usernameInput) {
        usernameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const username = usernameInput.value.trim();
                if (username) loadGitHubData(username);
            }
        });
    }

    if (updateBtn) {
        updateBtn.addEventListener('click', () => {
            const username = usernameInput ? usernameInput.value.trim() : '';
            if (username) loadGitHubData(username);
        });
    }

    loadGitHubData(savedUsername);
}

// === BACKGROUND CUSTOMIZATION ===
function initBackgroundSettings() {
    const bgSettingsBtn = document.getElementById('bg-settings-btn');
    const bgPanel = document.getElementById('bg-settings-panel');
    const bgUpload = document.getElementById('bg-image-upload');
    const uploadDropzone = document.getElementById('upload-dropzone');
    const bgUrlInput = document.getElementById('bg-image-url');
    const applyUrlBtn = document.getElementById('apply-bg-url');
    const scrimSlider = document.getElementById('bg-scrim-slider');
    const scrimValue = document.getElementById('scrim-value');
    const blurSlider = document.getElementById('bg-blur');
    const brightnessSlider = document.getElementById('bg-brightness');
    const resetBtn = document.getElementById('reset-bg-btn');
    const blurValue = document.getElementById('blur-value');
    const brightnessValue = document.getElementById('brightness-value');
    const fitModeSelect = document.getElementById('bg-fit-mode');
    const presetCards = document.querySelectorAll('.wp-preset-card');

    let overlay = document.getElementById('custom-bg-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'custom-bg-overlay';
        overlay.className = 'custom-bg-overlay';
        document.body.insertBefore(overlay, document.body.firstChild);
    }

    let scrim = document.getElementById('bg-scrim');
    if (!scrim) {
        scrim = document.createElement('div');
        scrim.id = 'bg-scrim';
        scrim.className = 'bg-scrim';
        document.body.insertBefore(scrim, overlay.nextSibling);
    }

    const savedBg = localStorage.getItem('customBg');
    const savedPreset = localStorage.getItem('wallpaperPreset') || 'none';
    const savedScrim = localStorage.getItem('bgScrim') || '40';
    const savedBlur = localStorage.getItem('bgBlur') || '0';
    const savedBrightness = localStorage.getItem('bgBrightness') || '100';
    const savedFitMode = localStorage.getItem('bgFitMode') || 'cover';

    if (savedBg) {
        overlay.style.backgroundImage = `url(${savedBg})`;
        document.body.classList.add('has-custom-bg');
    }

    if (scrimSlider) {
        scrimSlider.value = savedScrim;
        if (scrimValue) scrimValue.textContent = `${savedScrim}%`;
        document.documentElement.style.setProperty('--scrim-opacity', (parseInt(savedScrim, 10) / 100).toString());
    }

    if (blurSlider) {
        blurSlider.value = savedBlur;
        if (blurValue) blurValue.textContent = `${savedBlur}px`;
    }

    if (brightnessSlider) {
        brightnessSlider.value = savedBrightness;
        if (brightnessValue) brightnessValue.textContent = `${savedBrightness}%`;
    }

    if (fitModeSelect) {
        fitModeSelect.value = savedFitMode;
    }

    // Highlight active preset card
    presetCards.forEach(card => {
        card.classList.toggle('active', card.dataset.preset === savedPreset);
    });

    applyFilters();
    applyFitMode();

    // Preset cards click
    presetCards.forEach(card => {
        card.addEventListener('click', () => {
            presetCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const presetId = card.dataset.preset;
            const url = card.dataset.url;

            if (presetId === 'none' || !url) {
                overlay.style.backgroundImage = '';
                document.body.classList.remove('has-custom-bg');
                localStorage.removeItem('customBg');
                safeSetItem('wallpaperPreset', 'none');
                showToast('✨ Wallpaper cleared (Default gradient)');
            } else {
                overlay.style.backgroundImage = `url(${url})`;
                document.body.classList.add('has-custom-bg');
                safeSetItem('customBg', url);
                safeSetItem('wallpaperPreset', presetId);
                showToast(`🖼️ Applied ${card.querySelector('.wp-name')?.textContent || 'Preset'}`);
            }
            applyFilters();
        });
    });

    // File Upload Handler with size validation and safe storage check
    function handleFileUpload(file) {
        if (!file || !file.type.startsWith('image/')) {
            showToast('⚠️ Please choose an image file (JPG, PNG, WebP)');
            return;
        }
        if (file.size > 2.5 * 1024 * 1024) {
            showToast('⚠️ Image too large (max 2.5MB for browser storage)');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            try {
                localStorage.setItem('customBg', dataUrl);
                localStorage.setItem('wallpaperPreset', 'custom-upload');
                overlay.style.backgroundImage = `url("${CSS.escape(dataUrl)}")`;
                document.body.classList.add('has-custom-bg');
                presetCards.forEach(c => c.classList.remove('active'));
                applyFilters();
                showToast('📸 Custom wallpaper uploaded!');
            } catch (err) {
                showToast('⚠️ Storage quota exceeded. Image is too large for storage.');
            }
        };
        reader.readAsDataURL(file);
    }

    if (bgUpload) {
        bgUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handleFileUpload(file);
        });
    }

    // Drag and Drop on dropzone
    if (uploadDropzone) {
        ['dragenter', 'dragover'].forEach(name => {
            uploadDropzone.addEventListener(name, (e) => {
                e.preventDefault();
                uploadDropzone.style.borderColor = 'var(--accent-color)';
            });
        });
        ['dragleave', 'drop'].forEach(name => {
            uploadDropzone.addEventListener(name, (e) => {
                e.preventDefault();
                uploadDropzone.style.borderColor = '';
            });
        });
        uploadDropzone.addEventListener('drop', (e) => {
            const file = e.dataTransfer.files[0];
            if (file) handleFileUpload(file);
        });
    }

    // Custom URL with validation
    if (applyUrlBtn && bgUrlInput) {
        applyUrlBtn.addEventListener('click', () => {
            const url = bgUrlInput.value.trim();
            if (!url) return;
            if (!isValidUrl(url)) {
                showToast('⚠️ Please enter a valid HTTP/HTTPS image URL');
                return;
            }
            overlay.style.backgroundImage = `url("${CSS.escape(url)}")`;
            safeSetItem('customBg', url);
            safeSetItem('wallpaperPreset', 'custom-url');
            document.body.classList.add('has-custom-bg');
            presetCards.forEach(c => c.classList.remove('active'));
            applyFilters();
            showToast('🔗 Wallpaper URL applied!');
        });
    }

    // Scrim Dark Tint Slider
    if (scrimSlider) {
        scrimSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            if (scrimValue) scrimValue.textContent = `${val}%`;
            document.documentElement.style.setProperty('--scrim-opacity', (parseInt(val, 10) / 100).toString());
            safeSetItem('bgScrim', val);
        });
    }

    // Blur Slider
    if (blurSlider) {
        blurSlider.addEventListener('input', (e) => {
            if (blurValue) blurValue.textContent = `${e.target.value}px`;
            safeSetItem('bgBlur', e.target.value);
            applyFilters();
        });
    }

    // Brightness Slider
    if (brightnessSlider) {
        brightnessSlider.addEventListener('input', (e) => {
            if (brightnessValue) brightnessValue.textContent = `${e.target.value}%`;
            safeSetItem('bgBrightness', e.target.value);
            applyFilters();
        });
    }

    if (fitModeSelect) {
        fitModeSelect.addEventListener('change', (e) => {
            safeSetItem('bgFitMode', e.target.value);
            applyFitMode();
        });
    }

    // Reset Wallpaper Button
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            overlay.style.backgroundImage = '';
            overlay.style.filter = '';
            document.body.classList.remove('has-custom-bg');
            localStorage.removeItem('customBg');
            safeSetItem('wallpaperPreset', 'none');
            presetCards.forEach(c => c.classList.remove('active'));
            const noneCard = document.querySelector('.wp-preset-card[data-preset="none"]');
            if (noneCard) noneCard.classList.add('active');

            if (blurSlider) {
                blurSlider.value = '0';
                if (blurValue) blurValue.textContent = '0px';
                safeSetItem('bgBlur', '0');
            }
            if (brightnessSlider) {
                brightnessSlider.value = '100';
                if (brightnessValue) brightnessValue.textContent = '100%';
                safeSetItem('bgBrightness', '100');
            }
            if (scrimSlider) {
                scrimSlider.value = '40';
                if (scrimValue) scrimValue.textContent = '40%';
                document.documentElement.style.setProperty('--scrim-opacity', '0.4');
                safeSetItem('bgScrim', '40');
            }
            applyFilters();
            showToast('🔄 Wallpaper reset to default');
        });
    }

    function applyFilters() {
        if (!overlay) return;
        const b = blurSlider ? blurSlider.value : 0;
        const br = brightnessSlider ? brightnessSlider.value : 100;
        overlay.style.filter = `blur(${b}px) brightness(${br}%)`;
    }

    function applyFitMode() {
        if (!overlay) return;
        const mode = localStorage.getItem('bgFitMode') || 'cover';
        if (mode === 'contain') {
            overlay.style.backgroundSize = 'contain';
            overlay.style.backgroundPosition = 'center';
        } else if (mode === 'fill') {
            overlay.style.backgroundSize = '100% 100%';
            overlay.style.backgroundPosition = 'center';
        } else {
            overlay.style.backgroundSize = 'cover';
            overlay.style.backgroundPosition = 'center';
        }
    }
}

// === CLOCK & TYPOGRAPHY SETTINGS ===
function initClockSettings() {
    const clock24hr = document.getElementById('clock-24hr');
    const clockSeconds = document.getElementById('clock-seconds');
    const fontSelect = document.getElementById('clock-font-select');
    const formatSelect = document.getElementById('date-format-select');

    if (clock24hr) {
        clock24hr.checked = localStorage.getItem('clock24hr') === 'true';
        clock24hr.addEventListener('change', () => {
            safeSetItem('clock24hr', clock24hr.checked);
            updateClock();
        });
    }

    if (clockSeconds) {
        clockSeconds.checked = localStorage.getItem('clockSeconds') !== 'false';
        clockSeconds.addEventListener('change', () => {
            safeSetItem('clockSeconds', clockSeconds.checked);
            updateClock();
        });
    }

    if (fontSelect) {
        const savedFont = localStorage.getItem('clockFont') || "'Inter', sans-serif";
        fontSelect.value = savedFont;
        fontSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            safeSetItem('clockFont', val);
            const clock = document.getElementById('clock');
            if (clock) clock.style.fontFamily = val;
            updateClock();
            showToast('🔤 Clock typography updated');
        });
    }

    if (formatSelect) {
        const savedFormat = localStorage.getItem('dateFormat') || 'full';
        formatSelect.value = savedFormat;
        formatSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            safeSetItem('dateFormat', val);
            setDate();
            showToast('📅 Date format updated');
        });
    }
}

// === EXPORT/IMPORT SETTINGS ===
function initExportImport() {
    const exportBtn = document.getElementById('export-settings-btn');
    const importBtn = document.getElementById('import-settings-btn');
    const importInput = document.getElementById('import-settings-input');

    if (!exportBtn) return;

    // Export all settings
    exportBtn.addEventListener('click', () => {
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            settings: {},
            links: links
        };

        // Export all localStorage items
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data.settings[key] = localStorage.getItem(key);
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dailycosmos-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        showToast('✅ Settings exported successfully!');
    });

    // Import trigger
    importBtn.addEventListener('click', () => {
        importInput.click();
    });

    // Import handler
    importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);

                // Restore settings
                if (data.settings) {
                    Object.keys(data.settings).forEach(key => {
                        safeSetItem(key, data.settings[key]);
                    });
                }

                // Restore links
                if (data.links) {
                    links = data.links;
                    saveLinks();
                    renderLinks();
                }

                showToast('✅ Settings imported! Applying...');
                
                // Apply changes in place
                loadTheme();
                handleName();
                updateClock();
                if (typeof initGitHub === 'function') initGitHub();
                
                // Trigger background UI updates if panel is open
                const bgSettingsBtn = document.getElementById('bg-settings-btn');
                if (bgSettingsBtn) {
                    const savedBg = localStorage.getItem('customBg');
                    let overlay = document.getElementById('custom-bg-overlay');
                    if (overlay) {
                        if (savedBg) {
                            overlay.style.backgroundImage = `url(${savedBg})`;
                            document.body.classList.add('has-custom-bg');
                        } else {
                            overlay.style.backgroundImage = '';
                            document.body.classList.remove('has-custom-bg');
                        }
                        const savedBlur = localStorage.getItem('bgBlur') || '5';
                        const savedBrightness = localStorage.getItem('bgBrightness') || '100';
                        overlay.style.filter = `blur(${savedBlur}px) brightness(${savedBrightness}%)`;
                    }
                }
                
                if (document.getElementById('clock-24hr')) {
                    document.getElementById('clock-24hr').checked = localStorage.getItem('clock24hr') === 'true';
                }
                if (document.getElementById('clock-seconds')) {
                    document.getElementById('clock-seconds').checked = localStorage.getItem('clockSeconds') !== 'false';
                }

            } catch (error) {
                showToast(' Invalid backup file');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input
    });
}

// === SEARCH ENGINE SWITCHER ===
function initSearchEngineSwitcher() {
    const iconContainer = document.getElementById('search-engine-icon');
    const icon = document.getElementById('engine-icon');
    const dropdown = document.getElementById('search-engine-dropdown');
    const mainSearchInput = document.getElementById('main-search-input');
    const searchClearBtn = document.getElementById('search-clear-btn');
    const searchBtn = document.getElementById('search-btn');

    if (!iconContainer) return;

    const engines = [
        { id: 'google', name: 'Google', icon: 'https://www.google.com/favicon.ico', url: 'https://www.google.com/search?q=' },
        { id: 'duckduckgo', name: 'DuckDuckGo', icon: 'https://duckduckgo.com/favicon.ico', url: 'https://duckduckgo.com/?q=' },
        { id: 'bing', name: 'Bing', icon: 'https://www.bing.com/favicon.ico', url: 'https://www.bing.com/search?q=' },
        { id: 'brave', name: 'Brave', icon: 'https://brave.com/static-assets/images/brave-favicon.png', url: 'https://search.brave.com/search?q=' },
        { id: 'github', name: 'GitHub', icon: 'https://github.com/favicon.ico', url: 'https://github.com/search?q=' },
        { id: 'youtube', name: 'YouTube', icon: 'https://www.youtube.com/favicon.ico', url: 'https://www.youtube.com/results?search_query=' }
    ];

    let currentIndex = parseInt(localStorage.getItem('searchEngineIndex'), 10);
    if (isNaN(currentIndex) || currentIndex < 0 || currentIndex >= engines.length) {
        currentIndex = 0;
    }

    function updateEngine(index) {
        currentIndex = index;
        const engine = engines[currentIndex];
        if (icon) {
            icon.src = engine.icon;
            icon.alt = engine.name;
        }
        safeSetItem('searchEngineIndex', currentIndex);

        // Update active in dropdown
        if (dropdown) {
            dropdown.querySelectorAll('.engine-option').forEach((opt) => {
                opt.classList.toggle('active', opt.dataset.engine === engine.id);
            });
        }
    }

    // Toggle dropdown
    iconContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dropdown) dropdown.classList.toggle('hidden');
    });

    // Dropdown selection
    if (dropdown) {
        dropdown.addEventListener('click', (e) => {
            const opt = e.target.closest('.engine-option');
            if (opt) {
                const engineId = opt.dataset.engine;
                const foundIndex = engines.findIndex(eng => eng.id === engineId);
                if (foundIndex !== -1) {
                    updateEngine(foundIndex);
                }
                dropdown.classList.add('hidden');
            }
        });
    }

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (dropdown && !dropdown.contains(e.target) && !iconContainer.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });

    function isLikelyUrl(q) {
        if (/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(q)) return true;
        if (/^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+(\/[^\s]*)?$/i.test(q)) {
            const hostPart = q.split('/')[0];
            const parts = hostPart.split('.');
            const tld = parts[parts.length - 1].toLowerCase();
            const knownTlds = ['com', 'org', 'net', 'io', 'dev', 'app', 'edu', 'gov', 'co', 'ai', 'me', 'info', 'xyz', 'tv', 'uk', 'de', 'ca', 'jp', 'fr', 'in', 'us'];
            if (knownTlds.includes(tld) || q.includes('/')) return true;
        }
        return false;
    }

    // Execute Search
    function executeSearch() {
        if (!mainSearchInput) return;
        const query = mainSearchInput.value.trim();
        if (!query) return;

        // Check if query is direct URL
        if (isLikelyUrl(query)) {
            const url = query.startsWith('http://') || query.startsWith('https://') ? query : 'https://' + query;
            window.open(url, '_blank');
        } else {
            window.open(engines[currentIndex].url + encodeURIComponent(query), '_blank');
        }
        mainSearchInput.value = '';
        if (searchClearBtn) searchClearBtn.classList.add('hidden');
    }

    // Handle input keypress
    if (mainSearchInput) {
        mainSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                executeSearch();
            }
        });

        mainSearchInput.addEventListener('input', () => {
            if (searchClearBtn) {
                searchClearBtn.classList.toggle('hidden', mainSearchInput.value.length === 0);
            }
        });
    }

    // Search submit button
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            executeSearch();
        });
    }

    // Search clear button
    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
            if (mainSearchInput) {
                mainSearchInput.value = '';
                searchClearBtn.classList.add('hidden');
                mainSearchInput.focus();
            }
        });
    }

    updateEngine(currentIndex);
}

// === GLOBAL PANEL CLOSE ON OUTSIDE CLICK ===
document.addEventListener('click', (e) => {
    const panels = document.querySelectorAll('.panel:not(.hidden)');
    const commandBar = document.querySelector('.top-command-bar');
    const clockSettingsBtn = document.getElementById('clock-settings-btn');

    let clickedTrigger = false;
    if (commandBar && commandBar.contains(e.target)) clickedTrigger = true;
    if (clockSettingsBtn && clockSettingsBtn.contains(e.target)) clickedTrigger = true;
    if (e.target.closest('#context-menu') || e.target.closest('.link-item')) clickedTrigger = true;

    if (!clickedTrigger) {
        panels.forEach(panel => {
            if (!panel.contains(e.target) && !panel.classList.contains('modal-content')) {
                panel.classList.add('hidden');
            }
        });
        document.querySelectorAll('.command-btn').forEach(btn => btn.classList.remove('active'));
    }
});






// === SECURITY HELPER FUNCTIONS ===
// Input sanitization to prevent XSS attacks
function sanitizeInput(input) {
    if (!input) return '';
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
}

// URL validation - only allow http/https protocols
function isValidUrl(urlString) {
    try {
        const url = new URL(urlString);
        return ['http:', 'https:'].includes(url.protocol);
    } catch (error) {
        return false;
    }
}

// Secure URL normalization
function normalizeUrl(urlString) {
    if (!urlString) return '';
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
        urlString = 'https://' + urlString;
    }
    if (!isValidUrl(urlString)) {
        throw new Error('Invalid URL protocol. Only HTTP and HTTPS are allowed.');
    }
    return urlString;
}

// Secure favicon URL generation
function getSecureFaviconUrl(url) {
    try {
        const parsedUrl = new URL(url);
        const domain = parsedUrl.hostname;
        return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
    } catch (error) {
        console.error('Invalid URL for favicon:', error);
        return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Ctext y="20" font-size="20"%3E%3C/text%3E%3C/svg%3E';
    }
}
// === API SECURITY ===
// Secure fetch with timeout
function secureFetch(url, options = {}, timeoutMs = 5000) {
    return Promise.race([
        fetch(url, {
            ...options,
            // SECURITY: Ensure credentials are not sent to third parties
            credentials: 'omit',
            // SECURITY: Prevent caching of sensitive data
            cache: options.cache || 'no-store'
        }),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
        )
    ]);
}

// Rate limiter for API calls
const apiRateLimiter = {
    calls: {},

    canCall(apiName, maxCallsPerMinute = 10) {
        const now = Date.now();
        const minuteAgo = now - 60000;

        if (!this.calls[apiName]) {
            this.calls[apiName] = [];
        }

        // Clean old calls
        this.calls[apiName] = this.calls[apiName].filter(time => time > minuteAgo);

        if (this.calls[apiName].length >= maxCallsPerMinute) {
            console.warn(`Rate limit exceeded for ${apiName}`);
            return false;
        }

        this.calls[apiName].push(now);
        return true;
    }
};


// === PRIVACY CONTROLS ===
