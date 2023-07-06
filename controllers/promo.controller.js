const { badRequestResponse, successResponse, unauthorizedResponse, errorResponse } = require("../helpers/apiResponse");
const PromoOption = require("../models/PromoOptionModel");


function formatPromoOptions(promos) {
    const promoMap = new Map();
    const result = [];
    for (let { _id, category, duration, price } of promos) {
        if (promoMap.has(category)) {
            promoMap.set(category, [...promoMap.get(category), { duration, price, _id }])
        } else {
            promoMap.set(category, [{ duration, price, _id }]);
        }
    }
    promoMap.forEach((value, key) => {
        result.push({ category: key, options: value });
    })
    return result;
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
exports.getAllPromoOptions = async (req, res) => {
    const { format } = req.query;
    try {
        const promos = await PromoOption.find({}).select('-createdAt -updatedAt -__v');

        if (format) return successResponse(res, formatPromoOptions(promos), 'success')
        return successResponse(res, promos, 'Successful')
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.createPromoOption = async (req, res) => {
    const { id } = req.user;
    const { category, duration, price } = req.body;

    if (!category) return badRequestResponse(res, 'Category must be defined');
    if (duration && typeof duration !== 'number') return badRequestResponse(res, 'Duration must be a number in days');
    if (price && typeof price !== 'number') return badRequestResponse(res, 'Price must be a number in Naira');

    try {
        const newOption = new PromoOption({ category, duration, price, createdBy: id });
        await newOption.save();

        successResponse(res, null, 'Promo Option saved');
    } catch (error) {
        badRequestResponse(res, "Failed to save promo option: " + error.message);
    }
}

exports.updatePromoOption = async (req, res) => {
    const { id } = req.user;
    const { optionId } = req.params;
    const { category, duration, price } = req.body;

    if (!category) return badRequestResponse(res, 'Category must be defined');
    if (duration && typeof duration !== 'number') return badRequestResponse(res, 'Duration must be a number in days');
    if (price && typeof price !== 'number') return badRequestResponse(res, 'Price must be a number in Naira');

    try {
        const updatedOption = await PromoOption.findByIdAndUpdate(optionId, { category, duration, price, createdBy: id }, { new: true });

        successResponse(res, updatedOption.toObject(), 'Promo Option updated');
    } catch (error) {
        badRequestResponse(res, "Failed to save promo option: " + error.message);
    }
}

exports.deletePromoOption = async (req, res) => {
    const { optionId } = req.params;

    try {
        await PromoOption.findByIdAndDelete(optionId);

        successResponse(res, null, 'Promo Option deleted');
    } catch (error) {
        badRequestResponse(res, "Failed to save promo option: " + error.message);
    }
}