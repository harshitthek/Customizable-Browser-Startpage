'use strict';

const STORAGE_KEYS = {
    links: 'savedLinks',
    theme: 'savedTheme',
    customAccent: 'customAccentColor',
    username: 'username',
    githubUsername: 'githubUsername',
    searchEngine: 'searchEngineIndex',
    clock24hr: 'clock24hr',
    clockSeconds: 'clockSeconds',
    background: 'backgroundSettings',
    legacyBackground: 'customBg',
    legacyBlur: 'bgBlur',
    legacyBrightness: 'bgBrightness'
};

const THEMES = {
    slate: {
        name: 'Dark Slate',
        tone: 'dark',
        bg: '#0f172a',
        bg2: '#1e293b',
        surface: 'rgba(15, 23, 42, 0.76)',
        surfaceStrong: 'rgba(15, 23, 42, 0.94)',
        textPrimary: '#f8fafc',
        textSecondary: '#cbd5e1',
        textMuted: '#94a3b8',
        accent: '#60a5fa',
        border: 'rgba(226, 232, 240, 0.18)',
        overlay: 'rgba(2, 6, 23, 0.48)',
        shadow: '0 24px 80px rgba(2, 6, 23, 0.38)',
        warning: '#f59e0b',
        success: '#22c55e'
    },
    light: {
        name: 'Light',
        tone: 'light',
        bg: '#e0f2fe',
        bg2: '#f8fafc',
        surface: 'rgba(255, 255, 255, 0.78)',
        surfaceStrong: 'rgba(255, 255, 255, 0.94)',
        textPrimary: '#0f172a',
        textSecondary: '#334155',
        textMuted: '#64748b',
        accent: '#2563eb',
        border: 'rgba(15, 23, 42, 0.14)',
        overlay: 'rgba(255, 255, 255, 0.54)',
        shadow: '0 24px 80px rgba(15, 23, 42, 0.16)',
        warning: '#b45309',
        success: '#15803d'
    },
    ocean: {
        name: 'Ocean',
        tone: 'dark',
        bg: '#00375e',
        bg2: '#1e3a8a',
        surface: 'rgba(0, 55, 94, 0.78)',
        surfaceStrong: 'rgba(0, 43, 74, 0.94)',
        textPrimary: '#f0f9ff',
        textSecondary: '#bae6fd',
        textMuted: '#7dd3fc',
        accent: '#f59e0b',
        border: 'rgba(186, 230, 253, 0.22)',
        overlay: 'rgba(0, 20, 36, 0.5)',
        shadow: '0 24px 80px rgba(0, 19, 38, 0.4)',
        warning: '#fbbf24',
        success: '#34d399'
    },
    cyberpunk: {
        name: 'Cyberpunk',
        tone: 'dark',
        bg: '#09090f',
        bg2: '#2e1065',
        surface: 'rgba(15, 23, 42, 0.8)',
        surfaceStrong: 'rgba(9, 9, 15, 0.96)',
        textPrimary: '#f5f3ff',
        textSecondary: '#d8b4fe',
        textMuted: '#a78bfa',
        accent: '#22d3ee',
        border: 'rgba(34, 211, 238, 0.25)',
        overlay: 'rgba(9, 9, 15, 0.54)',
        shadow: '0 24px 90px rgba(76, 29, 149, 0.38)',
        warning: '#f0abfc',
        success: '#2dd4bf'
    },
    sunset: {
        name: 'Sunset',
        tone: 'dark',
        bg: '#7f1d1d',
        bg2: '#7c2d12',
        surface: 'rgba(69, 10, 10, 0.74)',
        surfaceStrong: 'rgba(69, 10, 10, 0.94)',
        textPrimary: '#fff7ed',
        textSecondary: '#fed7aa',
        textMuted: '#fdba74',
        accent: '#fde68a',
        border: 'rgba(254, 215, 170, 0.24)',
        overlay: 'rgba(69, 10, 10, 0.48)',
        shadow: '0 24px 80px rgba(69, 10, 10, 0.36)',
        warning: '#fbbf24',
        success: '#86efac'
    },
    forest: {
        name: 'Forest',
        tone: 'dark',
        bg: '#052e16',
        bg2: '#14532d',
        surface: 'rgba(5, 46, 22, 0.76)',
        surfaceStrong: 'rgba(5, 46, 22, 0.94)',
        textPrimary: '#f0fdf4',
        textSecondary: '#bbf7d0',
        textMuted: '#86efac',
        accent: '#a3e635',
        border: 'rgba(187, 247, 208, 0.22)',
        overlay: 'rgba(5, 46, 22, 0.48)',
        shadow: '0 24px 80px rgba(5, 46, 22, 0.36)',
        warning: '#facc15',
        success: '#4ade80'
    },
    aurora: {
        name: 'Aurora Wave',
        tone: 'dark',
        bg: '#1a0b2e',
        bg2: '#312e81',
        surface: 'rgba(30, 27, 75, 0.76)',
        surfaceStrong: 'rgba(26, 11, 46, 0.94)',
        textPrimary: '#f5f3ff',
        textSecondary: '#ddd6fe',
        textMuted: '#c4b5fd',
        accent: '#a78bfa',
        border: 'rgba(221, 214, 254, 0.22)',
        overlay: 'rgba(26, 11, 46, 0.5)',
        shadow: '0 24px 90px rgba(30, 27, 75, 0.38)',
        warning: '#f9a8d4',
        success: '#6ee7b7'
    },
    northern: {
        name: 'Northern Lights',
        tone: 'dark',
        bg: '#022c22',
        bg2: '#065f46',
        surface: 'rgba(2, 44, 34, 0.78)',
        surfaceStrong: 'rgba(2, 44, 34, 0.94)',
        textPrimary: '#ecfdf5',
        textSecondary: '#a7f3d0',
        textMuted: '#6ee7b7',
        accent: '#34d399',
        border: 'rgba(167, 243, 208, 0.22)',
        overlay: 'rgba(2, 44, 34, 0.5)',
        shadow: '0 24px 90px rgba(2, 44, 34, 0.38)',
        warning: '#fcd34d',
        success: '#22c55e'
    },
    midnight: {
        name: 'Midnight',
        tone: 'dark',
        bg: '#080c24',
        bg2: '#1d4ed8',
        surface: 'rgba(12, 18, 46, 0.78)',
        surfaceStrong: 'rgba(8, 12, 36, 0.95)',
        textPrimary: '#eff6ff',
        textSecondary: '#bfdbfe',
        textMuted: '#93c5fd',
        accent: '#38bdf8',
        border: 'rgba(191, 219, 254, 0.22)',
        overlay: 'rgba(8, 12, 36, 0.52)',
        shadow: '0 24px 90px rgba(8, 12, 36, 0.4)',
        warning: '#fbbf24',
        success: '#34d399'
    },
    rosegold: {
        name: 'Rose Gold',
        tone: 'dark',
        bg: '#4c1d1d',
        bg2: '#be185d',
        surface: 'rgba(76, 29, 29, 0.76)',
        surfaceStrong: 'rgba(76, 29, 29, 0.94)',
        textPrimary: '#fff1f2',
        textSecondary: '#fecdd3',
        textMuted: '#fda4af',
        accent: '#f9a8d4',
        border: 'rgba(254, 205, 211, 0.24)',
        overlay: 'rgba(76, 29, 29, 0.5)',
        shadow: '0 24px 90px rgba(76, 29, 29, 0.38)',
        warning: '#fcd34d',
        success: '#86efac'
    },
    lavender: {
        name: 'Lavender',
        tone: 'light',
        bg: '#ede9fe',
        bg2: '#fdf2f8',
        surface: 'rgba(255, 255, 255, 0.78)',
        surfaceStrong: 'rgba(255, 255, 255, 0.94)',
        textPrimary: '#2e1065',
        textSecondary: '#5b21b6',
        textMuted: '#7c3aed',
        accent: '#7c3aed',
        border: 'rgba(46, 16, 101, 0.16)',
        overlay: 'rgba(255, 255, 255, 0.54)',
        shadow: '0 24px 80px rgba(91, 33, 182, 0.16)',
        warning: '#b45309',
        success: '#15803d'
    },
    graphite: {
        name: 'Graphite',
        tone: 'dark',
        bg: '#111827',
        bg2: '#27272a',
        surface: 'rgba(24, 24, 27, 0.78)',
        surfaceStrong: 'rgba(24, 24, 27, 0.95)',
        textPrimary: '#fafafa',
        textSecondary: '#d4d4d8',
        textMuted: '#a1a1aa',
        accent: '#f4f4f5',
        border: 'rgba(244, 244, 245, 0.18)',
        overlay: 'rgba(9, 9, 11, 0.5)',
        shadow: '0 24px 80px rgba(0, 0, 0, 0.38)',
        warning: '#f59e0b',
        success: '#22c55e'
    },
    ember: {
        name: 'Ember',
        tone: 'dark',
        bg: '#1c1917',
        bg2: '#7c2d12',
        surface: 'rgba(28, 25, 23, 0.78)',
        surfaceStrong: 'rgba(28, 25, 23, 0.95)',
        textPrimary: '#fff7ed',
        textSecondary: '#fed7aa',
        textMuted: '#fdba74',
        accent: '#fb923c',
        border: 'rgba(254, 215, 170, 0.22)',
        overlay: 'rgba(28, 25, 23, 0.52)',
        shadow: '0 24px 80px rgba(28, 25, 23, 0.38)',
        warning: '#facc15',
        success: '#86efac'
    }
};

