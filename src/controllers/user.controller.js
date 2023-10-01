// Cấu hình từng controller tương ứng
const User = require("../models/user.model.js");

const cloudHelper = require("../helpers/cloud.helper.js");
const statusCode = require("./../constants/statusCode.constant.js");
const statusMessage = require("./../constants/statusMessage.constant.js");

const logout = async (req, res) => {
  console.log(req.userDataPass)
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
  const { _id, phonenumber } = req.userDataPass;
  const { username } = req.body;
  // username để trống, chứa các kí tự đặc biệt, trùng với số điện thoại, 
  // nhỏ hơn 6 tí tự hoặc lớn hơn 50 kí tự
  // là đường dẫn, số điện thoại, địa chỉ
  const avatar = req.files['avatar'];
  const timeCurrent = Date.now();
  try {
    if (!username ||
      username.match(/[^a-z|A-Z|0-9]/g) ||
      username === phonenumber ||
      username.lenth < 6 ||
      username.lenth > 50
    ) {
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

        return res.status(200).json({
          code: statusCode.OK,
          message: statusMessage.OK,
          data: {
            id: _id,
            username: username,
            phonenumber: phonenumber,
            created: timeCurrent,
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
            phonenumber: phonenumber,
            created: timeCurrent,
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
module.exports = {
  logout,
  changeInfoAfterSignup,
}