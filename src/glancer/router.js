const express = require("express");
const multer = require('multer');
const fsExtra = require('fs-extra');
const router = express.Router();
const upload = multer({ dest: 'src/images' });
const {
    loadOpenCV,
    compareImages,
} = require('./core');

router.get('/hello', async (req, res) => {
    return res.status(200).json({ message: `Let's glance!` });
});

router.post('/glance', upload.array('images', 2), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }
    await loadOpenCV();
    let threshold = parseInt(req.query.threshold) || 2; //default 'threshold' value is 2 if not given
    let mse = await compareImages(req.files[0].path, req.files[1].path) || -1;
    const match = mse <= threshold && mse > 0;
    fsExtra.emptyDirSync('src/images');
    //await removeImages('src/images');
    return res.status(200)
        .json({ threshold: threshold, match: match, mean_squared_err: mse.toFixed(2) });
});

module.exports = router;