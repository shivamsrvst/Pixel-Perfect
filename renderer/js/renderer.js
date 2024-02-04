const form=document.querySelector('#img-form');
const img=document.querySelector('#img');
const outputPath=document.querySelector('#output-path');
const fileName=document.querySelector('#filename');
const heightInput=document.querySelector('#height');
const widthInput=document.querySelector('#width');


//Function to load the image 
function loadImage(e){
    const file=e.target.files[0];
    if(!isFileImage(file)){
        alertError("Please Select an image File");
        return;
    }

    //Get Original Information of the Picture and then populate into the html

    const image=new Image();
    image.src=URL.createObjectURL(file);
    image.onload=function(){
        widthInput.value=this.width;
        heightInput.value=this.height;
    }


    form.style.display='block';
    fileName.innerText=file.name;
    outputPath.innerText=path.join(os.homedir(),'imageresizer')
}

//Function for sending the data to the main
function sendImage(e){
    e.preventDefault();

    const width=widthInput.value;
    const height=heightInput.value;
    const imgPath=img.files[0].path;

    if(!img.files[0]){
        alertError('Please Upload an Image For Resizing');
        return;

    }
    if(width==='' || height===''){
        alertError('Please Fill some height and width');
        return;
    }

    //Send To Main using ipcRenderer
    ipcRenderer.send('image:resize',{
        imgPath,
        width,
        height
    })


}

//Catch the image:done event
ipcRenderer.on('image:done',()=>{
    alertSuccess(`Image Resized To ${widthInput.value} x ${heightInput.value}`);
});


//Make Sure file is image
function isFileImage(file){
    const acceptedImageTypes=['image/gif','image/png','image/jpeg','image/JPG'];
    return file && acceptedImageTypes.includes(file['type']);

}

//Toastify------

function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: "red",
      color: "white",
      textAlign: "center",
    },
  });
}

function alertSuccess(message) {
    Toastify.toast({
      text: message,
      duration: 5000,
      close: false,
      style: {
        background: "green",
        color: "white",
        textAlign: "center",
      },
    });
  }


img.addEventListener('change',loadImage);
form.addEventListener('submit',sendImage)
