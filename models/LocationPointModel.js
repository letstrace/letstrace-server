const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const LocationPointSchema = new Schema({
	createdDate: { type: Date, default: Date.now },
	timeLogged: { type: Date, required: true },
	longitude: { type: Number, required: true },
	latitude: { type: Number, required: true },
	verified: { type: Boolean, required: true, default: 0 },
	uploadIdentifier: { type: String, required: true },
});

module.exports = mongoose.model('LocationPoint', LocationPointSchema);