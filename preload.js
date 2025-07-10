const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

// Expose a global object 'electronAPI' to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Opens a file dialog to select an audio file.
   * @returns {Promise<string|null>} A promise that resolves with the selected file path or null if cancelled.
   */
  openAudioFile: () => ipcRenderer.invoke('open-audio-file-dialog'),

  /**
   * Gets the path to the default alarm sound bundled with the app.
   * @returns {Promise<string>} A promise that resolves with the default sound path.
   */
  getDefaultAlarmSoundPath: () => ipcRenderer.invoke('get-default-alarm-sound-path'),

  /**
   * Saves application settings persistently.
   * @param {object} settings - The settings object to save.
   * @returns {Promise<void>}
   */
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

  /**
   * Loads application settings.
   * @returns {Promise<object>} A promise that resolves with the loaded settings.
   */
  loadSettings: () => ipcRenderer.invoke('load-settings')
});
