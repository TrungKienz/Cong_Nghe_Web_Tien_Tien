const dotenv = require('dotenv');
dotenv.config();
const md5 = require('md5');

const User = require('../models/user.model.js');

const jwtHelper = require('../helpers/jwt.helper.js');

const statusCode = require('./../constants/statusCode.constant.js');
const statusMessage = require('./../constants/statusMessage.constant.js');
const commonConstant = require('../constants/common.constant.js');
const { emailValidate } = require('../helpers/emailSender.helper.js');
const { generateRandom6DigitNumber } = require('../helpers/random.helper.js');

// const tokenList = {};

const accessTokenLife =
    process.env.ACCESS_TOKEN_LIFE || commonConstant.ACCESS_TOKEN_LIFE;
const accessTokenSecret =
    process.env.ACCESS_TOKEN_SECRET || 'accessTokenSecret';

// const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE || "3650d";
// const refreshTokenSecret =
//   process.env.REFRESH_TOKEN_SECRET || "refreshTokenSecret";
function validationEmail(email) {
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (emailPattern.test(email)) {
        return true;
    } else {
        return false;
    }
}

function validationPhonenumber(phonenumber) {
    if (
        !phonenumber ||
        phonenumber.length != 10 ||
        phonenumber[0] != '0' ||
        phonenumber.match(/[^0-9]/g)
    ) {
        return true;
    } else {
        return false;
    }
}
function validationPasword(password, email) {
    console.log(email);
    const emailAddress = email.split('@');
    console.log(emailAddress);
    if (
        !password ||
        password.length < 6 ||
        password.length > 10 ||
        password === emailAddress[0] ||
        password.match(/[^a-z|A-Z|0-9]/g)
    ) {
        return true;
    } else {
        return false;
    }
}

const signup = async (req, res) => {
    const { password, uuid, email } = req.query;
    if (email && password && uuid) {
        try {
            if (
                !validationEmail(email) ||
                validationPasword(password, email) ||
                !uuid
            ) {
                throw Error('PARAMETER_VALUE_IS_INVALID');
            } else {
                const userData = await User.findOne({ email: email });
                if (!userData) {
                    const hashedPassword = md5(password);
                    const verifyCode = generateRandom6DigitNumber();

                    const user = await new User({
                        email: email,
                        password: hashedPassword,
                        active: 0,
                        coins: 10,
                        created: Date.now(),
                        verifyCode: verifyCode.toString(),
                    });
                    const accessToken = await jwtHelper.generateToken(
                        { _id: user._id, email: user.email },
                        accessTokenSecret,
                        accessTokenLife
                    );
                    user.token = accessToken;
                    await user.save();
                    return res.status(200).json({
                        code: statusCode.OK,
                        message: statusMessage.OK,
                        data: {},
                    });
                } else {
                    return res.status(200).json({
                        code: statusCode.USER_EXISTED,
                        message: statusMessage.USER_EXISTED,
                    });
                }
            }
        } catch (error) {
            if (error.message == 'PARAMETER_VALUE_IS_INVALID') {
                console.log(error);
                return res.status(200).json({
                    code: statusCode.PARAMETER_VALUE_IS_INVALID,
                    message: statusMessage.PARAMETER_VALUE_IS_INVALID,
                });
            } else {
                console.log(error);
                return res.status(200).json({
                    code: statusCode.UNKNOWN_ERROR,
                    message: statusMessage.UNKNOWN_ERROR,
                });
            }
        }
    } else {
        return res.status(200).json({
            code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
            message: statusMessage.PARAMETER_IS_NOT_ENOUGHT,
        });
    }
};
//doing here
const login = async (req, res) => {
    const { email, password } = req.query; // gửi bằng query params
    if (email && password) {
        try {
            if (!validationEmail(email) || validationPasword(password, email)) {
                throw Error('PARAMETER_VALUE_IS_INVALID');
            } else {
                const userData = await User.findOne({ email: email });
                if (userData) {
                    const hashedPassword = md5(password);
                    if (hashedPassword == userData.password) {
                        const accessToken = await jwtHelper.generateToken(
                            { _id: userData._id, email: userData.email },
                            accessTokenSecret,
                            accessTokenLife
                        );

                        // lưu token tương ứng vs user, nếu đã tốn tại token thì thay thế token
                        await User.findOneAndUpdate(
                            { _id: userData._id },
                            {
                                $set: {
                                    token: accessToken,
                                },
                            }
                        );
                        return res.status(200).json({
                            code: statusCode.OK,
                            message: statusMessage.OK,
                            data: {
                                id: userData._id,
                                username: userData.email,
                                token: accessToken,
                                avatar: userData.avatar || "-1",
                                active: userData.active.toString(),
                                coins: userData.coins.toString(),
                            },
                        });
                    } else {
                    
                        console.log('password không hợp lệ');
                        return res.status(200).json({
                            code: statusCode.USER_IS_NOT_VALIDATED,
                            message: statusMessage.USER_IS_NOT_VALIDATED,
                        });
                    }
                } else {

                    console.log('email chưa được đăng kí');
                    res.status(200).json({
                        code: statusCode.USER_IS_NOT_VALIDATED,
                        message: statusMessage.USER_IS_NOT_VALIDATED,
                    });
                }
            }
        } catch (error) {
            console.log(error);
            if (error.message == 'PARAMETER_VALUE_IS_INVALID') {
                return res.status(200).json({
                    code: statusCode.PARAMETER_VALUE_IS_INVALID,
                    message: statusMessage.PARAMETER_VALUE_IS_INVALID,
                });
            } else {
                return res.status(200).json({
                    code: statusCode.UNKNOWN_ERROR,
                    message: statusMessage.UNKNOWN_ERROR,
                });
            }
        }
    } else {
        return res.status(200).json({
            code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
            message: statusMessage.PARAMETER_IS_NOT_ENOUGHT,
        });
    }
};

