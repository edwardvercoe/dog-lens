import '../stylesheets/style.scss';

import Webcam from 'webcam-easy';

const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas');
const snapSoundElement = document.getElementById('snapSound');
const webcam = new Webcam(webcamElement, 'user', canvasElement, snapSoundElement);

// DOM READY

document.addEventListener('DOMContentLoaded', (event) => {
  const ctaButton = document.querySelector('.btn__action');
  ctaButton.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('modal').remove();

    // start webcam

    webcam
      .start()
      .then((result) => {
        console.log('webcam started');
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

// take photo

const capturePhoto = () => {
  let picture = webcam.snap();
  console.log('camera snapped');
  console.log(picture);
  document.querySelector('#download-photo').href = picture;
  afterTakePhoto();
};

const afterTakePhoto = () => {
  webcam.stop();
  console.log('camera stopped');
};

const takePhoto = document.querySelector('#take-photo');

takePhoto.addEventListener('click', () => {
  capturePhoto();
});
