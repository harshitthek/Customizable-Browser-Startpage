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
const flashlightBtn = document.getElementById('flashlight-btn');
const muteBtn = document.getElementById('mute-btn');
const flashlightSound = document.getElementById('flashlight-sound');
// NOTE: pageOverlay reference was missing in your provided code, re-adding it.
const pageOverlay = document.getElementById('page-overlay');

// --- Data & State ---
let links = [];
let editingLinkIndex = null;
let contextMenuLinkIndex = null;
let flashlightOn = false;
let isMuted = localStorage.getItem('isMuted') === 'true';

// --- Functions ---
function setDate() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    if (dateElement) dateElement.textContent = now.toLocaleDateString(undefined, dateOptions);
}

function updateTimeAndGreeting() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    if(clockElement) clockElement.textContent = `${hours}:${minutes}:${seconds}`;

    // Compute greeting
    const hour = now.getHours();
    const greetingText = hour < 12 ? "Good morning, "
                       : hour < 18 ? "Good afternoon, "
                                   : "Good evening, ";
    // Safer update: find the first TEXT_NODE child and change it
    if(greetingElement) {
        const textNode = Array.from(greetingElement.childNodes)
            .find(node => node.nodeType === Node.TEXT_NODE);
        if (textNode) textNode.textContent = greetingText;
    }
}

function handleName() {
    const savedName = localStorage.getItem('username');
    if(nameElement) nameElement.textContent = savedName || "Guest";
}

function playSound(soundEl) {
    if (!isMuted && soundEl) {
        soundEl.currentTime = 0;
        soundEl.play().catch(e => console.error("Audio play failed.", e));
    }
}

function updateMuteButton() {
    if (muteBtn) muteBtn.textContent = isMuted ? '🔇' : '🔊';
}

function renderLinks() {
    if (!linksContainer) return;
    linksContainer.innerHTML = '';
    links.forEach((link, index) => {
        const linkItem = document.createElement('div');
        linkItem.className = 'link-item';
        linkItem.dataset.index = index;

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
            iconContainer.innerHTML = '';
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
        editBtn.innerHTML = '✏️';
        editBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openEditModal(index); });
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.title = 'Delete link';
        deleteBtn.innerHTML = 'x';
        deleteBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); deleteLink(index, linkItem); });
        linkActions.appendChild(editBtn);
        linkActions.appendChild(deleteBtn);

        linkItem.appendChild(linkAnchor);
        linkItem.appendChild(linkActions);
        linksContainer.appendChild(linkItem);
    });
    initializeInteractiveEffects(); // Re-initialize effects after rendering
}

function saveLinks() { localStorage.setItem('savedLinks', JSON.stringify(links)); }

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
    localStorage.setItem('savedTheme', theme);
    // Apply custom accent color if custom theme is active
    if (theme === 'custom') {
        const savedAccent = localStorage.getItem('customAccentColor');
        if (savedAccent) applyAccentColor(savedAccent);
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('savedTheme') || 'slate';
    applyTheme(savedTheme);
}

function openEditModal(index) {
    editingLinkIndex = index;
    const link = links[index];
    if (modalTitle) modalTitle.textContent = 'Edit Link';
    if (modalSubmitBtn) modalSubmitBtn.textContent = 'Save Changes';
    if (linkNameInput) linkNameInput.value = link.name;
    if (linkUrlInput) linkUrlInput.value = link.url;
    if (addLinkModal) addLinkModal.classList.remove('hidden');
    setTimeout(() => { if (linkNameInput) linkNameInput.focus(); }, 50);
}

function closeModal() {
    if (addLinkForm) addLinkForm.reset();
    if (addLinkModal) addLinkModal.classList.add('hidden');
    editingLinkIndex = null;
    if (modalTitle) modalTitle.textContent = 'Add New Link';
    if (modalSubmitBtn) modalSubmitBtn.textContent = 'Add Link';
}

// REPLACE your existing initializeInteractiveEffects function with this one:
function initializeInteractiveEffects() {
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
                    const menuWidth = contextMenu.offsetWidth;
                    const menuHeight = contextMenu.offsetHeight;
                    const posX = mouseX + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 5 : mouseX;
                    const posY = mouseY + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 5 : mouseY;
                    contextMenu.style.top = `${posY}px`;
                    contextMenu.style.left = `${posX}px`;
                    contextMenu.classList.remove('hidden');
                }
            }
        });

        // Handle mouseenter for sound
        linksContainer.addEventListener('mouseover', (e) => {
             const linkItem = e.target.closest('.link-item');
             if(linkItem) {
                 // console.log("Mouse entered item index:", linkItem.dataset.index); // Uncomment for detailed tracking
                 playSound(flashlightSound);
             }
        });

    } else {
        console.error("linksContainer not found!");
    }
}

