const { getUserFavorites } = require('../controllers/favorite.controller');
const { getUserProfile, updateUserProfile, updateProfilePhoto } = require('../controllers/user.controller');
const { filterFillableFields } = require('../middleware/filterFillableFields');
const { jwtVerifyToken } = require('../middleware/jwtAuth');
const upload = require('../middleware/upload');
const User = require('../models/UserModel');

const router = require('express').Router();

router.get('/me', jwtVerifyToken, getUserProfile);
router.get('/favorites', jwtVerifyToken, getUserFavorites);
router.get('/ads', jwtVerifyToken, );

router.put('/', jwtVerifyToken, filterFillableFields(User.allowedFields), updateUserProfile);
router.put('/profile-photo', jwtVerifyToken, upload.single('photo'), updateProfilePhoto);

module.exports = router;
