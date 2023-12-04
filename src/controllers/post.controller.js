const dotenv = require('dotenv');
dotenv.config();

const Fuse = require('fuse.js');
const Post = require('../models/post.model.js');
const User = require('../models/user.model.js');
const ReportPost = require('../models/report.post.model.js');
const Comment = require('../models/comment.model');
const Mark = require('../models/mark.model.js');

const Notification = require('../models/notification.model');
const formidableHelper = require('../helpers/formidable.helper');
const cloudHelper = require('../helpers/cloud.helper.js');

const statusCode = require('./../constants/statusCode.constant.js');
const statusMessage = require('./../constants/statusMessage.constant.js');

const deletePostAll = async (req, res) => {
    var userAll = await User.find({});
    await Promise.all(
        userAll.map((userData) => {
            return User.findByIdAndUpdate(userData._id, {
                $set: {
                    postIds: [],
                },
            });
        })
    );

    await Post.deleteMany({ _id: { $ne: null } });
    res.status(200).json({
        message: 'drop ok',
    });
};

const addPost = async (req, res) => {
    const { described, state, status } = req.query;
    const { _id } = req.userDataPass;
    const images = req.files && req.files['image'];
    const video = req.files && req.files['video'];

    try {
        const userData = await User.findOne({ _id: _id });
        if (userData.active !== 1) {
            return res.status(200).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            });
        }

        const currentCoin = userData.coins;
        if (currentCoin < 4) {
            return res.status(200).json({
                code: statusCode.NOT_ENOUGHT_COINS,
                message: statusMessage.NOT_ENOUGHT_COINS,
            });
        }
        if (images && video) {
            return res.status(200).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            });
        }

        if (images && images.length > 4) {
            return res.status(200).json({
                code: statusCode.MAXIMUM_NUMBER_OF_IMAGES,
                message: statusMessage.MAXIMUM_NUMBER_OF_IMAGES,
            });
        }

        if (video && video.length > 1) {
            return res.status(200).json({
                code: statusCode.MAXIMUM_NUMBER_OF_VIDEO,
                message: statusMessage.MAXIMUM_NUMBER_OF_VIDEO,
            });
        }

        var newPost;
        var result = await formidableHelper.parse(req);

        if (video) {
            video.map((element) => {
                if (element.size > 1024 * 1024 * 4) {
                    console.log('quá 4mb dung lượng tối đa cho phép');
                    return res.status(200).json({
                        code: statusCode.FILE_SIZE_IS_TOO_BIG,
                        message: statusMessage.FILE_SIZE_IS_TOO_BIG,
                    });
                }
            })
            var resultUploadVideo = await cloudHelper.upload(result.data[0], 'video');
            newPost = await new Post({
                described: described,
                state: state,
                status: status,
                video: resultUploadVideo,
                created: Date.now(),
                modified: Date.now(),
                like: 0,
                is_liked: false,
                comment: 0,
                author: _id,
            }).save();
        } else if (images) {
            images.map((image) => {
                if (image.size > 1024 * 1024 * 4) {
                    console.log('quá 4mb dung lượng tối đa cho phép');
                    return res.status(200).json({
                        code: statusCode.FILE_SIZE_IS_TOO_BIG,
                        message: statusMessage.FILE_SIZE_IS_TOO_BIG,
                    });
                }
            })

            var resultUploadImage = await Promise.all(
                images.map((element) => {
                    return cloudHelper.upload(element);
                })
            );
            newPost = await new Post({
                described: described,
                state: state,
                status: status,
                image: resultUploadImage,
                created: Date.now(),
                modified: Date.now(),
                like: 0,
                is_liked: false,
                comment: 0,
                author: _id,
                keyword: removeAscent(described),
            }).save();
        } else {
            newPost = await new Post({
                described: described,
                state: state,
                status: status,
                created: Date.now(),
                modified: Date.now(),
                like: 0,
                is_liked: false,
                comment: 0,
                author: _id,
                keyword: removeAscent(described),
            }).save();
        }

        const updatedCoin = currentCoin - 4;

        await User.findOneAndUpdate(
            { _id: _id },
            {
                $push: {
                    postIds: newPost._id,
                },
                $set: {
                    coins: updatedCoin,
                },
            }
        );
        
        var postUrl = (process.env.APP_URL || "http://localhost:3000/it4788") + "/post/" + newPost._id;

        res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: {
                id: newPost._id,
                url: postUrl.toString(),
                coins: updatedCoin.toString(),
            },
        });
        try {
            var newNotification = await new Notification({
                type: 'get post',
                object_id: newPost._id,
                title: userData.username + ' đã thêm một bài viết mới',
                avatar: userData.avatar,
                group: '1',
                created: Date.now(),
                read: '0',
                userData: _id,
                postData: newPost._id,
            }).save();
        } catch (error) {
            console.log(err);
        }

        try {
            await Promise.all(
                userData.friends.map(async (element) => {
                    return await User.findByIdAndUpdate(element, {
                        $push: {
                            notifications: {
                                id: newNotification._id,
                                read: '0',
                            },
                        },
                    });
                })
            );
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            code: statusCode.UNKNOWN_ERROR,
            message: statusMessage.UNKNOWN_ERROR,
        });
    }
};

