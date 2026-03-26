// Main Sketch for the grid images

// Set up grid layout and webcam capture, do transformations
let video;
let snapshot;
let staticSnapshot;
let uploadedImage;
// For multiple face bounding boxes
let faceBoxes = [];

let scaledW = 160;
let scaledH = 120;

// For storing processed images in each cell
let processed = {
  grayBright: null,
  r: null,
  g: null,
  b: null,
  rThresh: null,
  gThresh: null,
  bThresh: null,
  hsvImage: null,
  ycbcrImage: null,
  hsvThresh: null,
  ycbcrThresh: null,
  capturedImage: null,
  filteredImage: null,
  binaryThresh: null,
  cmykImage: null,
  cmykThresh: null,
  cannyEdgeImage: null, 
  invertedImage: null
};


// Menu Checkbox toggles
let useStaticPhoto = false;
let useUploadedImage = false;
let toggleCheckbox;

// Grid layout
const CELL_W = 160;
const CELL_H = 120;
const XGAP = 20;
const YGAP = 20;

// 0 => no filter, 1 => grayscale, 2 => blur, 3 => HSV, 4 => pixelate
let faceFilterMode = 0;

// Helper for grid positions
function gridX(col) {
  return col * (CELL_W + XGAP);
}
function gridY(row) {
  return row * (CELL_H + YGAP) + 40;
}

// Creates the main canvas and sets up the environment
function setup() {
  createCanvas(3 * (CELL_W + XGAP) - 20, 8 * (CELL_H + YGAP) + 80);

  // Create live video feed from webcam
  video = createCapture(VIDEO);
  video.size(scaledW, scaledH);
  video.hide();

  // Prepare p5.Images for your snapshot and uploads
  snapshot = createImage(scaledW, scaledH);
  staticSnapshot = createImage(scaledW, scaledH);
  uploadedImage = createImage(scaledW, scaledH);

  // Initialize ml5 face detection api
  initFaceAPI(video);

  // Periodically re-run detection if using live video
  setInterval(() => {
    if (!faceModelReady) return;
    if (!useStaticPhoto && !useUploadedImage) {
      faceapi.detect(video, onFaceDetected);
    }
  }, 500);
  
  toggleCheckbox = select('#toggleMode');
  if (toggleCheckbox) {
    toggleCheckbox.changed(() => {
      useStaticPhoto = toggleCheckbox.elt.checked;
      if (!useStaticPhoto && !useUploadedImage) {
        console.log("Returning to live webcam mode => continuous face detection.");
      }
    });
  }

  let saveBtn = select('#saveProcessed');
  if (saveBtn) {
    saveBtn.mousePressed(() => {
      saveCanvas('processed_image', 'png');
    });
  }

  let saveSelectedBtn = select('#saveSelectedImage');
  if (saveSelectedBtn) {
    saveSelectedBtn.mousePressed(saveSelectedImage);
  }

  let fileInput = select('#uploadImg');
  if (fileInput) {
    fileInput.changed(handleFileUpload);
  }

}

function draw() {
  background(240);

  // If in live webcam mode, copy from video
  if (!useStaticPhoto && !useUploadedImage) {
    snapshot.copy(video, 0, 0, scaledW, scaledH, 0, 0, scaledW, scaledH);
  }

  let inputImage = getCurrentInputImage();
  if (!inputImage) return;

  // We make a working copy for face detection display
  let faceDetectImage = inputImage.get();

  // Apply grayscale to the face detect image if faceFilterMode is 1
  if (faceFilterMode === 1) {
    faceDetectImage = convertToGrayscaleAndBrighten(faceDetectImage);
  }

  // If filter key 2-4 is pressed and we have faceBoxes, apply the filter
  if (faceFilterMode !== 0 && faceFilterMode !== 1 && faceBoxes.length > 0) {
    applyFaceFilterInPlace(faceDetectImage, faceBoxes, faceFilterMode);
  }

  // Draw the main grid with faceDetectImage in the "Face Detect" cell
  drawGridLayout(inputImage, faceDetectImage);
}


// This function applies the chosen filter to only the bounding‐box region
function applyFaceFilterInPlace(img, boxes, mode) {
  boxes.forEach(box => {
    let faceROI = img.get(box.x, box.y, box.w, box.h);
    let filtered = faceROI.get(); // make a copy

    if (mode === 1) {
      filtered = convertToGrayscaleAndBrighten(filtered);
    } else if (mode === 2) {
      filtered.filter(BLUR, 3);
    } else if (mode === 3) {
      filtered = convertRGBtoHSV(filtered);
    } else if (mode === 4) {
      filtered = pixelateImage(filtered, 5);
    }

    img.copy(filtered, 0, 0, filtered.width, filtered.height, box.x, box.y, box.w, box.h);
  });
}


