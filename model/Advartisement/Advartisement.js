const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Ad = new Schema({
    title: {
        type: String,
        required: true
    },
    poster: {
        type: String,
        required: true
    },
    ad_duration: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    payment: {
        type: [],
        required: false
    },
    contact:{
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'expried'],
        default: 'pending',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    paymentClear: {
        type: Boolean,
        required: true,
        default: false
    },
    paynow: {
        type: Number,
        enum: [0, 1],
        required: true,
        default: 0
    },
    role: {
        type: String,
        default: "Advertisement",
    }
}, {
    timestamps: true
});

const Advertisement = mongoose.model("Advertisement", Ad);

module.exports = Advertisement;