const removeAscent = (str) => {
    if (str === null || str === undefined) return str;
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    return str;
};

const getPost = async (req, res) => {
    // Destructuring variables from request
    const { id } = req.query;
    const { _id } = req.userDataPass;
    // Parameter validation
    if (!id) {
        return res.status(400).json({
            code: statusCode.PARAMETER_IS_NOT_ENOUGH,
            message: statusMessage.PARAMETER_IS_NOT_ENOUGH,
        });
    }
    // Input Validation
    if (!_id) {
        console.log("Invalid user ID");
        return res.status(400).json({
            code: statusCode.INVALID_USER_ID,
            message: statusMessage.INVALID_USER_ID,
        });
    }
    try {
        // Database Query
        const post = await Post.findOne({ _id: id })
            .populate({
                path: 'author',
                select: '_id username avatar coins blockedIds postIds',
            })
            .populate({
                path: 'like_list',
                select: 'username avatar',
            })
            .populate({
                path: 'comment_list',
                populate: {
                    path: 'poster',
                    select: 'username avatar',
                },
            })
            .populate({
                path: 'mark_list',
                select: 'type',
            });

        // Post Validation
        if (!post || post.is_blocked) {
            return res.status(404).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID,
            });
        }

        // Response Handling
        const author = await User.findOne({ _id: post.author?._id });
        const userData = await User.findById(_id);

        // Check if the post is marked by the user
        const isMarked = userData.mark_list.includes(id) ? "0" : "1";

        // Check if the user can mark the post
        const canMark = isMarked === "0" ? "0" : "1";

        // Check if the user can rate the post
        const canRate = isMarked === "0" ? "-5" : "1";
        
        var isBlocked = false;
        // User Blocking Check
        if (userData.blockedIds.includes(author._id)) {
            isBlocked = true;
        }
        var postUrl = (process.env.APP_URL || "http://localhost:3000/it4788") + "/post/" + post._id;
        const responseData = {
            id: isBlocked ? null : post._id,
            name: isBlocked ? null : (post.name || post.described),
            created: isBlocked ? null : post.created,
            described: isBlocked ? null : post.described,
            modified: isBlocked ? null : post.modified,
            fake: isBlocked ? null : "0",
            trust: isBlocked ? null : "0",
            kudos: isBlocked ? null : post.kudos_list.length.toString(),
            disappointed: isBlocked ? null : post.disappointed_list.length.toString(),
            is_rated: isBlocked ? null : "0",
            is_marked: isBlocked ? null : isMarked,
            image: isBlocked ? null : (post.image ? post.image.map((image) => ({
                id: image._id,
                url: image.url,
            })) : []),
            video: isBlocked ? null : (post.video ? {
                url: post.video.url,
                thumb: post.video.thumb,
            } : {}),
            author: isBlocked ? null : {
                id: author._id,
                name: author.username,
                avatar: author.avatar,
                coins: author.coins.toString(),
                listing: author.postIds.map((postId) => ({ postId })),
            },
            category: isBlocked ? null : {
                id: post._id,
                name: post.described,
                has_name: '0',
            },
            state: isBlocked ? null : post.state || "public",
            is_blocked: isBlocked ? "1" : "0",
            can_edit: isBlocked ? null : "0",
            banned: isBlocked ? null : post.banned || "0",
            can_mark: isBlocked ? null : canMark,
            can_rate: isBlocked ? null : canRate,
            url: isBlocked ? null : postUrl.toString(),
            messages: isBlocked ? null : (canMark === "-5" ? "Không được mark" : canRate === "-5" ? "Không được rate" : ""),
        };

        // Check if the user can edit the post
        const postDate = new Date(post.created);
        const currentDate = Date.now();
        const oneDayInMillis = 24 * 60 * 60 * 1000;
        const isPostOverOneDay = (currentDate - postDate) > oneDayInMillis;
        
        if (!isPostOverOneDay && author.coins > 4 && _id.toString() == post.author._id.toString()) {
            responseData.can_edit = "1";
        }


        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: responseData,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: statusCode.PARAMETER_VALUE_IS_INVALID,
            message: statusMessage.PARAMETER_VALUE_IS_INVALID,
        });
    }
};