const SEARCH_ENGINES = [
    { name: 'Google', icon: 'https://www.google.com/favicon.ico', url: 'https://www.google.com/search?q=' },
    { name: 'DuckDuckGo', icon: 'https://duckduckgo.com/favicon.ico', url: 'https://duckduckgo.com/?q=' },
    { name: 'Bing', icon: 'https://www.bing.com/favicon.ico', url: 'https://www.bing.com/search?q=' },
    { name: 'Yahoo', icon: 'https://www.yahoo.com/favicon.ico', url: 'https://search.yahoo.com/search?p=' },
    { name: 'Brave', icon: 'https://brave.com/static-assets/images/brave-favicon.png', url: 'https://search.brave.com/search?q=' }
];

const FALLBACK_QUOTES = [
    { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
    { text: 'The details are not the details. They make the design.', author: 'Charles Eames' },
    { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
    { text: 'Security is a process, not a product.', author: 'Bruce Schneier' },
    { text: 'Make things as simple as possible, but not simpler.', author: 'Albert Einstein' }
];

const DEFAULT_BACKGROUND = {
    type: 'gradient',
    value: '',
    fit: 'cover',
    blur: 0,
    brightness: 100,
    gradient: 'theme',
    complexity: 'calm'
};

const apiRateLimiter = {
    calls: {},
    canCall(apiName, maxCallsPerMinute = 10) {
        const now = Date.now();
        const minuteAgo = now - 60000;
        this.calls[apiName] = (this.calls[apiName] || []).filter(time => time > minuteAgo);
        if (this.calls[apiName].length >= maxCallsPerMinute) return false;
        this.calls[apiName].push(now);
        return true;
    }
};

let links = [];
let editingLinkIndex = null;
let contextMenuLinkIndex = null;
let draggedIndex = null;
let currentTheme = 'slate';
let currentBackground = { ...DEFAULT_BACKGROUND };

const el = {};

document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    initThemeSystem();
    initClock();
    initName();
    initBookmarks();
    initPanels();
    initSearchEngines();
    initQuote();
    initGitHub();
    initBackgroundSettings();
    initExportImport();
    initKeyboardShortcuts();
    initParticles();
});

