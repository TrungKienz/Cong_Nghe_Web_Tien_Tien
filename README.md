# Cong_Nghe_Web_Tien_Tien

Phát triển API mạng xã hội 

Danh sách 41 API cần được phát triển:
Login, logout, register, get_verify_code, verify_code,  get_list_posts, get_post, post (post), post (patch), post (delete), comment/:postId (get), comment/:postId (post), comment/:postId (delete), report_post, reactions/:postId, search, get_saved_search, del_saved_search, friends (get), get_user_info, user (patch), get_list_videos, user/block (get), user/:userId/block (post), friends/:userId/accept (patch), friends/request (get), friends/:userId/request (post), get_push_settings, set_push_settings, change_password, check_new_version, set_devtoken, get_conversation, delete_message, get_list_conversation, delete_conversation, get_list_suggested_friends, check_new_item, get_notification, set_read_message, set_read_notification, buy_token, transfer_token, deactive_user 


Cấu trúc thư mục và chức năng của từng thư mục:

Constants: Dùng để chứa hoặc cấu hình các biến không thay đổi (hằng số)
Controller: Chưa các lớp điều khiển 
Models: Chứa các lớp biên
Routes: Chứa các cấu hình định tuyến
Helper: Chứa các hàm giao tiếp với các phần mềm bên thứ 3 (third party)
Middlewares: Chứa các hàm xác thực và xác minh người dùng (Dùng để phân quyền và cấp quyền cho người dùng)
Configs: Chứa các cấu hình cơ bản của dự án