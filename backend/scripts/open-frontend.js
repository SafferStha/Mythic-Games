const { spawn } = require('child_process');

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173/';

function openOnWindows(url) {
	const child = spawn('cmd', ['/c', 'start', '', url], {
		detached: true,
		stdio: 'ignore',
	});

	child.unref();
}

function openOnMac(url) {
	const child = spawn('open', [url], {
		detached: true,
		stdio: 'ignore',
	});

	child.unref();
}

function openOnLinux(url) {
	const child = spawn('xdg-open', [url], {
		detached: true,
		stdio: 'ignore',
	});

	child.unref();
}

try {
	if (process.platform === 'win32') {
		openOnWindows(frontendUrl);
	} else if (process.platform === 'darwin') {
		openOnMac(frontendUrl);
	} else {
		openOnLinux(frontendUrl);
	}
} catch (error) {
	console.warn(`Could not open frontend URL ${frontendUrl}:`, error.message || error);
}