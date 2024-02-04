const path=require('path');
const os=require('os');
const fs=require('fs');
const resizeImg=require('resize-img');
const{app,BrowserWindow,Menu,ipcMain,shell}=require('electron');

process.env.NODE_ENV='production';

const isDev= process.env.NODE_ENV !== 'production';
const isMac= process.platform==='darwin';

let mainWindow;
//Create the main Window
function createMainWindow(){
    mainWindow=new BrowserWindow({
        title:'Pixel Perfect',
        width:isDev?1000: 500,
        height:600,
        webPreferences:{
          contextIsolation:true,
          nodeIntegration:true,
          preload:path.join(__dirname,'preload.js')

        }

    });
    
    // Open devtools if in dev
    if(isDev){
      mainWindow.webContents.openDevTools();
    }
    
    
    mainWindow.loadFile(path.join(__dirname,'./renderer/index.html'));

}
function createAboutWindow(){
    const aboutWindow=new BrowserWindow({
        title:'About Pixel Perfect',
        width:300,
        height:300

    });
    aboutWindow.loadFile(path.join(__dirname,'./renderer/about.html'));

}



//App is Ready
app.whenReady().then(()=>{
    createMainWindow();

    //Implement Menu
    const mainMenu=Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);


    //Remove mainWindow from memory on close

    mainWindow.on('closed',()=>(mainWindow=null))



    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createMainWindow()
        }
      })
});



// Menu Templates
const menu = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              {
                label: 'About',
                click: createAboutWindow
              },
            ],
          },
        ]
      : []),
    {
      role: 'fileMenu',
    },
    ...(isMac
      ? []
      : [
          {
            label: 'Help',
            submenu: [
              {
                label: 'About',
                click: createAboutWindow
              },
            ],
          },
        ]),
  ];
  
  // Respond to ipcRenderer resize
  ipcMain.on('image:resize',(e,options)=>{
    options.dest=path.join(os.homedir(),'imageresizer');
    resizeImage(options);

  });
  
  //Function to Resize the image
  async function resizeImage({imgPath, width, height, dest}){
    try {
      const newPath=await resizeImg(fs.readFileSync(imgPath),{
        encoding: 'utf-8',
        width:+width,
        height:+height
      });

      //Create Filename

      const filename=path.basename(imgPath);

      //Create destination folder if it doesn't exist

      if(!fs.existsSync(dest)){
        fs.mkdirSync(dest);

      }

      //Write File to the destination 
      fs.writeFileSync(path.join(dest,filename),newPath);

      //Send Success To Renderer
      mainWindow.webContents.send('image:done');


      //Open destination folder
      shell.openPath(dest);


      
    } catch (error) {
      console.log(error);
    }

  }

app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit()
    }
  })