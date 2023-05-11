const { getAdsByCategory, getAdsByTag, searchAdsWithFilters, createAd } = require('../controllers/ad.controller');
const { removeProtectedFields } = require('../middleware/filterFillableFields');
const { jwtVerifyToken } = require('../middleware/jwtAuth');

const router = require('express').Router();


router.get('/category/:categoryId', getAdsByCategory);
router.get('/tag/:tagId', getAdsByTag);
router.get('/search', searchAdsWithFilters);

router.post('/new', jwtVerifyToken, removeProtectedFields(['views']), createAd);


module.exports = router;