const express = require('express');
const TrackingController = require('../controllers/TrackingController');

const router = express.Router();

router.get('/', TrackingController.getData);
router.post('/', TrackingController.saveData);

module.exports = router;