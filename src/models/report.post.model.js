const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const reportPostSchema = new mongoose.Schema({
  id: Schema.Types.ObjectId,
  subject: String,
  details: String,
});

const ReportPost = mongoose.model("reportpost", reportPostSchema);

module.exports = ReportPost;
