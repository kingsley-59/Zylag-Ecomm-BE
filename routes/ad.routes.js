const { getAdsByCategory, getAdsByTag, searchAdsWithFilters, createAd, createCategory, updateCategory, getAllCategories, deleteCategory } = require('../controllers/ad.controller');
const { removeProtectedFields } = require('../middleware/filterFillableFields');
const { jwtVerifyToken, onlyAdmins } = require('../middleware/jwtAuth');
const upload = require('../middleware/upload');

const router = require('express').Router();


router.get('/category/all', getAllCategories)
router.get('/category/:categoryId', getAdsByCategory);
router.get('/tag/:tagId', getAdsByTag);
router.get('/search', searchAdsWithFilters);

router.post('/new', jwtVerifyToken, removeProtectedFields(['views']), upload.array('photos', 6), createAd);
router.post('/category/new', jwtVerifyToken, onlyAdmins, createCategory);

router.put('/category/:categoryId', jwtVerifyToken, onlyAdmins, updateCategory);

router.delete('/category/:categoryId', deleteCategory);

module.exports = router;