const getVerifyCode = async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(200).json({
            code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
            message: statusMessage.PARAMETER_IS_NOT_ENOUGHT,
        });
    }
    if (!email || !validationEmail(email)) {
        return res.status(200).json({
            code: statusCode.PARAMETER_VALUE_IS_INVALID,
            message: statusMessage.PARAMETER_VALUE_IS_INVALID,
        });
    } else {
        const userData = await User.findOne({ email: email });

        if (userData) {
            // Kiểm tra xem xem có gửi yêu cầu trong thời gian quá ngắn hay không
            const currentDate = Date.now();
            const twoMinuteInMillis = 2*60*1000;
            if (currentDate - userData.updateCodeDate <= twoMinuteInMillis) {
                return res.status(200).json({
                    code: statusCode.NOT_ACCESS,
                    message:
                        statusMessage.NOT_ACCESS,
                }); 
            }

            // Kiểm tra xem tài khoản đã được active hay chưa
            if (userData.active === 1) {
                return res.status(200).json({
                    code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
                    message:
                        statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
                });
            }
            const verifyCode = generateRandom6DigitNumber();

            userData.verifyCode = verifyCode;
            userData.updateCodeDate = Date.now();
            await userData.save();
            emailValidate(email, verifyCode);
            return res.status(200).json({
                code: statusCode.OK,
                message: statusMessage.OK,
                data: {
                    code_verify: userData.verifyCode.toString(),
                },
            });
        } else {
            return res.status(200).json({
                code: statusCode.USER_IS_NOT_VALIDATED,
                message: statusMessage.USER_IS_NOT_VALIDATED,
            });
        }
    }
};

const checkVerifyCode = async (req, res) => {
    const { email, code_verify } = req.query;

    if (!email || !code_verify) {
        return res.status(200).json({
            code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
            message: statusMessage.PARAMETER_IS_NOT_ENOUGHT,
        });
    }
    if (!email || !validationEmail(email)) {
        return res.status(200).json({
            code: statusCode.PARAMETER_VALUE_IS_INVALID,
            message: statusMessage.PARAMETER_VALUE_IS_INVALID,
        });
    } else {
        const userData = await User.findOne({ email: email });
        if (userData) {
            const verifyCode = userData.verifyCode;
            if (verifyCode && verifyCode == code_verify) {
                if (userData.active === 1) {
                    return res.status(200).json({
                        code: statusCode.PARAMETER_VALUE_IS_INVALID,
                        message: statusMessage.PARAMETER_VALUE_IS_INVALID,
                    });
                }

                const accessToken = await jwtHelper.generateToken(
                    { _id: userData._id, email: userData.email },
                    accessTokenSecret,
                    accessTokenLife
                );
                // lưu token tương ứng vs user, nếu đã tốn tại token thì thay thế token
                await User.findOneAndUpdate(
                    { _id: userData._id },
                    {
                        $set: {
                            active: 1,
                            token: accessToken,
                        },
                    }
                );
                return res.status(200).json({
                    code: statusCode.OK,
                    message: statusMessage.OK,
                    data: {
                        // token: accessToken,
                        id: userData._id,
                        active: "1",
                    },
                });
            } else {
                return res.status(200).json({
                    code: statusCode.PARAMETER_VALUE_IS_INVALID,
                    message: statusMessage.PARAMETER_VALUE_IS_INVALID,
                });
            }
        } else {
            return res.status(200).json({
                code: statusCode.USER_IS_NOT_VALIDATED,
                message: statusMessage.USER_IS_NOT_VALIDATED,
            });
        }
    }
};

module.exports = {
    login,
    signup,
    getVerifyCode,
    checkVerifyCode,
};