const editPost = async (req, res) => {
    const { id, described, status, state, image_del, image_sort, auto_accept } =
        req.query;
    const { _id } = req.userDataPass;
    const images = req.files['image'];
    const video = req.files['video'];

    try {
        var countImageDel = 0;

        const postData = await Post.findById(id);
        // if (image_sort && image_sort < 0) {
        //     return res.status(200).json({
        //         code: statusCode.PARAMETER_VALUE_IS_INVALID,
        //         message: statusMessage.PARAMETER_VALUE_IS_INVALID,
        //     });
        // }
        postData.image?.map((image) => {
            if(image_del.includes(image._id)){
                countImageDel++;
            }
        })

        if (!postData) {
            return res.status(200).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID,
            });
        }
        
        // Kiểm tra xem đã quá 4 ảnh hay chưa
        if (images != null && postData.image.length == 4 && postData.image.length > countImageDel) {
            return res.status(200).json({
                code: statusCode.MAXIMUM_NUMBER_OF_IMAGES,
                message: statusMessage.MAXIMUM_NUMBER_OF_IMAGES, 
            })
        }
        // if (image_del != null && postData.image.length == 0) {
        //     return res.status(200).json({
        //         code: statusCode.PARAMETER_VALUE_IS_INVALID,
        //         message: statusMessage.PARAMETER_VALUE_IS_INVALID, 
        //     })
        // }

        // Kiểm tra bài post có video hay ảnh
        // if (postData.image.length != 0 && video != null) {
        //     return res.status(200).json({
        //         code: statusCode.PARAMETER_VALUE_IS_INVALID,
        //         message: statusMessage.PARAMETER_VALUE_IS_INVALID, 
        //     })
        // } else if (postData.video != null && images != null) {
        //     return res.status(200).json({
        //         code: statusCode.PARAMETER_VALUE_IS_INVALID,
        //         message: statusMessage.PARAMETER_VALUE_IS_INVALID, 
        //     })
        // } else if (postData.video != null && video != null) {
        //     return res.status(200).json({
        //         code: statusCode.PARAMETER_VALUE_IS_INVALID,
        //         message: statusMessage.PARAMETER_VALUE_IS_INVALID, 
        //     })
        // }

        try {
            const postDate = new Date(postData.created);
            const currentDate = Date.now();

            // Số mili giây trong một ngày
            const oneDayInMillis = 24 * 60 * 60 * 1000;

            var isPostOverOneDay = false;

            if (currentDate - postDate > oneDayInMillis) {
                isPostOverOneDay = true;
            }

            const authorData = await User.findOne({ _id: postData.author });
            const currentCoin = authorData.coins;

            if (currentCoin < 4) {
                return res.status(200).json({
                    code: statusCode.NOT_ENOUGHT_COINS,
                    message: statusMessage.NOT_ENOUGHT_COINS,
                }); 
            }

            if (isPostOverOneDay == true) {
                return res.status(200).json({
                    code: statusCode.NOT_ACCESS,
                    message: statusMessage.NOT_ACCESS,
                });
            }

            if (postData.author.toString() !== _id.toString()) {
                return res.status(200).json({
                    code: statusCode.PARAMETER_VALUE_IS_INVALID,
                    message: statusMessage.PARAMETER_VALUE_IS_INVALID,
                });
            }

            if (described) {
                postData.described = described;
                postData.keyword = removeAscent(described);
            }
            if (status) {
                postData.status = status;
            }
            if (state) {
                postData.state = state;
            }
            if (status) {
                postData.status = status;
            }
            if (image_del && image_del.length > 0) {
                postData.image = postData.image.filter((element) => {
                    if (image_del.includes(String(element._id))) {
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            if (video) {
                cloudHelper
                    .upload(video[0], 'video')
                    .then(async (resultVideo) => {
                        postData.video = resultVideo;
                        await postData.save();
                    })
                    .catch((err) => {
                        // throw err;
                        console.log(err)
                    });
            } else if (images) {
                Promise.all(
                    images.map((image) => {
                        return cloudHelper.upload(image);
                    })
                ).then(async (resultImage) => {
                    postData.image =
                        postData.image && postData.length == 0
                            ? resultImage
                            : postData.image.concat(resultImage);
                    await postData.save();
                });
            } else {
                await postData.save();
            }
            if (isPostOverOneDay == true) {
                return res.status(200).json({
                    code: statusCode.PARAMETER_VALUE_IS_INVALID,
                    message: statusMessage.PARAMETER_VALUE_IS_INVALID,
                });
            } else {
                authorData.coins = currentCoin - 4;
                authorData.save();
                return res.status(200).json({ 
                    code: statusCode.OK,
                    message: statusMessage.OK,
                    coins: (currentCoin - 4).toString(),
                });
            }
        } catch (e) {
            return res.status(200).json({
                code: statusCode.FILE_SIZE_IS_TOO_BIG,
                message: statusMessage.FILE_SIZE_IS_TOO_BIG,
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            code: statusCode.UNKNOWN_ERROR,
            message: statusMessage.UNKNOWN_ERROR,
        });
    }
};

const deletePost = async (req, res) => {
    const { id } = req.query;
    const { _id } = req.userDataPass;
    try {
        const postData = await Post.findById(id);

        // Check is author of post
        if (postData.author.toString() != _id.toString()){
            return res.status(200).json({
                code: statusCode.NOT_ACCESS,
                message: statusMessage.NOT_ACCESS,
            })
        };

        const authorData = await User.findOne({ _id: _id });
        // Check if not enough coin
        var currentCoin = authorData.coins;
        if (currentCoin < 4) {
            return res.status(200).json({
                code: statusCode.NOT_ENOUGHT_COINS,
                message: statusMessage.NOT_ENOUGHT_COINS,
            });
        }
        authorData.coins = currentCoin - 4;
        authorData.save();

        var result = await Post.findOneAndDelete({
            _id: id,
            author: _id,
        });

        await User.updateOne(
            { _id: _id },
            {
                $pull: {
                    postIds: id,
                },
            }
        );
        
        if (postData.mark_list) {
            await Promise.all(
                postData.mark_list.map(async (markId) => {
                    // Delete mark if exist
                    await Mark.findOneAndDelete({ _id: markId });
                }));
        }  
        if (postData.comment_list) {
            await Promise.all(
                postData.comment_list.map(async (commentId) => {
                    // Delete comment if exist
                    await Comment.findOneAndDelete({ _id: commentId });
                }));
        } 
        if (postData.marker_list) {
            await Promise.all(
                postData.marker_list.map(async (markerId) => {
                    // Await inside the map function
                    await User.findOneAndUpdate(
                    { _id: markerId },
                    { $inc: { coins: 4 } }
                    );
                }));
        }

        if (!result) {
            return res.status(200).json({
                code: statusCode.POST_IS_NOT_EXISTED,
                message: statusMessage.POST_IS_NOT_EXISTED,
            });
        }
        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            coins: (currentCoin - 4).toString(),
        });
    } catch (error) {
        return res.status(200).json({
            code: statusCode.UNKNOWN_ERROR,
            message: statusMessage.UNKNOWN_ERROR,
        });
    }
};

const reportPost = async (req, res) => {
    const { id, subject, details } = req.query;
    const { _id } = req.userDataPass;
    try {
        if (!id || !subject || !details) {
            return res.status(200).json({
                code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
                message: statusMessage.PARAMETER_IS_NOT_ENOUGHT,
            });
        }

        var postData = await Post.findOne({ _id: id }).populate({
            path: 'author',
            select: '_id blockedIds'
        });

        if (!postData || postData.author.blockedIds.includes(_id) || req.userDataPass.blockedIds.includes(postData.author._id)) {
            return res.status(200).json({
                code: statusCode.POST_IS_NOT_EXISTED,
                message: statusMessage.POST_IS_NOT_EXISTED,
            });
        } else if (postData.is_blocked) {
            return res.status(200).json({
                code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
                message:
                    statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
            });
        }
        await new ReportPost({
            id: id,
            subject: subject,
            details: details,
        }).save();
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

const feel = async (req, res) => {
    const { id, type } = req.query;
    const { _id, coins }= req.userDataPass;
    if ( !type ) {
        return res.status(200).json({
            code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
            message:
                statusMessage.PARAMETER_IS_NOT_ENOUGHT,
        });
    }

    if (type != 0 && type != 1) {
        return res.status(200).json({
            code: statusCode.PARAMETER_VALUE_IS_INVALID,
            message:
                statusMessage.PARAMETER_VALUE_IS_INVALID,
        });
    } 

    try {
        const postDataPre = await Post.findOne({ _id: id }).populate({
            path: 'author',
            select: '_id blockedIds'
        });

        if(!postDataPre || postDataPre.author.blockedIds.includes(_id)) {
            return res.status(404).json({
                code: statusCode.POST_IS_NOT_EXISTED,
                message: statusMessage.POST_IS_NOT_EXISTED,
            });
        }

        if (
            postDataPre.disappointed_list?.includes(_id) && type == 0
        ) {

            return res.status(200).json({
                code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
                message:
                    statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
            });
        } else if (
            postDataPre.kudos_list?.includes(_id) && type == 1
        ) {

            return res.status(200).json({
                code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
                message:
                    statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
            });
        } 

        if (
            postDataPre.disappointed_list?.includes(_id) ||
            postDataPre.kudos_list?.includes(_id)
        ) {
            let updateFields = {};
            var disappointFeel;
            var kudoFeel;
            if (type == 0) {
                updateFields = {
                    $inc: { disappointed: 1 },
                    $inc: { kudos: -1 },
                    $pull: { kudos_list: _id },
                    $push: { disappointed_list: _id },
                };
                disappointFeel = postDataPre.disappointed_list.length + 1;
                kudoFeel = postDataPre.kudos_list.length - 1;
            } else if (type == 1) {
                updateFields = {
                    $inc: { disappointed: -1 },
                    $inc: { kudos: 1 },
                    $push: { kudos_list: _id },
                    $pull: { disappointed_list: _id },
                };
                disappointFeel = postDataPre.disappointed_list.length - 1;
                kudoFeel = postDataPre.kudos_list.length + 1;
            }

            const postData = await Post.findOneAndUpdate({ _id: id }, updateFields);

            if ( coins < 2 ) {
                return res.status(200).json({
                    code: statusCode.NOT_ENOUGHT_COINS,
                    message: statusMessage.NOT_ENOUGHT_COINS,
                }) 
            }

            await User.findOneAndUpdate({ _id: _id },{
                $inc: { coins: -2 }
            })

            if (postData) {
                return res.status(200).json({
                    code: statusCode.OK,
                    message: statusMessage.OK,
                    data: {
                        disappointed: disappointFeel? disappointFeel.toString() : "0",
                        kudos: kudoFeel? kudoFeel.toString() : "0",
                    },
                });
            } else {
                return res.status(404).json({
                    code: statusCode.POST_IS_NOT_EXISTED,
                    message: statusMessage.POST_IS_NOT_EXISTED,
                });
            }
        }

        let updateFields = {};

        if (type == 0) {
            updateFields = {
                $inc: { disappointed: 1 },
                $push: { disappointed_list: _id },
            };
            var disappointFeel = postDataPre.disappointed_list.length + 1;
        } else if (type == 1) {
            updateFields = {
                $inc: { kudos: 1 },
                $push: { kudos_list: _id },
            };
            var kudoFeel = postDataPre.kudos_list.length + 1;
        }

        const postData = await Post.findOneAndUpdate({ _id: id }, updateFields);

        if (postData) {
            return res.status(200).json({
                code: statusCode.OK,
                message: statusMessage.OK,
                data: {
                    disappointed: disappointFeel? disappointFeel.toString() : "0",
                    kudos: kudoFeel? kudoFeel.toString() : "0",
                },
            });
        } else {
            return res.status(404).json({
                code: statusCode.POST_IS_NOT_EXISTED,
                message: statusMessage.POST_IS_NOT_EXISTED,
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            code: statusCode.EXCEPTION_ERROR,
            message: statusMessage.EXCEPTION_ERROR,
        });
    }
};

const like = async (req, res) => {
    const { id } = req.query;
    const { _id } = req.userDataPass._id;
    if (id) {
        try {
            // tim post theo id
            var result = await Post.findOne({ _id: id });
            // neu khong co thi bao loi
            if (!result) {
                throw Error('notfound');
            }
            // kiem tra post có bị block không
            if (result.is_blocked) {
                throw Error('isblocked');
            }
            // nếu user đã like
            if (result.like_list.includes(String(_id))) {
                // xoá user id khỏi danh sách đã like của post
                var isLiked = false;
                await Post.findByIdAndUpdate(id, {
                    $pull: {
                        like_list: _id,
                    },
                    $set: {
                        like: result.like - 1,
                        // is_liked: isLiked
                    },
                });
                res.status(200).json({
                    code: statusCode.OK,
                    message: statusMessage.OK,
                    data: {
                        like: result.like - 1,
                        is_liked: isLiked,
                    },
                });
            } else {
                // nếu user chưa like thì thêm user id vào danh sách post
                var isLiked = true;
                await Post.findByIdAndUpdate(id, {
                    $push: {
                        like_list: _id,
                    },
                    $set: {
                        like: result.like + 1,
                        is_liked: false,
                    },
                });
                res.status(200).json({
                    code: statusCode.OK,
                    message: statusMessage.OK,
                    data: {
                        like: result.like + 1,
                        is_liked: isLiked,
                    },
                });
                try {
                    if (result.author == _id) {
                        throw Error('khong can thong bao cho mk');
                    }
                    var newNotification = await new Notification({
                        type: 'get post',
                        object_id: id,
                        title:
                            req.userDataPass.username +
                            ' đã like bài viết cuả bạn',
                        avatar: req.userDataPass.avatar,
                        group: '1',
                        created: Date.now(),
                        // read: "0",
                    }).save();
                    await User.findByIdAndUpdate(result.author, {
                        $push: {
                            notifications: {
                                id: newNotification._id,
                                read: '0',
                            },
                        },
                    });
                } catch (error) {
                    console.log(error);
                }
            }
        } catch (error) {
            console.log(error.message);
            if (error.message == 'isblocked') {
                return res.status(200).json({
                    code: statusCode.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
                    message:
                        statusMessage.ACTION_HAS_BEEN_DONE_PREVIOUSLY_BY_THIS_USER,
                });
            } else if (error.message == 'notfound') {
                return res.status(200).json({
                    code: statusCode.POST_IS_NOT_EXISTED,
                    message: statusMessage.POST_IS_NOT_EXISTED,
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


//version 2
const search = async (req, res) => {
    var { keyword, index, count, user_id } = req.query;
    const { _id } = req.userDataPass;

    if (!user_id) {
        return res.status(200).json({
            code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
            message: statusMessage.PARAMETER_IS_NOT_ENOUGHT,
        });
    }

    try {
        index = index ? index : 0;
        count = count ? count : 20;

        if (
            !keyword ||
            _id.toString() !== user_id ||
            isNaN(index) ||
            isNaN(count) ||
            !index ||
            !count
        ) {
            throw Error('params');
        }

        // Combine the search results into a single array
        const postData = await Post.find({}).populate({
            path:'author',
            select: 'username avatar',
        });

        // Create a Fuse instance
        const fuse = new Fuse(postData, {
            includeScore: true,
            useExtendedSearch: true,
            keys: ['described'],
        });
        
        // Perform the search
        const sortedResults = [];
        
        
        keyword.split(" ").forEach((kw) => {
            const searchResults = fuse.search(kw);
            sortedResults.push(...searchResults);
        });

        const mapResult = (element) => {
            return {
                id: element.item._id,
                name: element.item.described,
                image: element.item.image.map((elementImage) => ({
                    url: elementImage.url,
                })),
                video: element.item.video,
                feel: (
                    element.item.kudos_list.length +
                    element.item.disappointed_list.length
                ).toString(),
                mark_comment: (
                    element.item.comment_list.length +
                    element.item.mark_list.length
                ).toString(),
                is_felt: '0',
                author: {
                    //id: typeof element.item.author.id === 'string' ? element.item.author.id : element.item.author.id.toString(),
                    id: element.item.author.id.toString('hex'),
                    username: element.item.author.username,
                    avatar: element.item.author.avatar,
                },
                described: element.item.described,
            };
        };

        // Return the sorted results
        res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: sortedResults.map(mapResult),
        });

        // Cập nhật danh sách tìm kiếm đã lưu của người dùng
        await User.findByIdAndUpdate(
            _id,
            {
                $pull: {
                    savedSearch: {
                        keyword: keyword,
                    },
                },
            },
            { new: true }
        );

        await User.findByIdAndUpdate(
            _id,
            {
                $push: {
                    savedSearch: {
                        keyword: keyword,
                        created: Date.now(),
                    },
                },
            },
            { new: true }
        );
    } catch (error) {
        if (error.message == 'params') {
            return res.status(500).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID,
            });
        } else if (error.message == 'nodata') {
            return res.status(500).json({
                code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
                message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA,
            });
        } else {
            return res.status(500).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            });
        }
    }
}; 
// version 1
/* const search = async (req, res) => {
    var { keyword, index, count, user_id } = req.query;
    const { _id } = req.userDataPass;

    if (!user_id) {
        return res.status(200).json({
            code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
            message: statusMessage.PARAMETER_IS_NOT_ENOUGHT,
        });
    }

    try {
        index = index ? index : 0;
        count = count ? count : 20;

        if (
            !keyword ||
            _id.toString() !== user_id ||
            isNaN(index) ||
            isNaN(count) ||
            !index ||
            !count
        ) {
            throw Error('params');
        }

        // Tìm kiếm các kết quả đủ từ và đúng thứ tự bằng regex
        var postData1 = await Post.find({
            described: new RegExp(keyword, 'i'),
        });

        // Tìm kiếm các kết quả đủ từ nhưng không đúng thứ tự bằng regex
        var postData2 = await Post.find({
            $or: [
                { keyword: new RegExp(keyword, 'i') },
                { keyword: new RegExp(keyword.replace(' ', '|'), 'i') },
            ],
        }).populate({
            path: 'author',
            select: 'username avatar',
        });

        // Combine the search results into a single array
        const postData = postData1.concat(postData2);

        // Create a Fuse instance
        const fuse = new Fuse(postData, {
            keys: ['described'],
        });

        // Perform the search using Fuse
        const fuseResults = fuse.search(keyword);

        // Filter the results further using Regex
        const regexResults = fuseResults.filter(result => {
            const regex = new RegExp(`(?=\\b${keyword.split(' ').join('\\b)(?=.*\\b')}\\b)`, 'i');
            return regex.test(result.item.described);
        });

        const mapResult = (element) => {
            return {
                id: element.item._id,
                name: element.item.described,
                image: element.item.image.map((elementImage) => ({
                    url: elementImage.url,
                })),
                video: element.item.video,
                feel: (
                    element.item.kudos_list.length +
                    element.item.disappointed_list.length
                ).toString(),
                mark_comment: (
                    element.item.comment_list.length +
                    element.item.mark_list.length
                ).toString(),
                is_felt: '0',
                author: {
                    id: element.item.author.id.toString('hex'),
                    username: element.item.author.username,
                    avatar: element.item.author.avatar,
                },
                described: element.item.described,
            };
        };

        // Return the sorted results
        res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: regexResults.map(mapResult),
        });

        // Cập nhật danh sách tìm kiếm đã lưu của người dùng
        await User.findByIdAndUpdate(
            _id,
            {
                $pull: {
                    savedSearch: {
                        keyword: keyword,
                    },
                },
            },
            { new: true }
        );

        await User.findByIdAndUpdate(
            _id,
            {
                $push: {
                    savedSearch: {
                        keyword: keyword,
                        created: Date.now(),
                    },
                },
            },
            { new: true }
        );
    } catch (error) {
        if (error.message == 'params') {
            return res.status(500).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID,
            });
        } else if (error.message == 'nodata') {
            return res.status(500).json({
                code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
                message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA,
            });
        } else {
            return res.status(500).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            });
        }
    }
}; */
const get_saved_search = async (req, res) => {
    var { token, index, count } = req.query;
    const { _id } = req.userDataPass;
    // check params
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
        var userData = req.userDataPass;

        if (!userData) {
            throw Error('nodata');
        } else {
            const uniqueKeywords = {};
            const uniqueSavedSearch = [];

            userData.savedSearch
                .sort((a, b) => b.created - a.created)
                .slice(Number(index), Number(index) + Number(count))
                .forEach(({ _id, keyword, created }) => {
                    if (!uniqueKeywords[keyword]) {
                        uniqueKeywords[keyword] = true;
                        uniqueSavedSearch.push({
                            id: _id,
                            keyword: keyword,
                            created: created,
                        });
                    }
                });

            return res.status(200).json({
                code: statusCode.OK,
                message: statusMessage.OK,
                data: uniqueSavedSearch,
            });
        }
        /* return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: userData.savedSearch
                .sort((a, b) => b.created - a.created)
                .slice(Number(index), Number(index) + Number(count))
                .map(({ _id, keyword, created }) => ({
                    id: _id,
                    keyword: keyword,
                    created: created,
                })),
        }); */
    } catch (error) {
        if (error.message == 'params') {
            return res.status(200).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID,
            });
        } else if (error.message == 'nodata') {
            return res.status(200).json({
                code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
                message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA,
            });
        } else {
            return res.status(200).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            });
        }
    }
};

