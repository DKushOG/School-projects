// Image processing functions
// Collection of helper functions used to process p5.Image objects in various ways

// Conversion to grayscale and 20% increased brightness
function convertToGrayscaleAndBrighten(srcImage) {
  let w = srcImage.width;
  let h = srcImage.height;
  let resultImage = createImage(w, h);
  resultImage.loadPixels();
  srcImage.loadPixels();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let index = (x + y * w) * 4;
      let r = srcImage.pixels[index];
      let g = srcImage.pixels[index + 1];
      let b = srcImage.pixels[index + 2];

      // Convert to grayscale
      let gray = (r + g + b) / 3;
      // Increase brightness by 20% => +51
      let brightGray = gray + 51;
      if (brightGray > 255) brightGray = 255;

      resultImage.pixels[index]     = brightGray;
      resultImage.pixels[index + 1] = brightGray;
      resultImage.pixels[index + 2] = brightGray;
      resultImage.pixels[index + 3] = 255;
    }
  }
  resultImage.updatePixels();
  return resultImage;
}

// Splitting into RGB channels
function splitChannels(srcImage) {
  let w = srcImage.width;
  let h = srcImage.height;
  let rImg = createImage(w, h);
  let gImg = createImage(w, h);
  let bImg = createImage(w, h);

  rImg.loadPixels();
  gImg.loadPixels();
  bImg.loadPixels();
  srcImage.loadPixels();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let index = (x + y * w) * 4;
      let r = srcImage.pixels[index];
      let g = srcImage.pixels[index + 1];
      let b = srcImage.pixels[index + 2];

      // R channel
      rImg.pixels[index]     = r;
      rImg.pixels[index + 1] = 0;
      rImg.pixels[index + 2] = 0;
      rImg.pixels[index + 3] = 255;

      // G channel
      gImg.pixels[index]     = 0;
      gImg.pixels[index + 1] = g;
      gImg.pixels[index + 2] = 0;
      gImg.pixels[index + 3] = 255;

      // B channel
      bImg.pixels[index]     = 0;
      bImg.pixels[index + 1] = 0;
      bImg.pixels[index + 2] = b;
      bImg.pixels[index + 3] = 255;
    }
  }

  rImg.updatePixels();
  gImg.updatePixels();
  bImg.updatePixels();
  return { rImg, gImg, bImg };
}

// Convert RGB -> HSV. 
function convertRGBtoHSV(srcImage) {
  let w = srcImage.width;
  let h = srcImage.height;
  let result = createImage(w, h);
  srcImage.loadPixels();
  result.loadPixels();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let idx = (x + y * w) * 4;
      let r = srcImage.pixels[idx]     / 255;
      let g = srcImage.pixels[idx + 1] / 255;
      let b = srcImage.pixels[idx + 2] / 255;

      let maxVal = Math.max(r, g, b);
      let minVal = Math.min(r, g, b);
      let delta = maxVal - minVal;

      let hVal = 0;
      let sVal = (maxVal === 0) ? 0 : delta / maxVal;
      let vVal = maxVal;

      if (delta !== 0) {
        if (maxVal === r) {
          hVal = 60 * (((g - b) / delta) % 6);
        } else if (maxVal === g) {
          hVal = 60 * ((b - r) / delta + 2);
        } else {
          hVal = 60 * ((r - g) / delta + 4);
        }
      }
      if (hVal < 0) hVal += 360;

      let Hc = floor((hVal / 360) * 255);
      let Sc = floor(sVal * 255);
      let Vc = floor(vVal * 255);

      result.pixels[idx]     = Hc;
      result.pixels[idx + 1] = Sc;
      result.pixels[idx + 2] = Vc;
      result.pixels[idx + 3] = 255;
    }
  }

  result.updatePixels();
  return result;
}

