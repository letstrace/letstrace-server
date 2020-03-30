const LocationPoint = require('../models/LocationPointModel');
const SimplifiedLocationPoint = require('../models/SimplifiedLocationPointModel');
const { body, validationResult } = require('express-validator');
const apiResponse = require('../helpers/apiResponse');
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
	return typeof lat === 'number' && isFinite(lat) && Math.abs(lat) <= 90;
}

function validLng(lng) {
	return typeof lng === 'number' && isFinite(lng) && Math.abs(lng) <= 180;
}

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
const saveSimplifiedData = (points) => {
	// const startDate = new Date();
	const LOCATION_FIXED_POINT = 4;
	const toFixedPoint = value => value.toFixed(LOCATION_FIXED_POINT);
	const simplifiedPoints = {}; // `${lat},${lng}` => {point}
	const createdDate = new Date();
	points.forEach(point => {
		const latLng = `${toFixedPoint(point.latitude)},${toFixedPoint(point.longitude)}`;
		const existedPoint = simplifiedPoints[latLng];
		if (existedPoint) {
			simplifiedPoints[latLng].timeLogged.push(point.timeLogged);
		} else {
			simplifiedPoints[latLng] = {
				createdDate: createdDate,
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
	});
	// console.log(`massage: ${((new Date()).getTime() - startDate.getTime()) / 1000}`);
	SimplifiedLocationPoint.collection.insertMany(Object.values(simplifiedPoints), (err, docs) => {
		if (err) {
			// TODO: log error
		}
		// console.log(`done: ${((new Date()).getTime() - startDate.getTime()) / 1000}`);
	});
};

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
	(req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return apiResponse.validationErrorWithData(res, 'Validation Error.', errors.array());
		}
		const createdDate = new Date();
		const points = req.body.points;
		const identifier = uuid.v4();
		const pointsToInsert = points.filter(point => {
			console.log(point);
			return !isNaN((new Date(point.time)).getTime())
				&& validLat(point.latitude)
				&& validLng(point.longitude);
		}).map((point) => {
			return {
				createdDate: createdDate,
				timeLogged: new Date(point.time),
				latitude: point.latitude,
				longitude: point.longitude,
				verified: false,
				uploadIdentifier: identifier
			};
		});
		if (pointsToInsert.length === 0) {
			return apiResponse.ErrorResponse(res, `Nothing to insert`);
		}
		LocationPoint.collection.insertMany(pointsToInsert, (err, docs) => {
			if (err) {
				return apiResponse.ErrorResponse(res, `failed ${err}`);
			}
			apiResponse.successResponse(res, 'saved');
			saveSimplifiedData(pointsToInsert);
		});
	}
];
