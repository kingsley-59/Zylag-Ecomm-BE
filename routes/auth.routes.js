const { register, login, forgotPassword, resetPassword, sendEmailverificationLink, verifyEmailWithToken } = require('../controllers/auth.controller');
const { RegisterSchema, LoginSchema, ForgotPasswordSchema, ResestPasswordSchema } = require('../middleware/validator');

const router = require('express').Router();
const validator = require('express-joi-validation').createValidator({});


router.get('/send-verification-email', sendEmailverificationLink);
router.get('/verify-email', verifyEmailWithToken);

router.post('/register', validator.body(RegisterSchema), register);
router.post('/login', validator.body(LoginSchema), login);

router.post('/forgot-password', validator.body(ForgotPasswordSchema), forgotPassword);
router.put('/reset-password', validator.body(ResestPasswordSchema), resetPassword)


module.exports = router;
