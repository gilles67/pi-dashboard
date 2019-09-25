const electron = require('electron')
const app = electron.app
const ipc = electron.ipcMain
const BrowserWindow = electron.BrowserWindow

let win
let winShutdown
let winApp = []

function createWindow () {
  // Créer le browser window.
  win = new BrowserWindow({
    //width: 800,
    //height: 600,
    kiosk: true,
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.loadFile('contents/main-index.html')
  win.webContents.openDevTools()
  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    app.quit()
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

function createShutdownWindow() {
  winShutdown = new BrowserWindow({
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  });
  //winShutdown.webContents.openDevTools()
  winShutdown.setBounds(win.getBounds());
  winShutdown.loadFile('contents/main-shutdown.html');
  winShutdown.on('closed', () => {
    winShutdown = null
  })
}

function createAppWindow(id, url) {
  winApp[id] = new BrowserWindow({
    frame: false,
    webPreferences: {
      nodeIntegration: false
    }
  });
  winApp[id].setBounds(win.getBounds());
  winApp[id].on('closed', () => {
    winApp[id] = null
  })
}


ipc.on('request-shutdown', function(event, arg) {
  console.log("Request shutdown, option : " , arg)
  if(arg == "shutdown") {
      app.exit(99)
  }
  else if (arg == "reboot") {
    app.exit(0)
  }
  else if (arg == "cancelwin"){
    if(winShutdown != null) {
      winShutdown.hide();
      winShutdown.close();
    }
  }
  else if (arg == "querywin") {
    createShutdownWindow()
  }
})
