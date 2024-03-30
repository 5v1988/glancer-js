const express = require("express");
const multer = require('multer');
const app = express();
const port = 3008;
const upload = multer({ dest: 'src/images' });
const { loadOpenCV,
    compareImages,
    removeImages
} = require('./core');

app.post('/compare', upload.array('images', 2), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }
    await loadOpenCV();
    let threshold = parseInt(req.query.threshold) || 2; //default 'threshold' value is 2 if not given
    let mse = await compareImages(req.files[0].path, req.files[1].path) || -1;
    const status = mse <= threshold && mse > 0 ? 'pass' : 'fail';
    await removeImages('src/images');
    return res.status(200)
        .send({ threshold: threshold, status: status, mse: mse.toFixed(2) });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
