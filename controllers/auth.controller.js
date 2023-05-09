const { hash, compare } = require("bcrypt");
const { errorResponse, badRequestResponse, successResponse } = require("../helpers/apiResponse");
const User = require("../models/UserModel");
const { sign } = require("jsonwebtoken");


/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
exports.register = async (req, res) => {
    const { fullname, email, password } = req.body;

    try {
        const user = User.findOne({ email });
        if (user) return badRequestResponse(res, "user with this email already exists");

        const passwordHash = await hash(password, 10);
        const newUser = new User({
            fullname, email, passwordHash
        })
        await newUser.save();

        return successResponse(res, null, "Registration successful.");
    } catch (error) {
        errorResponse(res, error.message);
    }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return badRequestResponse(res, "User with this email does not exist");
        if (!(await compare(password, user.passwordHash))) return badRequestResponse(res, "Invalid email or password");
        if (!user.isActive) return badRequestResponse(res, "This user has been diabled. Please contact support");

        const payload = { id: user._id, email: user.email, role: user.role };
        const token = sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

        successResponse(res, { ...user.toObject(), passwordHash: undefined, token }, 'Login siccessful.');
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return badRequestResponse(res, "user with this email does not exist");
        if (!user.isActive) return badRequestResponse(res, 'Your account has been disabled. Please contact support.');

        const token = sign({ id: user._id, email }, process.env.JWT_SECRET, { expiresIn: '15m' });
        
    } catch (error) {
        errorResponse(res, error.message);
    }
}