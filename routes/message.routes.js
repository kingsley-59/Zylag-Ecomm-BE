const { jwtVerifyToken } = require('../middleware/jwtAuth');

const router = require('express').Router();


router.post('/', jwtVerifyToken, );

module.exports = router;