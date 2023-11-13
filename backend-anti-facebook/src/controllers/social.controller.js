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
    //#region check params
    if (!(user_id !== undefined)) // Check if params are provided
    {
      throw ({code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
        message: statusMessage.PARAMETER_IS_NOT_ENOUGHT + " - Missing user_id"})
    }

    if (user_id.toString() == _id.toString())
    {
      throw ({code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID + " - User cannot send request to themself"})
    }
    let totalRequestsSent = 0

    //#endregion

    //#region Update user
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
      totalRequestsSent = newArr.length
      if (!check_array_contains(newArr, user_id))
      {
        const _requestInfo = {
          _id : user_id,
          created : new Date()
        }
        totalRequestsSent += 1
        ownerData.sendRequestedFriends.push(_requestInfo) // Save sent friend request
        await ownerData.save()
      }
    })
    
    //#endregion
 
    //#region Update target friend
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
        const _requestInfo = {
          _id : _id.toString(),
          created : new Date()
        }

        //console.log(!check_array_contains(newArr, _requestInfo))
        targetData.requestedFriends.push(_requestInfo) // Save sent friend request
        await targetData.save()
      }
    })
    //targetData.requestedFriends.push(_id) // Save received friend request
    //targetData.requestedFriends.pop()
    //#endregion
    
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: {requested_friends: totalRequestsSent},
    })
  } catch (error) {
      return res.status(200).json({
        code: error.code,
        message: error.message,
      })
  }
}

