const jwtHelper = require("../helpers/jwt.helper.js");
const User = require("../models/user.model.js");
const statusCode = require("../constants/statusCode.constant.js");
const statusMessage = require("../constants/statusMessage.constant.js");

const accessTokenSecret =
  process.env.ACCESS_TOKEN_SECRET || "accessTokenSecret";

const isAuth = async (req, res, next) => {
  const tokenFromClient =
    req.body.token || req.query.token || req.headers["x-access-token"];
  console.log(tokenFromClient)
  if (tokenFromClient) {
    try {
      console.log("here")
      // if(tokenFromClient)
      const decoded = await jwtHelper.verifyToken(
        tokenFromClient,
        accessTokenSecret
      );
      console.log("decoded", decoded);
      const result = await User.findOne({
        _id: decoded.data._id,
        email: decoded.data.email,
        token: tokenFromClient,
      })
      if (!result) {
        throw Error("Unauthorized. Hacker?")
      }
      else if (result.is_blocked) {
        return res.status(401).json({
          code: statusCode.USER_IS_NOT_VALIDATED,
          message: statusMessage.USER_IS_NOT_VALIDATED,
        })
      }
      // console.log(decoded)
      req.jwtDecoded = decoded;
      req.userDataPass = result;

      next();
    } catch (error) {
      console.log("error",error.message)
      return res.status(401).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID,
        //server: "Lỗi token không hợp lệ"
      });
    }
  } else {
    return res.status(403).json({
      code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
      message: statusMessage.PARAMETER_IS_NOT_ENOUGHT,
      //server: "Lỗi token không hợp lệ"
    });
  }
};
//this is my commets
// No operation will do in here
// And here
// very useless :))))
module.exports = {
  isAuth: isAuth,
};
