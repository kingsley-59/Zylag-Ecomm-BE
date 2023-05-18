const { addToFavorites, getUserFavorites, deleteFavorite } = require('../controllers/favorite.controller');
const { jwtVerifyToken, onlyAdmins } = require('../middleware/jwtAuth');

const router = require('express').Router();

// users
router.get('/me', jwtVerifyToken, getUserFavorites);
router.post('/:adId', jwtVerifyToken, addToFavorites);
router.delete('/:favId', jwtVerifyToken, deleteFavorite);

module.exports = router;