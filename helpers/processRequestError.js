

function processRequestError(error) {
    const finalError = new Error();
    const response = error.response;
    const status = response.status;
    const message = response.data?.message || 'Request failed.';
    finalError.message = message;
    finalError.status = status;

    return finalError;
}

module.exports = processRequestError;