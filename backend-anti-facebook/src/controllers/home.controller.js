const User = require('../models/user.model.js');
const formidableHelper = require('../helpers/formidable.helper');

const statusCode = require('./../constants/statusCode.constant.js');
const statusMessage = require('./../constants/statusMessage.constant.js');


const checkNewItem = async (req, res) => {
    const { last_id, category_id } = req.query;
    const { _id } = req.userDataPass;
    try {
        var result = await User.findById(_id).populate({
            path: 'friends',
            select: 'postIds',
            populate: {
                path: 'postIds',
                // populate: {
                //   path: "author",
                //   select: "avatar username",
                // },
                options: {
                    sort: {
                        created: -1,
                    },
                },
            },
        });
        var postRes = [];
        result.friends.map((e, index) => {
            postRes = postRes.concat(e.postIds);
            // console.log(postRes)
        });
        function checkAdult(post) {
            return post._id == last_id;
        }
        var findLastIndex = postRes.findIndex(checkAdult);
        var new_items = 0;
        var newLastIndex;
        if (findLastIndex == -1) {
            new_items = postRes.length;
            // newLastIndex
        } else {
            new_items = findLastIndex;
        }
        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: {
                // posts: postRes.slice(index, index + count),
                // last_id: postRes[0]._id,
                new_items: new_items,
            },
        });
    } catch (error) {
        if (error.message == 'params') {
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
            path: 'notifications.id',

            // select: "username avatar",
        });
        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: userData.notifications
                .sort((a, b) => b.id.created - a.id.created)
                .slice(Number(index), Number(index) + Number(count)),
        });
    } catch (error) {
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
        var userData = req.userDataPass;
        userData.notifications.map((e) => {
            if (e.id == notification_id) {
                e.read = '1';
            }
        });
        await userData.save();
        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: userData.notifications,
        });
    } catch (error) {
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
    const { token, user_id } = req.query;
    const { _id } = req.userDataPass;
    try {
        // nếu tự xem thông tin của mình
        if (user_id == _id || !user_id) {
            console.log('trùng với id của user');
            var userData = await User.findById(_id).populate({
                path: 'friends',
                select: '_id username created description avatar cover_image link address city country listing is_friend online coins',
            });
            var listing = userData.friends.length;
            userData.listing = listing;
            return res.status(200).json({
                code: statusCode.OK,
                message: statusMessage.OK,
                data: {
                    id: userData._id ? userData._id : null,
                    username: userData.username ? userData.username : null,
                    created: userData.created ? userData.created : null,
                    description: userData.description
                        ? userData.description
                        : null,
                    avatar: userData.avatar ? userData.avatar : null,
                    cover_image: userData.cover_image
                        ? userData.cover_image
                        : null,
                    link: userData.link ? userData.link : null,
                    address: userData.address ? userData.address : null,
                    city: userData.city ? userData.city : null,
                    country: userData.country ? userData.country : null,
                    listing: userData.listing ? userData.listing : null,
                    is_friend: userData.is_friend ? userData.is_friend : null,
                    online: userData.online ? userData.online : null,
                    coins: userData.coins ? userData.coins : null,
                },
            });
        }
        // nếu xem thông tin của người khác
        try {
            var otherUserData = await User.findById(user_id)
                .select(
                    'username created description avatar cover_image link address city country friends blockedIds is_blocked birthday'
                )
                .populate({
                    path: 'friends',
                    select: 'username avatar',
                });
        } catch (e) {
            return res.status(500).json({
                code: statusCode.USER_IS_NOT_VALIDATED,
                message: statusMessage.USER_IS_NOT_VALIDATED,
            });
        }
        if (
            !otherUserData ||
            otherUserData.is_blocked ||
            otherUserData.blockedIds.includes(_id)
        ) {
            throw Error('notfound');
        }
        is_friend = req.userDataPass.friends.find((e) => e == user_id)
            ? '1'
            : '0';
        sendRequested = req.userDataPass.sendRequestedFriends.find(
            (e) => e.receiver == user_id
        )
            ? '1'
            : '0';
        requested = req.userDataPass.requestedFriends.find(
            (e) => e.author == user_id
        )
            ? '1'
            : '0';
        otherUserData.listing = otherUserData.friends.length;
        var userData = req.userDataPass;
        var result = await sameFriendsHelper.sameFriends(
            userData.friends,
            user_id
        );
        delete otherUserData.blockedIds;
        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: otherUserData,
            sameFriends: result.same_friends,
            is_friend: is_friend,
            sendRequested: sendRequested,
            requested: requested,
        });
    } catch (error) {
        console.log(error);
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
