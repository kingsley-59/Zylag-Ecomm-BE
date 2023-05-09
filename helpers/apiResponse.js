// apiResponse.js

// Success Response
const successResponse = (res, data, message = '', statusCode = 200) => {
    res.status(statusCode).json({
        statusCode,
        success: true,
        message,
        data
    });
};

// Error Response
const errorResponse = (res, message, statusCode = 500) => {
    console.log(message)
    res.status(statusCode).json({
        statusCode,
        success: false,
        error: message
    });
};

// Not Found Response
const notFoundResponse = (res, message = 'Resource not found') => {
    errorResponse(res, message, 404);
};

// Bad Request Response
const badRequestResponse = (res, message = 'Bad Request') => {
    errorResponse(res, message, 400);
};

// Unauthorized Response
const unauthorizedResponse = (res, message = 'Unauthorized') => {
    errorResponse(res, message, 401);
};

// Forbidden Response
const forbiddenResponse = (res, message = 'Forbidden') => {
    errorResponse(res, message, 403);
};

module.exports = {
    successResponse,
    errorResponse,
    notFoundResponse,
    badRequestResponse,
    unauthorizedResponse,
    forbiddenResponse
};
