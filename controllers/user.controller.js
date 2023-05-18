const { errorResponse, badRequestResponse, successResponse } = require("../helpers/apiResponse");
const Ad = require("../models/AdModel");
const User = require("../models/UserModel");



exports.getUserProfile = async function (req, res) {
    const { id } = req.user;

    try {
        const user = await User.findById(id).select('-passwordHash');
        if (!user) return badRequestResponse(res, 'User not available.');

        successResponse(res, user.toObject(), "success");
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.getUserAds = async function (req, res) {
    const { id } = req.user;

    try {
        const user = await Ad.find({ user: id });
        if (!user) return successResponse(res, null, 'You do not have any ads yet.');

        successResponse(res, user.toObject(), "success");
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.updateUserProfile = async function (req, res) {
    const { id } = req.user;

    try {
        const user = await User.findByIdAndUpdate(id, req.body, { new: true }).select('-passwordHash');
        if (!user) return badRequestResponse(res, 'User not available.');

        successResponse(res, user.toObject(), "success")
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.updateProfilePhoto = async function (req, res) {
    const { id } = req.user;

    try {
        const user = await User.findByIdAndUpdate(id, { photo: req.file }, { new: true }).select('-passwordHash');
        if (!user) return badRequestResponse(res, 'User not available.');

        successResponse(res, { photo: user.photo }, "success")
    } catch (error) {
        errorResponse(res, error.message);
    }
}