const Joi = require('joi');
const JoiWithPhone = Joi.extend(require('joi-phone-number'));


const vschema = {
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    phoneNumber: JoiWithPhone.string().phoneNumber({
        defaultCountry: 'NG',
        format: 'e164',
        strict: true
    }),
    passwordHard: Joi.string()
        .min(8)
        .pattern(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
        )
        .required()
        .messages({
            'string.base': 'Password must be a string',
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 8 characters long',
            'string.pattern.base':
                'Password must contain at least 1 letter, 1 number, and 1 special character',
            'any.required': 'Password is required',
        }),
    passwordEasy: Joi.string()
        .min(6)
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required()
        .messages({
            'string.base': 'Password must be a string',
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 6 characters long',
            'string.pattern.base': 'Password must contain only alphanumeric characters',
            'any.required': 'Password is required',
        }),
    token: Joi.string().required().trim(),
    address: Joi.string(), ...Joi
}


exports.RegisterSchema = Joi.object({
    fullname: vschema.name,
    email: vschema.email,
    password: vschema.passwordEasy
})

exports.LoginSchema = Joi.object({
    email: vschema.name,
    phoneNumber: vschema.phoneNumber,
    password: vschema.passwordEasy,
})

exports.ForgotPasswordSchema = Joi.object({
    email: vschema.email
})

exports.ResestPasswordSchema = Joi.object({
    token: vschema.token,
    password: vschema.passwordEasy,
})

exports.UpdateProfileSchema = Joi.object({
    fullname: vschema.name,
    email: vschema.email,
    phoneNumber: vschema.phoneNumber,
    address: vschema.address,
})

exports.CreateAdSchema = Joi.object({
    title: vschema.string().required(),
    condition: vschema.string().valid('new', 'used'),
    description: vschema.string().required(),
    tags: vschema.array().items(vschema.string()).required(),
    category: vschema.string().required(),
    subCategory: vschema.string(),
    video: vschema.string().allow(''),
    address: vschema.string().required(),
    latitude: vschema.number().required(),
    longitude: vschema.number().required(),
    price: vschema.alternatives().try(
        Joi.number().positive(),
        Joi.string().valid('free', 'negotiable')
    ).required(),
    quantity: vschema.number().positive(),
    deliveryType: vschema.string(),
    entity: vschema.string().valid('owner', 'business')
})