const del_saved_search = async (req, res) => {
    var { token, search_id, all } = req.query;
    const { _id } = req.userDataPass;
    const userDataIndex = req.userDataPass.savedSearch.findIndex(
        (i) => i.id === search_id
    );

    // check params
    if (isNaN(all)) {
        all = 0;
    }
    try {
        const userData = req.userDataPass.savedSearch.find(
            (i) => i.id === search_id
        );
        if (Number(all) == 1) {
            await User.findByIdAndUpdate(_id, {
                $set: {
                    savedSearch: [],
                },
            });

            if (req.userDataPass.savedSearch.length === 0) {
                throw Error('nodata');
            }

            return res.status(200).json({
                code: statusCode.OK,
                message: statusMessage.OK,
            });
        } else if (Number(all) == 0 && search_id) {
            if (!userData) {
                return res.status(500).json({
                    code: statusCode.PARAMETER_VALUE_IS_INVALID,
                    message: statusMessage.PARAMETER_VALUE_IS_INVALID,
                });
            }

            await User.findByIdAndUpdate(_id, {
                $pull: {
                    savedSearch: {
                        _id: search_id,
                    },
                },
            });

            return res.status(200).json({
                code: statusCode.OK,
                message: statusMessage.OK,
            });
        } else {
            throw Error('params');
        }
    } catch (error) {
        if (error.message == 'params') {
            return res.status(200).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID,
            });
        } else if (error.message == 'nodata') {
            return res.status(200).json({
                code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
                message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA,
            });
        } else {
            return res.status(200).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            });
        }
    }
};
const getListPosts = async (req, res) => {
    try {
        let { user_id, index, count, last_id } = req.query;

        // Parameter validation
        if (!index || !count) {
            return res.status(400).json({
                code: statusCode.PARAMETER_IS_NOT_ENOUGH,
                message: statusMessage.PARAMETER_IS_NOT_ENOUGH,
            });
        }

        // Parse index and count to ensure they are integers
        index = parseInt(index);
        count = parseInt(count);

        if (isNaN(index) || isNaN(count) || index < 0 || count < 0) {
            return res.status(400).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID,
            });
        }

        // Default values for index and count
        index = index || 0;
        count = count || 20;

        // Fetch posts based on user_id or user's friends
        let resultData;

        if (user_id) {
            resultData = await User.findById(user_id).populate({
                path: 'postIds',
                populate: {
                    path: 'author',
                    select: 'username avatar',
                    populate: {
                        path: 'comment_list',
                        populate: {
                            path: 'poster',
                            select: 'username avatar',
                        },
                    },
                },
                options: {
                    sort: {
                        created: -1,
                    },
                },
            });
        } else {
            const result = await User.findById(req.userDataPass._id).populate({
                path: 'friends',
                select: 'postIds',
                populate: {
                    path: 'postIds',
                    populate: {
                        path: 'author',
                        select: 'avatar username coins',
                    },
                    options: {
                        sort: {
                            created: -1,
                        },
                    },
                },
            });

            resultData = [].concat(...result.friends.map((e) => e.postIds));
        }

        console.log('resultData.postIds.author', resultData);

        var newItems = 0;

        const lastIdIndex = resultData.postIds.findIndex(
            (element) => element._id == last_id
        );

        if (lastIdIndex !== -1) {
            newItems = lastIdIndex;
        }

        // Manipulate post data
        const resultArray = resultData.postIds
            .slice(index, index + count)
            .map((element) => {
                // Check if the author is blocked
                var is_blocked;
                if (resultData.blockedIds?.includes(element._id)) {
                    is_blocked = '1';
                } else {
                    is_blocked = '0';
                }

                // Check can edit
                const postDate = new Date(resultData.created);
                const currentDate = Date.now();
                const oneDayInMillis = 24 * 60 * 60 * 1000;

                var isPostOverOneDay = false;

                if (currentDate - postDate > oneDayInMillis) {
                    isPostOverOneDay = true;
                }

                var can_edit;
                if (isPostOverOneDay === true && resultData.coins >= 4) {
                    can_edit = '1';
                } else if (isPostOverOneDay === false) {
                    can_edit = '1';
                } else {
                    can_edit = '0';
                }

                // Construct the post object
                return {
                    id: element._id,
                    name: element.described,
                    image: element.image.map((elementImage) => ({
                        url: elementImage.url,
                    })),
                    video: element.video,
                    described: element.described,
                    created: element.created,
                    feel: (
                        element.kudos_list.length +
                        element.disappointed_list.length
                    ).toString(),
                    comment_mark: (
                        element.comment_list.length + element.mark_list.length
                    ).toString(),
                    is_felt: '0',
                    is_blocked: is_blocked,
                    can_edit: can_edit,
                    banned: '0',
                    status: element.status,
                    author: {
                        id: element.author.id,
                        username: element.author.username,
                        avatar: element.author.avatar,
                    },
                };
            });

        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: {
                post: resultArray,
                new_items: newItems,
                last_id: resultData.postIds[0]._id,
            },
        });
    } catch (error) {
        if (error.message === 'params') {
            return res.status(400).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID,
            });
        } else if (error.message === 'nodata') {
            return res.status(404).json({
                code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
                message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA,
            });
        } else {
            console.error(error);
            return res.status(500).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            });
        }
    }
};

