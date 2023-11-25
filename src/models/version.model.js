const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const versionSchema = new mongoose.Schema({
    version: String,
    require: String,
    url: String,
    created: Date,
});

const Version = mongoose.model('version', versionSchema);

module.exports = Version;
