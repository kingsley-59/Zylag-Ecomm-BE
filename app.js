var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var authRouter = require('./routes/auth.routes');
var usersRouter = require('./routes/user.routess');

var app = express();

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Api routes
app.use('/auth', authRouter);
app.use('/users', usersRouter);


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