// Draw all sub-images in the grid
function drawGridLayout(originalImg, faceDetectImg) {
  push();
  textSize(20);
  fill(0);
  textAlign(LEFT);
  text("Main Grid", gridX(0) + 200, gridY(0) -10 );
  pop();

  // row0 => Webcam image, Grayscale + 20% brightness
  processed.grayBright = convertToGrayscaleAndBrighten(originalImg);
  drawLabeledImage("Webcam/Live", originalImg, gridX(0), gridY(0));
  drawLabeledImage("Gray+Bright", processed.grayBright, gridX(1), gridY(0));
  drawLabeledImage("Empty Cell", null, gridX(2), gridY(0));

  // row1 => R, G, B Channels
  let channels = splitChannels(originalImg);
  processed.r = channels.rImg;
  processed.g = channels.gImg;
  processed.b = channels.bImg;
  drawLabeledImage("Red", processed.r, gridX(0), gridY(1));
  drawLabeledImage("Green", processed.g, gridX(1), gridY(1));
  drawLabeledImage("Blue", processed.b, gridX(2), gridY(1));

  // row2 => R, G, B Threshold
  let rVal = select('#thresholdR').value();
  let gVal = select('#thresholdG').value();
  let bVal = select('#thresholdB').value();
  processed.rThresh = thresholdImageColor(processed.r, rVal, 'r');
  processed.gThresh = thresholdImageColor(processed.g, gVal, 'g');
  processed.bThresh = thresholdImageColor(processed.b, bVal, 'b');
  drawLabeledImage("R Thresh", processed.rThresh, gridX(0), gridY(2));
  drawLabeledImage("G Thresh", processed.gThresh, gridX(1), gridY(2));
  drawLabeledImage("B Thresh", processed.bThresh, gridX(2), gridY(2));

  // row3 => Webcam image, HSV, YCbCr
  processed.hsvImage = convertRGBtoHSV(originalImg);
  processed.ycbcrImage = convertRGBtoYCbCr(originalImg);
  drawLabeledImage("Webcam", originalImg, gridX(0), gridY(3));
  drawLabeledImage("HSV", processed.hsvImage, gridX(1), gridY(3));
  drawLabeledImage("YCbCr", processed.ycbcrImage, gridX(2), gridY(3));

  // row4 => Face Detection, HSV & YCbCr Threshold
  let c1Val = parseInt(select('#thresholdC1').value());
  let c2Val = parseInt(select('#thresholdC2').value());
  processed.hsvThresh = thresholdHSVImage(processed.hsvImage, c1Val);
  processed.ycbcrThresh = thresholdYCbCrImage(processed.ycbcrImage, c2Val);

  drawLabeledImage("Face Detect", faceDetectImg, gridX(0), gridY(4));
  drawLabeledImage("HSV Thresh", processed.hsvThresh, gridX(1), gridY(4));
  drawLabeledImage("YCbCr Thresh", processed.ycbcrThresh, gridX(2), gridY(4));

  // Draw face detection boxes
if (faceBoxes.length > 0) {
  push();
  translate(gridX(0), gridY(4) + 20);
  noFill();
  stroke(0, 255, 0);
  strokeWeight(2);

  faceBoxes.forEach(box => {
    rect(box.x, box.y, box.w, box.h);
  });

  pop();
}


  // Label for Extension Grid
  push();
  textSize(20);
  fill(0);
  textAlign(LEFT);
  text("Extensions", gridX(0) + 200, gridY(5) + 30);
  pop();

  // CMYK Conversion and Threshold
  processed.cmykImage = convertRGBtoCMYK(originalImg);
  let cmykThreshVal = parseInt(select('#thresholdCMYK').value());
  processed.cmykThresh = thresholdCMYKImage(processed.cmykImage, cmykThreshVal);
  let extRowY = gridY(5) + 40;
  drawLabeledImage("CMYK", processed.cmykImage, gridX(0), extRowY);
  drawLabeledImage("CMYK Thresh", processed.cmykThresh, gridX(1), extRowY);

  // Binary Threshold
  let binaryThreshVal = parseInt(select('#thresholdBinary').value());
  processed.binaryThresh = binaryThresholdImage(originalImg, binaryThreshVal);
  drawLabeledImage("Binary Thresh", processed.binaryThresh, gridX(2), extRowY);

  // Add a new row for RGB Binary Thresholding
  let rgbBinaryThreshVal = parseInt(select('#thresholdRGBBinary').value());
  let rgbBinary = binaryThresholdRGBChannels(originalImg, rgbBinaryThreshVal);

  let extRowY2 = gridY(6) + 40;
  drawLabeledImage("R Binary Thresh", rgbBinary.rBinary, gridX(0), extRowY2);
  drawLabeledImage("G Binary Thresh", rgbBinary.gBinary, gridX(1), extRowY2);
  drawLabeledImage("B Binary Thresh", rgbBinary.bBinary, gridX(2), extRowY2);

   // Canny Edge Detection
  let lowThreshold = parseInt(select('#cannyLowThreshold').value());
  let highThreshold = parseInt(select('#cannyHighThreshold').value());
  processed.cannyEdgeImage = cannyEdgeDetection(originalImg, lowThreshold, highThreshold);

  let cannyRowY = gridY(7) + 40;
  drawLabeledImage("Canny Edge Detection", processed.cannyEdgeImage, gridX(0), cannyRowY);
  
  // Color Inversion
let inversionIntensity = parseFloat(select('#inversionIntensity').value());
processed.invertedImage = applyColorInversion(originalImg, inversionIntensity);
let inversionRowY = gridY(7) + 40;
drawLabeledImage("Color Inversion", processed.invertedImage, gridX(1), inversionRowY);
}



