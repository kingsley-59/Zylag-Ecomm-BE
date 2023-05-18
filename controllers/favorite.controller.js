const { errorResponse, successResponse, badRequestResponse } = require("../helpers/apiResponse");
const Ad = require("../models/AdModel");
const Favorite = require("../models/FavoriteModel");



exports.getUserFavorites = async function (req, res) {
    const { id: userId } = req.user;
    const order = req.query?.order === 'asc' ? 'asc' : 'desc';
    const sortBy = req.query?.sortBy || 'createdAt';
    const sortQuery = {}

    switch (sortBy) {
        case 'title':
            sortQuery = { 'ad.title': order }
            break;
        case 'price':
            sortQuery = { 'ad.price': order }
            break;
        case 'posted':
            sortQuery = { 'ad.createdAt': order }
            break;
        case 'createdAt':
            sortQuery = { createdAt: order }
            break;

        default:
            sortQuery = { sortBy: order }
            break;
    }

    try {
        const favs = await Favorite.find({ user: userId }).sort(sortQuery).populate('ad');

        successResponse(res, favs.toObject(), 'Success');
    } catch (error) {
        errorResponse(res, error.message);
    }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {*} res 
 */
exports.addToFavorites = async function (req, res) {
    const { id: userId } = req.user;
    const { adId } = req.params;

    try {
        const ad = await Ad.findById(adId);
        if (!ad) return badRequestResponse(res, "This ad no longer exists");
        const newFav = new Favorite({ user: userId, ad: ad._id });
        await newFav.save();

        successResponse(res, null, "New favorite added!");
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.deleteFavorite = async function (req, res) {
    const { id: userId } = req.user;
    const { favId } = req.params;

    try {
        const fav = await Favorite.findOne({_id: favId, user: userId});
        if (!fav) return badRequestResponse(res, "You don't have a favorite with this id");
        await fav.deleteOne().exec();

        successResponse(res, null, 'Deleted.');
    } catch (error) {
        errorResponse(res, error.message);
    }
}