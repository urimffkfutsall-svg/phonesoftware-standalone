import os, json

# Create electron main.js
electron_main = """const { app, BrowserWindow, shell } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let backendProcess;

function startBackend() {
  const backendPath = isDev
    ? path.join(__dirname, '..', 'backend', 'server.py')
    : path.join(process.resourcesPath, 'backend', 'server.exe');

  if (isDev) {
    backendProcess = spawn('python', [backendPath], {
      cwd: path.join(__dirname, '..', 'backend'),
      env: { ...process.env, PORT: '8000' }
    });
  } else {
    backendProcess = spawn(backendPath, [], {
      cwd: path.join(process.resourcesPath, 'backend'),
      env: { ...process.env, PORT: '8000' }
    });
  }
  backendProcess.stdout.on('data', (d) => console.log('Backend:', d.toString()));
  backendProcess.stderr.on('data', (d) => console.error('Backend err:', d.toString()));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    titleBarStyle: 'default',
    title: 'PhoneSoftware'
  });

  const url = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, 'build', 'index.html')}`;

  mainWindow.loadURL(url);
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  startBackend();
  setTimeout(createWindow, isDev ? 0 : 3000);
});

app.on('before-quit', () => {
  if (backendProcess) backendProcess.kill();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
"""

with open('frontend/electron.js', 'w', encoding='utf-8') as f:
    f.write(electron_main)
print("electron.js created!")

# Update package.json
with open('frontend/package.json', 'r', encoding='utf-8') as f:
    pkg = json.load(f)

pkg['main'] = 'electron.js'
pkg['homepage'] = './'
pkg['scripts']['electron'] = 'electron .'
pkg['scripts']['electron-dev'] = 'concurrently "npm start" "wait-on http://localhost:3000 && electron ."'
pkg['scripts']['build-electron'] = 'npm run build && electron-builder'
pkg['build'] = {
    "appId": "com.phonesoftware.app",
    "productName": "PhoneSoftware",
    "directories": {"output": "dist"},
    "files": ["build/**/*", "electron.js", "assets/**/*"],
    "extraResources": [{"from": "../backend-dist/", "to": "backend/"}],
    "win": {
        "target": "nsis",
        "icon": "assets/icon.ico"
    },
    "nsis": {
        "installerIcon": "assets/icon.ico",
        "installerHeaderIcon": "assets/icon.ico",
        "createDesktopShortcut": True,
        "createStartMenuShortcut": True,
        "shortcutName": "PhoneSoftware"
    }
}

with open('frontend/package.json', 'w', encoding='utf-8') as f:
    json.dump(pkg, f, indent=2)
print("package.json updated!")
