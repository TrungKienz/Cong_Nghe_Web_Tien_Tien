const User = require('../models/user.model.js');
const Notification = require('../models/notification.model.js');
const Post = require('../models/post.model.js');

const formidableHelper = require('../helpers/formidable.helper');
const { sameFriends } = require('../helpers/sameFriends.helper.js');
const statusCode = require('./../constants/statusCode.constant.js');
const statusMessage = require('./../constants/statusMessage.constant.js');
const { checkNewNotification } = require('./notification.controller.js');

const checkNewItem = async (req, res) => {
    try {
        const { last_id, category_id } = req.query;
        const { _id } = req.userDataPass;
        const lastId = last_id || '0';

        // Validate category_id
        if (category_id < 0 || category_id > 3) {
            throw new Error('PARAMETER_VALUE_IS_INVALID');
        }

        // Retrieve user's friends' posts sorted by created date
        const userData = await User.findById(_id).populate({
            path: 'postIds',
            select: '_id created',
            options: {
                created: -1,
            },
        });

        var newItems = 0;
        console.log(userData.postIds.length);
        const lastIdIndex = userData.postIds.findIndex(
            (element) => element._id == lastId
        );
        console.log(lastIdIndex);
        if (lastIdIndex !== -1) {
            newItems = lastIdIndex;
        } else if (lastId == 0) {
            newItems = userData.postIds.length;
        } else {
            throw Error('PARAMETER_VALUE_IS_INVALID');
        }

        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: {
                new_items: newItems,
            },
        });
    } catch (error) {
        if (error.message === 'PARAMETER_VALUE_IS_INVALID') {
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
};

const getNotification = async (req, res) => {
    var { index, count } = req.query;
    const { _id } = req.userDataPass;
    if (!index || !count) {
        return res.status(200).json({
            code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
            message: statusMessage.PARAMETER_IS_NOT_ENOUGHT,
        });
    }
    try {
        index = parseInt(index);
        count = parseInt(count);
    } catch (e) {
        return res.status(200).json({
            code: statusCode.PARAMETER_TYPE_IS_INVALID,
            message: statusMessage.PARAMETER_TYPE_IS_INVALID,
        });
    }
    if (isNaN(index) || isNaN(count)) {
        return res.status(200).json({
            code: statusCode.PARAMETER_TYPE_IS_INVALID,
            message: statusMessage.PARAMETER_TYPE_IS_INVALID,
        });
    }
    if (index < 0 || count < 0) {
        return res.status(200).json({
            code: statusCode.PARAMETER_VALUE_IS_INVALID,
            message: statusMessage.PARAMETER_VALUE_IS_INVALID,
        });
    }
    try {
        index = index ? index : 0;
        count = count ? count : 20;

        var userData = await User.findById(_id).populate({
            path: 'notifications',
        });

        var resData = [];

        console.log(userData.notifications);

        userData.notifications.map((notification) => {
            resData.push({
                type: notification.type,
                object_id: notification.object_id,
                title: notification.title,
                notification_id: notification._id,
                created: notification.created,
                avatar: notification.avatar,
                group: notification.group,
                read: notification.read,
            });
        });

        console.log(resData);

        var countNewNoti = 0;
        resData.map((data) => {
            if (data.read === '0') {
                countNewNoti += 1;
            }
        });

        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: resData
                .sort((a, b) => b.created - a.created)
                .slice(Number(index), Number(index) + Number(count)),
            last_update: userData.notifications.last_update || Date(Date.now()),
            badge: countNewNoti.toString(),
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: statusCode.UNKNOWN_ERROR,
            message: statusMessage.UNKNOWN_ERROR,
        });
    }
};

const setReadNotification = async (req, res) => {
    const { notification_id } = req.query;
    const { _id } = req.userDataPass;

    try {
        await Notification.findByIdAndUpdate(notification_id, {
            $set: {
                read: '1',
            },
        });

        let newNoti = 0;

        const userData = await User.findById(_id).populate({
            path: 'notifications',
            select: 'read last_update',
        });

        userData.notifications.forEach((notification) => {
            if (notification.read === '0') {
                newNoti += 1;
            }
        });

        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: {
                badge: newNoti,
                last_update: Date(Date.now()),
            },
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            code: statusCode.UNKNOWN_ERROR,
            message: statusMessage.UNKNOWN_ERROR,
        });
    }
};

