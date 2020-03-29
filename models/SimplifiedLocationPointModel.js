const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const SimplifiedLocationPointModel = new Schema({
	createdDate: { type: Date, default: Date.now },
	timeLogged: { type: [Date], required: true, default: [] },
	verified: { type: Boolean, required: true, default: 0 },
	uploadIdentifier: { type: String, required: true },
	location: {
		type: {
			type: String,
			enum: ['Point'],
			required: true
		},
		coordinates: {
			type: [Number],
			required: true
		}
	}
});

module.exports = mongoose.model('SimplifiedLocationPoint', SimplifiedLocationPointModel);