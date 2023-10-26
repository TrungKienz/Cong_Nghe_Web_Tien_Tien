require("dotenv").config();
const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

// const ThumbnailGenerator = require('video-thumbnail-generator').default;
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
// const cookieParser = require( 'cookie-parser'
const { OK } = require("./src/constants/statusCode.constant.js");

const database = require('./src/configs/databaseConnection')

const route = require('./src/routes')

route(app);
database.connect();

const port = process.env.PORT || 3000;

app.all("/", (req, res) => {
  res.send("Mạng xã hội CÓ TÍNH PHÍ !!!!!!!!!");
});

app.all("/test", (req, res)=>{
  console.log("Before return")
  res.status(200).json("Test api");
  console.log("After return")
})
chats = [];
rooms = [];
io.on("connection", (socket) => {
  socket.on("send_message", (data) => {
    socket.broadcast.emit("receive_message", data)
})
  console.log("A user connected:" + socket.id);
  socket.on("joinchat", function (data) {
    socket.join(data._id);
    rooms.push(data._id);
    // console.log(socket.rooms, rooms);
    socket.emit("joinedchat", {
      _id: data._id,
      chats: chats.filter((e) => e.room == data._id),
    });
  });
  socket.on("reconnecting", (data) => {
    console.log("client dang tao lai ket noi");
  });
  socket.on("send", async (data) => {
    chats.push(data);
    try {
      await Chat.findByIdAndUpdate(data.conversation_id, {
        $push: {
          conversation: {
            message: data.message,
            unread: "1",
            created: Date.now(),
            sender: data.sender,
          },
        },
      });
    } catch (error) {
      console.log("loi updata Chat");
    } finally{
      io.to(data.receiver).emit("onmessage", {
        sender: data.sender,
        conversation_id: data.conversation_id,
        receiver: data.receiver,
        message: data.message,
      });
    }

  });
  socket.on("deletemessage",async (data) => {
    console.log("client xoa tin nhan");
    try {
      await Chat.findByIdAndUpdate(data.conversation_id, {
        $pull: {
          conversation: {
            _id: data.message_id
          },
        },
      });
    } catch (error) {
      console.log("loi updata Chat");
    } finally{
      io.to(data.receiver).emit("onmessage", {
        sender: data.sender,
        conversation_id: data.conversation_id,
        receiver: data.receiver,
        message: "Tin nhắn đã bị xoá",
      });
    }
  });
  socket.on("disconnect", (data) => {
    console.log("client ngat ket noi");
  });
});

server.listen(port, ()=>{
    console.log(`App listening on http://localhost:${port}`);
});
