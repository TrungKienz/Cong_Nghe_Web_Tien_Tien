require("dotenv").config();
const formidable = require("formidable");
const { getVideoDurationInSeconds } = require("get-video-duration");
const statusCode = require("../constants/statusCode.constant");
// const fs = require("fs");
const cloud = require("./cloud.helper");
let parse = (req, postData) => {
  return new Promise(async (resolve, reject) => {
    var imageList = (req.files&& req.files["images[]"])?req.files["images[]"]:[];
    var videoList = (req.files&& req.files.video)?req.files.video:null;
    var numberOfImages = (req.files&& req.files["images[]"])?req.files["images[]"].length:0;
    var numberOfVideos = (req.files&& req.files.video&&req.files.video[0].mimetype.slice(0,5)=="video")?req.files.video.length:0;
    if(!numberOfImages&&!numberOfVideos){
      console.log("khong co anh va video")
      return resolve({type: "{avatar: null, cover_image: null}", data: {}})
    }
    if (numberOfImages>4) {
      console.log("Nhieu hon 4 file image");
      return reject(statusCode.FILE_SIZE_IS_TOO_BIG);
    }
    if (numberOfVideos>1){
      console.log("Nhieu hon 1 file video");
      return reject(statusCode.FILE_SIZE_IS_TOO_BIG);
    }
    if (numberOfImages>0&&numberOfVideos>0){
      console.log("Co ca video lan image");
      return reject(statusCode.FILE_SIZE_IS_TOO_BIG);
    }
    // console.log(imageList)
    function checkAdult(e) {
      return e.size>4*1024*1024;
    }
    var isTooSize = imageList.find(checkAdult);
    if (isTooSize) {
      console.log("file anh qua lon", isTooSize);
      return reject(statusCode.FILE_SIZE_IS_TOO_BIG);
    }
    if (videoList&&videoList[0].size<1024*1024&&videoList[0].size>10*1024*1024) {
      console.log("file video qua lon hoac qua nho");
      return reject(statusCode.FILE_SIZE_IS_TOO_BIG);
    }
    var duration;
    if (videoList) {
      duration = await getVideoDurationInSeconds(videoList[0].path)
    }
    if (duration < 1 || duration > 10) {
      console.log("thời lượng video <1s hoặc lớn hơn 10s");
      return reject(statusCode.FILE_SIZE_IS_TOO_BIG);
    }
    if (numberOfImages>0) {
      resolve({ type: "image", data: imageList });
    }
    if (numberOfVideos>0) {
      resolve({ type: "video", data: videoList?videoList:{avatar: null, cover_image: null} });
    }

  });
};

let parseOld = (req, postData) => {
  // console.log
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      console.log(files);
      console.log(fields);
      // số lượng file phải < 5
      // var file = {};
      var numberOfImages =
        postData && postData.image ? postData.image.length : 0;
      var numberOfVideos =
        postData && postData.video && postData.video.url ? 1 : 0;
      var imageList = [];
      var videoList = [];
      var tempType = "";
      var file = "";
      for (const key in files) {
        if (files.hasOwnProperty(key)) {
          file = files[key];
          tempType = file.type.split("/")[1];
          if (tempType == "jpg" || tempType == "jpeg" || tempType == "png") {
            numberOfImages++;
            if (numberOfImages > 4) {
              console.log("có nhiều hơn 4 file ảnh");
              return reject(statusCode.FILE_SIZE_IS_TOO_BIG);
            }
            if (file.size > 4 * 1024 * 1024) {
              console.log("ảnh có dung lượng hơn 4Mb");
              return reject(statusCode.FILE_SIZE_IS_TOO_BIG);
            }
            imageList.push(file.path);
          } else if (tempType == "mp4" || tempType == "3gp") {
            numberOfVideos++;
            if (numberOfVideos > 2) {
              console.log("có nhiều hơn 1 file video");
              return reject(statusCode.FILE_SIZE_IS_TOO_BIG);
            }
            if (file.size > 10 * 1024 * 1024) {
              // kiem tra file video co hon hon 10MB khong
              console.log("dung lượng file lơn hơn 10Mb");
              return reject(statusCode.FILE_SIZE_IS_TOO_BIG);
            }
            getVideoDurationInSeconds(file.path)
              .then((duration) => {
                if (duration < 1 || duration > 10) {
                  console.log("thời lượng video <1s hoặc lớn hơn 10s");
                  return reject(statusCode.FILE_SIZE_IS_TOO_BIG);
                }
              })
              .catch((err) => {
                if (err) {
                  console.log("lỗi lấy duration");
                  return reject(statusCode.UNKNOWN_ERROR);
                }
              });
            videoList.push(file.path);
          }
        }
      }
      if (numberOfVideos == 1 && numberOfImages == 0) {
        resolve({ type: "video", data: videoList });
      } else if (
        numberOfVideos == 0 &&
        numberOfImages <= 4 &&
        numberOfImages > 0
      ) {
        resolve({ type: "image", data: imageList });
      } else if (numberOfImages == 0 && numberOfImages == 0) {
        resolve({ type: "{avatar: null, cover_image: null}", data: {} });
      } else {
        console.log(
          "không thoả mãn chỉ có 1 video hoặc chỉ có dưới 4 ảnh",
          numberOfImages,
          numberOfVideos
        );
        return reject(statusCode.FILE_SIZE_IS_TOO_BIG);
      }
    });
  });
};
let parseInfo = (req) => {
  console.log(req.files)
  var files = req.files;
  return new Promise(async (resolve, reject) => {
    if (!files||(!files.avatar&&!files.cover_image)) {
      return resolve({avatar: null, cover_image: null});
    }
    if (
      (files.avatar&& files.avatar[0].size > 1024 * 1024 * 4) ||
      (files.cover_image&& files.cover_image[0].size > 1024 * 1024 * 4)
    ) {
      console.log("quá 4mb dung lượng tối đa cho phép");
      return  resolve({avatar: null, cover_image: null});
    }
    if ((files.avatar&&files.avatar[0].mimetype.slice(0,5)!="image")||
    (files.cover_image&&files.cover_image[0].mimetype.slice(0,5)!="image")) {
      console.log("k dung dinh dang anh");
      return  resolve({avatar: null, cover_image: null});
    }
    console.log("-----------------------")
    var resAvatar, resCoverImage; 
    try {
      if (files.avatar) {
        resAvatar = await cloud.upload(files.avatar[0], "image");
      }
      if (files.cover_image) {
        resCoverImage= await cloud.upload(files.cover_image[0], "image");
      }
    } catch (error) {
      console.log(error)
    }
    
    return resolve({ avatar: resAvatar, cover_image: resCoverImage });
  });
};

module.exports = {
  parse: parse,
  parseInfo: parseInfo,
};