const setDevToken = async (req, res) => {
    const { token, devtype, devtoken } = req.query;
    const { _id } = req.userDataPass;
    try {
        var result = await formidableHelper.parseInfo(req);
        var userData = req.userDataPass;
        userData.devtype = devtype ? devtype : userData.devtype;
        userData.devtoken = devtoken ? devtoken : userData.devtoken;

        if (!devtype || !devtoken) {
            return res.status(200).json({
                code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
                message: statusMessage.PARAMETER_IS_NOT_ENOUGHT,
            });
        }

        if (devtype !== '0' && devtype !== '1') {
            return res.status(200).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID,
            });
        }

        await userData.save();
        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            // data: {
            //     devtype: userData.devtype,
            //     devtoken: userData.devtoken,
            // },
            data: {},
        });
    } catch (error) {
        console.log(error);
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

const getUserInfo = async (req, res) => {
    const { user_id } = req.query;
    const { _id } = req.userDataPass;

    try {
        // Check if viewing own profile or other user's profile
        if (!user_id || user_id === _id) {
            const userData = await User.findById(_id).populate({
                path: 'friends',
                select: '_id',
            });

            const listing = userData.friends.length;

            const dataRes = {
                id: userData._id || null,
                username: userData.username || null,
                created: userData.created || null,
                description: userData.description || null,
                avatar: userData.avatar || null,
                cover_image: userData.cover_image || null,
                link: userData.link || null,
                address: userData.address || null,
                city: userData.city || null,
                country: userData.country || null,
                listing: listing.toString(),
                is_friend: '0',
                online: '0',
                coins: userData.coins || '0',
            };

            return res.status(200).json({
                code: statusCode.OK,
                message: statusMessage.OK,
                data: dataRes,
            });
        }

        // Viewing other user's profile
        const otherUserData = await User.findById(user_id)
            .select(
                '_id username created description avatar cover_image link address city country friends blockedIds coins'
            )
            .populate({
                path: 'friends',
                select: '_id username avatar',
            });

        if (
            !otherUserData ||
            otherUserData.is_blocked ||
            otherUserData.blockedIds.includes(_id)
        ) {
            throw new Error('notfound');
        }

        const userData = await User.findById(_id);
        const is_friend = userData.friends.includes(user_id) ? '1' : '0';

        // const is_friend = req.userDataPass.friends.includes(user_id) ? '1' : '0';
        console.log(is_friend);

        otherUserData.listing = otherUserData.friends.length;

        const dataRes = {
            id: otherUserData._id || null,
            username: otherUserData.username || null,
            created: otherUserData.created || null,
            description: otherUserData.description || null,
            avatar: otherUserData.avatar || null,
            cover_image: otherUserData.cover_image || null,
            link: otherUserData.link || null,
            address: otherUserData.address || null,
            city: otherUserData.city || null,
            country: otherUserData.country || null,
            listing: otherUserData.listing,
            is_friend: is_friend || '0',
            online: '0',
            coins: otherUserData.coins || '0',
        };

        delete otherUserData.blockedIds;

        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: dataRes,
        });
    } catch (error) {
        console.error(error);
        if (error.message == 'notfound') {
            return res.status(500).json({
                code: statusCode.USER_IS_NOT_VALIDATED,
                message: statusMessage.USER_IS_NOT_VALIDATED,
            });
        } else {
            return res.status(500).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            });
        }
    }
};

const setUserInfo = async (req, res) => {
    const {
        token,
        username,
        description,
        avatar,
        address,
        city,
        country,
        cover_image,
        link,
        // birthday,
        // link,
        // songtai,
        // dentu,
        // hoctai,
        // nghenghiep,
        // sothich
    } = req.query;
    const { _id } = req.userDataPass;
    try {
        var result = await formidableHelper.parseInfo(req);
        var userData = req.userDataPass;
        userData.username = username ? username : userData.username;
        userData.description = description ? description : userData.description;
        userData.avatar = result.avatar ? result.avatar.url : userData.avatar;
        userData.address = address ? address : userData.address;
        userData.city = city ? city : userData.city;
        userData.country = country ? country : userData.country;
        userData.cover_image = result.cover_image
            ? result.cover_image.url
            : userData.cover_image;
        userData.link = link ? link : userData.link;
        // userData.nghenghiep = nghenghiep?nghenghiep:userData.nghenghiep;
        // userData.hoctai = hoctai?hoctai:userData.hoctai;
        // userData.songtai = songtai?songtai:userData.songtai;
        // userData.birthday = birthday?birthday:userData.birthday;
        // userData.dentu = dentu?dentu:userData.dentu;
        // userData.sothich = sothich?sothich:userData.sothich;
        await userData.save();
        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: {
                // username: username,
                // description: description,
                avatar: result.avatar ? result.avatar.url : '',
                cover_image: result.cover_image ? result.cover_image.url : '',
                // address: address,
                link: link,
                city: city,
                country: country,
                // nghenghiep: nghenghiep,
                // hoctai: hoctai,
                // sothich: sothich,
                // songtai: songtai,
                // dentu: dentu
            },
        });
    } catch (error) {
        console.log(error);
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
    checkNewItem,
    getNotification,
    setReadNotification,
    setDevToken,
    getUserInfo,
    setUserInfo,
};
