const Joi = require('joi');
const JoiWithPhone = Joi.extend(require('joi-phone-number'));


exports.RegisterSchema = Joi.object({
    firstName: Joi.string().alphanum().min(3).max(30).required(),
    lastName: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string(),
    address: Joi.string(),
    phoneNumber: JoiWithPhone.string().phoneNumber({
        defaultCountry: 'NG',
        format: 'e164',
        strict: true
    })
})

exports.LoginSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    phoneNumber: JoiWithPhone.string().phoneNumber({
        defaultCountry: 'NG',
        format: 'e164',
        strict: true
    }),
    password: Joi.string().required(),
})

exports.ForgotPasswordSchema = Joi.object({
    otp: Joi.string().min(6).max(6).required(),
    phoneNumber: JoiWithPhone.string().phoneNumber({
        defaultCountry: 'NG',
        format: 'e164',
        strict: true
    }),
    password: Joi.string().required()
})