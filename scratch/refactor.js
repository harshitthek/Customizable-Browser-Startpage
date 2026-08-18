const fs = require('fs');
const path = require('path');

const cssPath = path.resolve(__dirname, '../css/style.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace standard tokens
css = css.replace(/var\(--panel-bg\)/g, 'var(--surface-bg)');
css = css.replace(/var\(--input-bg\)/g, 'var(--surface-bg)');
css = css.replace(/var\(--input-border\)/g, 'var(--border-color)');

// Shadows
css = css.replace(/box-shadow:\s*0\s*4px\s*15px\s*rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.2\s*\)/g, 'box-shadow: var(--shadow-sm)');
css = css.replace(/box-shadow:\s*0\s*8px\s*25px\s*rgba\(\s*59\s*,\s*130\s*,\s*246\s*,\s*0\.3\s*\)/g, 'box-shadow: var(--shadow-md)');
css = css.replace(/box-shadow:\s*0\s*8px\s*32px\s*rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.15\s*\)/g, 'box-shadow: var(--shadow-md)');
css = css.replace(/box-shadow:\s*0\s*8px\s*32px\s*rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.2\s*\)/g, 'box-shadow: var(--shadow-lg)');
css = css.replace(/box-shadow:\s*0\s*12px\s*40px\s*rgba\(\s*59\s*,\s*130\s*,\s*246\s*,\s*0\.3\s*\)/g, 'box-shadow: var(--shadow-xl, var(--shadow-lg))');

// .link-item
css = css.replace(/background:\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.12\s*\)/g, 'background: var(--surface-bg)');
css = css.replace(/border:\s*1px\s*solid\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.15\s*\)/g, 'border: 1px solid var(--border-color)');
css = css.replace(/background:\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.18\s*\)/g, 'background: var(--surface-hover)');

// Focus colors
css = css.replace(/box-shadow:\s*0\s*0\s*0\s*3px\s*rgba\(\s*59\s*,\s*130\s*,\s*246\s*,\s*0\.1\s*\)/g, 'box-shadow: 0 0 0 3px var(--focus-color)');

// GitHub panel
css = css.replace(/background:\s*rgba\(\s*139\s*,\s*92\s*,\s*246\s*,\s*0\.08\s*\)/g, 'background: var(--surface-bg)');
css = css.replace(/background:\s*rgba\(\s*59\s*,\s*130\s*,\s*246\s*,\s*0\.1\s*\)/g, 'background: var(--surface-bg)');
css = css.replace(/background:\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.05\s*\)/g, 'background: var(--surface-bg)');
css = css.replace(/border:\s*1px\s*solid\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.08\s*\)/g, 'border: 1px solid var(--border-color)');
css = css.replace(/border:\s*1px\s*solid\s*rgba\(\s*139\s*,\s*92\s*,\s*246\s*,\s*0\.2\s*\)/g, 'border: 1px solid var(--border-color)');
css = css.replace(/background:\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.1\s*\)/g, 'background: var(--surface-hover)');

fs.writeFileSync(cssPath, css);
console.log('CSS tokens updated.');
