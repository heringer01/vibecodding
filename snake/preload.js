const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  toggleFullscreen: () => {
    const currentWindow = require('electron').remote
      ? require('electron').remote.getCurrentWindow()
      : null;

    if (currentWindow) {
      currentWindow.setFullScreen(!currentWindow.isFullScreen());
      return;
    }

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen?.();
    }
  }
});

window.addEventListener('DOMContentLoaded', () => {
  // Preload intentionally left minimal for secure context isolation.
});
