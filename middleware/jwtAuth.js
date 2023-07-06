const jwt = require('jsonwebtoken');
const { unauthorizedResponse, errorResponse, forbiddenResponse } = require('../helpers/apiResponse');

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
*/
exports.jwtVerifyToken = async (req, res, next) => {
    
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded;
        req.token = token;
        next()
    } catch (error) {
        unauthorizedResponse(res, 'Unathorized! Please log in.');
    }
}

exports.onlyAdmins = async (req, res, next) => {
    const { role } = req?.user;

    if (!role) return errorResponse(res, "user token must be verified first");

    if (role !== 'admin' && role !== 'superadmin') return forbiddenResponse(res, 'This resource is accessible to admins only');

    next();
}