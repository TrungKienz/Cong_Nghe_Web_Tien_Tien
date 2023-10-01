const express = require('express');
// Cấu hình định tuyến tổng
const authRouter = require('./auth.route');
const userRouter = require('./user.route')

// const articleRouter = require('./Article');

const routesArray = [
    { path: '/auth', router: authRouter },
    { path: '/user', router: userRouter },
];

function routes(app) {
    routesArray.forEach(route => {
        app.use('/it4788' + route.path, route.router);
        app.use(express.json()); // For parsing JSON data
        app.use(express.urlencoded({ extended: true }));
    });

    app.get('/it4788', (req, res) => {
        res.send('it4788 Mạng xã hội CÓ TÍNH PHÍ !!!!!!!!!');
    });
}

module.exports = routes;
