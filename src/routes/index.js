// Cấu hình định tuyến tổng
const authRouter = require('./auth.route');

// const articleRouter = require('./Article');

const routesArray = [
    { path: '/auth', router: authRouter },
];

function routes(app) {
    routesArray.forEach(route => {
        app.use('/api' + route.path, route.router);
    });

    app.get('/api', (req, res) => {
        res.send('API Mạng xã hội CÓ TÍNH PHÍ !!!!!!!!!');
    });
}

module.exports = routes;

module.exports = routes;
