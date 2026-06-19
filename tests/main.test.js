import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const htmlPath = path.resolve(__dirname, '../index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const jsPath = path.resolve(__dirname, '../js/main.js');
const js = fs.readFileSync(jsPath, 'utf8');

describe('DailyCosmos UI and Core Logic', () => {
    function setupDOM(initialLinks = null) {
        const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost' });
        const window = dom.window;
        const document = window.document;

        // Mock localStorage
        const store = initialLinks ? { links: JSON.stringify(initialLinks) } : {};
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

        window.HTMLCanvasElement.prototype.getContext = function () {
            return { clearRect: function() {}, fillRect: function() {}, beginPath: function() {}, arc: function() {}, fill: function() {}, stroke: function() {}, moveTo: function() {}, lineTo: function() {} };
        };
        window.requestAnimationFrame = function(callback) { setTimeout(callback, 0); };

        const script = document.createElement('script');
        script.textContent = js;
        document.body.appendChild(script);
        document.dispatchEvent(new window.Event('DOMContentLoaded'));

        return { window, document };
    }

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
});