const getListOfFriendSuggestions = async (req, res) => {
  const { _id } = req.userDataPass;
  let {index, count } = req.query;// gửi bằng query params
  //const { _id } = req.userDataPass;
  try {

    //#region params check
    if (!(index !== undefined) || !(count !== undefined)) // Check if params are provided
    {
      throw ({code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
        message: statusMessage.PARAMETER_IS_NOT_ENOUGHT + " - Missing index or count"})
    }

    if (isNaN(+index) || isNaN(+count)) // Check if params are of number type
    {
      throw ({code: statusCode.PARAMETER_TYPE_IS_INVALID,
        message: statusMessage.PARAMETER_TYPE_IS_INVALID + " - index or count is not a number"})
    }

    const ownerData = await User.findOne({ _id: _id })
    if (!ownerData) //For some reason cannot find user in db
    {
      throw ({code: statusCode.USER_IS_NOT_VALIDATED,
        message: statusMessage.USER_IS_NOT_VALIDATED})
    }
    //#endregion

    //#region get list of all users
    let newList = []
    //const filter = { settings.}
    const usersData = await User.find().select('username friends').exec();
    if (!usersData) //For some reason cannot find any user
    {
      throw ({code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
        message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA})
    }

    usersData.forEach(user => {
      const same_friends_count = count_same_friends(user, ownerData)
      user = user.toObject() // ew
      user.same_friends = same_friends_count
      delete user.friends
      if (user._id.toString() != _id.toString()) //Exclude the user's id
      {
        newList.push(user)
      }
    });
    //#endregion

    //#region adjust list with index and count
    newList = shuffle(newList)

    if (index > newList.length -1)
    {
      throw ({code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID + " - Provided index is out of range"})
    }

    newList = newList.slice(index)

    count = Math.min(count, newList.length)
    newList = newList.slice(0, count)
    //#endregion

    return res.status(200).json({
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

const getListOfFriendRequests = async (req, res) => {
  const { _id } = req.userDataPass;
  let {index, count } = req.query;// gửi bằng query params
  //const { _id } = req.userDataPass;
  try {

    //#region params check
    if (!(index !== undefined) || !(count !== undefined)) // Check if params are provided
    {
      throw ({code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
        message: statusMessage.PARAMETER_IS_NOT_ENOUGHT + " - Missing index or count"})
    }

    if (isNaN(+index) || isNaN(+count)) // Check if params are of number type
    {
      throw ({code: statusCode.PARAMETER_TYPE_IS_INVALID,
        message: statusMessage.PARAMETER_TYPE_IS_INVALID + " - index or count is not a number"})
    }
    //#endregion

    //#region get full list of all users
    let newList = []
    let infoArr = []

    let user = await User.findOne({ _id: _id })

    let arr = user.requestedFriends.toObject()
    arr.forEach(request => {
      infoArr.push({
        _id : request._id.toString(),
        created :  request.created,
        //created :  changeTimeZone(request.created, "Asia/Bangkok")
      })
    })

    for(i = 0; i < infoArr.length; i++)
    {
      let _userInfo = await User.findOne({ _id: infoArr[i]._id }).select('username avatar friends')
      const same_friends_count = count_same_friends(_userInfo, user)
      _userInfo = _userInfo.toObject()
      _userInfo.created = infoArr[i].created
      _userInfo.same_friends = same_friends_count 
      delete _userInfo.friends
      newList.push(_userInfo)
    }
    //#endregion
    
    //#region adjust list with index and count


    if (index > newList.length -1 && newList.length > 0)
    {
      throw ({code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID + " - Provided index is out of range"})
    }

    newList = newList.slice(index)

    count = Math.min(count, newList.length)
    newList = newList.slice(0, count)
    //#endregion

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

const getListOfUserFriends = async (req, res) => {
  const { _id } = req.userDataPass;
  let {index, count, user_id } = req.query;
  //const { _id } = req.userDataPass;
  try {

    //#region params check
    if (!(index !== undefined) || !(count !== undefined)) // Check if params are provided
    {
      throw ({code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
        message: statusMessage.PARAMETER_IS_NOT_ENOUGHT + " - Missing index or count"})
    }

    if (isNaN(+index) || isNaN(+count)) // Check if params are of number type
    {
      throw ({code: statusCode.PARAMETER_TYPE_IS_INVALID,
        message: statusMessage.PARAMETER_TYPE_IS_INVALID + " - index or count is not a number"})
    }
    //#endregion

    //#region get full list of all users
    let newList = []
    let infoArr = []

    let targetId = user_id? user_id : _id //Get friends list from either user or provided user_id
    let user = await User.findOne({ _id: targetId })

    let arr = user.friends.toObject()
    arr.forEach(request => {
      infoArr.push({
        _id : request._id.toString(),
        created :  request.created,
        //created :  changeTimeZone(request.created, "Asia/Bangkok")
      })
    })

    for(i = 0; i < infoArr.length; i++)
    {
      let _userInfo = await User.findOne({ _id: infoArr[i]._id }).select('username avatar friends')
      const same_friends_count = count_same_friends(_userInfo, user)
      _userInfo = _userInfo.toObject()
      _userInfo.created = infoArr[i].created
      _userInfo.same_friends = same_friends_count 
      delete _userInfo.friends
      newList.push(_userInfo)
    }
    //#endregion
    
    //#region adjust list with index and count


    if (index > newList.length -1 && newList.length > 0)
    {
      throw ({code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID + " - Provided index is out of range"})
    }

    newList = newList.slice(index)

    count = Math.min(count, newList.length)
    newList = newList.slice(0, count)
    //#endregion

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

const getListOfBlockedUsers = async (req, res) => {
  const { _id } = req.userDataPass;
  let {index, count } = req.query;// gửi bằng query params
  //const { _id } = req.userDataPass;
  try {

    //#region params check
    if (!(index !== undefined) || !(count !== undefined)) // Check if params are provided
    {
      throw ({code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
        message: statusMessage.PARAMETER_IS_NOT_ENOUGHT + " - Missing index or count"})
    }

    if (isNaN(+index) || isNaN(+count)) // Check if params are of number type
    {
      throw ({code: statusCode.PARAMETER_TYPE_IS_INVALID,
        message: statusMessage.PARAMETER_TYPE_IS_INVALID + " - index or count is not a number"})
    }
    //#endregion

    //#region get full list of all users
    let newList = []
    let infoArr = []

    let user = await User.findOne({ _id: _id })

    let arr = user.blockedIds.toObject()
    arr.forEach(request => {
      infoArr.push({
        _id : request._id.toString(),
        created :  request.created,
        //created :  changeTimeZone(request.created, "Asia/Bangkok")
      })
    })

    for(i = 0; i < infoArr.length; i++)
    {
      let _userInfo = await User.findOne({ _id: infoArr[i]._id }).select('username avatar friends')
      const same_friends_count = count_same_friends(_userInfo, user)
      _userInfo = _userInfo.toObject()
      _userInfo.created = infoArr[i].created
      _userInfo.same_friends = same_friends_count 
      delete _userInfo.friends
      newList.push(_userInfo)
    }
    //#endregion
    
    //#region adjust list with index and count


    if (index > newList.length -1 && newList.length > 0)
    {
      throw ({code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID + " - Provided index is out of range"})
    }

    newList = newList.slice(index)

    count = Math.min(count, newList.length)
    newList = newList.slice(0, count)
    //#endregion

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

const processFriendRequest = async (req, res) => {
  const { _id } = req.userDataPass;
  const {user_id, is_accept} = req.query //target's id
  try {
    //#region params check
    if (!(user_id !== undefined) || !(is_accept !== undefined)) // Check if params are provided
    {
      throw ({code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
        message: statusMessage.PARAMETER_IS_NOT_ENOUGHT + " - Missing user_id or is_accept"})
    }

    if (!check_array_contains([0,1], +is_accept))
    {
      throw ({code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID + " - is_accept must be either 0 or 1"})
    }

    const ownerData = await User.findOne({ _id: _id })
    if (!ownerData) //For some reason cannot find user in db
    {
      throw ({code: statusCode.USER_IS_NOT_VALIDATED,
        message: statusMessage.USER_IS_NOT_VALIDATED})
    }
    //#endregion
    
    //#region Check if friend request exists
    let listOfFriendRequests = ownerData.requestedFriends.toObject()
    let isFriendRequestExist = false
    listOfFriendRequests.forEach(fr => {
      if (fr._id.toString() == user_id.toString())
      {
        isFriendRequestExist = true
      }
    });

    if (!isFriendRequestExist)
    {
      throw ({code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID + ` - Friend request from user_id ${user_id} does not exist from user's db.`})
    }

    const targetData = await User.findOne({ _id: user_id })
    if (!targetData) //For some reason cannot find target
    {
      throw ({code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
        message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA})
    }

    let listOfSentFriendRequest = targetData.sendRequestedFriends.toObject()
    let isFriendRequestExistOnTarget = false
    listOfSentFriendRequest.forEach(fr => {
      if (fr._id.toString() == _id.toString())
      {
        isFriendRequestExistOnTarget = true
      }
    });
    if (!isFriendRequestExistOnTarget)
    {
      throw ({code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID + ` - Friend request from user_id ${user_id} does not exist from target's db.`})
    }
    //#endregion

    //#region proceed request
    if(is_accept) //Add to friends list
    {
      ownerData.friends.push({
        _id : user_id,
        created : new Date()
      })
      targetData.friends.push({
        _id : _id,
        created : new Date()
      })
    }
    //Remove friend requests
    ownerData.requestedFriends.pull({_id : user_id})
    targetData.sendRequestedFriends.pull({_id : _id})

    //save to db
    ownerData.save()
    targetData.save()

    //#endregion


    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
    })
  } catch (error) {
      return res.status(200).json({
        code: error.code,
        message: error.message,
      })
  }
}

//#region Common functions

function count_same_friends(user1, user2) //returns an int
{
  const friendlist1 = user1.friends.toObject()
  const friendlist2 = user2.friends.toObject()
  let friendsID_arr1 = []
  let friendsID_arr2 = []

  friendlist1.forEach(friend => {
    friendsID_arr1.push(friend._id.toString())
  });

  friendlist2.forEach(friend => {
    friendsID_arr2.push(friend._id.toString())
  });

  return count_common(friendsID_arr1, friendsID_arr2)
}

function count_common(array1, array2) 
{
  let bit1 = 0;
  let bit2 = 0;
  let bit3 = 0;
 
    // Traverse the first array 
    for (var i = 0; i < array1.length; i++)
    {
        // Set 1 at (index)position a[i]
        bit1 = bit1 | (1<<array1[i]);
    }
    // Traverse the second array 
    for (var i = 0; i < array2.length; i++)
    {
 
        // Set 1 at (index)position b[i] 
        bit2 = bit2 | (1<<array2[i]);
    }
 
    // Bitwise AND of both the bitsets 
    bit3 = bit1 & bit2; 
 
    // Find the count of 1's 
    var count = bit3.toString(2).split("1").length - 1;
    return count; 
}

function check_array_contains(array, value) // returns a bool
{
  return array.includes(value)
}
function shuffle(array) { // Fisher–Yates shuffle // returns an array
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
function changeTimeZone(date, timeZone) { // returns a Date() object
  if (typeof date === 'string') {
    return new Date(
      new Date(date).toLocaleString('en-US', {
        timeZone,
      }),
    );
  }

  return new Date(
    date.toLocaleString('en-US', {
      timeZone,
    }),
  );
}

//#endregion

module.exports = {
    addFriend,
    getListOfFriendSuggestions,
    getListOfFriendRequests,
    processFriendRequest,
    getListOfUserFriends,
};
