/* Trong trường data cần phải có các trường như sau: 
- type: Kiểu notification
- object_id: Phục vụ cho việc chuyển màn hình (id của bài viết)
- title: Nội dung của notification
- notification_id: Id của tin thông báo
- avatar: avatar của người tạo thông báo
- read: trạng thái đã đọc hay chưa*/

import Notification from '../models/notification.model';

const addNotification = async (data) => {
    var typeNoti = data.type;
    if (typeNoti === 'post') {
    }
    var newNotification = await new Notification({
        type: data.type || null,
        object_id: data.notificationId || null,
        title: data.username + ' đã thêm một bài viết mới' || null,
        notification_id: data.notificationId || null,
        created: Date.now(),
        avatar: type.avatar || null,
        group: '1',
        read: '0',
        lastUpdate: data.lastUpdate,
        userId: _id,
    }).save();

    return newNotification;
};

module.export = addNotification;