function cacheElements() {
    Object.assign(el, {
        body: document.body,
        clock: document.getElementById('clock'),
        greeting: document.getElementById('greeting'),
        name: document.getElementById('name'),
        date: document.getElementById('date'),
        linksContainer: document.getElementById('links-container'),
        addLinkBtn: document.getElementById('add-link-btn'),
        modal: document.getElementById('add-link-modal'),
        modalTitle: document.getElementById('modal-title'),
        modalSubmitBtn: document.getElementById('modal-submit-btn'),
        addLinkForm: document.getElementById('add-link-form'),
        linkNameInput: document.getElementById('link-name-input'),
        linkUrlInput: document.getElementById('link-url-input'),
        cancelBtn: document.getElementById('cancel-btn'),
        closeBtn: document.querySelector('#add-link-modal .close-btn'),
        bookmarkSearch: document.getElementById('search-input'),
        bookmarkCount: document.getElementById('bookmark-count'),
        contextMenu: document.getElementById('context-menu'),
        contextOpenBtn: document.getElementById('context-open-btn'),
        contextEditBtn: document.getElementById('context-edit-btn'),
        contextDeleteBtn: document.getElementById('context-delete-btn'),
        themeBtn: document.getElementById('theme-btn'),
        themePanel: document.getElementById('theme-panel'),
        themeOptions: document.getElementById('theme-options'),
        accentColorInput: document.getElementById('accent-color-input'),
        saveCustomThemeBtn: document.getElementById('save-custom-theme-btn'),
        bgBtn: document.getElementById('bg-settings-btn'),
        bgPanel: document.getElementById('bg-settings-panel'),
        bgLayer: document.getElementById('background-layer'),
        bgPreview: document.getElementById('background-preview'),
        bgStatus: document.getElementById('background-status'),
        bgUpload: document.getElementById('bg-image-upload'),
        bgUrl: document.getElementById('bg-image-url'),
        applyBgUrl: document.getElementById('apply-bg-url'),
        bgFit: document.getElementById('bg-fit-mode'),
        bgGradient: document.getElementById('bg-gradient-select'),
        bgBlur: document.getElementById('bg-blur'),
        bgBrightness: document.getElementById('bg-brightness'),
        blurValue: document.getElementById('blur-value'),
        brightnessValue: document.getElementById('brightness-value'),
        resetBgBtn: document.getElementById('reset-bg-btn'),
        clockSettingsBtn: document.getElementById('clock-settings-btn'),
        clockPanel: document.getElementById('clock-settings-panel'),
        clock24: document.getElementById('clock-24hr'),
        clockSeconds: document.getElementById('clock-seconds'),
        mainSearchForm: document.getElementById('main-search-container'),
        mainSearchInput: document.getElementById('main-search-input'),
        engineButton: document.getElementById('search-engine-icon'),
        engineIcon: document.getElementById('engine-icon'),
        githubProfile: document.getElementById('github-profile'),
        githubRepos: document.getElementById('github-repos'),
        githubStatus: document.getElementById('github-status'),
        githubUsername: document.getElementById('gh-username-input'),
        githubUpdate: document.getElementById('gh-update-btn'),
        quoteWidget: document.getElementById('quote-widget'),
        quoteText: document.getElementById('quote-text'),
        quoteAuthor: document.getElementById('quote-author'),
        exportBtn: document.getElementById('export-settings-btn'),
        importBtn: document.getElementById('import-settings-btn'),
        importInput: document.getElementById('import-settings-input'),
        toastContainer: document.getElementById('toast-container')
    });
}

function initThemeSystem() {
    renderThemeOptions();
    const saved = localStorage.getItem(STORAGE_KEYS.theme) || 'slate';
    applyTheme(THEMES[saved] ? saved : 'slate');

    el.themeOptions?.addEventListener('click', event => {
        const option = event.target.closest('.theme-option');
        if (!option) return;
        applyTheme(option.dataset.theme);
        showToast(`Theme changed to ${THEMES[option.dataset.theme].name}.`, 'success');
    });

    el.accentColorInput?.addEventListener('input', () => {
        applyTheme('custom', el.accentColorInput.value, false);
    });

    el.saveCustomThemeBtn?.addEventListener('click', () => {
        const accent = el.accentColorInput.value;
        localStorage.setItem(STORAGE_KEYS.customAccent, accent);
        applyTheme('custom', accent);
        showToast('Custom accent saved.', 'success');
    });
}

function renderThemeOptions() {
    if (!el.themeOptions) return;
    el.themeOptions.replaceChildren();
    Object.entries(THEMES).forEach(([key, theme]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'theme-option';
        button.dataset.theme = key;
        button.setAttribute('aria-pressed', 'false');

        const swatch = document.createElement('span');
        swatch.className = 'theme-swatch';
        swatch.style.background = `linear-gradient(90deg, ${theme.bg}, ${theme.bg2}, ${theme.accent})`;

        const label = document.createElement('span');
        label.textContent = theme.name;
        button.append(swatch, label);
        el.themeOptions.appendChild(button);
    });
}

function applyTheme(themeName, customAccent = localStorage.getItem(STORAGE_KEYS.customAccent), persist = true) {
    const baseName = themeName === 'custom' ? (localStorage.getItem(STORAGE_KEYS.theme) === 'custom' ? 'slate' : localStorage.getItem(STORAGE_KEYS.theme) || 'slate') : themeName;
    const theme = { ...(THEMES[baseName] || THEMES.slate) };
    if (themeName === 'custom' && isHexColor(customAccent)) {
        theme.accent = customAccent;
    }

    const corrected = makeContrastSafeTheme(theme);
    currentTheme = themeName === 'custom' ? 'custom' : baseName;
    el.body.dataset.theme = currentTheme;
    el.body.dataset.tone = corrected.tone;

    const vars = {
        '--bg': corrected.bg,
        '--bg-2': corrected.bg2,
        '--surface': corrected.surface,
        '--surface-strong': corrected.surfaceStrong,
        '--text-primary': corrected.textPrimary,
        '--text-secondary': corrected.textSecondary,
        '--text-muted': corrected.textMuted,
        '--accent': corrected.accent,
        '--accent-contrast': readableTextFor(corrected.accent),
        '--border': corrected.border,
        '--overlay': corrected.overlay,
        '--shadow': corrected.shadow,
        '--warning': corrected.warning,
        '--success': corrected.success,
        '--focus': hexToRgba(corrected.accent, 0.38)
    };
    Object.entries(vars).forEach(([property, value]) => el.body.style.setProperty(property, value));

    if (persist) localStorage.setItem(STORAGE_KEYS.theme, currentTheme);
    updateThemePressedState();
    updateBackgroundScrim();
}

function updateThemePressedState() {
    document.querySelectorAll('.theme-option').forEach(option => {
        option.setAttribute('aria-pressed', String(option.dataset.theme === currentTheme));
    });
}

function makeContrastSafeTheme(theme) {
    const safe = { ...theme };
    const surfaceHex = colorToHex(safe.surface) || safe.bg;
    if (contrastRatio(safe.textPrimary, surfaceHex) < 4.5) safe.textPrimary = readableTextFor(surfaceHex);
    if (contrastRatio(safe.textSecondary, surfaceHex) < 3.2) safe.textSecondary = safe.textPrimary === '#ffffff' ? '#d1d5db' : '#334155';
    if (contrastRatio(safe.textMuted, surfaceHex) < 3) safe.textMuted = safe.textSecondary;
    return safe;
}

function initClock() {
    if (!el.clock) return;
    el.clock24.checked = localStorage.getItem(STORAGE_KEYS.clock24hr) === 'true';
    el.clockSeconds.checked = localStorage.getItem(STORAGE_KEYS.clockSeconds) !== 'false';

    updateClock();
    updateDateAndGreeting();
    setInterval(updateClock, 1000);
    setInterval(updateDateAndGreeting, 60000);

    el.clock24.addEventListener('change', () => {
        localStorage.setItem(STORAGE_KEYS.clock24hr, String(el.clock24.checked));
        updateClock();
    });
    el.clockSeconds.addEventListener('change', () => {
        localStorage.setItem(STORAGE_KEYS.clockSeconds, String(el.clockSeconds.checked));
        updateClock();
    });
}

