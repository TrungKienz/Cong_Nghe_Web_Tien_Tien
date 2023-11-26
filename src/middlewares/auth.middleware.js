const jwtHelper = require('../helpers/jwt.helper.js');
const User = require('../models/user.model.js');
const statusCode = require('../constants/statusCode.constant.js');
const statusMessage = require('../constants/statusMessage.constant.js');

const accessTokenSecret =
    process.env.ACCESS_TOKEN_SECRET || 'accessTokenSecret';

const isAuth = async (req, res, next) => {
    var tokenFromClient =
        req.body.token ||
        req.query.token ||
        req.headers['x-access-token'] ||
        req.headers['authorization'];

    if (tokenFromClient) {
        if (tokenFromClient.includes('Bearer')) {
            const arrayToken = tokenFromClient.split(' ');
            tokenFromClient = arrayToken[1];
        }

        try {
            const decoded = await jwtHelper.verifyToken(
                tokenFromClient,
                accessTokenSecret
            );
            console.log('decoded', decoded);
            const result = await User.findOne({
                _id: decoded.data._id,
                token: tokenFromClient,
            });
            if (!result) {
                throw Error('Unauthorized. Hacker?');
            } else if (result.is_blocked) {
                return res.status(401).json({
                    code: statusCode.USER_IS_NOT_VALIDATED,
                    message: statusMessage.USER_IS_NOT_VALIDATED,
                });
            }
            req.jwtDecoded = decoded;
            req.userDataPass = result;

            next();
        } catch (error) {
            console.log('error', error.message);
            return res.status(401).json({
                code: statusCode.TOKEN_IS_INVALID,
                message: statusMessage.TOKEN_IS_INVALID,
            });
        }
    } else {
        return res.status(403).json({
            code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
            message: statusMessage.PARAMETER_IS_NOT_ENOUGHT,
        });
    }
};

module.exports = {
    isAuth,
};
