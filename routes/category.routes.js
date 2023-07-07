const { getAdsByCategory, getAdsByTag, searchAdsWithFilters, createAd, createCategory, updateCategory, getAllCategories, deleteCategory, addSubcategory } = require('../controllers/ad.controller');
const { removeProtectedFields } = require('../middleware/filterFillableFields');
const { jwtVerifyToken, onlyAdmins } = require('../middleware/jwtAuth');
const upload = require('../middleware/upload');

const router = require('express').Router();


router.get('/', getAllCategories)

router.post('/', jwtVerifyToken, onlyAdmins, createCategory);

router.post('/:parentId', jwtVerifyToken, onlyAdmins, addSubcategory);

router.put('/:categoryId', jwtVerifyToken, onlyAdmins, updateCategory);

router.delete('/:categoryId', deleteCategory);

module.exports = router;