// Cấu hình từng controller tương ứng
const User = require('../models/user.model.js');
const Version = require('../models/version.model.js');

const cloudHelper = require('../helpers/cloud.helper.js');
const statusCode = require('./../constants/statusCode.constant.js');
const statusMessage = require('./../constants/statusMessage.constant.js');
const md5 = require('md5');

function isValidUsername(username, email) {
    // Kiểm tra chiều dài chuỗi
    const minLength = 3;
    const maxLength = 18;
    const emailAddress = email.split('@')[0];

    //Kiểm tra xem email có trùng với username hay không
    if (username == emailAddress) {
        return false;
    }

    if (username.length < minLength || username.length > maxLength) {
        return false;
    }

    // Kiểm tra ký tự đặc biệt
    const specialChars = /[!@#$%^&*(),.?":{}|<>]/;
    if (specialChars.test(username)) {
        return false;
    }

    // Kiểm tra xem chuỗi có giống địa chỉ email hay không
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailPattern.test(username)) {
        return false;
    }

    // Kiểm tra xem chuỗi có giống địa chỉ URL hay không
    const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
    if (urlPattern.test(username)) {
        return false;
    }

    // Nếu không có vấn đề nào, chuỗi được coi là hợp lệ
    return true;
}


const logout = async (req, res) => {
    const { _id } = req.userDataPass;
    try {
        await User.findByIdAndUpdate(_id, {
            $set: {
                token: null,
            },
        });
        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
        });
    } catch (error) {
        return res.status(200).json({
            code: statusCode.UNKNOWN_ERROR,
            message: statusMessage.UNKNOWN_ERROR,
        });
    }
};

const changeInfoAfterSignup = async (req, res) => {
    const { _id, email } = req.userDataPass;
    const { username } = req.query;
    const avatar = req.files && req.files['avatar'];
    const timeCurrent = Date.now();
    try {

        //Kiểm tra xem username có hợp lệ hay không
        const isValidName = isValidUsername(username, email);
        
        if (isValidName == false) {
            return res.status(200).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID,
            });
        }

        // Username là trường bắt buộc
        if (!username) {
            return res.status(200).json({
                code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
                message: statusMessage.PARAMETER_IS_NOT_ENOUGHT,
            });
        }

        if (avatar) {
            if (avatar[0].size > 1024 * 1024 * 4) {
                console.log('quá 4mb dung lượng tối đa cho phép');
                return res.status(200).json({
                    code: statusCode.FILE_SIZE_IS_TOO_BIG,
                    message: statusMessage.FILE_SIZE_IS_TOO_BIG,
                });
            }
            const typeFile = avatar[0].originalname.split('.')[1]; 
            if (
                !(
                    typeFile == 'jpg' ||
                    typeFile == 'jpeg' ||
                    typeFile == 'png'
                )
            ) {
                return res.status(200).json({
                    code: statusCode.PARAMETER_TYPE_IS_INVALID,
                    message: statusMessage.PARAMETER_TYPE_IS_INVALID,
                });
            }
            const result = await cloudHelper.upload(avatar[0], 'avatar'); 
            await User.findOneAndUpdate(
                { _id: _id },
                {
                    $set: {
                        avatar: result.url,
                        username: username,
                    },
                }
            );
            return res.status(200).json({
                code: statusCode.OK,
                message: statusMessage.OK,
                data: {
                    id: _id,
                    username: username,
                    email: email,
                    created: Date(timeCurrent),
                    avatar: result.url,
                },
            });
        } else {
            return res.status(200).json({
                code: statusCode.OK,
                message: statusMessage.OK,
                data: {
                    id: _id,
                    username: username,
                    email: email,
                    created: Date(timeCurrent),
                    avatar: req.userDataPass.avatar,
                },
            });
        }


    } catch (error) {
        return res.status(200).json({
            code: statusCode.UNKNOWN_ERROR,
            message: statusMessage.UNKNOWN_ERROR,
        });
    }
};