// Utility to label each cell in the grid
function drawLabeledImage(label, img, x, y) {
  push();
  fill(0, 150);
  noStroke();
  rect(x, y, CELL_W, 20);

  fill(255);
  textSize(12);
  text(label, x + 5, y + 14);
  pop();

  if (img) {
    image(img, x, y + 20, CELL_W, CELL_H);
  } else {
    push();
    fill(220);
    noStroke();
    rect(x, y + 20, CELL_W, CELL_H);
    pop();
  }
}

// Returns the current input image (live, static, or uploaded)
function getCurrentInputImage() {
  if (useUploadedImage) {
    return uploadedImage;
  } else if (useStaticPhoto) {
    return staticSnapshot;
  } else {
    return snapshot;
  }
}

// Keystroke handling
function keyPressed() {
  if (key === 'd') {
    snapshot.copy(video, 0, 0, scaledW, scaledH, 0, 0, scaledW, scaledH);
    staticSnapshot.copy(snapshot, 0, 0, scaledW, scaledH, 0, 0, scaledW, scaledH);
    useStaticPhoto = true;
    if (toggleCheckbox) {
      toggleCheckbox.elt.checked = true;
    }
    useUploadedImage = false;
    faceFilterMode = 0; 
    if (faceModelReady) {
      faceapi.detect(staticSnapshot.elt, onFaceDetected);
    }
    console.log("Captured a static frame + face detection once");
  }

  if (key === '0') {
    // Reset face filter => bounding box reappears
    faceFilterMode = 0;
    console.log("Reset face filter => bounding box visible");
  }

  if (key === '1') {
    // Apply grayscale to the entire image
    faceFilterMode = 1;
    console.log("Applied Grayscale to entire image");
  }

  if (['2', '3', '4'].includes(key)) {
    faceFilterMode = parseInt(key);
    console.log("faceFilterMode =>", faceFilterMode);
  }
}


// Handle uploaded images
function handleFileUpload() {
  let fileInput = document.getElementById("uploadImg");
  if (fileInput.files && fileInput.files[0]) {
    let file = fileInput.files[0];
    let reader = new FileReader();
    reader.onload = function (e) {
      loadImage(e.target.result, (img) => {
        // Use uploaded image + do face detection once
        useUploadedImage = true;
        useStaticPhoto = false;
        faceFilterMode = 0;
        if (toggleCheckbox) {
          toggleCheckbox.elt.checked = false;
        }

        console.log("Uploaded => detect face once");

        if (faceModelReady) {
          faceapi.detect(img.elt, onFaceDetected);
        }

        // Resize and copy into uploadedImage
        img.resize(scaledW, scaledH);
        uploadedImage.copy(img, 0, 0, scaledW, scaledH, 0, 0, scaledW, scaledH);
      });
    };
    reader.readAsDataURL(file);
  }
}

// Saves the selected image from the dropdown menu
function saveSelectedImage() {
  let dropdown = select('#saveImageSelect');
  let selectedKey = dropdown.value();

  let mirrorCheckbox = select('#mirrorImage');
  let mirrorCheck = mirrorCheckbox ? mirrorCheckbox.elt.checked : false;

  let imageToSave = null;
  if (selectedKey === 'original') {
    imageToSave = getCurrentInputImage();
  } else if (processed[selectedKey]) {
    imageToSave = processed[selectedKey];
  }

  if (imageToSave) {
    let imgToExport = imageToSave.get();
    if (mirrorCheck) {
      imgToExport = mirrorImageHorizontally(imgToExport);
    }
    save(imgToExport, `${selectedKey}${mirrorCheck ? '_mirrored' : ''}.png`);
    console.log(`Saved ${selectedKey}.png (mirrored=${mirrorCheck})`);
  } else {
    console.log("No image found for the selected option.");
  }
}



