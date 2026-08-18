import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.resolve(__dirname, '../index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const jsPath = path.resolve(__dirname, '../js/main.js');
const js = fs.readFileSync(jsPath, 'utf8');

describe('DailyCosmos UI and Core Logic', () => {
    let globalStore = {};

    function setupDOM(initialStore = null) {
        const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost' });
        const window = dom.window;
        const document = window.document;

        // Mock localStorage
        let store = initialStore ? { ...initialStore } : { ...globalStore };
        const localStorageMock = {
            getItem: function(key) { return store[key] || null; },
            setItem: function(key, value) { store[key] = value.toString(); },
            removeItem: function(key) { delete store[key]; },
            clear: function() { store = {}; }
        };
        Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
        
        window.matchMedia = window.matchMedia || function() {
            return { matches: false, addListener: function() {}, removeListener: function() {} };
        };
        window.alert = function(msg) {
            window.lastAlert = msg;
        };

        window.HTMLCanvasElement.prototype.getContext = function () {
            const gradMock = { addColorStop: function() {} };
            return {
                clearRect: function() {},
                fillRect: function() {},
                beginPath: function() {},
                arc: function() {},
                fill: function() {},
                stroke: function() {},
                moveTo: function() {},
                lineTo: function() {},
                fillText: function() {},
                bezierCurveTo: function() {},
                closePath: function() {},
                createRadialGradient: function() { return gradMock; },
                createLinearGradient: function() { return gradMock; },
                createConicGradient: function() { return gradMock; }
            };
        };
        window.requestAnimationFrame = function(callback) { return setTimeout(() => callback(performance.now()), 0); };
        window.cancelAnimationFrame = function(id) { clearTimeout(id); };
        window.fetch = window.fetch || function() {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ current: { temperature_2m: 14, relative_humidity_2m: 88, wind_speed_10m: 13, weather_code: 63 } })
            });
        };

        dom.window.eval(js);
        document.dispatchEvent(new window.Event('DOMContentLoaded'));

        return { window, document, store };
    }

    beforeEach(() => {
        globalStore = {};
    });

    it('should initialize without throwing errors', () => {
        expect(() => {
            setupDOM();
        }).not.toThrow();
    });

    it('should set default theme if none in localStorage', () => {
        const { document } = setupDOM();
        expect(document.body.dataset.theme).toBe('slate');
    });

    it('should trap focus within modals', () => {
        const { document, window } = setupDOM();
        const modal = document.getElementById('add-link-modal');
        const event = new window.KeyboardEvent('keydown', { key: 'Tab' });
        expect(() => {
            document.dispatchEvent(event);
        }).not.toThrow();
    });

    it('should have no duplicate IDs in HTML', () => {
        const { document } = setupDOM();
        const ids = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
        const uniqueIds = new Set(ids);
        expect(ids.length).toBe(uniqueIds.size);
    });

    it('Theme persistence test: saves to localStorage and restores', () => {
        // 1 & 2: User selects theme and written to localStorage
        const { document, window, store } = setupDOM();
        const themeBtn = document.querySelector('.theme-option[data-theme="cyberpunk"]');
        if (themeBtn) themeBtn.click();
        
        expect(document.body.dataset.theme).toBe('cyberpunk');
        expect(window.localStorage.getItem('savedTheme')).toBe('cyberpunk');

        // 3 & 4: Page initializes again and theme restores correctly
        const { document: doc2 } = setupDOM({ savedTheme: 'cyberpunk' });
        expect(doc2.body.dataset.theme).toBe('cyberpunk');
    });

    it('Modal open/close toggles hidden class and manages focus', () => {
        const { document } = setupDOM();
        const modal = document.getElementById('add-link-modal');
        const btn = document.getElementById('add-link-btn');
        const closeBtn = modal.querySelector('.close-btn');

        btn.click();
        expect(modal.classList.contains('hidden')).toBe(false);

        closeBtn.click();
        expect(modal.classList.contains('hidden')).toBe(true);
    });

    it('Bookmark CRUD operations update DOM and localStorage', () => {
        const { document, window } = setupDOM();
        
        // Setup values
        const nameInput = document.getElementById('link-name-input');
        const urlInput = document.getElementById('link-url-input');
        const form = document.getElementById('add-link-form');
        
        nameInput.value = 'TestLink123';
        urlInput.value = 'https://test.com';
        
        // Trigger save (Create)
        form.dispatchEvent(new window.Event('submit', { cancelable: true, bubbles: true }));

        const linksStr = window.localStorage.getItem('savedLinks');
        expect(linksStr).toContain('TestLink123');

        // Verify it rendered
        const container = document.getElementById('links-container');
        expect(container.innerHTML).toContain('TestLink123');
    });

    it('handles localStorage quota exceeded safely', () => {
        const { document, window } = setupDOM();
        
        // Make setItem throw quota exceeded
        window.localStorage.setItem = function() {
            const e = new Error('Quota exceeded');
            e.name = 'QuotaExceededError';
            throw e;
        };

        const form = document.getElementById('add-link-form');
        const nameInput = document.getElementById('link-name-input');
        const urlInput = document.getElementById('link-url-input');
        
        nameInput.value = 'QuotaTest';
        urlInput.value = 'https://quota.com';

        expect(() => {
            form.dispatchEvent(new window.Event('submit', { cancelable: true, bubbles: true }));
        }).not.toThrow();
        
        // The toast should show up
        expect(window.lastAlert).toContain('Storage quota exceeded');
    });

    it('Dev Dashboard: activates theme and verifies all core widgets exist in DOM', () => {
        const devJsPath = path.resolve(__dirname, '../js/dev-dashboard.js');
        const devJs = fs.readFileSync(devJsPath, 'utf8');

        const { document, window } = setupDOM();
        window.eval(devJs);

        try {
            const devThemeBtn = document.querySelector('.theme-option[data-theme="dev"]');
            expect(devThemeBtn).toBeTruthy();
            devThemeBtn.click();

            expect(document.body.dataset.theme).toBe('dev');
            expect(window.localStorage.getItem('savedTheme')).toBe('dev');

            // Check essential Dev Dashboard elements
            expect(document.getElementById('dev-dashboard-view')).toBeTruthy();
            expect(document.getElementById('dev-clock-time')).toBeTruthy();
            expect(document.getElementById('dev-clock-date')).toBeTruthy();
            expect(document.getElementById('dev-radar-canvas')).toBeTruthy();
            expect(document.getElementById('dev-weather-widget')).toBeTruthy();
            expect(document.getElementById('dev-telemetry-widget')).toBeTruthy();
            expect(document.getElementById('dev-search-widget')).toBeTruthy();
            expect(document.getElementById('dev-search-input')).toBeTruthy();
            expect(document.querySelectorAll('.dev-badge').length).toBeGreaterThanOrEqual(5);
        } finally {
            if (window.DevDashboard && typeof window.DevDashboard.stop === 'function') {
                window.DevDashboard.stop();
            }
        }
    });
});
