const LocationPoint = require('../models/LocationPointModel');
const { body, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
const apiResponse = require('../helpers/apiResponse');
const auth = require('../middlewares/jwt');
const uuid = require('uuid');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

// Location Schema
function LocationData(identifier, time, lat, lng, verified = false) {
	this.timeLogged = time;
	this.longitude = lat;
	this.latitude = lng;
	this.verified = verified;
	this.uploadIdentifier = identifier;
}

/**
 * Book List.
 *
 * @returns {Object}
 */
exports.getData = [
	(req, res) => {
		apiResponse.successResponse(res, 'get data');
	}
];

/**
 * Saving location data
 *
 * @param {Object[]}    points
 * @param {number}      points[].longitude
 * @param {number}      points[].latitude
 * @param {string}      points[].time
 *
 * @returns {Object}
 */
exports.saveData = [
	body('points', 'points needs to be array.').isArray(),
	body('points', 'points cannot be empty.').isLength({ min: 1 }),
	body('points.*.longitude', 'longitude required.').isFloat(),
	body('points.*.latitude', 'latitude required.').isFloat(),
	body('points.*.time', 'time needs to be string.').isString(),
	body('points.*.time', 'time required.').isLength({ min: 1 }).trim(),
	(req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return apiResponse.validationErrorWithData(res, 'Validation Error.', errors.array());
		}
		const points = Array.from(req.body.points);
		const identifier = uuid.v4();
		const pointsToInsert = points.map((point) => {
			return new LocationData(identifier, point.time, point.latitude, point.longitude);
		});
		LocationPoint.collection.insert(pointsToInsert, (err, docs) => {
			if (err) {
				return apiResponse.ErrorResponse(res, `failed ${err}`);
			}
			apiResponse.successResponse(res, 'saved');
		});
	}
];