function updateClock() {
    const now = new Date();
    const use24Hr = localStorage.getItem(STORAGE_KEYS.clock24hr) === 'true';
    const showSeconds = localStorage.getItem(STORAGE_KEYS.clockSeconds) !== 'false';
    const options = { hour: '2-digit', minute: '2-digit', hour12: !use24Hr };
    if (showSeconds) options.second = '2-digit';
    el.clock.textContent = now.toLocaleTimeString([], options);
}

function updateDateAndGreeting() {
    const now = new Date();
    const hour = now.getHours();
    const greetingText = hour < 12 ? 'Good morning,' : hour < 18 ? 'Good afternoon,' : 'Good evening,';
    const textNode = [...el.greeting.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
    if (textNode) textNode.textContent = `${greetingText} `;
    el.date.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function initName() {
    const savedName = sanitizeText(localStorage.getItem(STORAGE_KEYS.username), 40) || 'Guest';
    el.name.textContent = savedName;
    el.name.addEventListener('click', () => {
        const nextName = prompt('Enter your display name:', savedName === 'Guest' ? '' : el.name.textContent);
        const clean = sanitizeText(nextName, 40);
        if (!clean) return;
        localStorage.setItem(STORAGE_KEYS.username, clean);
        el.name.textContent = clean;
    });
}

function initBookmarks() {
    links = readLinks();
    renderLinks();

    el.addLinkBtn.addEventListener('click', () => openAddModal());
    el.closeBtn.addEventListener('click', closeModal);
    el.cancelBtn.addEventListener('click', closeModal);
    el.modal.addEventListener('click', event => {
        if (event.target === el.modal) closeModal();
    });

    el.addLinkForm.addEventListener('submit', event => {
        event.preventDefault();
        saveBookmarkFromForm();
    });

    el.bookmarkSearch.addEventListener('input', renderLinks);
    el.bookmarkSearch.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            el.bookmarkSearch.value = '';
            renderLinks();
            el.bookmarkSearch.blur();
        }
    });

    el.linksContainer.addEventListener('click', handleBookmarkClick);
    el.linksContainer.addEventListener('keydown', handleBookmarkKeydown);
    el.linksContainer.addEventListener('contextmenu', openContextMenu);
    el.linksContainer.addEventListener('dragstart', handleDragStart);
    el.linksContainer.addEventListener('dragover', handleDragOver);
    el.linksContainer.addEventListener('dragleave', event => event.target.closest('.link-item')?.classList.remove('drag-over'));
    el.linksContainer.addEventListener('drop', handleDrop);
    el.linksContainer.addEventListener('dragend', () => {
        draggedIndex = null;
        document.querySelectorAll('.dragging, .drag-over').forEach(node => node.classList.remove('dragging', 'drag-over'));
    });

    el.contextOpenBtn.addEventListener('click', () => {
        if (contextMenuLinkIndex !== null) window.open(links[contextMenuLinkIndex].url, '_blank', 'noopener,noreferrer');
        hideContextMenu();
    });
    el.contextEditBtn.addEventListener('click', () => {
        if (contextMenuLinkIndex !== null) openEditModal(contextMenuLinkIndex);
        hideContextMenu();
    });
    el.contextDeleteBtn.addEventListener('click', () => {
        if (contextMenuLinkIndex !== null) deleteLink(contextMenuLinkIndex);
        hideContextMenu();
    });
}

function readLinks() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.links) || '[]');
        if (!Array.isArray(parsed)) return [];
        return parsed
            .map(item => {
                try {
                    return {
                        name: sanitizeText(item.name, 100) || hostnameFromUrl(item.url) || 'Bookmark',
                        url: normalizeUrl(item.url)
                    };
                } catch {
                    return null;
                }
            })
            .filter(Boolean)
            .slice(0, 200);
    } catch {
        return [];
    }
}

function saveLinks() {
    localStorage.setItem(STORAGE_KEYS.links, JSON.stringify(links));
    updateBookmarkCount();
}

function renderLinks() {
    const query = el.bookmarkSearch.value.trim().toLowerCase();
    const visibleLinks = links
        .map((link, index) => ({ link, index }))
        .filter(({ link }) => !query || link.name.toLowerCase().includes(query) || hostnameFromUrl(link.url).toLowerCase().includes(query));

    el.linksContainer.replaceChildren();
    if (!visibleLinks.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = links.length ? 'No bookmarks match that filter.' : 'Add your first bookmark to make this startpage yours.';
        el.linksContainer.appendChild(empty);
        updateBookmarkCount();
        return;
    }

    visibleLinks.forEach(({ link, index }) => el.linksContainer.appendChild(createBookmarkNode(link, index)));
    updateBookmarkCount(visibleLinks.length);
}

function createBookmarkNode(link, index) {
    const item = document.createElement('article');
    item.className = 'link-item';
    item.dataset.index = String(index);
    item.draggable = true;

    const anchor = document.createElement('a');
    anchor.className = 'link-anchor';
    anchor.href = link.url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.title = `${link.name} - ${link.url}`;

    const icon = document.createElement('div');
    icon.className = 'icon-container';
    const image = document.createElement('img');
    image.className = 'favicon';
    image.alt = '';
    image.loading = 'lazy';
    image.referrerPolicy = 'no-referrer';
    image.src = getSecureFaviconUrl(link.url);
    image.addEventListener('error', () => renderFallbackIcon(icon, link.name), { once: true });
    icon.appendChild(image);

    const name = document.createElement('span');
    name.className = 'link-name';
    name.textContent = link.name;

    const host = document.createElement('span');
    host.className = 'link-host';
    host.textContent = hostnameFromUrl(link.url);

    anchor.append(icon, name, host);

    const actions = document.createElement('div');
    actions.className = 'link-actions';
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'edit-btn';
    edit.dataset.action = 'edit';
    edit.title = 'Edit bookmark';
    edit.textContent = 'Edit';
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete-btn';
    remove.dataset.action = 'delete';
    remove.title = 'Delete bookmark';
    remove.textContent = 'Del';
    actions.append(edit, remove);

    item.append(anchor, actions);
    return item;
}

function renderFallbackIcon(container, name) {
    container.replaceChildren();
    const fallback = document.createElement('span');
    fallback.className = 'fallback-icon';
    fallback.textContent = (sanitizeText(name, 1) || '?').toUpperCase();
    container.appendChild(fallback);
}

function updateBookmarkCount(visibleCount = links.length) {
    if (!el.bookmarkCount) return;
    const total = links.length;
    el.bookmarkCount.textContent = total === 0 ? 'No bookmarks yet' : `${visibleCount} of ${total} bookmark${total === 1 ? '' : 's'}`;
}

