# 🌟 Customizable Browser Startpage

A beautiful, secure, and highly customizable browser homepage replacement with 13 premium themes, privacy controls, and zero dependencies.

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Security](https://img.shields.io/badge/security-hardened-brightgreen)
![Privacy](https://img.shields.io/badge/privacy-first-orange)

---

## ✨ Features

### 🎨 13 Premium Themes
- **Dark Slate** (default) | **Light** | **Ocean**
- 🌃 **Cyberpunk** (particle effects)
- 🌅 **Sunset** | 🌲 **Forest**
- ✨ **Aurora Wave** (animated gradients)
- 🌌 **Northern Lights** (animated)
- 🌙 **Midnight** | 🌹 **Rose Gold**
- Custom theme builder with accent colors

### 🔒 Security & Privacy
- ✅ Content Security Policy (CSP) headers
- ✅ XSS protection with input sanitization
- ✅ URL validation (HTTP/HTTPS only)
- ✅ API rate limiting (10 calls/min)
- ✅ Secure favicon loading
- ✅ Privacy panel with data controls
- ✅ No tracking, no cookies, no external analytics
- ✅ All data stored locally in browser

### 🔖 Smart Bookmarks
- Add/Edit/Delete bookmarks with favicons
- Drag & drop reordering
- Search and filter
- Right-click context menu
- XSS-safe rendering
- Export/Import settings

### 🔍 Multi-Engine Search
- Google | Bing | DuckDuckGo | Yahoo | Brave
- Quick engine switcher
- Search from main page

### 💻 GitHub Integration
- Display profile information
- Repository stats (repos, followers, gists)
- Most starred repositories
- Clean, modern UI

### 💬 Inspirational Quotes
- Random quotes from Quotable API
- Auto-refresh feature
- Fallback quotes included

### 🕐 Clock & Greetings
- Live updating clock
- 12/24 hour format toggle
- Time-based greetings (Good morning/afternoon/evening)
- Full date display

### 🖼️ Background Customization
- Upload custom images
- Unsplash integration
- Gradient backgrounds
- Blur effects
- Persistent settings

### ⚙️ Settings Management
- Export all settings (JSON)
- Import settings from backup
- Reset to defaults
- Cloud-free backup/restore

---

## 🚀 Quick Start

### Option 1: Use Directly
1. Download or clone this repository
2. Open `index.html` in your browser
3. Set as your browser homepage

### Option 2: GitHub Pages (Live Demo)
Visit the live demo: `https://[YourUsername].github.io/Customizable-Browser-Startpage/`

### Set as Homepage
**Chrome/Edge:**
1. Settings → Appearance → Show home button
2. Enter path to `index.html` or GitHub Pages URL

**Firefox:**
1. Settings → Home → Homepage and new windows
2. Enter path to `index.html` or GitHub Pages URL

---

## 🛡️ Security Features

This startpage is built with security as a top priority:

| Feature | Implementation |
|---------|----------------|
| **CSP Headers** | Blocks inline scripts and XSS attacks |
| **Input Sanitization** | All user inputs are escaped and validated |
| **URL Validation** | Only HTTP/HTTPS protocols allowed |
| **API Security** | Rate limiting, timeouts, no credentials |
| **Privacy First** | No external tracking or data collection |
| **Safe Storage** | All data in browser localStorage only |

---

## 🎨 Themes Preview

Choose from 13 carefully designed themes:

- **Dark Slate**: Professional dark theme (default)
- **Cyberpunk**: Neon colors with particle effects
- **Aurora Wave**: Animated blue-to-violet gradients
- **Northern Lights**: Dynamic aurora animations
- **Sunset**: Warm orange/pink gradients
- **Forest**: Calming green nature theme
- And 7 more!

---

## 📦 What's Included

```
Customizable-Browser-Startpage/
├── index.html           # Main HTML with CSP headers
├── js/
│   ├── main.js         # Core functionality (947 lines)
│   └── privacy.js      # Privacy controls (70 lines)
├── css/
│   └── style.css       # All styles including themes (1,160 lines)
└── README.md           # This file
```

**Total:** ~2,400 lines of clean, well-commented code  
**Dependencies:** None (pure vanilla JavaScript)

---

## 🔧 Configuration

### GitHub Widget
Edit line ~950 in `js/main.js`:
```javascript
const GITHUB_USERNAME = 'YourUsername';
```

### Default Theme
Edit line 26 in `index.html`:
```html
<body data-theme="slate">
```

### API Rate Limits
Edit `js/main.js` rate limit settings:
```javascript
const rateLimitWindow = 60000; // 1 minute
const maxRequests = 10;        // Max 10 calls
```

---

## 🎯 Keyboard Shortcuts

- `N` - Add new bookmark
- `B` - Background settings
- `T` - Theme selector
- `ESC` - Close modals/panels

---

## 🧪 Browser Compatibility

✅ **Tested and working:**
- Chrome/Edge (v90+)
- Firefox (v88+)
- Safari (v14+)
- Brave
- Opera

---

## 📋 Roadmap

### Implemented ✅
- [x] 13 premium themes
- [x] Security hardening (CSP, XSS protection)
- [x] Privacy panel and controls
- [x] Bookmark management
- [x] GitHub widget
- [x] Multi-engine search
- [x] Export/Import settings

### Future Enhancements 🔜
- [ ] Todo widget
- [ ] Auto theme (time-based light/dark)
- [ ] Timezone widget
- [ ] Widget collapse/expand
- [ ] Bookmark folders/tags
- [ ] Weather widget

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Quotable API** - Random quotes
- **GitHub API** - Profile data
- **Google Fonts** - Inter font family
- **Unsplash** - Optional background images

---

## 📞 Support

Found a bug? Have a feature request?  
[Open an issue](../../issues) on GitHub!

---

## 📊 Project Stats

![Code Size](https://img.shields.io/github/languages/code-size/[YourUsername]/Customizable-Browser-Startpage)
![Last Commit](https://img.shields.io/github/last-commit/[YourUsername]/Customizable-Browser-Startpage)

**Made with ❤️ and a focus on privacy & security**
