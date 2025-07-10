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

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: Math.min(450, width), // Set a max width, or adapt to screen size
    height: Math.min(700, height), // Set a max height, or adapt to screen size
    minWidth: 350, // Minimum width
    minHeight: 500, // Minimum height
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableBlinkFeatures: 'WebBluetooth',
    },
    title: "Battery Alarm",
    icon: path.join(__dirname, 'build', 'icon.png') // Ensure correct path to icon
  });

  // Load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Open the DevTools. (Optional, for debugging)
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- IPC Main Handlers ---

// Handle request to open file dialog for audio
ipcMain.handle('open-audio-file-dialog', async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg'] }
    ]
  });
  // Return the selected file path or null if cancelled
  return result.canceled ? null : result.filePaths[0];
});

// Handle request to get the default alarm sound path
ipcMain.handle('get-default-alarm-sound-path', () => {
  return path.join(process.resourcesPath, 'your_alarm_sound.mp3');
});

// Handle request to save settings
ipcMain.handle('save-settings', (event, settings) => {
  saveSettings(settings);
});

// Handle request to load settings
ipcMain.handle('load-settings', () => {
  return loadSettings();
});