// Convert RGB to YCbCr 
function convertRGBtoYCbCr(srcImage) {
  let w = srcImage.width;
  let h = srcImage.height;
  let result = createImage(w, h);
  srcImage.loadPixels();
  result.loadPixels();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let idx = (x + y * w) * 4;
      let R = srcImage.pixels[idx];
      let G = srcImage.pixels[idx + 1];
      let B = srcImage.pixels[idx + 2];

      // BT.601 formula
      let Y  =  0.299 * R + 0.587 * G + 0.114 * B;
      let Cb = -0.1687 * R - 0.3313 * G + 0.5 * B + 128;
      let Cr =  0.5    * R - 0.4187 * G - 0.0813 * B + 128;

      let Yc  = constrain(floor(Y),  0, 255);
      let Cbc = constrain(floor(Cb), 0, 255);
      let Crc = constrain(floor(Cr), 0, 255);

      result.pixels[idx]     = Yc;
      result.pixels[idx + 1] = Cbc;
      result.pixels[idx + 2] = Crc;
      result.pixels[idx + 3] = 255;
    }
  }

  result.updatePixels();
  return result;
}

// Convert RGB to YCbCr
function thresholdHSVImage(srcImage, thresholdVal) {
  let w = srcImage.width;
  let h = srcImage.height;
  let result = createImage(w, h);
  srcImage.loadPixels();
  result.loadPixels();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let idx = (x + y * w) * 4;
      let hVal = srcImage.pixels[idx];
      let sVal = srcImage.pixels[idx + 1];
      let vVal = srcImage.pixels[idx + 2];

      let adjust = thresholdVal - 128;
      let newH = constrain(hVal + adjust, 0, 255);
      let newS = constrain(sVal + adjust, 0, 255);
      let newV = constrain(vVal + adjust, 0, 255);

      result.pixels[idx] = newH;
      result.pixels[idx + 1] = newS;
      result.pixels[idx + 2] = newV;
      result.pixels[idx + 3] = 255;
    }
  }

  result.updatePixels();
  return result;
}

// YCbCr Thresholding
function thresholdYCbCrImage(srcImage, thresholdVal) {
  let w = srcImage.width;
  let h = srcImage.height;
  let result = createImage(w, h);
  srcImage.loadPixels();
  result.loadPixels();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let idx = (x + y * w) * 4;
      let Y = srcImage.pixels[idx];
      let Cb = srcImage.pixels[idx + 1];
      let Cr = srcImage.pixels[idx + 2];

      let adjust = thresholdVal - 128;
      let newY = constrain(Y + adjust, 0, 255);
      let newCb = constrain(Cb + adjust, 0, 255);
      let newCr = constrain(Cr + adjust, 0, 255);

      result.pixels[idx] = newY;
      result.pixels[idx + 1] = newCb;
      result.pixels[idx + 2] = newCr;
      result.pixels[idx + 3] = 255;
    }
  }

  result.updatePixels();
  return result;
}

// Pixelate an image with 5x5 blocks in Grayscale
function pixelateImage(srcImage, blockSize = 5) {
  let w = srcImage.width;
  let h = srcImage.height;
  let resultImage = createImage(w, h);

  srcImage.loadPixels();
  resultImage.loadPixels();

  for (let y = 0; y < h; y += blockSize) {
    for (let x = 0; x < w; x += blockSize) {
      let graySum = 0;
      let count = 0;

      // Calculate average grayscale value for the block
      for (let yy = 0; yy < blockSize; yy++) {
        for (let xx = 0; xx < blockSize; xx++) {
          let nx = x + xx;
          let ny = y + yy;
          if (nx < w && ny < h) {
            let idx = (nx + ny * w) * 4;
            let r = srcImage.pixels[idx];
            let g = srcImage.pixels[idx + 1];
            let b = srcImage.pixels[idx + 2];
            let gray = (r + g + b) / 3;
            graySum += gray;
            count++;
          }
        }
      }

      let avgGray = graySum / count;

      // Paint the block with the average grayscale value
      for (let yy = 0; yy < blockSize; yy++) {
        for (let xx = 0; xx < blockSize; xx++) {
          let nx = x + xx;
          let ny = y + yy;
          if (nx < w && ny < h) {
            let idx = (nx + ny * w) * 4;
            resultImage.pixels[idx] = avgGray;
            resultImage.pixels[idx + 1] = avgGray;
            resultImage.pixels[idx + 2] = avgGray;
            resultImage.pixels[idx + 3] = 255;
          }
        }
      }
    }
  }

  resultImage.updatePixels();
  return resultImage;
}

