// Face Detection
// Loads and initializes the ml5 Face API model for face detection.
let faceapi;
let detections = [];
let faceModelReady = false;

// Face API detection options
const detectionOptions = {
  withLandmarks: true,
  withExpressions: false,
  withDescriptors: false
};

// Initalised ml5 api
function initFaceAPI(videoInput) {
  faceapi = ml5.faceApi(videoInput, detectionOptions, onFaceModelReady);
}

function onFaceModelReady() {
  console.log("Face API model loaded!");
  faceModelReady = true;
}

// Called each time face detection finishes (live or static).
// Bounding box is stored in faceBox (or null if no face found).
function onFaceDetected(err, result) {
  if (err) {
    console.error(err);
    return;
  }

  // Store all detected faces
  detections = result; 
  // Map face detection results to an array of bounding box objects
  if (detections.length > 0) {
    faceBoxes = detections.map(det => {
      let box = det.alignedRect._box;
      return {
        x: Math.floor(box._x),
        y: Math.floor(box._y),
        w: Math.max(Math.floor(box._width), 1),
        h: Math.max(Math.floor(box._height), 1)
      };
    });
  } else {
    faceBoxes = [];
  }
}
