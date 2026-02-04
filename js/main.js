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

function updateClock() {
    const clockElement = document.getElementById('clock');
    if (!clockElement) return;

    const now = new Date();
    const use24Hr = localStorage.getItem('clock24hr') === 'true';
    const showSeconds = localStorage.getItem('clockSeconds') !== 'false'; // default true

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
    // Compute greeting
    const hour = now.getHours();
    const greetingText = hour < 12 ? "Good morning, "
        : hour < 18 ? "Good afternoon, "
            : "Good evening, ";
    // Safer update: find the first TEXT_NODE child and change it
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
//hi

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
            if (linkItem) {
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
            if (customThemePanel) customThemePanel.classList.remove('hidden');
            const savedAccent = localStorage.getItem('customAccentColor') || '#3b82f6';
            if (accentColorInput) accentColorInput.value = savedAccent;
        } else if (target.id === 'save-custom-theme-btn') {
            if (accentColorInput) {
                const newColor = accentColorInput.value;
                localStorage.setItem('customAccentColor', newColor);
                applyTheme('custom'); // Apply custom theme which also applies accent color
            }
        } else if (target.id === 'back-to-themes-btn') { // CORRECTED BACK BUTTON LOGIC
            themePanel.classList.remove('custom-view');
            if (customThemePanel) customThemePanel.classList.add('hidden');
            loadTheme(); // Reload last saved theme
        }
    });

    if (accentColorInput) accentColorInput.addEventListener('input', () => {
        applyAccentColor(accentColorInput.value);
        document.body.dataset.theme = 'custom'; // Ensure custom theme is active for preview
    });


    if (contextEditBtn) contextEditBtn.addEventListener('click', () => {
        if (contextMenuLinkIndex !== null) openEditModal(contextMenuLinkIndex);
        if (contextMenu) contextMenu.classList.add('hidden');
    });
    // Corrected deleteLink call
    if (contextDeleteBtn) contextDeleteBtn.addEventListener('click', () => {
        if (contextMenuLinkIndex !== null) {
            // Find the element to pass for animation
            const linkElement = linksContainer ? linksContainer.querySelector(`.link-item[data-index="${contextMenuLinkIndex}"]`) : null;
            deleteLink(contextMenuLinkIndex, linkElement);
        }
        if (contextMenu) contextMenu.classList.add('hidden');
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
        updateClock();
        updateGreeting();
        setDate();
        setInterval(updateClock, 1000);
        setInterval(updateGreeting, 60000); // Update greeting every minute
    }
    updateMuteButton(); // Call on load
    startClock();
    handleName();
    loadTheme();
    loadLinks(); // This will call initializeInteractiveEffects internally
    initKeyboardShortcuts();
    initClockSettings();
    initExportImport();
    initSearchEngineSwitcher();
});

