const mongoose = require('mongoose')
const MONGO_URL = process.env.MONGO_URL

const connect = async () => {
    try {
        await mongoose.connect(MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        mongoose.set('useNewUrlParser', true)
        mongoose.set('useFindAndModify', false)
        mongoose.set('useCreateIndex', true)
        mongoose.set('useUnifiedTopology', true)
        console.log('Connected to mongoDB')
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

module.exports = { connect }