const change_password = async (req, res) => {
    let { password, new_password } = req.query;
    const { _id } = req.userDataPass;
    try {
        const user = req.userDataPass;
        if (
            !new_password ||
            new_password.length < 6 ||
            new_password.length > 10 ||
            new_password.match(/[^a-z|A-Z|0-9]/g)
        )
            throw Error('PARAMETER_VALUE_IS_INVALID');
        if (!password || !new_password) throw Error('PARAMETER_IS_NOT_ENOUGHT');
        if (password == new_password) throw Error('PARAMETER_VALUE_IS_INVALID');

        let count = 0;
        //check xâu con chung dài nhất 80%

        if (
            password.includes(new_password) &&
            new_password.length >= 0.8 * password.length
        )
            throw Error('PARAMETER_VALUE_IS_INVALID');

        password = md5(password);
        if (password != user.password)
            throw Error('PARAMETER_VALUE_IS_INVALID');

        //đã thoả mãn các điều kiện

        new_password = md5(new_password);
        user.password = new_password;
        await user.save();

        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: {},
        });
    } catch (error) {
        console.log(error.message);
        if (error.message == 'PARAMETER_VALUE_IS_INVALID')
            return res.status(200).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID,
            });
        else if (error.message == 'PARAMETER_IS_NOT_ENOUGHT')
        return res.status(200).json({
            code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
            message: statusMessage.PARAMETER_IS_NOT_ENOUGHT,
        });
        else
        {return res.status(200).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            });}
            
    }
};

const get_push_settings = async (req, res) => {
    const { token } = req.query;
    const { _id } = req.userDataPass;
    try {
        var userData = req.userDataPass;
        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: userData.settings,
        });
    } catch (error) {
        if (error.massage == '') {
            return res.status(500).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            });
        } else {
            return res.status(500).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            });
        }
    }
};

const set_push_settings = async (req, res) => {
    const {
        token,
        like_comment,
        from_friends,
        requested_friend,
        suggested_friend,
        birthday,
        video,
        report,
        sound_on,
        notification_on,
        vibrant_on,
        led_on,
    } = req.query;
    const { _id } = req.userDataPass;
    try {
        if (
            like_comment == undefined &&
            from_friends == undefined &&
            requested_friend == undefined &&
            suggested_friend == undefined &&
            birthday == undefined &&
            video == undefined &&
            report == undefined &&
            sound_on == undefined &&
            notification_on == undefined &&
            vibrant_on == undefined &&
            led_on == undefined
        ) {
            throw Error('params');
        }
        var userData = req.userDataPass;
        userData.settings.like_comment =
            like_comment == '0' || like_comment == '1'
                ? like_comment
                : userData.settings.like_comment;
        userData.settings.from_friends =
            from_friends == '0' || from_friends == '1'
                ? from_friends
                : userData.settings.from_friends;
        userData.settings.requested_friend =
            requested_friend == '0' || requested_friend == '1'
                ? requested_friend
                : userData.settings.requested_friend;
        userData.settings.suggested_friend =
            suggested_friend == '0' || suggested_friend == '1'
                ? suggested_friend
                : userData.settings.suggested_friend;
        userData.settings.birthday =
            birthday == '0' || birthday == '1'
                ? birthday
                : userData.settings.birthday;
        userData.settings.video =
            video == '0' || video == '1' ? video : userData.settings.video;
        userData.settings.report =
            report == '0' || report == '1' ? report : userData.settings.report;
        userData.settings.sound_on =
            sound_on == '0' || sound_on == '1'
                ? sound_on
                : userData.settings.sound_on;
        userData.settings.notification_on =
            notification_on == '0' || notification_on == '1'
                ? notification_on
                : userData.settings.notification_on;
        userData.settings.vibrant_on =
            vibrant_on == '0' || vibrant_on == '1'
                ? vibrant_on
                : userData.settings.vibrant_on;
        userData.settings.led_on =
            led_on == '0' || led_on == '1' ? led_on : userData.settings.led_on;
        var result = await userData.save();

        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            // data: result.settings,
            data: {},
        });
    } catch (error) {
        if (error.massage == 'params') {
            return res.status(500).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID,
            });
        } else {
            return res.status(500).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            });
        }
    }
};

