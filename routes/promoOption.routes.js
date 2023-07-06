const { deletePromoOption, createPromoOption, updatePromoOption, getAllPromoOptions } = require('../controllers/promo.controller');
const { jwtVerifyToken, onlyAdmins } = require('../middleware/jwtAuth');

const router = require('express').Router()


router.get('/', getAllPromoOptions);

router.post('/', jwtVerifyToken, onlyAdmins, createPromoOption);

router.put('/:optionId', jwtVerifyToken, onlyAdmins, updatePromoOption);

router.delete('/:optionId', jwtVerifyToken, onlyAdmins, deletePromoOption);

module.exports = router;