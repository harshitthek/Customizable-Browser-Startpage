// --- Element References ---
const clockElement = document.getElementById('clock');
const greetingElement = document.getElementById('greeting');
const nameElement = document.getElementById('name');
const dateElement = document.getElementById('date');
const linksContainer = document.getElementById('links-container');
const addLinkBtn = document.getElementById('add-link-btn');
const addLinkModal = document.getElementById('add-link-modal');
const closeBtn = document.querySelector('.close-btn');
const cancelBtn = document.getElementById('cancel-btn');
const addLinkForm = document.getElementById('add-link-form');
const linkNameInput = document.getElementById('link-name-input');
const linkUrlInput = document.getElementById('link-url-input');
const themeBtn = document.getElementById('theme-btn');
const themePanel = document.getElementById('theme-panel');

// --- Data ---
let links = [];

// --- Functions ---
function setDate() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString(undefined, dateOptions);
}

function updateTimeAndGreeting() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    clockElement.classList.add('tick');
    setTimeout(() => {
        clockElement.classList.remove('tick');
    }, 200);
    const hour = now.getHours();
    let greetingText;
    if (hour < 12) {
        greetingText = "Good morning, ";
    } else if (hour < 18) {
        greetingText = "Good afternoon, ";
    } else {
        greetingText = "Good evening, ";
    }
    greetingElement.firstChild.textContent = greetingText;
}

function handleName() {
    const savedName = localStorage.getItem('username');
    if (savedName) {
        nameElement.textContent = savedName;
    } else {
        nameElement.textContent = "Guest";
    }
}

function renderLinks() {
    linksContainer.innerHTML = '';
    links.forEach((link, index) => {
        const linkDiv = document.createElement('div');
        linkDiv.className = 'link-item';
        const linkAnchor = document.createElement('a');
        linkAnchor.href = link.url;
        linkAnchor.textContent = link.name;
        linkAnchor.target = '_blank';
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.textContent = 'x';
        deleteButton.onclick = () => deleteLink(index, linkDiv);
        linkDiv.appendChild(linkAnchor);
        linkDiv.appendChild(deleteButton);
        linksContainer.appendChild(linkDiv);
        setTimeout(() => {
            linkDiv.classList.add('visible');
        }, 10);
    });
}

function saveLinks() {
    localStorage.setItem('savedLinks', JSON.stringify(links));
}

function addLink(name, url) {
    links.push({ name, url });
    saveLinks();
    renderLinks();
}

function deleteLink(index, linkElement) {
    if (confirm("Are you sure you want to delete this link?")) {
        linkElement.classList.remove('visible');
        setTimeout(() => {
            links.splice(index, 1);
            saveLinks();
            renderLinks();
        }, 300);
    }
}

function loadLinks() {
    const savedLinks = localStorage.getItem('savedLinks');
    if (savedLinks) {
        links = JSON.parse(savedLinks);
    }
    renderLinks();
}

function applyTheme(theme) {
    document.body.dataset.theme = theme;
    localStorage.setItem('savedTheme', theme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('savedTheme');
    if (savedTheme) {
        applyTheme(savedTheme);
    }
}

// --- Event Listeners ---
nameElement.addEventListener('click', () => {
    const currentName = localStorage.getItem('username') || "Guest";
    const newName = prompt("Enter a new name:", currentName === "Guest" ? "" : currentName);
    if (newName && newName.trim() !== "") {
        localStorage.setItem('username', newName.trim());
        nameElement.textContent = newName.trim();
    }
});

addLinkBtn.addEventListener('click', () => {
    addLinkModal.classList.remove('hidden');
});

function closeModal() {
    addLinkForm.reset();
    addLinkModal.classList.add('hidden');
}

closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
addLinkModal.addEventListener('click', (event) => {
    if (event.target === addLinkModal) {
        closeModal();
    }
});

addLinkForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const linkName = linkNameInput.value;
    let linkUrl = linkUrlInput.value;
    if (!linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
        linkUrl = 'https://' + linkUrl;
    }
    addLink(linkName, linkUrl);
    closeModal();
});

themeBtn.addEventListener('click', () => {
    themePanel.classList.toggle('hidden');
});

themePanel.addEventListener('click', (event) => {
    if (event.target.matches('.theme-option')) {
        const theme = event.target.dataset.theme;
        applyTheme(theme);
    }
});

// --- Initializations ---
function startClock() {
    updateTimeAndGreeting();
    setDate();
    const msToNextSecond = 1000 - (Date.now() % 1000);
    setTimeout(() => {
        updateTimeAndGreeting();
        setInterval(updateTimeAndGreeting, 1000);
    }, msToNextSecond);
}

startClock();
handleName();
loadTheme();
loadLinks();