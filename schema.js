const mongoose = require("mongoose");
const {Schema} = mongoose;

const date = new Date();

const reply_Schema = new Schema({
	text: {type: String},
	created_on: {type: Date, default: date},
	bumped_on: {type: Date, default: date},
	reported: {type: Boolean, default: false},
	delete_password: {type: String},
});

const mReply = mongoose.model("Reply", reply_Schema);

const thread_Schema = new Schema({
	text: {type: String},
	created_on: {type: Date, default: date},
	bumped_on: {type: Date, default: date},
	reported: {type: Boolean, default: false},
	delete_password: {type: String},
	replies: {type: [reply_Schema]},
});

mThread = mongoose.model("Thread",thread_Schema);

const board_Schema= new Schema({
	name: {type: String},
	threads: {type: [thread_Schema]},
});

const mBoard = mongoose.model("Board", board_Schema);

exports.mBoard = mBoard;
exports.mThread = mThread;
exports.mReply = mReply;
