const { app, BrowserWindow } = require('electron');

console.log('Test Electron starting...');

let mainWindow;

function createWindow() {
  console.log('Creating window...');
  
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Test Electron'
  });

  mainWindow.loadFile('test.html');
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

console.log('Test setup complete');
