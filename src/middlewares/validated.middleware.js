const statusCode = require('../constants/statusCode.constant.js');
const statusMessage = require('../constants/statusMessage.constant.js');

const isValidate = async (req, res, next) => {
    const { activate } = req.userDataPass;
    try {
        // Find user data 
        const isValidate = activate;

        if (isValidate != 1){
            return res.status(200).json({
                code: statusCode.USER_IS_NOT_VALIDATED,
                message: statusMessage.USER_IS_NOT_VALIDATED,
            })
        }

        next()

    } catch (error) {
        return res.status(200).json({
            code: statusCode.UNKNOWN_ERROR,
            message: statusMessage.UNKNOWN_ERROR,
        })
    }

};

module.exports = {
    isValidate,
};
