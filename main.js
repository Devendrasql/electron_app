const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

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
      preload: path.join(__dirname, 'preload.js'), // For future extensibility, though not strictly needed for this app
      nodeIntegration: false, // Keep false for security
      contextIsolation: true, // Keep true for security
      // Enable Web Bluetooth API
      // Note: This requires specific flags in Electron and might still need user permission
      // depending on the OS and browser engine version.
      // For testing, you might need to launch Electron with --enable-web-bluetooth flag.
      // In a production app, you'd rely on the user grant permission via the dialog.
      enableBlinkFeatures: 'WebBluetooth', // Ensure WebBluetooth is enabled
    },
    title: "Battery Alarm", // Set window title
    icon: path.join(__dirname, 'icon.png') // Optional: path to an icon file (e.g., .png)
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
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Optional: Create a preload.js if you need to expose Node.js APIs to the renderer
// For this simple app, it's not strictly necessary but good practice for security.
// If you create it, it would be an empty file for now.
// const { contextBridge } = require('electron');
// contextBridge.exposeInMainWorld('electronAPI', {
//   // Example: ipcRenderer.invoke('some-channel')
// });
