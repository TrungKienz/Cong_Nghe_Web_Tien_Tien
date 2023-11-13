// Cấu hình từng controller tương ứng
const User = require("../models/user.model.js");

const cloudHelper = require("../helpers/cloud.helper.js");
const statusCode = require("./../constants/statusCode.constant.js");
const statusMessage = require("./../constants/statusMessage.constant.js");
const md5 = require("md5");

const logout = async (req, res) => {
  const { token } = req.query;
  const { _id } = req.userDataPass;
  try {
    var userData = await User.findByIdAndUpdate(_id, {
      $set: {
        token: null
      }
    });
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: userData,
    })
  } catch (error) {
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR,
      })
  }
}

const changeInfoAfterSignup = async (req, res) => {
  const { _id } = req.userDataPass;
  const { username } = req.query;
  // username
  const avatar = req.files['avatar'];
  const timeCurrent = Date.now();
  try {
    if (!username) {
      throw Error("PARAMETER_VALUE_IS_INVALID")
    }
    else {
      if(avatar){
        if (avatar[0].size > 1024 * 1024 * 4) { 
          console.log("quá 4mb dung lượng tối đa cho phép");
          return res.status(200).json({
            code: statusCode.FILE_SIZE_IS_TOO_BIG,
            message: statusMessage.FILE_SIZE_IS_TOO_BIG
          })
        }
        const typeFile = avatar[0].originalname.split(".")[1]; //tách lấy kiểu của file mà người dùng gửi lên
        if (!(typeFile == "jpg" || typeFile == "jpeg" || typeFile == "png")) { //không đúng định dạng
          console.log("File không đúng định dạng");
          return res.status(200).json({
            code: statusCode.FILE_SIZE_IS_TOO_BIG,
            message: statusMessage.FILE_SIZE_IS_TOO_BIG
          })
        }
        const result = await cloudHelper.upload(avatar[0], 'avatar'); //lưu và đổi tên file
        // update tên user và đường dẫn avatar, thời gian sửa đổi
        await User.findOneAndUpdate(
          {_id: _id},
          {
            $set: {
              avatar: result.url,
              username: username
            }
            
          }
        )
        return res.status(200).json({
          code: statusCode.OK,
          message: statusMessage.OK,
          data: {
            id: _id,
            username: username,
            email: username,
            created: Date(timeCurrent),
            avatar: result.url,
          },
        });
      }else{
        return res.status(200).json({
          code: statusCode.OK,
          message: statusMessage.OK,
          data: {
            id: _id,
            username: username,
            email: username,
            created: Date(timeCurrent),
            avatar: req.userDataPass.avatar,
          },
        });
      }


    }
  } catch (error) {
    console.error(error.message);
    if (error.message == "PARAMETER_VALUE_IS_INVALID") {
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID
      })
    }else if (error.message == "FILE_SIZE_IS_TOO_BIG") {
      return res.status(200).json({
        code: statusCode.FILE_SIZE_IS_TOO_BIG,
        message: statusMessage.FILE_SIZE_IS_TOO_BIG
      })
    } else {
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR
      })
    }
  }


};

const changePassword = async (req, res) => {
  const { token, password, new_password } = req.query;
  const { _id } = req.userDataPass;
  try {
    if (!token || !password || !new_password) {
      throw Error('Missing parameter');
    } else {
      const userData = await User.findOne({ _id });
        if (userData) {
          // tìm được user có trong hệ thống
          const hashedPassword = md5(password);// mã hoá password
          if (hashedPassword == userData.password) {
            // kiểm tra password
            User.findOneAndUpdate(
                { token },
                {
                  $set: {
                    password: md5(new_password),
                  },
                });
            return res.status(200).json({
              code: statusCode.OK,
              message: statusMessage.OK,
              data: {
                id: userData._id,
                username: userData.email,
                coins: userData.coins,
              },
            });
          } else {
            // password không hợp lệ
            console.log("password không hợp lệ")
            return res.status(200).json({
              code: statusCode.USER_IS_NOT_VALIDATED,
              message: statusMessage.USER_IS_NOT_VALIDATED,
            });
          }
        } else {
          // phonenumber chưa được đăng kí
          console.log("email chưa được đăng kí")
          res.status(200).json({
            code: statusCode.USER_IS_NOT_VALIDATED,
            message: statusMessage.USER_IS_NOT_VALIDATED,
        
          });
        }
    }

  

    

    // Update the password
    User.password = md5(new_password);
    await User.save();

    return res.status(200).json({
      code: statusCode.SUCCESS,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.log(error);
    if (error.message === 'Missing parameter' || error.message === 'Invalid token' || error.message === 'Invalid password') {
      return res.status(400).json({
        code: statusCode.BAD_REQUEST,
        message: error.message
      });
    } else {
      return res.status(500).json({
        code: statusCode.INTERNAL_SERVER_ERROR,
        message: statusMessage.INTERNAL_SERVER_ERROR
      });
    }
  }
};


module.exports = {
  logout,
  changeInfoAfterSignup,
  changePassword
}