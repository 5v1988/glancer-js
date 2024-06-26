const express = require("express");
const multer = require('multer');
const fsExtra = require('fs-extra');
const router = express.Router();
const upload = multer({ dest: 'src/images' });
const {
    compareImagesUsingCV,
    compareImagesUsingBitMap,
    resembleJsOptions
} = require('./core');

router.get('/hello', async (req, res) => {
    return res.status(200).json({ message: `Let's glance!` });
});

router.post('/glance', upload.array('images', 2), async (req, res) => {
    if (!req.files || req.files.length !== 2) {
        return res.status(400).json({ message: 'No files uploaded' });
    }
    let threshold = req.query.threshold || 2  //default 'threshold' value is 2 if not given
    threshold = (Math.round(threshold * 100) / 100).toFixed(2);
    let mse = await compareImagesUsingCV(req.files[0].path, req.files[1].path);
    const match = mse <= threshold && mse >= 0;
    fsExtra.emptyDirSync('src/images');
    return res.status(200)
        .json({
            threshold: Number(threshold),
            match: match,
            mean_squared_err: Number(mse.toFixed(2))
        });
});

router.post('/compare', upload.array('images', 2), async (req, res) => {
    if (!req.files || req.files.length !== 2) {
        return res.status(400).json({ message: 'No files uploaded' });
    }
    let threshold = req.query.threshold || 2  //default 'threshold' value is 2 if not given
    threshold = (Math.round(threshold * 100) / 100).toFixed(2);
    let diff = await compareImagesUsingBitMap(req.files[0].path, req.files[1].path, resembleJsOptions);
    const match = diff.rawMisMatch <= threshold && diff.rawMisMatch >= 0;
    diff.match = match;
    fsExtra.emptyDirSync('src/images');
    return res.status(200).json(diff);
});

module.exports = router;