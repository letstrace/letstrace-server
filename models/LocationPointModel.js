const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const LocationPointSchema = new Schema({
	timeLogged: { type: String, required: true },
	longitude: { type: Number, required: true },
	latitude: { type: Number, required: true },
	verified: { type: Boolean, required: true, default: 0 },
	uploadIdentifier: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('LocationPoint', LocationPointSchema);