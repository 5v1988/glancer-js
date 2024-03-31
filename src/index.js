const express = require("express");
require('dotenv').config();
const router = require('./glancer/router');
const app = express();
const PORT = process.env.PORT || 3003;
app.use("/api", router);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});