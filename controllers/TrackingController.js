const LocationPoint = require('../models/LocationPointModel');
const { body, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
const apiResponse = require('../helpers/apiResponse');
const auth = require('../middlewares/jwt');
const uuid = require('uuid');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

/**
 * Get location of carriers
 *
 * Get all data
 * Round to x floating points
 * Dedup
 *
 * @returns {Object}
 */
exports.getData = [
	(req, res) => {
		apiResponse.successResponse(res, 'get data');
	}
];

function validLat(lat) {
	return isFinite(lat) && Math.abs(lat) <= 90;
}

function validLng(lng) {
	return isFinite(lng) && Math.abs(lng) <= 180;
}

/**
 * Saving location data
 *
 * @param {Object[]}    points
 * @param {number}      points[].longitude
 * @param {number}      points[].latitude
 * @param {number}      points[].time
 *
 */
exports.saveData = [
	body('points', 'points needs to be array.').isArray(),
	body('points', 'points cannot be empty.').isLength({ min: 1 }),
	body('points.*.latitude', 'latitude invalid.').isFloat().custom(validLat),
	body('points.*.longitude', 'longitude invalid.').isFloat().custom(validLng),
	body('points.*.time', 'time invalid.').isFloat(),
	(req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return apiResponse.validationErrorWithData(res, 'Validation Error.', errors.array());
		}
		const createdDate = new Date();
		const points = req.body.points;
		const identifier = uuid.v4();
		const pointsToInsert = points.filter(point => {
			return !isNaN((new Date(point.time)).getTime());
		}).map((point) => {
			return {
				createdDate: createdDate,
				timeLogged: new Date(point.time),
				latitude: point.longitude,
				longitude: point.longitude,
				verified: false,
				uploadIdentifier: identifier
			};
		});
		LocationPoint.collection.insertMany(pointsToInsert, (err, docs) => {
			if (err) {
				return apiResponse.ErrorResponse(res, `failed ${err}`);
			}
			apiResponse.successResponse(res, 'saved');

		});
	}
];

/**
 * Saving simplified location data
 *
 * @param {Object[]}    points
 * @param {Date}        points[].createdDate
 * @param {Date}        points[].timeLogged
 * @param {number}      points[].latitude
 * @param {number}      points[].longitude
 * @param {boolean}     points[].verified
 * @param {string}      points[].uploadIdentifier
 *
 */
exports.saveSimplifiedData = (points) => {
	const LOCATION_FIXED_POINT = 4;
	const toFixedPoint = value => value.toFixed(LOCATION_FIXED_POINT);
	const simplifiedPoints = {}; // `${lat},${lng}` => {point}

	points.forEach(point => {
		const latLng = `${toFixedPoint(point.latitude)},${toFixedPoint(point.longitude)}`;
		const existedPoint = simplifiedPoints[latLng];
		if (existedPoint) {
			simplifiedPoints[latLng].timeLogged.push(point.timeLogged);
		} else {
			simplifiedPoints[latLng] = {
				timeLogged: [point.timeLogged],
				verified: point.verified,
				uploadIdentifier: point.uploadIdentifier,
				location: {
					type: 'Point',
					coordinates: [
						toFixedPoint(point.latitude),
						toFixedPoint(point.longitude)
					]
				}
			}
		}

		// insert
	});
};