const getListVideo = async (req, res) => {
    try {
        let { last_id, user_id, index, count } = req.query;

        // Parameter validation
        if (!index || !count) {
            return res.status(400).json({
                code: statusCode.PARAMETER_IS_NOT_ENOUGH,
                message: statusMessage.PARAMETER_IS_NOT_ENOUGH,
            });
        }

        // Parse index and count to ensure they are integers
        index = parseInt(index);
        count = parseInt(count);

        if (isNaN(index) || isNaN(count) || index < 0 || count < 0) {
            return res.status(400).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID,
            });
        }

        // Default values for index and count
        index = index || 0;
        count = count || 20;

        // Fetch posts based on user_id or user's friends
        let resultData;

        if (user_id) {
            resultData = await User.findById(user_id).populate({
                path: 'postIds',
                populate: {
                    path: 'author',
                    select: 'username avatar',
                    populate: {
                        path: 'comment_list',
                        populate: {
                            path: 'poster',
                            select: 'username avatar',
                        },
                    },
                },
                options: {
                    sort: {
                        created: -1,
                    },
                },
            });
        } else {
            const result = await User.findById(req.userDataPass._id).populate({
                path: 'friends',
                select: 'postIds',
                populate: {
                    path: 'postIds',
                    populate: {
                        path: 'author',
                        select: 'avatar username coins',
                    },
                    options: {
                        sort: {
                            created: -1,
                        },
                    },
                },
            });

            resultData = [].concat(...result.friends.map((e) => e.postIds));
        }

        var newItems = 0;

        const lastIdIndex = resultData.postIds.findIndex(
            (element) => element._id == last_id
        );

        if (lastIdIndex !== -1) {
            newItems = lastIdIndex;
        }

        // Manipulate post data
        const resultArray = resultData.postIds
            .slice(index, index + count)
            .filter((element) => {
                return element.video != '{}';
            })
            .map((element) => {
                // Check if the author is blocked
                var is_blocked;
                if (resultData.blockedIds?.includes(element._id)) {
                    is_blocked = '1';
                } else {
                    is_blocked = '0';
                }

                // Check can edit
                const postDate = new Date(resultData.created);
                const currentDate = Date.now();
                const oneDayInMillis = 24 * 60 * 60 * 1000;

                var isPostOverOneDay = false;

                if (currentDate - postDate > oneDayInMillis) {
                    isPostOverOneDay = true;
                }

                var can_edit;
                if (isPostOverOneDay === true && resultData.coins >= 4) {
                    can_edit = '1';
                } else if (isPostOverOneDay === false) {
                    can_edit = '1';
                } else {
                    can_edit = '0';
                }
                //if (element.video == "{}") {return;}

                // Construct the post object
                return {
                    id: element._id,
                    name: element.described,
                    image: element.image.map((elementImage) => ({
                        url: elementImage.url,
                    })),
                    video: element.video,
                    described: element.described,
                    created: element.created,
                    feel: (
                        element.kudos_list.length +
                        element.disappointed_list.length
                    ).toString(),
                    comment_mark: (
                        element.comment_list.length + element.mark_list.length
                    ).toString(),
                    is_felt: '0',
                    is_blocked: is_blocked,
                    can_edit: can_edit,
                    banned: '0',
                    status: element.status,
                    author: {
                        id: element.author.id,
                        username: element.author.username,
                        avatar: element.author.avatar,
                    },
                };
            });
        return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: {
                post: resultArray,
                new_items: newItems.toString(),
                last_id: resultData.postIds[0]._id,
            },
        });
    } catch (error) {
        if (error.message === 'params') {
            return res.status(400).json({
                code: statusCode.PARAMETER_VALUE_IS_INVALID,
                message: statusMessage.PARAMETER_VALUE_IS_INVALID,
            });
        } else if (error.message === 'nodata') {
            return res.status(404).json({
                code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
                message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA,
            });
        } else {
            console.error(error);
            return res.status(500).json({
                code: statusCode.UNKNOWN_ERROR,
                message: statusMessage.UNKNOWN_ERROR,
            });
        }
    }
};

module.exports = {
    addPost,
    getPost,
    getListPosts,
    editPost,
    deletePost,
    reportPost,
    feel,
    like,
    deletePostAll,
    search,
    get_saved_search,
    del_saved_search,
    getListVideo,
};
