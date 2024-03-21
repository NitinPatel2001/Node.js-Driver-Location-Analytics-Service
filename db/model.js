const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Location_Schema = new Schema({
    driverId: {
        type: String,
        require: true,
    },
    latitude: {
        type: Number,
        require: true,
    },
    longitude: {
        type: Number,
        require: true,
    }
},{timestamps: true});

const Location = mongoose.model('Location', Location_Schema);

module.exports = Location;