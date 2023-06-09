const { getAdsByCategory, getAdsByTag, searchAdsWithFilters, createAd, getAllAds, getAdById, deleteAd } = require('../controllers/ad.controller');
const { removeProtectedFields } = require('../middleware/filterFillableFields');
const { jwtVerifyToken } = require('../middleware/jwtAuth');
const upload = require('../middleware/upload');
const { CreateAdSchema } = require('../middleware/validator');

const router = require('express').Router();
const validator = require('express-joi-validation').createValidator({ passError: true });

router.get('/', getAllAds);
router.get('/:adId', getAdById);
router.get('/category/:categoryId', getAdsByCategory);
router.get('/tag', getAdsByTag);
router.get('/search', searchAdsWithFilters);

router.post('/new', jwtVerifyToken, removeProtectedFields(['status','views']), upload.fields([{name: 'photos'}]), validator.body(CreateAdSchema), createAd);

router.delete('/:adId', jwtVerifyToken, deleteAd);

module.exports = router;