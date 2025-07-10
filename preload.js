const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

console.log('[preload.js] Preload script started.');

// Expose a global object 'electronAPI' to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Opens a file dialog to select an audio file.
   * @returns {Promise<string|null>} A promise that resolves with the selected file path or null if cancelled.
   */
  openAudioFile: () => {
    console.log('[preload.js] Calling ipcRenderer.invoke("open-audio-file-dialog")');
    return ipcRenderer.invoke('open-audio-file-dialog');
  },

  /**
   * Gets the path to the default alarm sound bundled with the app.
   * @returns {Promise<string>} A promise that resolves with the default sound path.
   */
  getDefaultAlarmSoundPath: () => {
    console.log('[preload.js] Calling ipcRenderer.invoke("get-default-alarm-sound-path")');
    return ipcRenderer.invoke('get-default-alarm-sound-path');
  },

  /**
   * Saves application settings persistently.
   * @param {object} settings - The settings object to save.
   * @returns {Promise<void>}
   */
  saveSettings: (settings) => {
    console.log('[preload.js] Calling ipcRenderer.invoke("save-settings")', settings);
    return ipcRenderer.invoke('save-settings', settings);
  },

  /**
   * Loads application settings.
   * @returns {Promise<object>} A promise that resolves with the loaded settings.
   */
  loadSettings: () => {
    console.log('[preload.js] Calling ipcRenderer.invoke("load-settings")');
    return ipcRenderer.invoke('load-settings');
  }
});

console.log('[preload.js] electronAPI exposed to window.');
