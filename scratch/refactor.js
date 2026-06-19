const fs = require('fs');
const path = require('path');

const cssPath = path.resolve(__dirname, '../css/style.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace standard tokens
css = css.replace(/var\(--panel-bg\)/g, 'var(--surface-bg)');
css = css.replace(/var\(--input-bg\)/g, 'var(--surface-bg)');
css = css.replace(/var\(--input-border\)/g, 'var(--border-color)');

// Shadows
css = css.replace(/box-shadow:\s*0\s*4px\s*15px\s*rgba\(0,\s*0,\s*0,\s*0\.2\)/g, 'box-shadow: var(--shadow-sm)');
css = css.replace(/box-shadow:\s*0\s*8px\s*25px\s*rgba\(59,\s*130,\s*246,\s*0\.3\)/g, 'box-shadow: var(--shadow-md)');
css = css.replace(/box-shadow:\s*0\s*8px\s*32px\s*rgba\(0,\s*0,\s*0,\s*0\.15\)/g, 'box-shadow: var(--shadow-lg)');
css = css.replace(/box-shadow:\s*0\s*8px\s*32px\s*rgba\(0,\s*0,\s*0,\s*0\.2\)/g, 'box-shadow: var(--shadow-lg)'); // close enough based on rule
css = css.replace(/box-shadow:\s*0\s*12px\s*40px\s*rgba\(59,\s*130,\s*246,\s*0\.3\)/g, 'box-shadow: var(--shadow-lg)');

// .link-item
css = css.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.12\)/g, 'background: var(--surface-bg)');
css = css.replace(/border:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.15\)/g, 'border: 1px solid var(--border-color)');
css = css.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.18\)/g, 'background: var(--surface-hover)');

// Focus colors
css = css.replace(/box-shadow:\s*0\s*0\s*0\s*3px\s*rgba\(59,\s*130,\s*246,\s*0\.1\)/g, 'box-shadow: 0 0 0 3px var(--focus-color)');

// GitHub panel
css = css.replace(/background:\s*rgba\(139,92,246,0\.08\)/g, 'background: var(--surface-bg)');
css = css.replace(/background:\s*rgba\(59,130,246,0\.1\)/g, 'background: var(--surface-bg)');
css = css.replace(/background:\s*rgba\(255,255,255,0\.05\)/g, 'background: var(--surface-bg)');
css = css.replace(/border:\s*1px\s*solid\s*rgba\(255,255,255,0\.08\)/g, 'border: 1px solid var(--border-color)');
css = css.replace(/border:\s*1px\s*solid\s*rgba\(139,92,246,0\.2\)/g, 'border: 1px solid var(--border-color)');
css = css.replace(/background:\s*rgba\(255,255,255,0\.1\)/g, 'background: var(--surface-hover)');

// Other specific background
css = css.replace(/background:\s*linear-gradient\(135deg,\s*var\(--grad-1\),\s*var\(--grad-2\),\s*var\(--grad-3\),\s*var\(--grad-4\)\)/g, 'background: var(--bg-color)');

fs.writeFileSync(cssPath, css);
console.log('CSS tokens updated.');
