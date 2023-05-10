const { register, login, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { RegisterSchema, LoginSchema, ForgotPasswordSchema, ResestPasswordSchema } = require('../middleware/validator');

const router = require('express').Router();
const validator = require('express-joi-validation').createValidator({});


router.post('/register', validator.body(RegisterSchema), register);
router.post('/login', validator.body(LoginSchema), login);
router.post('/forgot-password', validator.body(ForgotPasswordSchema), forgotPassword);
router.put('/reset-password', validator.body(ResestPasswordSchema), resetPassword)

module.exports = router;
