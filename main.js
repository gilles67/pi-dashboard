const electron = require('electron')
const app = electron.app
const ipc = electron.ipcMain
const BrowserWindow = electron.BrowserWindow

let win
let winShutdown
let winWait
let winApp = []
let navbarHeight = 0;

// Main Window

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

ipc.on('notify', function(event, arg) {
  if( 'navbar-height' in arg) {
      navbarHeight = arg['navbar-height'];
      console.log("navbarHeight", navbarHeight);
  }
})


//Shutdown Window

function createShutdownWindow() {
  if (winShutdown) {
      winShutdown.show()
  }
  else {
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
    }
  }
  else if (arg == "querywin") {
    createShutdownWindow()
  }
})

// Waiting window

function openWaitWindow() {
  if (winWait) {
      winWait.show()
  }
  else {
    winWait = new BrowserWindow({
      frame: false,
      webPreferences: {
        nodeIntegration: true
      }
    });
    //winWait.webContents.openDevTools()
    winWait.setBounds(win.getBounds());
    winWait.loadFile('contents/main-wait.html');
    winWait.on('closed', () => {
      winWait = null
    })
  }
}

ipc.on('request-wait', function(event, arg) {
  console.log("Request wait, option : " , arg)
  if(arg == "cancelwin") {
    winWait.hide();
  }
  else if (arg == "querywait") {
    openWaitWindow()
  }
})

// Application window

function createAppWindow(item) {
  var id = item['id']
  if (id in winApp) {
    //winApp[id].reload()
    winApp[id].focus()
    console.log(winApp[id].ItemApp)
  }
  else {
    winApp[id] = new BrowserWindow({
      frame: false,
      webPreferences: {
        nodeIntegration: false
      }
    });
    winApp[id].setBounds(win.getBounds());
    winSize = win.getBounds();
    winApp[id].setSize(winSize['width'], winSize['height'] - navbarHeight);
    winApp[id].loadURL(item['url']);
    winApp[id].ItemApp = item;
    winApp[id].on('closed', () => {
      winApp[id] = null
    })
  }
}

ipc.on('open-app', function(event, arg) {
  createAppWindow(arg);
})