// For threshold of single channel R,G, or B for the normal RGB images
function thresholdImageColor(srcImage, thresholdVal, channel) {
  let w = srcImage.width;
  let h = srcImage.height;
  let result = createImage(w, h);
  result.loadPixels();
  srcImage.loadPixels();

  let adjust = thresholdVal - 128;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let index = (x + y * w) * 4;

      let r = srcImage.pixels[index];
      let g = srcImage.pixels[index + 1];
      let b = srcImage.pixels[index + 2];

      let newR = channel === 'r' ? constrain(r + adjust, 0, 255) : r;
      let newG = channel === 'g' ? constrain(g + adjust, 0, 255) : g;
      let newB = channel === 'b' ? constrain(b + adjust, 0, 255) : b;

      result.pixels[index] = newR;
      result.pixels[index + 1] = newG;
      result.pixels[index + 2] = newB;
      result.pixels[index + 3] = 255;
    }
  }

  result.updatePixels();
  return result;
}

// Extra Extensions
// Mirror image horizontally
function mirrorImageHorizontally(img) {
  let mirrored = createImage(img.width, img.height);
  img.loadPixels();
  mirrored.loadPixels();

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let index = (x + y * img.width) * 4;
      let mirrorIndex = ((img.width - 1 - x) + y * img.width) * 4;

      mirrored.pixels[mirrorIndex]     = img.pixels[index];
      mirrored.pixels[mirrorIndex + 1] = img.pixels[index + 1];
      mirrored.pixels[mirrorIndex + 2] = img.pixels[index + 2];
      mirrored.pixels[mirrorIndex + 3] = img.pixels[index + 3];
    }
  }
  mirrored.updatePixels();
  return mirrored;
}

// Converts RGB image to CMYK color space.
function convertRGBtoCMYK(srcImage) {
  let w = srcImage.width;
  let h = srcImage.height;
  let result = createImage(w, h);
  srcImage.loadPixels();
  result.loadPixels();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let idx = (x + y * w) * 4;
      let r = srcImage.pixels[idx] / 255;
      let g = srcImage.pixels[idx + 1] / 255;
      let b = srcImage.pixels[idx + 2] / 255;

      let k = 1 - Math.max(r, g, b);
      let c = (1 - r - k) / (1 - k + 0.00001);
      let m = (1 - g - k) / (1 - k + 0.00001);
      let yVal = (1 - b - k) / (1 - k + 0.00001);

      let Cc = floor(c * 255);
      let Mc = floor(m * 255);
      let Yc = floor(yVal * 255);
      let Kc = floor(k * 255);

      // Store CMY in RGB channels, K in alpha
      result.pixels[idx] = Cc;
      result.pixels[idx + 1] = Mc;
      result.pixels[idx + 2] = Yc;
      result.pixels[idx + 3] = Kc;
    }
  }

  result.updatePixels();
  return result;
}

// CMYK Thresholding
function thresholdCMYKImage(srcImage, thresholdVal) {
  let w = srcImage.width;
  let h = srcImage.height;
  let result = createImage(w, h);
  srcImage.loadPixels();
  result.loadPixels();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let idx = (x + y * w) * 4;
      let c = srcImage.pixels[idx];
      let m = srcImage.pixels[idx + 1];
      let yVal = srcImage.pixels[idx + 2];
      let k = srcImage.pixels[idx + 3];

      // Apply threshold adjustment
      let adjust = thresholdVal - 128; 

      let newC = constrain(c + adjust, 0, 255);
      let newM = constrain(m + adjust, 0, 255);
      let newY = constrain(yVal + adjust, 0, 255);
      let newK = constrain(k + adjust, 0, 255);

      result.pixels[idx] = newC;
      result.pixels[idx + 1] = newM;
      result.pixels[idx + 2] = newY;
      result.pixels[idx + 3] = newK;
    }
  }

  result.updatePixels();
  return result;
}

//Applies binary thresholding to an image
// Pixels above the threshold are white, below are black

