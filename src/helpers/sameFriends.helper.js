require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/user.model");
let sameFriends = (friends, user_id) => {
  return new Promise(async (resolve, reject) => {
    var result = await User.findById(user_id).select("username avatar friends");
    var count = 0;
    result.friends.forEach((element) => {
      if (friends.includes(element)||(element&&friends.includes(element._id))) {
        count++;
      }
    });
    return resolve({
      _id: result._id,
      username: result.username,
      avatar: result.avatar,
      same_friends: count,
    });
  });
};
module.exports = {
  sameFriends: sameFriends,
};