const set_block = async (req, res) => {
    let { token, user_id, type } = req.query;
    const { _id } = req.userDataPass;

    try {
        type = Number(type);
        // Kiểm tra tham số đầu vào
        if (user_id == _id || (type != 0 && type != 1)) {
            console.log('trùng user_id hoặc type không đúng');
            throw new Error('params');
        }

        if (!(user_id !== undefined)) {
            // Check if params are provided
            console.log("Missing user_id or is_accept")
            throw {
                code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
                message:
                    statusMessage.PARAMETER_IS_NOT_ENOUGHT,
            };
        }
        // Tìm user bị block
        var friendData = await User.findById(user_id);
        if (!friendData || friendData.is_blocked) {
            console.log('friend không tìm thấy hoặc đã bị server block');
            throw new Error('action');
        }
        // OK
        var userData = req.userDataPass;
        var isBlocked = userData.blockedIds.includes(user_id);
        if (type == 0 && isBlocked) {
            // Block và đã block rồi
            throw new Error('blockedbefore');
        }
        if (type == 0 && !isBlocked) {
            await User.findByIdAndUpdate(_id, {
                $push: {
                    blockedIds: user_id,
                },
                $pull: {
                    friends: {
                        _id: user_id
                    },
                    sendRequestedFriends: {
                        _id: user_id,
                    },
                    requestedFriends: {
                        _id: user_id,
                    },
                },
            });
            await User.findByIdAndUpdate(user_id, {
                $pull: {
                    friends: {
                        _id: _id
                    },
                    sendRequestedFriends: {
                        _id: _id,
                    },
                    requestedFriends: {
                        _id: _id,
                    },
                },
            });
            return res.status(200).json({
                code: statusCode.OK,
                message: statusMessage.OK,
            });
        }
        if (type == 1 && !isBlocked) {
            // Unblock và chưa block trước đó
            throw new Error('unblockedbefore');
        }
        if (type == 1 && isBlocked) {
            await User.findByIdAndUpdate(_id, {
                $pull: {
                    blockedIds: user_id,
                },
            });
            return res.status(200).json({
                code: statusCode.OK,
                message: statusMessage.OK,
            });
        }
    } catch (error) {
        if (error.message == 'params') {
            return res.status(500).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID,
            });
        } else if (
            error.message == 'blockedbefore' ||
            error.message == 'unblockedbefore'
        ) {
            return res.status(500).json({
                code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
                message: statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
            });
        } else if (error.message == 'action') {
            return res.status(500).json({
                code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
                message: statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
            });
        } else {
            return res.status(500).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            });
        }
    }
};

const check_new_version = async (req, res) => {
    const { token, last_update } = req.query;
    const { _id, active } = req.userDataPass;
    try {
        if (!last_update || active == 0) {
            throw new Error('params');
        }

        
        var versionData = await Version.find({}).sort({ created: 1 });
        var userData = await User.findById(_id)
            .populate({
                path: 'notifications',
            })
            .populate({
                path: 'conversations',
                select: 'unread',
            });

        var unreadCount = 0;
        userData.conversations.map((element) => {
            if (element.unread === '1') {
                unreadCount++;
            }
        });

        var resData = [];
        userData.notifications.map((notification) => {
            resData.push({
                notification_id: notification._id,
            });
        });
        console.log(userData);
        var countNewNoti = 0;
        resData.map((data) => {
            if (data.read === '0') {
                countNewNoti += 1;
            }
        });

        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: {
                version: {
                    version: versionData[0].version,
                    require: versionData[0].require,
                    url: versionData[0].url,
                },
                user: {
                    id: _id,
                    active: active.toString(),
                },
                badge:
                    countNewNoti >= 100
                        ? (countNewNoti = "99+")
                        : countNewNoti.toString(),
                unread_message: unreadCount >= 100
                ? (unreadCount = "99+")
                :unreadCount.toString(),
                now: versionData[0].version,
            },
        });
    } catch (error) {
        if (error.message == 'params') {
            return res.status(500).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID,
            });
        } else {
            return res.status(500).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            });
        }
    }
};

module.exports = {
    logout,
    changeInfoAfterSignup,
    change_password,
    get_push_settings,
    set_push_settings,
    set_block,
    check_new_version,
};
