import '../stylesheets/style.scss';

import { Howl } from 'howler';
import watermark from 'watermarkjs';
import platform from 'platform';

// DOM READY
// MODAL
let sndClick;

document.addEventListener('DOMContentLoaded', () => {
  const ctaButton = document.querySelector('.btn__action');
  const backHomeButton = document.querySelector('#backHome');

  ctaButton.addEventListener('click', (e) => {
    e.preventDefault();
    sndClick = new Howl({ src: ['./audio/dog.mp3'], loop: true, html5: true });
    document.querySelector('.notification-audio').classList.add('animation');
    document.getElementById('modal').classList.add('disable');
    sndClick.play();
  });

  backHomeButton.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('modal').classList.remove('disable');
    sndClick.stop();
  });

  console.log(platform.name);
  console.log(platform.product);

  if (platform.name == 'Safari' || platform.product == 'iPhone') {
    document.querySelector('.preview-options').classList.add('disable');
    document.querySelector('.safari-options').classList.add('active');
  }
});

//

/*

>> kasperkamperman.com - 2020-05-17
>> https://www.kasperkamperman.com/blog/camera-template/

*/

var takeSnapshotUI = createClickFeedbackUI();

var video;
var takePhotoButton;
var switchCameraButton;
var amountOfCameras = 0;
var currentFacingMode = 'environment';
var angle;

const previewImgContainer = document.querySelector('.photo-preview-container');
const previewImgElement = document.getElementById('photo-preview');
const bgBlurred = document.querySelector('.photo-preview--blurred');

// this function counts the amount of video inputs
// it replaces DetectRTC that was previously implemented.
function deviceCount() {
  return new Promise(function (resolve) {
    var videoInCount = 0;

    navigator.mediaDevices
      .enumerateDevices()
      .then(function (devices) {
        devices.forEach(function (device) {
          if (device.kind === 'video') {
            device.kind = 'videoinput';
          }

          if (device.kind === 'videoinput') {
            videoInCount++;
            console.log('videocam: ' + device.label);
          }
        });

        resolve(videoInCount);
      })
      .catch(function (err) {
        console.log(err.name + ': ' + err.message);
        resolve(0);
      });
  });
}

document.addEventListener('DOMContentLoaded', function (event) {
  // check if mediaDevices is supported
  if (
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    navigator.mediaDevices.enumerateDevices
  ) {
    // first we call getUserMedia to trigger permissions
    // we need this before deviceCount, otherwise Safari doesn't return all the cameras
    // we need to have the number in order to display the switch front/back button
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: true,
      })
      .then(function (stream) {
        stream.getTracks().forEach(function (track) {
          track.stop();
        });

        deviceCount().then(function (deviceCount) {
          amountOfCameras = deviceCount;

          // init the UI and the camera stream
          initCameraUI();
          initCameraStream();
        });
      })
      .catch(function (error) {
        //https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        if (error === 'PermissionDeniedError') {
          alert('Permission denied. Please refresh and give permission.');
        }

        console.error('getUserMedia() error: ', error);
      });
  } else {
    alert('Mobile camera is not supported by browser, or there is no camera detected/connected');
  }
});

function initCameraUI() {
  video = document.getElementById('video');

  takePhotoButton = document.getElementById('takePhotoButton');
  // switchCameraButton = document.getElementById('switchCameraButton');

  // https://developer.mozilla.org/nl/docs/Web/HTML/Element/button
  // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_button_role

  takePhotoButton.addEventListener('click', function () {
    takeSnapshotUI();
    takeSnapshot();
  });

  // -- switch camera part
  // if (amountOfCameras > 1) {
  //   switchCameraButton.style.display = 'block';

  //   switchCameraButton.addEventListener('click', function () {
  //     if (currentFacingMode === 'environment') currentFacingMode = 'user';
  //     else currentFacingMode = 'environment';

  //     initCameraStream();
  //   });
  // }

  // Listen for orientation changes to make sure buttons stay at the side of the
  // physical (and virtual) buttons (opposite of camera) most of the layout change is done by CSS media queries
  // https://www.sitepoint.com/introducing-screen-orientation-api/
  // https://developer.mozilla.org/en-US/docs/Web/API/Screen/orientation
  window.addEventListener(
    'orientationchange',
    function () {
      // iOS doesn't have screen.orientation, so fallback to window.orientation.
      // screen.orientation will
      if (screen.orientation) angle = screen.orientation.angle;
      else angle = window.orientation;

      var guiControls = document.getElementById('gui_controls').classList;
      var vidContainer = document.getElementById('vid_container').classList;

      if (angle == 270 || angle == -90) {
        guiControls.add('left');
        vidContainer.add('left');
      } else {
        if (guiControls.contains('left')) guiControls.remove('left');
        if (vidContainer.contains('left')) vidContainer.remove('left');
      }

      //0   portrait-primary
      //180 portrait-secondary device is down under
      //90  landscape-primary  buttons at the right
      //270 landscape-secondary buttons at the left
    },
    false
  );
}