function handleBookmarkClick(event) {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    event.preventDefault();
    const item = event.target.closest('.link-item');
    const index = Number(item?.dataset.index);
    if (!Number.isInteger(index)) return;
    if (action === 'edit') openEditModal(index);
    if (action === 'delete') deleteLink(index);
}

function handleBookmarkKeydown(event) {
    const item = event.target.closest('.link-item');
    if (!item) return;
    const index = Number(item.dataset.index);
    if (event.key === 'Delete') {
        event.preventDefault();
        deleteLink(index);
    }
    if (event.key.toLowerCase() === 'e') {
        event.preventDefault();
        openEditModal(index);
    }
}

function handleDragStart(event) {
    const item = event.target.closest('.link-item');
    if (!item) return;
    draggedIndex = Number(item.dataset.index);
    item.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(draggedIndex));
}

function handleDragOver(event) {
    const item = event.target.closest('.link-item');
    if (!item || draggedIndex === null) return;
    event.preventDefault();
    document.querySelectorAll('.drag-over').forEach(node => node.classList.remove('drag-over'));
    item.classList.add('drag-over');
}

function handleDrop(event) {
    const item = event.target.closest('.link-item');
    if (!item || draggedIndex === null) return;
    event.preventDefault();
    const targetIndex = Number(item.dataset.index);
    if (targetIndex === draggedIndex) return;
    const [moved] = links.splice(draggedIndex, 1);
    links.splice(targetIndex, 0, moved);
    saveLinks();
    renderLinks();
    showToast('Bookmark order updated.', 'success');
}

function openContextMenu(event) {
    const item = event.target.closest('.link-item');
    if (!item) return;
    event.preventDefault();
    contextMenuLinkIndex = Number(item.dataset.index);
    const menuWidth = 150;
    const menuHeight = 126;
    el.contextMenu.style.left = `${Math.min(event.clientX, window.innerWidth - menuWidth - 8)}px`;
    el.contextMenu.style.top = `${Math.min(event.clientY, window.innerHeight - menuHeight - 8)}px`;
    el.contextMenu.classList.remove('hidden');
}

function hideContextMenu() {
    contextMenuLinkIndex = null;
    el.contextMenu.classList.add('hidden');
}

function openAddModal() {
    editingLinkIndex = null;
    el.modalTitle.textContent = 'Add Bookmark';
    el.modalSubmitBtn.textContent = 'Add Bookmark';
    el.addLinkForm.reset();
    el.modal.classList.remove('hidden');
    setTimeout(() => el.linkNameInput.focus(), 50);
}

function openEditModal(index) {
    const link = links[index];
    if (!link) return;
    editingLinkIndex = index;
    el.modalTitle.textContent = 'Edit Bookmark';
    el.modalSubmitBtn.textContent = 'Save Changes';
    el.linkNameInput.value = link.name;
    el.linkUrlInput.value = link.url;
    el.modal.classList.remove('hidden');
    setTimeout(() => el.linkNameInput.focus(), 50);
}

function closeModal() {
    el.modal.classList.add('hidden');
    el.addLinkForm.reset();
    editingLinkIndex = null;
}

function saveBookmarkFromForm() {
    const name = sanitizeText(el.linkNameInput.value, 100);
    let url;
    try {
        url = normalizeUrl(el.linkUrlInput.value);
    } catch (error) {
        showToast(error.message, 'error');
        el.linkUrlInput.focus();
        return;
    }
    if (!name) {
        showToast('Bookmark name is required.', 'error');
        el.linkNameInput.focus();
        return;
    }

    const normalized = { name, url };
    const duplicateIndex = links.findIndex((link, index) => index !== editingLinkIndex && link.url === url);
    if (duplicateIndex >= 0 && !confirm('A bookmark with this URL already exists. Add it anyway?')) return;

    if (editingLinkIndex === null) {
        links.push(normalized);
        showToast('Bookmark added.', 'success');
    } else {
        links[editingLinkIndex] = normalized;
        showToast('Bookmark updated.', 'success');
    }
    saveLinks();
    renderLinks();
    closeModal();
}

function deleteLink(index) {
    const link = links[index];
    if (!link) return;
    if (!confirm(`Delete "${link.name}"?`)) return;
    links.splice(index, 1);
    saveLinks();
    renderLinks();
    showToast('Bookmark deleted.', 'success');
}

function initPanels() {
    el.themeBtn.addEventListener('click', event => togglePanel(event, el.themePanel));
    el.bgBtn.addEventListener('click', event => togglePanel(event, el.bgPanel));
    el.clockSettingsBtn.addEventListener('click', event => togglePanel(event, el.clockPanel));

    document.addEventListener('click', event => {
        if (event.target.closest('.panel, .modal-content, .top-right-controls, #clock-settings-btn')) return;
        closePanels();
        hideContextMenu();
    });

    document.querySelectorAll('[data-close-panel]').forEach(button => {
        button.addEventListener('click', () => document.getElementById(button.dataset.closePanel)?.classList.add('hidden'));
    });
}

function togglePanel(event, panel) {
    event.stopPropagation();
    const wasHidden = panel.classList.contains('hidden');
    closePanels();
    if (wasHidden) panel.classList.remove('hidden');
}

function closePanels() {
    document.querySelectorAll('.panel:not(.modal-content)').forEach(panel => panel.classList.add('hidden'));
}

function initSearchEngines() {
    let currentIndex = clampInt(localStorage.getItem(STORAGE_KEYS.searchEngine), 0, SEARCH_ENGINES.length - 1, 0);

    function updateEngine() {
        const engine = SEARCH_ENGINES[currentIndex];
        el.engineIcon.src = engine.icon;
        el.engineIcon.alt = engine.name;
        el.engineButton.title = `Switch search engine (${engine.name})`;
        localStorage.setItem(STORAGE_KEYS.searchEngine, String(currentIndex));
    }

    el.engineButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % SEARCH_ENGINES.length;
        updateEngine();
        showToast(`Search engine: ${SEARCH_ENGINES[currentIndex].name}`, 'success');
    });

    el.mainSearchForm.addEventListener('submit', event => {
        event.preventDefault();
        const query = el.mainSearchInput.value.trim();
        if (!query) return;
        const engine = SEARCH_ENGINES[currentIndex];
        window.open(engine.url + encodeURIComponent(query), '_blank', 'noopener,noreferrer');
        el.mainSearchInput.value = '';
    });

    updateEngine();
}

