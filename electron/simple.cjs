const { app, BrowserWindow } = require('electron');

app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 800, height: 600 });
  win.loadFile('test.html');
});

app.on('window-all-closed', () => {
  app.quit();
});
