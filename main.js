const { app, BrowserWindow, screen, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Path to store application settings
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

/**
 * Loads settings from the settings.json file.
 * @returns {object} The loaded settings or an empty object if not found/error.
 */
function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return {};
}

/**
 * Saves settings to the settings.json file.
 * @param {object} settings - The settings object to save.
 */
function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

function createWindow() {
  // Get primary display's size
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Log the path to preload.js before creating the window
  const preloadScriptPath = path.join(__dirname, 'preload.js');
  console.log(`[main.js] Attempting to load preload script from: ${preloadScriptPath}`);
  if (!fs.existsSync(preloadScriptPath)) {
    console.error(`[main.js] ERROR: preload.js file NOT FOUND at: ${preloadScriptPath}`);
  }

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: Math.min(450, width),
    height: Math.min(700, height),
    minWidth: 350,
    minHeight: 500,
    webPreferences: {
      preload: preloadScriptPath, // Use the resolved path
      nodeIntegration: false,
      contextIsolation: true,
      enableBlinkFeatures: 'WebBluetooth',
    },
    title: "Battery Alarm",
    icon: path.join(__dirname, 'build', 'icon.png')
  });

  console.log('[main.js] BrowserWindow created.');

  // Load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Open the DevTools. (Optional, for debugging)
  // mainWindow.webContents.openDevTools(); // Uncomment this line to always open DevTools for debugging packaged app
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  console.log('[main.js] App is ready. Creating window...');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  console.log('[main.js] All windows closed. Quitting app.');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- IPC Main Handlers ---

ipcMain.handle('open-audio-file-dialog', async (event) => {
  console.log('[main.js] Received request to open audio file dialog.');
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg'] }
    ]
  });
  console.log(`[main.js] File dialog result: ${result.canceled ? 'Cancelled' : result.filePaths[0]}`);
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('get-default-alarm-sound-path', () => {
  const defaultPath = path.join(process.resourcesPath, 'your_alarm_sound.mp3');
  console.log(`[main.js] Providing default alarm sound path: ${defaultPath}`);
  return defaultPath;
});

ipcMain.handle('save-settings', (event, settings) => {
  console.log('[main.js] Received request to save settings:', settings);
  saveSettings(settings);
});

ipcMain.handle('load-settings', () => {
  const loadedSettings = loadSettings();
  console.log('[main.js] Received request to load settings. Loaded:', loadedSettings);
  return loadedSettings;
});