function initQuote() {
    const showLocalQuote = () => {
        const quote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
        renderQuote(quote);
    };

    showLocalQuote();
    loadRemoteQuote().catch(() => {});

    el.quoteWidget.addEventListener('click', showLocalQuote);
    el.quoteWidget.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            showLocalQuote();
        }
    });
}

async function loadRemoteQuote() {
    if (!apiRateLimiter.canCall('quotes', 4)) return;
    const response = await secureFetch('https://api.quotable.io/random?maxLength=120', {}, 4000);
    if (!response.ok) throw new Error('Quote unavailable');
    const quote = await response.json();
    renderQuote({ text: sanitizeText(quote.content, 180), author: sanitizeText(quote.author, 80) });
}

function renderQuote(quote) {
    el.quoteText.textContent = `"${quote.text}"`;
    el.quoteAuthor.textContent = quote.author ? `- ${quote.author}` : '';
}

function initGitHub() {
    const savedUsername = sanitizeGithubUsername(localStorage.getItem(STORAGE_KEYS.githubUsername) || 'harshitthek');
    el.githubUsername.value = savedUsername;
    el.githubUpdate.addEventListener('click', () => {
        const username = sanitizeGithubUsername(el.githubUsername.value);
        if (!username) {
            showToast('Enter a valid GitHub username.', 'error');
            return;
        }
        loadGitHubData(username);
    });
    if (savedUsername) loadGitHubData(savedUsername);
}

