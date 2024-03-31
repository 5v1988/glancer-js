const Jimp = require('jimp');
const fs = require("fs");

const loadOpenCV = async () => new Promise(resolve => {
    global.Module = {
        onRuntimeInitialized: resolve
    };
    global.cv = require('./opencv.js');
});

const removeImages = async (dir) => {
    fs.rmSync(dir, { recursive: true, force: true, });
}

const compareImages = async function (image1, image2) {
    // Load images
    const jimpImage1 = await Jimp.read(image1);
    const jimpImage2 = await Jimp.read(image2);
    // Compare images
    // Resize images to ensure they have the same dimensions
    const width = Math.min(jimpImage1.bitmap.width, jimpImage2.bitmap.width);
    const height = Math.min(jimpImage1.bitmap.height, jimpImage2.bitmap.height);
    console.log('Image dimensions:', width, height);
    // Convert images to buffer
    const image1Buffer = await jimpImage1.getBufferAsync(Jimp.MIME_PNG);
    const image2Buffer = await jimpImage2.getBufferAsync(Jimp.MIME_PNG);
    console.log('Image buffers loaded.');
    // Convert buffer to Mat
    const image1Array = new Uint8Array(image1Buffer);
    const image2Array = new Uint8Array(image2Buffer);
    const image1Mat = cv.matFromArray(height, width, cv.CV_8UC4, image1Array);
    const image2Mat = cv.matFromArray(height, width, cv.CV_8UC4, image2Array);
    console.log('Images converted to Mats.');
    // Convert images to grayscale for comparison
    const grayImage1 = new cv.Mat();
    const grayImage2 = new cv.Mat();
    cv.cvtColor(image1Mat, grayImage1, cv.COLOR_RGBA2GRAY);
    cv.cvtColor(image2Mat, grayImage2, cv.COLOR_RGBA2GRAY);
    console.log('Images converted to grayscale.');
    // Compute Mean Squared Error (MSE)
    const diff = new cv.Mat();
    cv.absdiff(grayImage1, grayImage2, diff);
    console.log('Difference computed.');
    const squaredDiff = new cv.Mat();
    cv.multiply(diff, diff, squaredDiff);
    console.log('Squared difference computed.');
    // Compute the mean of the squared differences
    let sum = 0;
    for (let i = 0; i < squaredDiff.rows; i++) {
        for (let j = 0; j < squaredDiff.cols; j++) {
            const pixel = squaredDiff.ucharPtr(i, j);
            sum += pixel[0];
        }
    }
    const mse = sum / (squaredDiff.rows * squaredDiff.cols);
    console.log('Mean Squared Error (MSE):', mse);
    // Release resources
    image1Mat.delete();
    image2Mat.delete();
    grayImage1.delete();
    grayImage2.delete();
    diff.delete();
    squaredDiff.delete();
    console.log('Resources released.');
    return mse;
};

module.exports = {
    loadOpenCV,
    compareImages,
    removeImages
}