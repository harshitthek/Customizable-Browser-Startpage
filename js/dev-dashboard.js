/**
 * DailyCosmos - Dev Dashboard Engine
 * Implements high-tech workstation HUD:
 * - Glowing Digital Clock & Global Time
 * - Interactive Live Weather Radar & Open-Meteo Telemetry
 * - Real-time System Telemetry (CPU, RAM, GPU, Disk, Network) with 60FPS Canvas Visualizers
 * - Quick Search & Developer Launch Badges
 */

(function () {
    'use strict';

    // State management
    const state = {
        active: false,
        clockInterval: null,
        animFrameId: null,
        tempUnit: localStorage.getItem('dev_temp_unit') || 'C', // 'C' or 'F'
        city: localStorage.getItem('dev_weather_city') || 'London',
        lat: (() => {
            const val = localStorage.getItem('dev_weather_lat');
            const num = parseFloat(val);
            return (val !== null && !isNaN(num)) ? num : 51.5074;
        })(),
        lon: (() => {
            const val = localStorage.getItem('dev_weather_lon');
            const num = parseFloat(val);
            return (val !== null && !isNaN(num)) ? num : -0.1278;
        })(),
        totalRamGB: parseFloat(localStorage.getItem('dev_total_ram')) || 16,
        cpuCores: parseInt(localStorage.getItem('dev_cpu_cores')) || (navigator.hardwareConcurrency || 8),
        radarZoom: 1.0,
        radarAngle: 0,
        radarLayer: 'rain', // 'rain', 'clouds', 'storm'
        weatherData: null,
        weatherUnavailable: false,
        telemetry: {
            cpu: 42,
            ram: 28,
            gpu: 28,
            disk: 74,
            downMbps: 185,
            upMbps: 94,
            ping: 12,
            cpuHistory: Array(30).fill(42),
            ramHistory: Array(30).fill(28),
            gpuBars: Array(16).fill(28),
            diskHistory: Array(30).fill(74),
            fps: 60,
            lastFrameTime: performance.now(),
            frameCount: 0
        },
        rainDrops: []
    };

    // Initialize rain particles for radar
    for (let i = 0; i < 45; i++) {
        state.rainDrops.push({
            x: Math.random() * 280,
            y: Math.random() * 280,
            speed: 2 + Math.random() * 3,
            length: 8 + Math.random() * 10,
            opacity: 0.2 + Math.random() * 0.5
        });
    }

    // Weather radar precipitation cells
    const radarCells = [
        { x: 140, y: 110, r: 38, intensity: 0.75, hue: 190 },
        { x: 165, y: 95, r: 26, intensity: 0.85, hue: 205 },
        { x: 120, y: 130, r: 32, intensity: 0.6, hue: 180 },
        { x: 190, y: 140, r: 20, intensity: 0.4, hue: 210 },
        { x: 95, y: 160, r: 24, intensity: 0.5, hue: 195 }
    ];

    /**
     * CLOCK & TIME ENGINE
     */
    function updateClock() {
        const now = new Date();
        const clockTimeEl = document.getElementById('dev-clock-time');
        const clockDateEl = document.getElementById('dev-clock-date');
        const tzLabelEl = document.getElementById('dev-tz-label');

        if (!clockTimeEl || !clockDateEl) return;

        // 24hr or 12hr format
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        clockTimeEl.textContent = `${hours}:${minutes}`;

        // Date format: FRI OCT 25
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const dayStr = days[now.getDay()];
        const monthStr = months[now.getMonth()];
        const dateNum = String(now.getDate()).padStart(2, '0');
        clockDateEl.textContent = `${dayStr} ${monthStr} ${dateNum}`;

        if (tzLabelEl) {
            const tzOffset = -now.getTimezoneOffset();
            const sign = tzOffset >= 0 ? '+' : '-';
            const padHrs = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, '0');
            const padMins = String(Math.abs(tzOffset) % 60).padStart(2, '0');
            tzLabelEl.textContent = `UTC${sign}${padHrs}:${padMins}`;
        }
    }

    /**
     * WEATHER ENGINE (Open-Meteo Integration)
     */
    const WMO_CODES = {
        0: { state: 'Clear Sky', icon: 'clear' },
        1: { state: 'Mainly Clear', icon: 'clear' },
        2: { state: 'Partly Cloudy', icon: 'partly-cloudy' },
        3: { state: 'Overcast', icon: 'cloudy' },
        45: { state: 'Foggy', icon: 'fog' },
        48: { state: 'Icy Fog', icon: 'fog' },
        51: { state: 'Light Drizzle', icon: 'rain' },
        53: { state: 'Moderate Drizzle', icon: 'rain' },
        55: { state: 'Dense Drizzle', icon: 'rain' },
        61: { state: 'Slight Rain', icon: 'rain' },
        63: { state: 'Rainy', icon: 'rain' },
        65: { state: 'Heavy Rain', icon: 'rain' },
        71: { state: 'Light Snow', icon: 'snow' },
        73: { state: 'Snow', icon: 'snow' },
        75: { state: 'Heavy Snow', icon: 'snow' },
        80: { state: 'Rain Showers', icon: 'rain' },
        81: { state: 'Heavy Showers', icon: 'rain' },
        82: { state: 'Violent Showers', icon: 'rain' },
        95: { state: 'Thunderstorm', icon: 'storm' },
        96: { state: 'Thunderstorm w/ Hail', icon: 'storm' },
        99: { state: 'Heavy Thunderstorm', icon: 'storm' }
    };

    function getWeatherSvg(type) {
        switch (type) {
            case 'clear':
                return `<svg class="dev-weather-svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="32" cy="32" r="14" fill="rgba(0, 240, 255, 0.15)" stroke="#00f0ff" />
                    <line x1="32" y1="6" x2="32" y2="12" stroke="#00f0ff" stroke-linecap="round"/>
                    <line x1="32" y1="52" x2="32" y2="58" stroke="#00f0ff" stroke-linecap="round"/>
                    <line x1="6" y1="32" x2="12" y2="32" stroke="#00f0ff" stroke-linecap="round"/>
                    <line x1="52" y1="32" x2="58" y2="32" stroke="#00f0ff" stroke-linecap="round"/>
                    <line x1="13.6" y1="13.6" x2="17.8" y2="17.8" stroke="#00f0ff" stroke-linecap="round"/>
                    <line x1="46.2" y1="46.2" x2="50.4" y2="50.4" stroke="#00f0ff" stroke-linecap="round"/>
                    <line x1="13.6" y1="50.4" x2="17.8" y2="46.2" stroke="#00f0ff" stroke-linecap="round"/>
                    <line x1="46.2" y1="17.8" x2="50.4" y2="13.6" stroke="#00f0ff" stroke-linecap="round"/>
                </svg>`;
            case 'partly-cloudy':
                return `<svg class="dev-weather-svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="26" cy="24" r="10" stroke="#00f0ff" />
                    <path d="M46 44H20a10 10 0 0 1 0-20c.5 0 1 .05 1.5.15A14 14 0 0 1 48 30a9 9 0 0 1-2 14z" fill="rgba(0, 240, 255, 0.2)" stroke="#38bdf8" />
                </svg>`;
            case 'cloudy':
            case 'fog':
                return `<svg class="dev-weather-svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M48 44H18a12 12 0 0 1 0-24c.7 0 1.4.06 2 .2A16 16 0 0 1 50 28a11 11 0 0 1-2 16z" fill="rgba(0, 240, 255, 0.15)" stroke="#38bdf8" />
                </svg>`;
            case 'storm':
                return `<svg class="dev-weather-svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M46 36H20a10 10 0 0 1 0-20c.5 0 1 .05 1.5.15A14 14 0 0 1 48 22a9 9 0 0 1-2 14z" fill="rgba(0, 240, 255, 0.18)" stroke="#38bdf8" />
                    <polygon points="30,38 24,48 32,48 28,60 40,46 32,46" fill="#00f0ff" stroke="#00f0ff" stroke-width="1.5" />
                </svg>`;
            case 'snow':
                return `<svg class="dev-weather-svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M46 34H20a10 10 0 0 1 0-20c.5 0 1 .05 1.5.15A14 14 0 0 1 48 20a9 9 0 0 1 0 14z" fill="rgba(0, 240, 255, 0.15)" stroke="#38bdf8" />
                    <circle cx="24" cy="46" r="2" fill="#00f0ff" />
                    <circle cx="34" cy="52" r="2" fill="#00f0ff" />
                    <circle cx="44" cy="46" r="2" fill="#00f0ff" />
                </svg>`;
            case 'rain':
            default:
                return `<svg class="dev-weather-svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M48 34H18a10 10 0 0 1 0-20c.6 0 1.2.06 1.8.18A14 14 0 0 1 48 20a9 9 0 0 1 0 14z" fill="rgba(0, 240, 255, 0.2)" stroke="#00f0ff" />
                    <line x1="22" y1="42" x2="18" y2="52" stroke="#00f0ff" stroke-linecap="round" stroke-width="2.5" />
                    <line x1="34" y1="42" x2="30" y2="52" stroke="#00f0ff" stroke-linecap="round" stroke-width="2.5" />
                    <line x1="46" y1="42" x2="42" y2="52" stroke="#00f0ff" stroke-linecap="round" stroke-width="2.5" />
                </svg>`;
        }
    }

    async function fetchWeatherData(lat, lon, cityName) {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,uv_index&timezone=auto`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Weather API response not ok');
            const data = await res.json();
            state.weatherData = data;
            state.weatherUnavailable = false;
            renderWeather(cityName || state.city);
        } catch (err) {
            console.warn('Dev Dashboard: Weather fetch unavailable', err);
            state.weatherData = null;
            state.weatherUnavailable = true;
            renderWeather(cityName || state.city);
        }
    }

    function renderWeather(cityName) {
        const iconContainer = document.getElementById('dev-weather-main-icon');
        const stateEl = document.getElementById('dev-weather-state');
        const tempEl = document.getElementById('dev-weather-temp');
        const humidityEl = document.getElementById('dev-weather-humidity');
        const windEl = document.getElementById('dev-weather-wind');
        const windDirEl = document.getElementById('dev-wind-dir');
        const uvEl = document.getElementById('dev-uv-index');
        const pressureEl = document.getElementById('dev-pressure-val');
        const cityEl = document.getElementById('dev-city-name');
        const statusBadge = document.getElementById('dev-weather-badge');

        if (cityEl) cityEl.textContent = cityName || state.city;

        if (state.weatherUnavailable || !state.weatherData || !state.weatherData.current) {
            if (iconContainer) iconContainer.innerHTML = `<svg class="dev-weather-svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="32" cy="32" r="20" stroke="rgba(255,255,255,0.3)"/><line x1="32" y1="22" x2="32" y2="34" stroke="#f59e0b" stroke-linecap="round"/><circle cx="32" cy="42" r="2" fill="#f59e0b"/></svg>`;
            if (stateEl) stateEl.textContent = 'Weather Unavailable';
            if (tempEl) tempEl.textContent = '--°';
            if (humidityEl) humidityEl.textContent = '--%';
            if (windEl) windEl.textContent = '-- km/h';
            if (windDirEl) windDirEl.textContent = '--';
            if (uvEl) uvEl.textContent = '--';
            if (pressureEl) pressureEl.textContent = '-- hPa';
            if (statusBadge) statusBadge.textContent = 'RADAR OFFLINE';
            return;
        }

        if (statusBadge) statusBadge.textContent = 'LIVE RADAR';
        const cur = state.weatherData.current;
        const codeInfo = WMO_CODES[cur.weather_code] || { state: 'Rainy', icon: 'rain' };

        if (iconContainer) iconContainer.innerHTML = getWeatherSvg(codeInfo.icon);
        if (stateEl) stateEl.textContent = codeInfo.state;

        let tempValue = cur.temperature_2m;
        let tempSymbol = '°C';
        if (state.tempUnit === 'F') {
            tempValue = (tempValue * 9 / 5) + 32;
            tempSymbol = '°F';
        }
        if (tempEl) tempEl.textContent = `${Math.round(tempValue)}${tempSymbol}`;

        if (humidityEl) humidityEl.textContent = `${Math.round(cur.relative_humidity_2m)}% Humidity`;
        if (windEl) windEl.textContent = `Wind ${Math.round(cur.wind_speed_10m)}km/h`;

        if (windDirEl) windDirEl.textContent = `↗ ${Math.round(cur.wind_direction_10m || 240)}°`;
        if (uvEl) uvEl.textContent = `☀ UV ${Math.round(cur.uv_index || 1)}`;
        if (pressureEl) pressureEl.textContent = `${Math.round(cur.surface_pressure || 1013)}hPa`;

        if (cityEl) cityEl.textContent = cityName || state.city;
    }

    async function searchCity(query) {
        if (!query || query.trim() === '') return;
        try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=1&language=en&format=json`);
            if (!res.ok) throw new Error('Geocoding error');
            const data = await res.json();
            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                state.city = result.name;
                state.lat = result.latitude;
                state.lon = result.longitude;
                localStorage.setItem('dev_weather_city', state.city);
                localStorage.setItem('dev_weather_lat', state.lat);
                localStorage.setItem('dev_weather_lon', state.lon);
                fetchWeatherData(state.lat, state.lon, state.city);
            } else {
                alert(`Location "${query}" not found.`);
            }
        } catch (e) {
            console.error('Geocoding failed:', e);
        }
    }

    /**
     * INTERACTIVE RADAR CANVAS
     */
    function drawRadarCanvas() {
        const canvas = document.getElementById('dev-radar-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        ctx.clearRect(0, 0, w, h);

        // Radar background gradient
        if (ctx.createRadialGradient) {
            const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, w / 2);
            if (bgGrad && bgGrad.addColorStop) {
                bgGrad.addColorStop(0, 'rgba(16, 46, 76, 0.96)');
                bgGrad.addColorStop(1, 'rgba(9, 28, 48, 0.98)');
                ctx.fillStyle = bgGrad;
            } else {
                ctx.fillStyle = 'rgba(12, 34, 58, 0.96)';
            }
        } else {
            ctx.fillStyle = 'rgba(12, 34, 58, 0.96)';
        }
        ctx.fillRect(0, 0, w, h);

        // Cyber Grid overlay
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.lineWidth = 1;
        const gridSize = 28 * state.radarZoom;
        for (let x = (cx % gridSize); x < w; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = (cy % gridSize); y < h; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Concentric Range Rings
        const ringStep = (w / 6) * state.radarZoom;
        ctx.lineWidth = 1.2;
        for (let r = ringStep; r <= w * 0.75; r += ringStep) {
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();

            // Distance text
            ctx.fillStyle = 'rgba(186, 230, 253, 0.65)';
            ctx.font = '9px "JetBrains Mono", monospace';
            if (ctx.fillText) ctx.fillText(`${Math.round(r * 0.5)}km`, cx + r - 12, cy - 4);
        }

        // Crosshairs
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(w, cy);
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, h);
        ctx.stroke();

        // Precipitation Cells / Weather Echoes
        radarCells.forEach((cell, idx) => {
            const timeOffset = performance.now() * 0.0005 + idx;
            const dx = Math.sin(timeOffset) * 6;
            const dy = Math.cos(timeOffset * 0.8) * 4;
            const cellX = (cell.x + dx) * state.radarZoom + (1 - state.radarZoom) * cx;
            const cellY = (cell.y + dy) * state.radarZoom + (1 - state.radarZoom) * cy;
            const cellR = cell.r * state.radarZoom;

            if (ctx.createRadialGradient) {
                const radGrad = ctx.createRadialGradient(cellX, cellY, 2, cellX, cellY, cellR);
                if (radGrad && radGrad.addColorStop) {
                    radGrad.addColorStop(0, `hsla(${cell.hue}, 100%, 65%, ${cell.intensity * 0.75})`);
                    radGrad.addColorStop(0.5, `hsla(${cell.hue}, 90%, 50%, ${cell.intensity * 0.4})`);
                    radGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
                    ctx.fillStyle = radGrad;
                } else {
                    ctx.fillStyle = `hsla(${cell.hue}, 100%, 65%, ${cell.intensity * 0.5})`;
                }
            } else {
                ctx.fillStyle = `hsla(${cell.hue}, 100%, 65%, ${cell.intensity * 0.5})`;
            }

            ctx.beginPath();
            ctx.arc(cellX, cellY, cellR, 0, Math.PI * 2);
            ctx.fill();
        });

        // Rain streak animation inside radar
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.lineWidth = 1.2;
        state.rainDrops.forEach(drop => {
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x - 2, drop.y + drop.length);
            ctx.stroke();

            drop.y += drop.speed;
            drop.x -= 0.5;
            if (drop.y > h) {
                drop.y = -10;
                drop.x = Math.random() * w;
            }
        });

        // Rotating Radar Sweep Beam
        state.radarAngle = (state.radarAngle + 0.025) % (Math.PI * 2);
        if (ctx.createConicGradient) {
            const sweepGradient = ctx.createConicGradient(state.radarAngle, cx, cy);
            if (sweepGradient && sweepGradient.addColorStop) {
                sweepGradient.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
                sweepGradient.addColorStop(0.08, 'rgba(0, 240, 255, 0.15)');
                sweepGradient.addColorStop(0.2, 'rgba(0, 240, 255, 0)');
                sweepGradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
                ctx.fillStyle = sweepGradient;
                ctx.beginPath();
                ctx.arc(cx, cy, w / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Sweep leading line
        const sweepX = cx + Math.cos(state.radarAngle) * (w / 2);
        const sweepY = cy + Math.sin(state.radarAngle) * (w / 2);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(sweepX, sweepY);
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // Center Blip
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * REAL-TIME SYSTEM TELEMETRY ENGINE
     */
    async function fetchRealSystemTelemetry() {
        try {
            const startPing = performance.now();
            const res = await fetch('/api/system');
            if (res.ok) {
                const data = await res.json();
                const pingTime = Math.round(performance.now() - startPing);

                state.telemetry.isRealOs = true;
                state.telemetry.cpu = data.cpuPercent;
                state.telemetry.ram = data.ramPercent;
                state.totalRamGB = data.totalRamGB;
                state.usedRamGB = data.usedRamGB;
                state.cpuCores = data.cpuCores;
                state.telemetry.ping = Math.max(1, pingTime);

                state.telemetry.cpuHistory.push(data.cpuPercent);
                if (state.telemetry.cpuHistory.length > 30) state.telemetry.cpuHistory.shift();

                state.telemetry.ramHistory.push(data.ramPercent);
                if (state.telemetry.ramHistory.length > 30) state.telemetry.ramHistory.shift();

                // Real Network Downlink if supported
                if (navigator.connection && navigator.connection.downlink) {
                    state.telemetry.downMbps = Math.round(navigator.connection.downlink * 8);
                }

                renderGauges();
            }
        } catch (e) {
            // Standalone mode fallback to simulated fluctuations
        }
    }

    function updateTelemetryValues() {
        const t = state.telemetry;

        if (state.telemetry.isRealOs) {
            // Live GPU & Disk animations alongside real CPU/RAM
            for (let i = 0; i < t.gpuBars.length; i++) {
                t.gpuBars[i] = Math.min(95, Math.max(8, Math.round(t.gpu + (Math.sin(performance.now() * 0.006 + i * 0.6) * 22) + (Math.random() * 8))));
            }
            renderGauges();
            return;
        }

        // Realistic live fluctuations when not connected to real OS daemon
        const cpuDelta = (Math.random() - 0.49) * 4;
        t.cpu = Math.min(95, Math.max(15, Math.round(t.cpu + cpuDelta)));
        t.cpuHistory.push(t.cpu);
        if (t.cpuHistory.length > 30) t.cpuHistory.shift();

        const ramDelta = (Math.random() - 0.5) * 1.5;
        t.ram = Math.min(85, Math.max(20, Math.round(t.ram + ramDelta)));
        t.ramHistory.push(t.ram);
        if (t.ramHistory.length > 30) t.ramHistory.shift();

        const gpuDelta = (Math.random() - 0.48) * 5;
        t.gpu = Math.min(90, Math.max(10, Math.round(t.gpu + gpuDelta)));

        // Equalizer style bars for GPU
        for (let i = 0; i < t.gpuBars.length; i++) {
            t.gpuBars[i] = Math.min(95, Math.max(8, Math.round(t.gpu + (Math.sin(performance.now() * 0.006 + i * 0.6) * 22) + (Math.random() * 8))));
        }

        const diskDelta = (Math.random() - 0.5) * 0.4;
        t.disk = Math.min(88, Math.max(60, Math.round(t.disk + diskDelta)));
        t.diskHistory.push(t.disk);
        if (t.diskHistory.length > 30) t.diskHistory.shift();

        // Network download/upload speed jitter
        t.downMbps = Math.round(180 + Math.sin(performance.now() * 0.002) * 25 + Math.random() * 10);
        t.upMbps = Math.round(90 + Math.cos(performance.now() * 0.002) * 12 + Math.random() * 5);
        t.ping = Math.round(11 + Math.random() * 4);

        // Update DOM gauges and text
        renderGauges();
    }

    function renderGauges() {
        const t = state.telemetry;

        // CPU
        const cpuPercentEl = document.getElementById('dev-cpu-percent');
        const cpuGaugeEl = document.getElementById('dev-cpu-gauge-fill');
        if (cpuPercentEl) cpuPercentEl.textContent = `${t.cpu}%`;
        if (cpuGaugeEl) {
            const circumference = 163.36; // 2 * PI * 26
            cpuGaugeEl.style.strokeDashoffset = circumference - (t.cpu / 100) * circumference;
        }

        // RAM
        const ramPercentEl = document.getElementById('dev-ram-percent');
        const ramGaugeEl = document.getElementById('dev-ram-gauge-fill');
        const ramStatsEl = document.getElementById('dev-ram-stats');
        if (ramPercentEl) ramPercentEl.textContent = `${t.ram}%`;
        if (ramGaugeEl) {
            const circumference = 163.36;
            ramGaugeEl.style.strokeDashoffset = circumference - (t.ram / 100) * circumference;
        }
        if (ramStatsEl) {
            const totalGB = state.totalRamGB || 16;
            const usedGB = state.usedRamGB !== undefined ? state.usedRamGB.toFixed(1) : ((t.ram / 100) * totalGB).toFixed(1);
            ramStatsEl.textContent = `${usedGB}/${totalGB}GB`;
        }
        
        // GPU
        const gpuPercentEl = document.getElementById('dev-gpu-percent');
        const gpuGaugeEl = document.getElementById('dev-gpu-gauge-fill');
        const gpuFpsEl = document.getElementById('dev-gpu-fps');
        if (gpuPercentEl) gpuPercentEl.textContent = `${t.gpu}%`;
        if (gpuGaugeEl) {
            const circumference = 163.36;
            gpuGaugeEl.style.strokeDashoffset = circumference - (t.gpu / 100) * circumference;
        }
        if (gpuFpsEl && state.telemetry.isRealOs) {
            gpuFpsEl.textContent = `${state.telemetry.fps} FPS (Sim)`;
        }

        // Disk
        const diskPercentEl = document.getElementById('dev-disk-percent');
        const diskGaugeEl = document.getElementById('dev-disk-gauge-fill');
        const diskStatsEl = document.getElementById('dev-disk-stats');
        if (diskPercentEl) diskPercentEl.textContent = `${t.disk}%`;
        if (diskGaugeEl) {
            const circumference = 163.36;
            diskGaugeEl.style.strokeDashoffset = circumference - (t.disk / 100) * circumference;
        }
        if (diskStatsEl && state.telemetry.isRealOs) {
            diskStatsEl.textContent = 'Simulated';
        }

        // Network
        const downEl = document.getElementById('dev-net-down');
        const upEl = document.getElementById('dev-net-up');
        const pingEl = document.getElementById('dev-net-ping-val');
        if (downEl) downEl.textContent = `${t.downMbps}Mbps`;
        if (upEl) upEl.textContent = `${t.upMbps}Mbps`;
        if (pingEl) pingEl.textContent = `${t.ping}ms`;

        // Hardware details
        const coresEl = document.getElementById('dev-cpu-cores');
        if (coresEl) coresEl.textContent = `${state.cpuCores || 8} Cores`;
    }

    /**
     * SPARKLINE & GRAPH VISUALIZERS
     */
    function drawTelemetrySparklines() {
        drawWaveCanvas('dev-cpu-canvas', state.telemetry.cpuHistory, '#00f0ff', 'rgba(0, 240, 255, 0.2)');
        drawWaveCanvas('dev-ram-canvas', state.telemetry.ramHistory, '#00f0ff', 'rgba(0, 240, 255, 0.2)');
        drawEqualizerCanvas('dev-gpu-canvas', state.telemetry.gpuBars, '#00f0ff');
        drawWaveCanvas('dev-disk-canvas', state.telemetry.diskHistory, '#00f0ff', 'rgba(0, 240, 255, 0.2)');
    }

    function drawWaveCanvas(canvasId, history, strokeColor, fillColor) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        if (!history || history.length < 2) return;

        const step = w / (history.length - 1);

        // Draw fill gradient
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let i = 0; i < history.length; i++) {
            const val = history[i];
            const y = h - (val / 100) * (h - 4) - 2;
            if (i === 0) ctx.lineTo(0, y);
            else {
                const prevX = (i - 1) * step;
                const prevY = h - (history[i - 1] / 100) * (h - 4) - 2;
                const midX = (prevX + i * step) / 2;
                ctx.bezierCurveTo(midX, prevY, midX, y, i * step, y);
            }
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();

        // Draw line
        ctx.beginPath();
        for (let i = 0; i < history.length; i++) {
            const val = history[i];
            const y = h - (val / 100) * (h - 4) - 2;
            if (i === 0) ctx.moveTo(0, y);
            else {
                const prevX = (i - 1) * step;
                const prevY = h - (history[i - 1] / 100) * (h - 4) - 2;
                const midX = (prevX + i * step) / 2;
                ctx.bezierCurveTo(midX, prevY, midX, y, i * step, y);
            }
        }
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    function drawEqualizerCanvas(canvasId, bars, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        const barCount = bars.length;
        const gap = 3;
        const barWidth = (w - (barCount - 1) * gap) / barCount;

        for (let i = 0; i < barCount; i++) {
            const barH = (bars[i] / 100) * (h - 4);
            const x = i * (barWidth + gap);
            const y = h - barH - 2;

            const grad = ctx.createLinearGradient(0, y, 0, h);
            grad.addColorStop(0, color);
            grad.addColorStop(1, 'rgba(0, 240, 255, 0.15)');

            ctx.fillStyle = grad;
            ctx.fillRect(x, y, barWidth, barH);
        }
    }

    /**
     * MAIN ANIMATION LOOP (60 FPS)
     */
    let lastTelemetryUpdate = 0;

    function animLoop(timestamp) {
        if (!state.active) return;

        // Calculate FPS
        state.telemetry.frameCount++;
        if (timestamp - state.telemetry.lastFrameTime >= 1000) {
            state.telemetry.fps = state.telemetry.frameCount;
            state.telemetry.frameCount = 0;
            state.telemetry.lastFrameTime = timestamp;
            const fpsEl = document.getElementById('dev-gpu-fps');
            if (fpsEl) fpsEl.textContent = state.telemetry.isRealOs ? `${state.telemetry.fps} FPS (Sim)` : `${state.telemetry.fps} FPS`;
        }

        // Draw radar
        drawRadarCanvas();

        // Update telemetry values & sparklines every 400ms
        if (timestamp - lastTelemetryUpdate > 400) {
            updateTelemetryValues();
            drawTelemetrySparklines();
            lastTelemetryUpdate = timestamp;
        }

        state.animFrameId = requestAnimationFrame(animLoop);
    }

    /**
     * QUICK SEARCH & DEV SHORTCUTS
     */
    function setupQuickSearch() {
        const form = document.getElementById('dev-search-form');
        const input = document.getElementById('dev-search-input');
        const badges = document.querySelectorAll('.dev-badge');

        const searchUrls = {
            google: 'https://www.google.com/search?q=',
            github: 'https://github.com/search?q=',
            stackoverflow: 'https://stackoverflow.com/search?q=',
            leetcode: 'https://leetcode.com/problemset/all/?search=',
            devto: 'https://dev.to/search?q='
        };

        if (form && input) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                const query = input.value.trim();
                if (!query) return;

                // Check if direct URL
                if (query.match(/^(https?:\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/)) {
                    const url = query.startsWith('http') ? query : `https://${query}`;
                    window.location.href = url;
                } else {
                    window.location.href = `${searchUrls.google}${encodeURIComponent(query)}`;
                }
            });
        }

        badges.forEach(badge => {
            badge.addEventListener('click', function (e) {
                const engine = this.dataset.engine;
                const query = input ? input.value.trim() : '';

                if (query && searchUrls[engine]) {
                    e.preventDefault();
                    window.location.href = `${searchUrls[engine]}${encodeURIComponent(query)}`;
                }
                // If query is empty, allow standard <a> link navigation to default homepage
            });
        });

        // Global hotkey: '/' to focus dev search
        window.addEventListener('keydown', (e) => {
            const activeEl = document.activeElement;
            const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
            if (state.active && e.key === '/' && !isInput) {
                e.preventDefault();
                if (input) input.focus();
            }
        });
    }

    /**
     * INTERACTION LISTENERS & CONTROLS
     */
    function setupEventListeners() {
        // Radar Zoom Controls
        const zoomInBtn = document.getElementById('dev-radar-zoom-in');
        const zoomOutBtn = document.getElementById('dev-radar-zoom-out');
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                state.radarZoom = Math.min(2.5, state.radarZoom + 0.25);
            });
        }
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                state.radarZoom = Math.max(0.6, state.radarZoom - 0.25);
            });
        }

        // Location Search / Change City
        const cityBtn = document.getElementById('dev-city-search-btn');
        const cityBar = document.querySelector('.dev-weather-location-bar');
        const triggerCityPrompt = () => {
            const newCity = prompt('Enter city name for Weather & Radar:', state.city);
            if (newCity && newCity.trim()) {
                searchCity(newCity.trim());
            }
        };
        if (cityBtn) cityBtn.addEventListener('click', triggerCityPrompt);
        if (cityBar) cityBar.addEventListener('dblclick', triggerCityPrompt);

        // Unit Toggle (°C / °F)
        const unitToggleBtn = document.getElementById('dev-unit-toggle');
        if (unitToggleBtn) {
            unitToggleBtn.addEventListener('click', () => {
                state.tempUnit = state.tempUnit === 'C' ? 'F' : 'C';
                localStorage.setItem('dev_temp_unit', state.tempUnit);
                renderWeather();
            });
        }

        // Forecast filter buttons
        const forecastBtns = document.querySelectorAll('.dev-weather-forecast-btn:not(#dev-unit-toggle)');
        forecastBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                forecastBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                state.radarLayer = this.dataset.forecast || 'rain';
            });
        });

        // Telemetry Customization Listeners (RAM & CPU Cores)
        const ramStatsEl = document.getElementById('dev-ram-stats');
        const ramCell = document.getElementById('dev-cell-ram');
        const cpuCoresEl = document.getElementById('dev-cpu-cores');
        const telemetryConfigBtn = document.getElementById('dev-telemetry-config-btn');

        const triggerRamConfig = () => {
            const current = state.totalRamGB || 16;
            const input = prompt('Enter your Total System RAM in GB (e.g. 16, 32, 64, 8):', current);
            if (input && !isNaN(parseFloat(input)) && parseFloat(input) > 0) {
                state.totalRamGB = parseFloat(input);
                localStorage.setItem('dev_total_ram', state.totalRamGB);
                renderGauges();
            }
        };

        const triggerCpuConfig = () => {
            const current = state.cpuCores || 8;
            const input = prompt('Enter your CPU Cores count (e.g. 8, 12, 16, 24):', current);
            if (input && !isNaN(parseInt(input)) && parseInt(input) > 0) {
                state.cpuCores = parseInt(input);
                localStorage.setItem('dev_cpu_cores', state.cpuCores);
                renderGauges();
            }
        };

        if (ramStatsEl) {
            ramStatsEl.style.cursor = 'pointer';
            ramStatsEl.title = 'Click to customize Total RAM';
            ramStatsEl.addEventListener('click', triggerRamConfig);
        }
        if (ramCell) {
            ramCell.addEventListener('dblclick', triggerRamConfig);
        }
        if (cpuCoresEl) {
            cpuCoresEl.style.cursor = 'pointer';
            cpuCoresEl.title = 'Click to customize CPU Cores';
            cpuCoresEl.addEventListener('click', triggerCpuConfig);
        }
        if (telemetryConfigBtn) {
            telemetryConfigBtn.addEventListener('click', () => {
                const choice = prompt('Configure Telemetry:\n1: Set Total RAM (GB)\n2: Set CPU Cores\nType 1 or 2:', '1');
                if (choice === '1') triggerRamConfig();
                else if (choice === '2') triggerCpuConfig();
            });
        }

        // Pause animations when tab is in background to save CPU/battery
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (state.animFrameId) cancelAnimationFrame(state.animFrameId);
            } else if (state.active) {
                state.animFrameId = requestAnimationFrame(animLoop);
            }
        });
    }

    /**
     * DEV DASHBOARD LIFECYCLE CONTROLLER
     */
    window.DevDashboard = {
        init: function () {
            setupQuickSearch();
            setupEventListeners();
        },
        start: function () {
            if (state.active) return;
            state.active = true;
            updateClock();
            if (state.clockInterval) clearInterval(state.clockInterval);
            state.clockInterval = setInterval(updateClock, 1000);

            fetchWeatherData(state.lat, state.lon, state.city);
            
            // Poll real OS telemetry
            fetchRealSystemTelemetry();
            if (state.realTelemetryInterval) clearInterval(state.realTelemetryInterval);
            state.realTelemetryInterval = setInterval(fetchRealSystemTelemetry, 1500);

            state.animFrameId = requestAnimationFrame(animLoop);
        },
        stop: function () {
            state.active = false;
            if (state.clockInterval) {
                clearInterval(state.clockInterval);
                state.clockInterval = null;
            }
            if (state.realTelemetryInterval) {
                clearInterval(state.realTelemetryInterval);
                state.realTelemetryInterval = null;
            }
            if (state.animFrameId) {
                cancelAnimationFrame(state.animFrameId);
                state.animFrameId = null;
            }
        },
        isActive: function () {
            return state.active;
        }
    };

    // Auto-init DOM bindings on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.DevDashboard.init());
    } else {
        window.DevDashboard.init();
    }
})();