async function loadGitHubData(username) {
    if (!apiRateLimiter.canCall('github', 10)) {
        renderGithubError('GitHub rate limit reached locally. Try again in a minute.');
        return;
    }
    el.githubStatus.textContent = 'Loading';
    el.githubProfile.replaceChildren(createLoading('Loading GitHub profile...'));
    el.githubRepos.replaceChildren();

    try {
        const [profileResponse, reposResponse] = await Promise.all([
            secureFetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {}, 6000),
            secureFetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=5`, {}, 6000)
        ]);

        if (profileResponse.status === 403) throw new Error('GitHub API limit reached. Try again later.');
        if (!profileResponse.ok) throw new Error('GitHub user not found.');
        if (!reposResponse.ok) throw new Error('GitHub repositories unavailable.');

        const profile = await profileResponse.json();
        const repos = await reposResponse.json();
        renderGitHubProfile(profile, Array.isArray(repos) ? repos : []);
        localStorage.setItem(STORAGE_KEYS.githubUsername, username);
        el.githubStatus.textContent = 'Loaded';
    } catch (error) {
        renderGithubError(error.message);
    }
}

function renderGitHubProfile(profile, repos) {
    el.githubProfile.replaceChildren();
    const card = document.createElement('div');
    card.className = 'gh-profile-card';
    const avatar = document.createElement('img');
    avatar.className = 'gh-avatar';
    avatar.alt = '';
    avatar.loading = 'lazy';
    avatar.referrerPolicy = 'no-referrer';
    avatar.src = safeHttpsUrl(profile.avatar_url) || '';
    const info = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'gh-name';
    name.textContent = sanitizeText(profile.name || profile.login, 80) || 'GitHub User';
    const bio = document.createElement('div');
    bio.className = 'gh-bio';
    bio.textContent = sanitizeText(profile.bio, 140) || 'No bio available';
    info.append(name, bio);
    card.append(avatar, info);

    const stats = document.createElement('div');
    stats.className = 'gh-stats-grid';
    [
        ['Repositories', profile.public_repos],
        ['Followers', profile.followers],
        ['Following', profile.following],
        ['Gists', profile.public_gists]
    ].forEach(([label, value]) => stats.appendChild(createStatBox(label, value)));

    el.githubProfile.append(card, stats);

    const topRepo = repos.reduce((best, repo) => Number(repo.stargazers_count) > Number(best?.stargazers_count || -1) ? repo : best, null);
    el.githubRepos.replaceChildren();
    if (topRepo?.name) el.githubRepos.appendChild(createRepoNode(topRepo, true));
    repos.forEach(repo => el.githubRepos.appendChild(createRepoNode(repo, false)));
}

function createStatBox(label, value) {
    const box = document.createElement('div');
    box.className = 'gh-stat-box';
    const statValue = document.createElement('span');
    statValue.className = 'stat-value';
    statValue.textContent = String(Number(value) || 0);
    const statLabel = document.createElement('span');
    statLabel.className = 'stat-label';
    statLabel.textContent = label;
    box.append(statValue, statLabel);
    return box;
}

function createRepoNode(repo, featured) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = featured ? 'gh-top-repo gh-repo' : 'gh-repo';
    button.addEventListener('click', () => {
        const url = safeHttpsUrl(repo.html_url);
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
    });
    const title = document.createElement('div');
    title.className = featured ? 'gh-top-repo-name' : 'gh-repo-name';
    title.textContent = `${featured ? 'Most starred: ' : ''}${sanitizeText(repo.name, 80) || 'Repository'}`;
    const desc = document.createElement('div');
    desc.className = 'gh-repo-desc';
    desc.textContent = sanitizeText(repo.description, 130) || 'No description';
    const meta = document.createElement('div');
    meta.className = 'gh-repo-meta';
    meta.textContent = `${sanitizeText(repo.language, 40) || 'Code'} - ${Number(repo.stargazers_count) || 0} stars`;
    button.append(title, desc, meta);
    return button;
}

function renderGithubError(message) {
    el.githubStatus.textContent = 'Unavailable';
    el.githubProfile.replaceChildren(createError(message || 'GitHub unavailable.'));
    el.githubRepos.replaceChildren();
}

function createLoading(message) {
    const node = document.createElement('div');
    node.className = 'loading-state';
    node.textContent = message;
    return node;
}

function createError(message) {
    const node = document.createElement('div');
    node.className = 'error-state';
    node.textContent = message;
    return node;
}

function initBackgroundSettings() {
    currentBackground = readBackgroundSettings();
    syncBackgroundControls();
    applyBackground(currentBackground, { skipValidation: true });

    el.bgUpload.addEventListener('change', event => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
            showToast('Choose an image under 5 MB.', 'error');
            event.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = loadEvent => {
            const next = { ...currentBackground, type: 'upload', value: String(loadEvent.target.result), complexity: 'busy' };
            applyBackground(next);
        };
        reader.onerror = () => showToast('Could not read that image.', 'error');
        reader.readAsDataURL(file);
    });

    el.applyBgUrl.addEventListener('click', () => {
        let url;
        try {
            url = normalizeUrl(el.bgUrl.value);
        } catch (error) {
            showToast(error.message, 'error');
            return;
        }
        const next = { ...currentBackground, type: 'remote', value: url, complexity: 'busy' };
        applyBackground(next);
    });

    [el.bgFit, el.bgGradient, el.bgBlur, el.bgBrightness].forEach(control => {
        control.addEventListener('input', () => {
            const next = {
                ...currentBackground,
                fit: el.bgFit.value,
                gradient: el.bgGradient.value,
                blur: clampInt(el.bgBlur.value, 0, 24, 0),
                brightness: clampInt(el.bgBrightness.value, 55, 145, 100)
            };
            applyBackground(next, { skipImageReload: true });
        });
    });

    el.resetBgBtn.addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEYS.background);
        localStorage.removeItem(STORAGE_KEYS.legacyBackground);
        localStorage.removeItem(STORAGE_KEYS.legacyBlur);
        localStorage.removeItem(STORAGE_KEYS.legacyBrightness);
        applyBackground({ ...DEFAULT_BACKGROUND });
        syncBackgroundControls();
        showToast('Background reset.', 'success');
    });
}

function readBackgroundSettings() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.background) || 'null');
        if (parsed && typeof parsed === 'object') {
            return normalizeBackgroundSettings(parsed);
        }
    } catch {}

    const legacy = localStorage.getItem(STORAGE_KEYS.legacyBackground);
    if (legacy) {
        return normalizeBackgroundSettings({
            type: legacy.startsWith('data:') ? 'upload' : 'remote',
            value: legacy,
            fit: 'cover',
            blur: localStorage.getItem(STORAGE_KEYS.legacyBlur) || 0,
            brightness: localStorage.getItem(STORAGE_KEYS.legacyBrightness) || 100,
            gradient: 'theme',
            complexity: 'busy'
        });
    }
    return { ...DEFAULT_BACKGROUND };
}

function normalizeBackgroundSettings(settings) {
    const next = { ...DEFAULT_BACKGROUND, ...settings };
    next.type = ['gradient', 'upload', 'remote'].includes(next.type) ? next.type : 'gradient';
    next.fit = ['cover', 'contain', 'centered', 'blur'].includes(next.fit) ? next.fit : 'cover';
    next.gradient = ['theme', 'dawn', 'orbit', 'meadow', 'ember'].includes(next.gradient) ? next.gradient : 'theme';
    next.blur = clampInt(next.blur, 0, 24, 0);
    next.brightness = clampInt(next.brightness, 55, 145, 100);
    next.value = typeof next.value === 'string' ? next.value : '';
    if (next.type === 'remote' && !safeHttpsUrl(next.value)) {
        next.type = 'gradient';
        next.value = '';
    }
    if (next.type === 'upload' && !next.value.startsWith('data:image/')) {
        next.type = 'gradient';
        next.value = '';
    }
    return next;
}

function syncBackgroundControls() {
    el.bgFit.value = currentBackground.fit;
    el.bgGradient.value = currentBackground.gradient;
    el.bgBlur.value = currentBackground.blur;
    el.bgBrightness.value = currentBackground.brightness;
    el.blurValue.textContent = String(currentBackground.blur);
    el.brightnessValue.textContent = String(currentBackground.brightness);
    if (currentBackground.type === 'remote') el.bgUrl.value = currentBackground.value;
}

async function applyBackground(settings, options = {}) {
    const next = normalizeBackgroundSettings(settings);
    currentBackground = next;
    syncBackgroundControls();
    el.body.dataset.bgFit = next.fit;
    el.body.dataset.bgGradient = next.gradient;
    el.blurValue.textContent = String(next.blur);
    el.brightnessValue.textContent = String(next.brightness);

    if (next.type === 'gradient' || !next.value) {
        el.body.classList.remove('has-custom-bg', 'bg-busy');
        el.bgLayer.style.backgroundImage = '';
        el.bgPreview.style.backgroundImage = '';
        el.bgStatus.textContent = 'Gradient background active.';
        persistBackground(next);
        updateBackgroundScrim();
        return;
    }

    if (!options.skipImageReload && !options.skipValidation) {
        el.bgStatus.textContent = 'Checking image...';
        el.applyBgUrl.disabled = true;
        try {
            const analysis = await loadAndAnalyzeImage(next.value);
            next.complexity = analysis.busy ? 'busy' : 'calm';
            el.bgStatus.textContent = analysis.message;
        } catch (error) {
            el.applyBgUrl.disabled = false;
            el.bgStatus.textContent = 'Image failed to load. Using gradient fallback.';
            showToast(error.message, 'error');
            return;
        }
        el.applyBgUrl.disabled = false;
    }

    const image = cssUrl(next.value);
    el.bgLayer.style.backgroundImage = image;
    el.bgLayer.style.filter = `blur(${next.fit === 'blur' ? Math.max(12, next.blur) : next.blur}px) brightness(${next.brightness}%)`;
    el.bgPreview.style.backgroundImage = image;
    el.body.classList.add('has-custom-bg');
    el.body.classList.toggle('bg-busy', next.complexity === 'busy' || next.brightness > 118);
    persistBackground(next);
    updateBackgroundScrim();
}

function persistBackground(settings) {
    localStorage.setItem(STORAGE_KEYS.background, JSON.stringify(settings));
}

function updateBackgroundScrim() {
    if (!el.body) return;
    const busy = currentBackground.type !== 'gradient' && (currentBackground.complexity === 'busy' || currentBackground.brightness > 112);
    const theme = THEMES[currentTheme] || THEMES.slate;
    const overlay = busy
        ? (theme.tone === 'light' ? 'rgba(255,255,255,0.70)' : 'rgba(2,6,23,0.66)')
        : theme.overlay;
    el.body.style.setProperty('--overlay', overlay);
}

function loadAndAnalyzeImage(src) {
    return new Promise((resolve, reject) => {
        if (!src.startsWith('data:') && !safeHttpsUrl(src)) {
            reject(new Error('Only HTTPS, HTTP, and local uploaded images are supported.'));
            return;
        }

        const image = new Image();
        image.decoding = 'async';
        image.referrerPolicy = 'no-referrer';
        if (!src.startsWith('data:')) image.crossOrigin = 'anonymous';
        const timeout = setTimeout(() => {
            image.src = '';
            reject(new Error('Image took too long to load.'));
        }, 7000);

        image.onload = () => {
            clearTimeout(timeout);
            const ratio = image.naturalWidth / Math.max(1, image.naturalHeight);
            const lowRes = image.naturalWidth < 900 || image.naturalHeight < 500;
            const awkward = ratio > 3 || ratio < 0.45;
            const brightness = estimateImageBrightness(image);
            const busy = lowRes || awkward || brightness > 180 || brightness < 52;
            const notes = [];
            if (lowRes) notes.push('low resolution');
            if (awkward) notes.push('unusual aspect ratio');
            if (brightness > 180) notes.push('bright image');
            if (brightness < 52) notes.push('dark image');
            resolve({
                busy,
                message: notes.length ? `Image loaded; overlay strengthened for ${notes.join(', ')}.` : 'Image loaded successfully.'
            });
        };
        image.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Image failed to load. Check the URL or CDN permissions.'));
        };
        image.src = src;
    });
}

function estimateImageBrightness(image) {
    try {
        const canvas = document.createElement('canvas');
        const size = 24;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(image, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        let total = 0;
        for (let i = 0; i < data.length; i += 4) {
            total += (data[i] * 0.299) + (data[i + 1] * 0.587) + (data[i + 2] * 0.114);
        }
        return total / (data.length / 4);
    } catch {
        return 128;
    }
}

function initExportImport() {
    el.exportBtn.addEventListener('click', () => {
        const data = {
            version: '2.0',
            exportedAt: new Date().toISOString(),
            settings: pickLocalSettings(),
            links
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `dailycosmos-backup-${new Date().toISOString().slice(0, 10)}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
        showToast('Settings exported.', 'success');
    });

    el.importBtn.addEventListener('click', () => el.importInput.click());
    el.importInput.addEventListener('change', event => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = loadEvent => {
            try {
                const data = JSON.parse(String(loadEvent.target.result));
                importSettings(data);
                showToast('Settings imported. Refreshing...', 'success');
                setTimeout(() => window.location.reload(), 900);
            } catch (error) {
                showToast(error.message || 'Invalid backup file.', 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    });
}

function pickLocalSettings() {
    const keys = Object.values(STORAGE_KEYS);
    return keys.reduce((acc, key) => {
        const value = localStorage.getItem(key);
        if (value !== null) acc[key] = value;
        return acc;
    }, {});
}

function importSettings(data) {
    if (!data || typeof data !== 'object') throw new Error('Invalid backup file.');
    const importedLinks = Array.isArray(data.links) ? data.links : tryParseJson(data.settings?.[STORAGE_KEYS.links], []);
    links = importedLinks
        .map(item => {
            try {
                return { name: sanitizeText(item.name, 100), url: normalizeUrl(item.url) };
            } catch {
                return null;
            }
        })
        .filter(item => item?.name && item?.url)
        .slice(0, 200);
    saveLinks();

    const allowedKeys = new Set(Object.values(STORAGE_KEYS));
    if (data.settings && typeof data.settings === 'object') {
        Object.entries(data.settings).forEach(([key, value]) => {
            if (allowedKeys.has(key) && typeof value === 'string' && value.length < 7_000_000) {
                localStorage.setItem(key, value);
            }
        });
    }
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', event => {
        const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);
        if (event.key === 'Escape') {
            closePanels();
            hideContextMenu();
            closeModal();
            return;
        }
        if (typing) return;
        if (event.key === '/') {
            event.preventDefault();
            el.mainSearchInput.focus();
        }
        if (event.key.toLowerCase() === 'n') el.addLinkBtn.click();
        if (event.key.toLowerCase() === 'b') el.bgBtn.click();
        if (event.key.toLowerCase() === 't') el.themeBtn.click();
    });
}

