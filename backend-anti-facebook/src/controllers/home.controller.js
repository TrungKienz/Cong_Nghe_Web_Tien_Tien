const dotenv = require("dotenv");
dotenv.config();
// const fs = require("fs");
// const formidable = require("formidable");
// const { getVideoDurationInSeconds } = require("get-video-duration");
// const mongoose = require("mongoose");

const Post = require("../models/post.model.js");
const User = require("../models/user.model.js");
const ReportPost = require("../models/report.post.model.js");
const Comment = require("../models/comment.model");
const Notification = require("../models/notification.model");
const formidableHelper = require("../helpers/formidable.helper");
const cloudHelper = require("../helpers/cloud.helper.js");

const statusCode = require("./../constants/statusCode.constant.js");
const statusMessage = require("./../constants/statusMessage.constant.js");
const { Mongoose } = require("mongoose");

const getListPosts = async (req, res) => {
  var {
    token,
    user_id,
    in_campaign,
    camaign_id,
    latitude,
    longitude,
    last_id,
    index,
    count,
  } = req.query;
  const { _id } = req.userDataPass;
  // check params
  if(!index || !count){
    return res.status(200).json({
      code: statusCode.PARAMETER_IS_NOT_ENOUGHT,
      message: statusMessage.PARAMETER_IS_NOT_ENOUGHT,
    });
  }
  try{
    index = parseInt(index);
    count = parseInt(count);
  }catch (e) {
    return res.status(200).json({
      code: statusCode.PARAMETER_TYPE_IS_INVALID,
      message: statusMessage.PARAMETER_TYPE_IS_INVALID,
    });
  }
  if(isNaN(index) || isNaN(count)){
    return res.status(200).json({
      code: statusCode.PARAMETER_TYPE_IS_INVALID,
      message: statusMessage.PARAMETER_TYPE_IS_INVALID,
    });
  }
  if(index < 0 || count < 0){
    return res.status(200).json({
      code: statusCode.PARAMETER_VALUE_IS_INVALID,
      message: statusMessage.PARAMETER_VALUE_IS_INVALID,
    });
  }
  try {
    // if (index || !count) {
    //   // throw Error("params");
    //   index = 0;
    //   count = 20;
    // }
    console.log(index, count)
    if(index==null||index=="") index=0;
    if(count==null||count=="") count=20;
    if(user_id){
      var resultData = await User.findById(user_id).populate({
        path: "postIds",
        populate: {
          path: "author",
          select: "username avatar",
          populate: {
            path: "comment_list",
            populate:{
              path: "poster",
              select: "username avatar"
            },
            
            // select: "username avatar",
          },
          populate: {
            path: "like_list",
            select: "username avatar"
          },
        },
        
        options: {
          sort: {
            created: -1,
          },
        },
      });
      resultData.postIds.map(e=>{
        e.is_liked= e.like_list.includes(_id);
      })
      
      // await (resultData.postIds.slice(Number(index),Number(index)+Number(count))).map(element => {
      //   return res.status(200).json({
      //     code: statusCode.OK,
      //     message: statusMessage.OK,
      //     data: {
      //       id: element._id,
      //       name: null, 
      //       image: element.image,
      //     }, 
      //   })
      // });
      // console.log(result)
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: resultData.postIds.slice(Number(index),Number(index)+Number(count)),  
      })
    }


    var result = await User.findById(_id).populate({
      path: "friends",
      select: "postIds",
      populate: {
        path: "postIds",
        populate: {
          path: "author",
          select: "avatar username",
        },
        options: {
          sort: {
            created: -1,
          },
        },
      },
    });
    var postRes = [];
    result.friends.map((e, index) => {
      // console.log(e.postIds);
      var temp=e.postIds;
      console.log(temp)
      
      temp.map(e2=>{
        if(e2.like_list){
          e2.is_liked=e2.like_list.includes(_id);
        }
      })
      postRes = postRes.concat(temp);
    });
    if (postRes.length==0) {
      throw Error("nodata");
    }
    function checkAdult(post) {
      return post._id == last_id;
    }
    var findLastIndex = postRes.findIndex(checkAdult);
    var new_items = 0;
    var newLastIndex;
    if (findLastIndex == -1) {
      new_items = postRes.length;
      // newLastIndex
    } else {
      new_items = findLastIndex;
    }
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: {
        posts: postRes.slice(Number(index),Number(index)+ Number(count)),
        last_id: postRes[0]._id,
        new_items: findLastIndex,
      },
    });
  } catch (error) {
    if (error.message == "params") {
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID,
      });
    } else if (error.message == "nodata") {
      return res.status(200).json({
        code: statusCode.NO_DATA_OR_END_OF_LIST_DATA,
        message: statusMessage.NO_DATA_OR_END_OF_LIST_DATA,
      });
    } else {
      console.log(error);
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR,
      });
    }
  }
};

const checkNewItem = async (req, res) => {
  const { last_id, category_id } = req.query;
  const { _id } = req.userDataPass;
  try {
    var result = await User.findById(_id).populate({
      path: "friends",
      select: "postIds",
      populate: {
        path: "postIds",
        // populate: {
        //   path: "author",
        //   select: "avatar username",
        // },
        options: {
          sort: {
            created: -1,
          },
        },
      },
    });
    var postRes = [];
    result.friends.map((e, index) => {
      postRes = postRes.concat(e.postIds);
      // console.log(postRes)
    });
    function checkAdult(post) {
      return post._id == last_id;
    }
    var findLastIndex = postRes.findIndex(checkAdult);
    var new_items = 0;
    var newLastIndex;
    if (findLastIndex == -1) {
      new_items = postRes.length;
      // newLastIndex
    } else {
      new_items = findLastIndex;
    }
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: {
        // posts: postRes.slice(index, index + count),
        // last_id: postRes[0]._id,
        new_items: new_items,
      },
    });
  } catch (error) {
    if (error.message == "params") {
      return res.status(200).json({
        code: statusCode.PARAMETER_VALUE_IS_INVALID,
        message: statusMessage.PARAMETER_VALUE_IS_INVALID,
      });
    } else {
      return res.status(200).json({
        code: statusCode.UNKNOWN_ERROR,
        message: statusMessage.UNKNOWN_ERROR,
      });
    }
  }
};

module.exports = {
  getListPosts,
  checkNewItem,
};
