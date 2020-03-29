const express = require('express');
const trackingRouter = require('./tracking');

const app = express();

app.use('/v1/track', trackingRouter);

module.exports = app;