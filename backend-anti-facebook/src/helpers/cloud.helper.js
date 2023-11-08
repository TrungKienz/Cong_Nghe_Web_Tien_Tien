require("dotenv").config();

const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
let upload = (fileUp, type) => {
  var {path}=fileUp;
  return new Promise((resolve, reject) => {
    if (type == "video") {
      cloudinary.uploader
        .upload(path, { resource_type: "video" })
        .then((result) => {
          // console.log(result)
          resolve({url: result.url,
                  thumb: result.url.slice(0, result.url.lastIndexOf("."))+".png"});
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    } else {
      cloudinary.uploader
        .upload(path)
        .then((result) => {
          resolve({url: result.url});
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    }
  });
};
module.exports = {
  upload: upload,
};