// https://github.com/webrtc/samples/blob/gh-pages/src/content/devices/input-output/js/main.js
function initCameraStream() {
  // stop any active streams in the window
  if (window.stream) {
    window.stream.getTracks().forEach(function (track) {
      console.log(track);
      track.stop();
    });
  }

  // we ask for a square resolution, it will cropped on top (landscape)
  // or cropped at the sides (landscape)
  var size = 1280;

  var constraints = {
    audio: false,
    video: {
      width: { ideal: size },
      height: { ideal: size },
      //width: { min: 1024, ideal: window.innerWidth, max: 1920 },
      //height: { min: 776, ideal: window.innerHeight, max: 1080 },
      facingMode: currentFacingMode,
    },
  };

  navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);

  function handleSuccess(stream) {
    window.stream = stream; // make stream available to browser console
    video.srcObject = stream;

    // if (constraints.video.facingMode) {
    //   if (constraints.video.facingMode === 'environment') {
    //     switchCameraButton.setAttribute('aria-pressed', true);
    //   } else {
    //     switchCameraButton.setAttribute('aria-pressed', false);
    //   }
    // }

    const track = window.stream.getVideoTracks()[0];
    const settings = track.getSettings();
    let str = JSON.stringify(settings, null, 4);
    console.log('settings ' + str);
  }

  function handleError(error) {
    console.error('getUserMedia() error: ', error);
  }
}

function takeSnapshot() {
  // if you'd like to show the canvas add it to the DOM
  var canvas = document.createElement('canvas');

  var width = video.videoWidth;
  var height = video.videoHeight;

  canvas.width = width;
  canvas.height = height;

  let context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, width, height);

  // polyfil if needed https://github.com/blueimp/JavaScript-Canvas-to-Blob

  // https://developers.google.com/web/fundamentals/primers/promises
  // https://stackoverflow.com/questions/42458849/access-blob-value-outside-of-canvas-toblob-async-function
  function getCanvasBlob(canvas) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(
        function (blob) {
          resolve(blob);
        },
        'image/jpeg',
        1
      );
    });
  }

  // some API's (like Azure Custom Vision) need a blob with image data
  getCanvasBlob(canvas).then(function (blob) {
    // do something with the image blob

    let blobURL = URL.createObjectURL(blob);
    const downloadBtn = document.querySelector('#downloadImage');

    // preview image

    watermark([blobURL, './images/watermark@2x.png'])
      .image(watermark.image.lowerRight())
      .then(function (img) {
        previewImgElement.innerHTML = '';
        previewImgElement.appendChild(img);

        downloadBtn.href = img.src;
        downloadBtn.download = 'dogSnap.jpeg';
        bgBlurred.style.backgroundImage = `url(${img.src})`;
        sndClick.stop();
      });
    previewImgContainer.classList.add('active');
  });
}

function createClickFeedbackUI() {
  // in order to give feedback that we actually pressed a button.
  // we trigger a almost black overlay
  var overlay = document.getElementById('video_overlay'); //.style.display;

  // sound feedback

  var overlayVisibility = false;
  var timeOut = 80;

  function setFalseAgain() {
    overlayVisibility = false;
    overlay.style.display = 'none';
  }

  return function () {
    if (overlayVisibility == false) {
      overlayVisibility = true;
      overlay.style.display = 'block';
      setTimeout(setFalseAgain, timeOut);
    }
  };
}

// Save & Delete button actions

// const saveButton = document.getElementById('button-save');
const deleteButton = document.getElementById('button-delete');
const closeButton = document.getElementById('close-icon');

deleteButton.addEventListener('click', (e) => {
  e.preventDefault();
  previewImgContainer.classList.remove('active');
  previewImgElement.innerHTML = '';
  bgBlurred.style.backgroundImage = '';
  sndClick.play();
});

closeButton.addEventListener('click', (e) => {
  e.preventDefault();
  previewImgContainer.classList.remove('active');
  previewImgElement.innerHTML = '';
  bgBlurred.style.backgroundImage = '';
  sndClick.play();
});
