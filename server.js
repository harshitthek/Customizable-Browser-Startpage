const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = '127.0.0.1';
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json'
};

// Measure real CPU usage delta
function getCpuUsage() {
    return new Promise((resolve) => {
        const startStats = os.cpus().map(c => c.times);
        setTimeout(() => {
            const endStats = os.cpus().map(c => c.times);
            let totalIdle = 0, totalTick = 0;
            for (let i = 0; i < startStats.length; i++) {
                const start = startStats[i];
                const end = endStats[i];
                const idle = end.idle - start.idle;
                const total = (end.user - start.user) + (end.nice - start.nice) + (end.sys - start.sys) + (end.irq - start.irq) + idle;
                totalIdle += idle;
                totalTick += total;
            }
            const usage = totalTick === 0 ? 0 : Math.round(100 - (totalIdle / totalTick) * 100);
            resolve(Math.min(100, Math.max(0, usage)));
        }, 150);
    });
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
    const requestPath = parsedUrl.pathname;

    // Real System Telemetry API endpoint
    if (requestPath === '/api/system') {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const totalGB = (totalMem / (1024 ** 3)).toFixed(1);
        const usedGB = (usedMem / (1024 ** 3)).toFixed(1);
        const ramPercent = Math.round((usedMem / totalMem) * 100);
        const cpuPercent = await getCpuUsage();

        const data = {
            isReal: true,
            totalRamGB: parseFloat(totalGB),
            usedRamGB: parseFloat(usedGB),
            freeRamGB: parseFloat((freeMem / (1024 ** 3)).toFixed(1)),
            ramPercent: ramPercent,
            cpuPercent: cpuPercent,
            cpuCores: os.cpus().length,
            cpuModel: os.cpus()[0]?.model || 'Processor',
            platform: os.platform(),
            uptime: Math.round(os.uptime())
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
        return;
    }

    // Static file serving with path traversal hardening
    let reqPath = requestPath === '/' || requestPath === '' ? '/index.html' : requestPath;
    const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.resolve(__dirname, '.' + safePath);

    // Verify resolved path stays strictly within serving root
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, HOST, () => {
    console.log(`DailyCosmos server running on http://${HOST}:${PORT}`);
});
