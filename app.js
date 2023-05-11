var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

var authRouter = require('./routes/auth.routes');
var usersRouter = require('./routes/user.routes');
var adsRouter = require('./routes/ad.routes');

var app = express();

// DB connection
const MONGODB_URL = process.env.MONGODB_URL;

mongoose.set('strictQuery', false);
if (process.env.NODE_ENV === 'developement') {
    mongoose.set('debug', true);
}

mongoose
    .connect(MONGODB_URL)
    .then((conn) => {
        //don't show the log when it is prod
        if (process.env.NODE_ENV !== 'prod') {
            console.log('\nConnected to %s', mongoose.connection.host);
            console.log('App is running ... \n');
            console.log('Press CTRL + C to stop the process. \n');
        }
    })
    .catch((err) => {
        console.error('App starting error:', err.message);
        process.exit(1);
    });


// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Api routes
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/ads', adsRouter);


// Error handlers
// Error handler for invalid routes
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

// Error handler for application errors
app.use((err, req, res, next) => {
    console.error(err); // Log the error for debugging purposes

    // Determine the error status code
    const statusCode = err.statusCode || 500;

    // Prepare the error response
    const errorResponse = {
        message: err.message || 'Internal Server Error',
        error: err,
    };

    // Send the error response
    res.status(statusCode).json(errorResponse);
})

module.exports = app;
