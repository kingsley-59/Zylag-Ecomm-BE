let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let mongoose = require('mongoose');
const cors = require('cors');

let authRouter = require('./routes/auth.routes');
let usersRouter = require('./routes/user.routes');
let adsRouter = require('./routes/ad.routes');
let categoryRoutes = require('./routes/category.routes');
let favRouter = require('./routes/favorite.routes');
let promoOptionsRouter = require('./routes/promoOption.routes');
const { errorResponse } = require('./helpers/apiResponse');

let app = express();

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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Api routes
app.use('/auth', authRouter);
app.use('/user', usersRouter);
app.use('/ads', adsRouter);
app.use('/category', categoryRoutes);
app.use('/favorite', favRouter);
app.use('/promos', promoOptionsRouter);

// test routes
const { EventEmitter } = require('events');

// SSE event emitter for sending chat messages to connected clients
const chatEmitter = new EventEmitter();
// SSE endpoint for chat messages
app.get('/chat', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Event listener to send chat messages to the client
    const sendMessage = message => {
        res.write(`data: ${message}\n\n`);
    };

    // Register the event listener
    chatEmitter.on('message', sendMessage);

    // Remove the event listener when the client connection is closed
    res.on('close', () => {
        chatEmitter.off('message', sendMessage);
    });
});

// Route for submitting chat messages
app.post('/chat', (req, res) => {
    const { message } = req.body;
    if (message) {
        // Emit the chat message event
        chatEmitter.emit('message', message);
        res.sendStatus(200);
    } else {
        res.status(400).json({ error: 'Invalid message' });
    }
});


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

    // handle validation errors
    if (err && err.error && err.error?.isJoi) {
        console.log('Details : ', err.error.details)
        const validationErrors = err.error.details?.map(detail => detail.message);
        const message = validationErrors?.join(' | ');
        return errorResponse(res, `Request validation error: ${message}`, 400, err.error)
    }

    // handle mongoose validation errors
    if (err instanceof mongoose.Error.ValidationError) {
        // Handle Mongoose validation errors
      const validationErrors = {};

      // Loop through the errors and extract the relevant information
      for (let field in err.errors) {
        validationErrors[field] = err.errors[field].message;
      }

      // Return the validation errors
      return errorResponse(res, "Data validation error", 400, validationErrors);
    }

    // Determine the error status code
    const statusCode = err.statusCode || 500;

    // Send the error response
    errorResponse(res, err.message || 'Something went wrong', statusCode);
})

module.exports = app;