// === KEYBOARD SHORTCUTS ===
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            // ESC to blur input
            if (e.key === 'Escape') {
                e.target.blur();
                document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
                document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
            }
            return;
        }

        // Prevent default for our shortcuts
        const shortcuts = ['/', 'n', 'N', 'b', 'B', 't', 'T'];
        if (shortcuts.includes(e.key)) e.preventDefault();

        switch (e.key) {
            case '/':
                document.getElementById('search-input')?.focus();
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
                document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
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
    { text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs' },
    { text: 'Code is like humor. When you have to explain it, it is bad.', author: 'Cory House' },
    { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
    { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' }
];
function initQuote() {
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const widget = document.getElementById('quote-widget');
    if (!quoteText || !quoteAuthor) return;
    function showQuote() {
        const q = quotes[Math.floor(Math.random() * quotes.length)];
        quoteText.textContent = `"${q.text}"`;
        quoteAuthor.textContent = `- ${q.author}`;
    }
    showQuote();
    if (widget) widget.addEventListener('click', showQuote);
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
                fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`)
            ]);

            if (profileRes.status === 403) {
                throw new Error('403 Forbidden - API Rate Limit');
            }
            if (!profileRes.ok) {
                throw new Error('User not found');
            }
            const profile = await profileRes.json();
            const repos = await reposRes.json();

            // Find top starred repo
            const topRepo = repos.reduce((max, repo) => repo.stargazers_count > (max.stargazers_count || 0) ? repo : max, {});

            profileDiv.innerHTML = `
                <div class="gh-profile-card">
                    <img src="${profile.avatar_url}" class="gh-avatar" alt="${profile.login}">
                    <div class="gh-info">
                        <div class="gh-name">${profile.name || profile.login}</div>
                        <div class="gh-bio">${profile.bio || 'No bio available'}</div>
                    </div>
                </div>
                <div class="gh-stats-grid">
                    <div class="gh-stat-box">
                        <span class="stat-value">${profile.public_repos}</span>
                        <span class="stat-label">Repositories</span>
                    </div>
                    <div class="gh-stat-box">
                        <span class="stat-value">${profile.followers}</span>
                        <span class="stat-label">Followers</span>
                    </div>
                    <div class="gh-stat-box">
                        <span class="stat-value">${profile.following}</span>
                        <span class="stat-label">Following</span>
                    </div>
                    <div class="gh-stat-box">
                        <span class="stat-value">${profile.public_gists}</span>
                        <span class="stat-label">Gists</span>
                    </div>
                </div>
                ${topRepo.name ? `
                    <div class="gh-top-repo" onclick="window.open('${topRepo.html_url}', '_blank')">
                        <div class="gh-top-repo-title">🏆 Most Starred</div>
                        <div class="gh-top-repo-name">${topRepo.name}</div>
                        <div class="gh-top-repo-stars">⭐ ${topRepo.stargazers_count} stars</div>
                    </div>
                ` : ''}
            `;

            reposDiv.innerHTML = repos.map(repo => `
                <div class="gh-repo" onclick="window.open('${repo.html_url}', '_blank')">
                    <div class="gh-repo-name">${repo.name}</div>
                    <div class="gh-repo-desc">${repo.description || 'No description'}</div>
                    <div class="gh-repo-meta">
                        ${repo.language ? `<span class="gh-lang">● ${repo.language}</span>` : ''}
                        <span class="gh-stars">⭐ ${repo.stargazers_count}</span>
                    </div>
                </div>
            `).join('');

            localStorage.setItem('githubUsername', username);
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

    updateBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if (username) loadGitHubData(username);
    });

    loadGitHubData(savedUsername);
}

// === BACKGROUND CUSTOMIZATION ===
function initBackgroundSettings() {
    const bgSettingsBtn = document.getElementById('bg-settings-btn');
    const bgPanel = document.getElementById('bg-settings-panel');
    const bgUpload = document.getElementById('bg-image-upload');
    const bgUrlInput = document.getElementById('bg-image-url');
    const applyUrlBtn = document.getElementById('apply-bg-url');
    const blurSlider = document.getElementById('bg-blur');
    const brightnessSlider = document.getElementById('bg-brightness');
    const resetBtn = document.getElementById('reset-bg-btn');
    const blurValue = document.getElementById('blur-value');
    const brightnessValue = document.getElementById('brightness-value');

    if (!bgSettingsBtn) return;

    let overlay = document.getElementById('custom-bg-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'custom-bg-overlay';
        document.body.insertBefore(overlay, document.body.firstChild);
    }

    bgSettingsBtn.addEventListener('click', () => {
        bgPanel.classList.toggle('hidden');
        document.getElementById('theme-panel')?.classList.add('hidden');
    });

    const savedBg = localStorage.getItem('customBg');
    const savedBlur = localStorage.getItem('bgBlur') || '5';
    const savedBrightness = localStorage.getItem('bgBrightness') || '100';

    if (savedBg) {
        overlay.style.backgroundImage = `url(${savedBg})`;
        document.body.classList.add('has-custom-bg');
    }
    blurSlider.value = savedBlur;
    brightnessSlider.value = savedBrightness;
    blurValue.textContent = savedBlur;
    brightnessValue.textContent = savedBrightness;
    applyFilters();

    bgUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            overlay.style.backgroundImage = `url(${event.target.result})`;
            localStorage.setItem('customBg', event.target.result);
            document.body.classList.add('has-custom-bg');
            applyFilters();
        };
        reader.readAsDataURL(file);
    });

    applyUrlBtn.addEventListener('click', () => {
        const url = bgUrlInput.value.trim();
        if (!url) return;
        overlay.style.backgroundImage = `url(${url})`;
        localStorage.setItem('customBg', url);
        document.body.classList.add('has-custom-bg');
        applyFilters();
    });

    blurSlider.addEventListener('input', (e) => {
        blurValue.textContent = e.target.value;
        localStorage.setItem('bgBlur', e.target.value);
        applyFilters();
    });

    brightnessSlider.addEventListener('input', (e) => {
        brightnessValue.textContent = e.target.value;
        localStorage.setItem('bgBrightness', e.target.value);
        applyFilters();
    });

    resetBtn.addEventListener('click', () => {
        overlay.style.backgroundImage = '';
        overlay.style.filter = '';
        document.body.classList.remove('has-custom-bg');
        localStorage.removeItem('customBg');
        localStorage.removeItem('bgBlur');
        localStorage.removeItem('bgBrightness');
        blurSlider.value = '5';
        brightnessSlider.value = '100';
        blurValue.textContent = '5';
        brightnessValue.textContent = '100';
    });

    function applyFilters() {
        overlay.style.filter = `blur(${blurSlider.value}px) brightness(${brightnessSlider.value}%)`;
    }
}

// === CLOCK SETTINGS ===
function initClockSettings() {
    const settingsBtn = document.getElementById('clock-settings-btn');
    const panel = document.getElementById('clock-settings-panel');
    const clock24hr = document.getElementById('clock-24hr');
    const clockSeconds = document.getElementById('clock-seconds');

    if (!settingsBtn) return;

    // Load settings
    clock24hr.checked = localStorage.getItem('clock24hr') === 'true';
    clockSeconds.checked = localStorage.getItem('clockSeconds') !== 'false';

    // Toggle panel
    settingsBtn.addEventListener('click', () => {
        panel.classList.toggle('hidden');
        document.querySelectorAll('.panel').forEach(p => {
            if (p !== panel) p.classList.add('hidden');
        });
    });

    // Close button
    const closeBtn = panel.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            panel.classList.add('hidden');
        });
    }

    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && !settingsBtn.contains(e.target) && !panel.classList.contains('hidden')) {
            panel.classList.add('hidden');
        }
    });

    // Save settings
    clock24hr.addEventListener('change', () => {
        localStorage.setItem('clock24hr', clock24hr.checked);
        updateClock();
    });

    clockSeconds.addEventListener('change', () => {
        localStorage.setItem('clockSeconds', clockSeconds.checked);
        updateClock();
    });
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
                        localStorage.setItem(key, data.settings[key]);
                    });
                }

                // Restore links
                if (data.links) {
                    links = data.links;
                    saveLinks();
                    renderLinks();
                }

                showToast(' Settings imported! Refreshing...');
                setTimeout(() => location.reload(), 1500);
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
    const container = document.getElementById('search-engine-container');
    const icon = document.getElementById('engine-icon');
    const name = document.getElementById('engine-name');

    if (!container) return;

    const engines = [
        { name: 'Google', icon: 'https://www.google.com/favicon.ico', url: 'https://www.google.com/search?q=' },
        { name: 'DuckDuckGo', icon: 'https://duckduckgo.com/favicon.ico', url: 'https://duckduckgo.com/?q=' },
        { name: 'Bing', icon: 'https://www.bing.com/favicon.ico', url: 'https://www.bing.com/search?q=' },
        { name: 'Brave', icon: 'https://brave.com/static-assets/images/brave-favicon.png', url: 'https://search.brave.com/search?q=' }
    ];

    let currentIndex = parseInt(localStorage.getItem('searchEngineIndex')) || 0;

    function updateEngine() {
        const engine = engines[currentIndex];
        icon.src = engine.icon;
        name.textContent = engine.name;
        localStorage.setItem('searchEngineIndex', currentIndex);
    }

    container.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % engines.length;
        updateEngine();
    });

    // Handle search from main search bar
    const mainSearchInput = document.getElementById('main-search-input');
    if (mainSearchInput) {
        mainSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                const query = e.target.value.trim();
                window.open(engines[currentIndex].url + encodeURIComponent(query), '_blank');
                e.target.value = '';
            }
        });
    }

    updateEngine();
}