function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const count = window.innerWidth < 700 ? 28 : 68;
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.28,
            vy: (Math.random() - 0.5) * 0.28,
            radius: Math.random() * 1.8 + 0.4
        }));
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || 'rgba(255,255,255,0.4)';
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
            ctx.globalAlpha = 0.32;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener('resize', resize);
}

function showToast(message, type = '') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`.trim();
    toast.textContent = message;
    el.toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        setTimeout(() => toast.remove(), 220);
    }, 3200);
}

function sanitizeText(value, maxLength = 200) {
    return String(value || '')
        .replace(/[\u0000-\u001f\u007f]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxLength);
}

function normalizeUrl(value) {
    let raw = sanitizeText(value, 2048);
    if (!raw) throw new Error('URL is required.');
    if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
    let url;
    try {
        url = new URL(raw);
    } catch {
        throw new Error('Enter a valid URL.');
    }
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only HTTP and HTTPS URLs are allowed.');
    if (!url.hostname || url.hostname.includes('..')) throw new Error('Enter a valid hostname.');
    return url.href;
}

function safeHttpsUrl(value) {
    try {
        const url = new URL(value);
        return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch {
        return '';
    }
}

function hostnameFromUrl(value) {
    try {
        return new URL(value).hostname.replace(/^www\./, '');
    } catch {
        return '';
    }
}

function getSecureFaviconUrl(value) {
    const host = hostnameFromUrl(value);
    return host ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64` : '';
}

function sanitizeGithubUsername(value) {
    const username = sanitizeText(value, 39);
    return /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username) ? username : '';
}

function cssUrl(value) {
    return `url("${String(value).replace(/"/g, '%22')}")`;
}

function isHexColor(value) {
    return /^#[0-9a-f]{6}$/i.test(value || '');
}

function colorToHex(value) {
    if (!value) return null;
    if (isHexColor(value)) return value;
    const rgba = value.match(/rgba?\(([^)]+)\)/i);
    if (!rgba) return null;
    const [r, g, b] = rgba[1].split(',').map(part => Number.parseFloat(part.trim()));
    if ([r, g, b].some(Number.isNaN)) return null;
    return `#${[r, g, b].map(n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('')}`;
}

function hexToRgb(hex) {
    const safe = isHexColor(hex) ? hex.slice(1) : '000000';
    return {
        r: Number.parseInt(safe.slice(0, 2), 16),
        g: Number.parseInt(safe.slice(2, 4), 16),
        b: Number.parseInt(safe.slice(4, 6), 16)
    };
}

function hexToRgba(hex, alpha) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function relativeLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const convert = channel => {
        const s = channel / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return (0.2126 * convert(r)) + (0.7152 * convert(g)) + (0.0722 * convert(b));
}

function contrastRatio(a, b) {
    const l1 = relativeLuminance(a);
    const l2 = relativeLuminance(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function readableTextFor(hex) {
    return contrastRatio('#ffffff', hex) >= contrastRatio('#0f172a', hex) ? '#ffffff' : '#0f172a';
}

function clampInt(value, min, max, fallback) {
    const number = Number.parseInt(value, 10);
    if (Number.isNaN(number)) return fallback;
    return Math.max(min, Math.min(max, number));
}

function tryParseJson(value, fallback) {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

function secureFetch(url, options = {}, timeoutMs = 5000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, {
        ...options,
        credentials: 'omit',
        cache: options.cache || 'no-store',
        signal: controller.signal
    }).finally(() => clearTimeout(timeout));
}