// --- Event Listeners (Attached Once on DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', () => {
    // Check elements exist before adding listeners
    if (nameElement) nameElement.addEventListener('click', () => {
        const currentName = localStorage.getItem('username') || "Guest";
        const newName = prompt("Enter a new name:", currentName === "Guest" ? "" : currentName);
        if (newName && newName.trim() !== "") { localStorage.setItem('username', newName.trim()); nameElement.textContent = newName.trim(); }
    });

    if (addLinkBtn) addLinkBtn.addEventListener('click', () => {
        editingLinkIndex = null;
        if (modalTitle) modalTitle.textContent = 'Add New Link';
        if (modalSubmitBtn) modalSubmitBtn.textContent = 'Add Link';
        if (addLinkModal) addLinkModal.classList.remove('hidden');
        setTimeout(() => { if (linkNameInput) linkNameInput.focus(); }, 50);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (addLinkModal) addLinkModal.addEventListener('click', (e) => { if (e.target === addLinkModal) closeModal(); });

    if (addLinkForm) addLinkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = linkNameInput.value;
        let url = linkUrlInput.value;
        if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
        if (editingLinkIndex !== null) links[editingLinkIndex] = { name, url };
        else links.push({ name, url });
        saveLinks();
        renderLinks(); // This now re-renders links but doesn't re-attach global listeners
        closeModal();
    });

    if (themeBtn && themePanel) themeBtn.addEventListener('click', () => themePanel.classList.toggle('hidden'));
    if (themePanel) themePanel.addEventListener('click', (e) => {
        const target = e.target;
        if (target.matches('.theme-option') && target.id !== 'custom-theme-btn') {
            const theme = target.dataset.theme;
            if (theme) applyTheme(theme);
        } else if (target.id === 'custom-theme-btn') {
            themePanel.classList.add('custom-view');
            if(customThemePanel) customThemePanel.classList.remove('hidden');
            const savedAccent = localStorage.getItem('customAccentColor') || '#3b82f6';
            if(accentColorInput) accentColorInput.value = savedAccent;
        } else if (target.id === 'save-custom-theme-btn') {
             if(accentColorInput) {
                const newColor = accentColorInput.value;
                localStorage.setItem('customAccentColor', newColor);
                applyTheme('custom'); // Apply custom theme which also applies accent color
             }
        } else if (target.id === 'back-to-themes-btn') { // CORRECTED BACK BUTTON LOGIC
            themePanel.classList.remove('custom-view');
            if(customThemePanel) customThemePanel.classList.add('hidden');
            loadTheme(); // Reload last saved theme
        }
    });

     if (accentColorInput) accentColorInput.addEventListener('input', () => {
        applyAccentColor(accentColorInput.value);
        document.body.dataset.theme = 'custom'; // Ensure custom theme is active for preview
    });


    if (contextEditBtn) contextEditBtn.addEventListener('click', () => {
        if (contextMenuLinkIndex !== null) openEditModal(contextMenuLinkIndex);
        if(contextMenu) contextMenu.classList.add('hidden');
    });
    // Corrected deleteLink call
    if (contextDeleteBtn) contextDeleteBtn.addEventListener('click', () => {
        if (contextMenuLinkIndex !== null) {
             // Find the element to pass for animation
             const linkElement = linksContainer ? linksContainer.querySelector(`.link-item[data-index="${contextMenuLinkIndex}"]`) : null;
             deleteLink(contextMenuLinkIndex, linkElement);
        }
        if(contextMenu) contextMenu.classList.add('hidden');
    });

    if (flashlightBtn) flashlightBtn.addEventListener('click', () => {
        flashlightOn = !flashlightOn;
        document.body.classList.toggle('flashlight-on', flashlightOn);
        flashlightBtn.classList.toggle('active', flashlightOn);
        playSound(flashlightSound);
    });
    if (muteBtn) muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        localStorage.setItem('isMuted', isMuted);
        updateMuteButton();
    });

    // --- Initializations ---
    function startClock() {
        updateTimeAndGreeting();
        setDate();
        setInterval(updateTimeAndGreeting, 1000);
    }
    updateMuteButton(); // Call on load
    startClock();
    handleName();
    loadTheme();
    loadLinks(); // This will call initializeInteractiveEffects internally
});