function binaryThresholdImage(srcImage, thresholdVal) {
  let w = srcImage.width;
  let h = srcImage.height;
  let result = createImage(w, h);
  srcImage.loadPixels();
  result.loadPixels();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let idx = (x + y * w) * 4;
      let r = srcImage.pixels[idx];
      let g = srcImage.pixels[idx + 1];
      let b = srcImage.pixels[idx + 2];

      // Compute brightness
      let brightness = (r + g + b) / 3;
      let binaryVal = brightness > thresholdVal ? 255 : 0;

      result.pixels[idx] = binaryVal;
      result.pixels[idx + 1] = binaryVal;
      result.pixels[idx + 2] = binaryVal;
      result.pixels[idx + 3] = 255;
    }
  }

  result.updatePixels();
  return result;
}

// Binary thresholding for the RGB channels as well as an extension
function binaryThresholdRGBChannels(srcImage, thresholdVal) {
  let w = srcImage.width;
  let h = srcImage.height;
  
  let rBinary = createImage(w, h);
  let gBinary = createImage(w, h);
  let bBinary = createImage(w, h);
  
  rBinary.loadPixels();
  gBinary.loadPixels();
  bBinary.loadPixels();
  srcImage.loadPixels();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let idx = (x + y * w) * 4;
      let r = srcImage.pixels[idx];
      let g = srcImage.pixels[idx + 1];
      let b = srcImage.pixels[idx + 2];

      rBinary.pixels[idx] = r > thresholdVal ? 255 : 0;
      rBinary.pixels[idx + 1] = 0;
      rBinary.pixels[idx + 2] = 0;
      rBinary.pixels[idx + 3] = 255;

      gBinary.pixels[idx] = 0;
      gBinary.pixels[idx + 1] = g > thresholdVal ? 255 : 0;
      gBinary.pixels[idx + 2] = 0;
      gBinary.pixels[idx + 3] = 255;

      bBinary.pixels[idx] = 0;
      bBinary.pixels[idx + 1] = 0;
      bBinary.pixels[idx + 2] = b > thresholdVal ? 255 : 0;
      bBinary.pixels[idx + 3] = 255;
    }
  }

  rBinary.updatePixels();
  gBinary.updatePixels();
  bBinary.updatePixels();

  return { rBinary, gBinary, bBinary };
}

// Canny Edge Detection Extension
function cannyEdgeDetection(srcImage, lowThreshold, highThreshold) {
  let w = srcImage.width;
  let h = srcImage.height;

  let grayImage = convertToGrayscaleAndBrighten(srcImage);
  grayImage.loadPixels();

  let result = createImage(w, h);
  result.loadPixels();

  let sobelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
  ];
  let sobelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1]
  ];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let gx = 0;
      let gy = 0;

      // Apply Sobel kernels
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          let idx = ((x + kx) + (y + ky) * w) * 4;
          let pixel = grayImage.pixels[idx];

          gx += pixel * sobelX[ky + 1][kx + 1];
          gy += pixel * sobelY[ky + 1][kx + 1];
        }
      }

      let magnitude = Math.sqrt(gx * gx + gy * gy);

      // Apply thresholding
      let edgeVal = (magnitude >= lowThreshold && magnitude <= highThreshold) ? 255 : 0;

      let idx = (x + y * w) * 4;
      result.pixels[idx] = edgeVal;
      result.pixels[idx + 1] = edgeVal;
      result.pixels[idx + 2] = edgeVal;
      result.pixels[idx + 3] = 255;
    }
  }

  result.updatePixels();
  return result;
}

// Colour inversion extension
function applyColorInversion(srcImage, intensity) {
  let w = srcImage.width;
  let h = srcImage.height;
  let resultImage = createImage(w, h);
  srcImage.loadPixels();
  resultImage.loadPixels();

  for (let i = 0; i < w * h * 4; i += 4) {
    let r = srcImage.pixels[i];
    let g = srcImage.pixels[i + 1];
    let b = srcImage.pixels[i + 2];

    // Invert based on intensity
    resultImage.pixels[i] = lerp(r, 255 - r, intensity);
    resultImage.pixels[i + 1] = lerp(g, 255 - g, intensity);
    resultImage.pixels[i + 2] = lerp(b, 255 - b, intensity);
    resultImage.pixels[i + 3] = 255;
  }

  resultImage.updatePixels();
  return resultImage;
}
