// Cấu hình từng controller tương ứng
const User = require("../models/user.model.js");

const cloudHelper = require("../helpers/cloud.helper.js");
const statusCode = require("./../constants/statusCode.constant.js");
const statusMessage = require("./../constants/statusMessage.constant.js");
const { request } = require("express");


const addFriend = async (req, res) => {
  const { _id } = req.userDataPass;
  const {user_id} = req.query //target's id
  try {

    //Update user
    const ownerData = await User.findOne({ _id: _id })
    if (!ownerData) //For some reason cannot find user
    {
      throw ({code: statusCode.USER_IS_NOT_VALIDATED,
        message: statusMessage.USER_IS_NOT_VALIDATED})
    }

    //Check if friend request already exists
    await User.findOne({ _id: _id }).exec(async (err,user) => {
      let newArr = []
      let arr = user.sendRequestedFriends.toObject()
      arr.forEach(request => {
        newArr.push(request._id.toString())
      });
      if (!check_array_contains(newArr, user_id))
      {
        
        ownerData.sendRequestedFriends.push(user_id) // Save sent friend request
        await ownerData.save()
      }
    })
    

 



    //Update target friend
    
    const targetData = await User.findOne({ _id: user_id })
    if (!targetData) //For some reason cannot find target
    {
      throw ({code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
        message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA})
    }
    await User.findOne({ _id: user_id }).exec(async (err,user) => {
      let newArr = []
      let arr = user.requestedFriends.toObject()
      arr.forEach(request => {
        newArr.push(request._id.toString())
      });
      if (!check_array_contains(newArr, _id.toString()))
      {
        console.log(!check_array_contains(newArr, _id.toString()))
        targetData.requestedFriends.push(_id) // Save sent friend request
        await targetData.save()
      }
    })
    //targetData.requestedFriends.push(_id) // Save received friend request
    //targetData.requestedFriends.pop()
    
    

    
    


    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: targetData,
    })
  } catch (error) {
      return res.status(200).json({
        code: error.code,
        message: error.message,
      })
  }
}

const getListOfFriendSuggestions = async (req, res) => {
  let { count } = req.query;// gửi bằng query params
  //const { _id } = req.userDataPass;
  try {
    const update = { coins: 1000 };
    let newList = []
    //const filter = { settings.}
    const usersData = await User.find().select('email').exec();
    if (!usersData) //For some reason cannot find any user
    {
      throw ({code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
        message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA})
    }

    usersData.forEach(user => {
      user = user.toObject() // ew
      user.same_friends = 1 // TODO
      newList.push(user)
    });

    newList = shuffle(newList)
    if (count) 
    {
      count = Math.min(count, newList.length)
      newList = newList.slice(0, count)
    }

    return res.status(202).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: newList,
    })
  } catch (error) {
      return res.status(200).json({
        code: error.code,
        message: error.message,
      })
  }
}


//Common functions
function check_array_contains(array, value)
{
  return array.includes(value)
}
function shuffle(array) { // Fisher–Yates shuffle
  let currentIndex = array.length,  randomIndex;
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}


module.exports = {
  addFriend,
  getListOfFriendSuggestions,
}