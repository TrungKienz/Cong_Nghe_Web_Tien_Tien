const express = require('express');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
var cors = require("cors");
const bodyParser = require("body-parser");

// Cấu hình định tuyến tổng
const authRouter = require('./auth.route');
const userRouter = require('./user.route');
const postRouter = require('./post.route');
const testRouter = require('./test.route');
const homeRouter = require('./home.route');



// const articleRouter = require('./Article');
const cpUpload = upload.fields([
    { name: "image", maxCount: 4 },
    { name: "video", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
    { name: "avatar[]", maxCount: 1 },
    { name: "cover_image", maxCount: 1},
    { name: "cover_image[]", maxCount: 1 },
]);

const routesArray = [
    { path: '/auth', router: authRouter },
    { path: '/user', router: userRouter },
    { path: '/post', router: postRouter },
    { path: '/test', router: testRouter },
    { path: '/home', router: homeRouter },
];


function routes(app) {
    app.use(cors());
    app.use(express.json()); // For parsing JSON data
    app.use(express.urlencoded({ extended: true }));
    app.use(cpUpload);
    app.use(bodyParser.json({ limit: "50mb" })); // for parsing application/json
    app.use(bodyParser.urlencoded({ limit: "50mb", extended: true })); // for parsing application/x-www-form-urlencoded

    routesArray.forEach(route => {
        app.use('/it4788' + route.path, route.router);
    });

    app.get('/it4788', (req, res) => {
        res.send('it4788 Mạng xã hội CÓ TÍNH PHÍ !!!!!!!!!');
    });
}

module.exports = routes;
