const { hash, compare } = require("bcrypt");
const { errorResponse, badRequestResponse, successResponse } = require("../helpers/apiResponse");
const User = require("../models/UserModel");
const { sign, verify } = require("jsonwebtoken");
const MailService = require("../modules/nodemailer");

const mailService = new MailService();


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

        // send welcome email
        await mailService.sendWelcomeEmail(newUser);

        // send email verification link
        await mailService.sendVerificationEmail(newUser);

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
        if (!user.emailIsVerified) return badRequestResponse(res, "Please verify your email.");
        if (!user.isActive) return badRequestResponse(res, "This user has been diabled. Please contact support");

        const payload = { id: user._id, email: user.email, role: user.role };
        const token = sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

        successResponse(res, { ...user.toObject(), passwordHash: undefined, token }, 'Login siccessful.');
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.sendEmailverificationLink = async (req, res) => {
    const email = req.query?.email;
    if (!email) return badRequestResponse(res, "Email is a required query parameter");

    try {
        const user = await User.findOne({ email });
        if (!user) return badRequestResponse(res, "user with this email does not exist");
        if (!user.isActive) return badRequestResponse(res, "This user has been diabled. Please contact support");

        const token = sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
        user.emailVerificationToken = token;
        await user.save();
        await mailService.sendVerificationEmail(user);

        successResponse(res, null, "verification email sent. Please check your inbox.");
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.verifyEmailWithToken = async (req, res)  => {
    const token = req.query?.token;
    if (!token) return badRequestResponse(res, "token is a required query parameter");

    try {
        const decoded = verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.id, isActive: true });
        if (!user) return badRequestResponse(res, "Email no longer exists.")
        if (user.emailVerificationToken !== token) return badRequestResponse('Invalid token.');
        
        user.emailVerificationToken = null,
        user.emailIsVerified = true;
        await user.save();

        successResponse(res, null, "Email verified successfully.");
    } catch (error) {
        errorResponse(res, error.message);
    }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return badRequestResponse(res, "user with this email does not exist");
        if (!user.isActive) return badRequestResponse(res, 'Your account has been disabled. Please contact support.');

        // generate passwprd reset token
        const token = sign({ id: user._id, email }, process.env.JWT_SECRET, { expiresIn: '15m' });

        // send password reset link to email
        const { html, plainText } = mailService.getMailTemplate('forgotPassword', {
            name: user.fullname,
            resetLink: `${process.env.CLIENT_URL}/password-reset?token=${token}`
        })
        const info = await mailService.sendMail({
            from: `${process.env.CONTACT_NAME} <${process.env.CONTACT_EMAIL}>`,
            to: email,
            replyTo: process.env.CONTACT_EMAIL,
            subject: `Password Reset Request - ${process.env.COMPANY_NAME}`,
            html,
            text: plainText
        })

        successResponse(res, null, "Reset password link has been sent to your email.");
    } catch (error) {
        errorResponse(res, error.message);
    }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
exports.resetPassword = async (req, res) => {
    const { password, token } = req.body;

    try {
        const decoded = verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email, isActive: true });
        if (!user) return badRequestResponse(res, "Email no longer exists.")

        const passwordHash = await hash(password, 10);
        user.passwordHash = passwordHash;
        await user.save();

        successResponse(res, null, "Password reset successfully");
    } catch (error) {
        console.log(error.message);
        errorResponse(res, 'Failed to complete password reset. Please try again.', 400)
    }
}