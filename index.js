require('dotenv').config();
const app = require('express')();
const server = require('http').createServer(app);
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const database = require('./src/configs/databaseConnection');
const route = require('./src/routes');
const swaggerDocs = require('./src/configs/swaggerConfiguration')

const port = process.env.PORT || 3000;
ffmpeg.setFfmpegPath(ffmpegPath);

route(app);
database.connect();

app.all('/test', (req, res) => {
    res.status(200).json('Test api');
});

server.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
    swaggerDocs(app, port)
});
