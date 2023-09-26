const mongoose = require('mongoose')

const connectDB = async () => {
    console.log('Connecting to the database')
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`MongoDB Conneted: ${conn.connection.host}`.cyan.underline.bold)
}

module.exports = connectDB;