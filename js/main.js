// --- Element References ---
const clockElement = document.getElementById('clock');
const greetingElement = document.getElementById('greeting');
const nameElement = document.getElementById('name');
const dateElement = document.getElementById('date');
const linksContainer = document.getElementById('links-container');
const addLinkBtn = document.getElementById('add-link-btn');
const addLinkModal = document.getElementById('add-link-modal');
const closeBtn = addLinkModal.querySelector('.close-btn');
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
    dateElement.textContent = now.toLocaleDateString(undefined, dateOptions);
}

function updateTimeAndGreeting() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;

    clockElement.classList.add('tick');
    setTimeout(() => clockElement.classList.remove('tick'), 200);

    const hour = now.getHours();
    const greetingText = hour < 12 ? "Good morning, "
                       : hour < 18 ? "Good afternoon, "
                                   : "Good evening, ";
    const textNode = Array.from(greetingElement.childNodes)
        .find(node => node.nodeType === Node.TEXT_NODE);
    if (textNode) textNode.textContent = greetingText;
}

function handleName() {
    const savedName = localStorage.getItem('username');
    nameElement.textContent = savedName || "Guest";
}

function playSound(soundEl) {
    if (!isMuted && soundEl) {
        soundEl.currentTime = 0;
        soundEl.play().catch(e => console.error("Audio play failed. User interaction might be required.", e));
    }
}

function updateMuteButton() {
    if (muteBtn) muteBtn.textContent = isMuted ? '🔇' : '🔊';
}

function renderLinks() {
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
        try {
            const hostname = new URL(link.url).hostname;
            faviconImg.src = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
        } catch { faviconImg.src = ''; }
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
        editBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation(); openEditModal(index);
        });
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.title = 'Delete link';
        deleteBtn.innerHTML = 'x';
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation(); deleteLink(index, linkItem);
        });
        linkActions.appendChild(editBtn);
        linkActions.appendChild(deleteBtn);

        linkItem.appendChild(linkAnchor);
        linkItem.appendChild(linkActions);
        linksContainer.appendChild(linkItem);
    });
    initializeInteractiveEffects();
}

function saveLinks() { localStorage.setItem('savedLinks', JSON.stringify(links)); }

function deleteLink(index, linkElement) {
    if (confirm("Are you sure you want to delete this link?")) {
        if (linkElement) linkElement.style.opacity = 0;
        setTimeout(() => {
            links.splice(index, 1);
            saveLinks();
            renderLinks();
        }, 300);
    }
}

function loadLinks() {
    const savedLinks = localStorage.getItem('savedLinks');
    if (savedLinks) links = JSON.parse(savedLinks);
    renderLinks();
}

function applyTheme(theme) {
    document.body.dataset.theme = theme;
    localStorage.setItem('savedTheme', theme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('savedTheme') || 'slate';
    applyTheme(savedTheme);
}

function openEditModal(index) {
    editingLinkIndex = index;
    const link = links[index];
    modalTitle.textContent = 'Edit Link';
    modalSubmitBtn.textContent = 'Save Changes';
    linkNameInput.value = link.name;
    linkUrlInput.value = link.url;
    addLinkModal.classList.remove('hidden');
    setTimeout(() => linkNameInput.focus(), 50);
}

function closeModal() {
    addLinkForm.reset();
    addLinkModal.classList.add('hidden');
    editingLinkIndex = null;
    modalTitle.textContent = 'Add New Link';
    modalSubmitBtn.textContent = 'Add Link';
}

function initializeInteractiveEffects() {
    document.addEventListener('click', () => { if(contextMenu) contextMenu.classList.add('hidden'); }, true);

    document.querySelectorAll('.link-anchor').forEach(anchor => {
        const linkItem = anchor.parentElement;
        if (!linkItem) return;

        anchor.addEventListener('mousemove', (e) => {
            const rect = linkItem.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            linkItem.style.setProperty('--mouse-x', `${x}px`);
            linkItem.style.setProperty('--mouse-y', `${y}px`);
        });
    });
    
    document.querySelectorAll('.link-item').forEach(item => {
        item.addEventListener('mouseenter', () => playSound(flashlightSound));
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            contextMenuLinkIndex = parseInt(item.dataset.index, 10);
            const { clientX: mouseX, clientY: mouseY } = e;
            if(contextMenu) {
                contextMenu.style.top = `${mouseY}px`;
                contextMenu.style.left = `${mouseX}px`;
                contextMenu.classList.remove('hidden');
            }
        });
    });
}

// --- Event Listeners ---
if (nameElement) nameElement.addEventListener('click', () => {
    const currentName = localStorage.getItem('username') || "Guest";
    const newName = prompt("Enter a new name:", currentName === "Guest" ? "" : currentName);
    if (newName && newName.trim() !== "") {
        localStorage.setItem('username', newName.trim());
        nameElement.textContent = newName.trim();
    }
});

if (addLinkBtn) addLinkBtn.addEventListener('click', () => {
    editingLinkIndex = null;
    modalTitle.textContent = 'Add New Link';
    modalSubmitBtn.textContent = 'Add Link';
    addLinkModal.classList.remove('hidden');
    setTimeout(() => linkNameInput.focus(), 50);
});

if (closeBtn) closeBtn.addEventListener('click', closeModal);
if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

if (addLinkModal) addLinkModal.addEventListener('click', (e) => {
    if (e.target === addLinkModal) closeModal();
});

if (addLinkForm) addLinkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = linkNameInput.value;
    let url = linkUrlInput.value;
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
    if (editingLinkIndex !== null) links[editingLinkIndex] = { name, url };
    else links.push({ name, url });
    saveLinks();
    renderLinks();
    closeModal();
});

if (themeBtn && themePanel) themeBtn.addEventListener('click', () => themePanel.classList.toggle('hidden'));
if (themePanel) themePanel.addEventListener('click', (e) => {
    if (e.target.matches('.theme-option')) applyTheme(e.target.dataset.theme);
});
if (customThemeBtn) customThemeBtn.addEventListener('click', () => {
    themePanel.classList.add('custom-view');
    customThemePanel.classList.remove('hidden');
    accentColorInput.value = localStorage.getItem('customAccentColor') || '#3b82f6';
});
if (backToThemesBtn) {
    backToThemesBtn.addEventListener('click', () => {
        if (themePanel) themePanel.classList.remove('custom-view');
        if (customThemePanel) customThemePanel.classList.add('hidden');
        loadTheme();
    });
}
if (accentColorInput) accentColorInput.addEventListener('input', () => {
    applyAccentColor(accentColorInput.value);
    document.body.dataset.theme = 'custom';
});
if (saveCustomThemeBtn) saveCustomThemeBtn.addEventListener('click', () => {
    localStorage.setItem('customAccentColor', accentColorInput.value);
    applyTheme('custom');
    alert('Custom accent color saved!');
});

if (contextEditBtn) contextEditBtn.addEventListener('click', () => {
    if (contextMenuLinkIndex !== null) openEditModal(contextMenuLinkIndex);
    contextMenu.classList.add('hidden');
});
if (contextDeleteBtn) contextDeleteBtn.addEventListener('click', () => {
    if (contextMenuLinkIndex !== null) deleteLink(contextMenuLinkIndex);
    contextMenu.classList.add('hidden');
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
updateMuteButton();
startClock();
handleName();
loadTheme();
loadLinks();

