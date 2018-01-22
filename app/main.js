const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const ipcMain = electron.ipcMain

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 600, height: 900, frame:true})
  mainWindow.setMenu(null);
  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'site/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// import serialport 
const sp         = require('serialport');
var port_found = false;

// initialize port connection and set up listener for data throughput
var monitor = require('node-usb-detection');

// look for changes on usb
monitor.change(function(device){
  console.log('detected USB change');
  querySerialPorts();
});

// look for initial connections
querySerialPorts();

// grab the first serial port we can find
function querySerialPorts() {
    
    if(!port_found){
        var port_name  = 0;
        sp.list(function(err, ports) {

            if (ports && ports[0]){
                var port_name = ports[0]['comName'];
                setupPort(port_name);
            }
            else{
                mainWindow.webContents.send('set_state', false);
                console.log('error querying serial ports');
            }
        });
    }
    
    // send message to renderer that the port state was set

}

function setupPort(port_name){
    
        // if there is a port to connect to, we'll set it up
        if (port_name){
            var port_found = true;
            var serialport = new sp(port_name, {
                  baudRate: 57600
                });
            var Readline = sp.parsers.Readline;
            var parser = serialport.pipe(new Readline());
            
            // error handling on serial port
            serialport.on('error', function(err) {
                if(err){
                    console.log(err);
                    console.log('error occurred in serial port')
                }
            });
            
            // consume input data
            serialport.open(function(){
                console.log('Serial Port Opened');
                parser.on('data', function(data){
                   // console.log(data[0]);
                    // Send async message to render process
                    mainWindow.webContents.send('stream_data', data);
                    mainWindow.webContents.send('set_state', true);
                });
            });
    }
}





