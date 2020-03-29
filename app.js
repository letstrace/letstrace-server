const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();
const apiRouter = require('./routes/api');
const apiResponse = require('./helpers/apiResponse');
const cors = require('cors');
const bodyParser = require('body-parser');
const compress = require('compression');
const helmet = require('helmet');

// DB connection
const MONGODB_URL = process.env.MONGODB_URL;
const mongoose = require('mongoose');
mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		//don't show the log when it is test
		if (process.env.NODE_ENV !== 'production') {
			console.log('Connected to %s', MONGODB_URL);
			console.log('App is running ... \n');
			console.log('Press CTRL + C to stop the process. \n');
		}
	})
	.catch(err => {
		console.error('App starting error:', err.message);
		process.exit(1);
	});
const db = mongoose.connection;

const app = express();

//don't show the log when it is test
if (process.env.NODE_ENV !== 'production') {
	app.use(logger('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// gzip compression
app.use(compress());

app.use(cookieParser());

app.use(helmet());

//To allow cross-origin requests
app.use(cors());

//Route Prefixes
app.use('/api/', apiRouter);

// throw 404 if URL not found
app.all('*', (req, res) => {
	return apiResponse.notFoundResponse(res, 'Page not found');
});

app.use((err, req, res) => {
	if (err.name == 'UnauthorizedError') {
		return apiResponse.unauthorizedResponse(res, err.message);
	}
});

module.exports = app;
