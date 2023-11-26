const Notification = require('../models/notification.model');

const addNotification = async (data, _id) => {
    try {
        const { notificationType, postId, username, lastUpdate, avatar } = data;

        if (!notificationType || !postId || !username || !lastUpdate) {
            throw new Error('Missing required fields in data');
        }

        let title;
        if (notificationType === 'post') {
            title = `${username} đã thêm một bài viết mới`;
        } else if (notificationType === 'comment') {
            title = `${username} đã thêm một bình luận mới`;
        } else {
            throw new Error('Invalid notification type');
        }

        const newNotification = new Notification({
            type: notificationType,
            object_id: postId,
            title,
            created: Date.now(),
            avatar: avatar || null, // Use data.avatar instead of type.avatar
            group: '0',
            read: '0',
            last_update: lastUpdate,
            userId: _id,
        });

        await newNotification.save();

        return newNotification;
    } catch (error) {
        console.error(error);
        throw error; // Rethrow the error for handling at a higher level
    }
};

module.exports = { addNotification };
