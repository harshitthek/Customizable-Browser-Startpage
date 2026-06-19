(function() {
    try {
        var savedTheme = localStorage.getItem('savedTheme') || 'slate';
        document.body.dataset.theme = savedTheme;
        if (savedTheme === 'custom') {
            var savedAccent = localStorage.getItem('customAccentColor');
            if (savedAccent) document.body.style.setProperty('--accent-color', savedAccent);
        }
    } catch (e) {}
})();
