const { badRequestResponse, successResponse, errorResponse } = require("../helpers/apiResponse");
const Ad = require("../models/AdModel");
const Category = require("../models/CategoryModel");



exports.getAdsByCategory = async function () {
    const { categoryId } = req.params;
    const { limit, page } = req.query;
    const result = { ads: [], totalAds: 0, totalPages: 0, currentPage: parseInt(page), };

    try {
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const category = await Category.findById(categoryId).lean();
        if (!category) return badRequestResponse(res, 'This category does not exist');

        if (category.parent) {
            result.ads = await Ad.find({ category: category._id })
                .sort({ createdAt: 'desc' })
                .skip((pageNumber - 1) * limitNumber)
                .limit(limitNumber)
                .populate('tags');
            result.totalAds = await Ad.countDocuments({ category: category._id });
            result.totalPages = Math.ceil(result.totalAds / limitNumber);
        } else {
            const childCategories = await Category.find({ parent: categoryId }).lean();
            for (let c of childCategories) {
                let ads = await Ad.find({ category: c._id })
                    .sort({ createdAt: 'desc' })
                    .skip((pageNumber - 1) * limitNumber)
                    .limit(limitNumber)
                    .populate('tags');
                result.ads.push(...ads);
                result.totalAds += await Ad.countDocuments({ category: c._id });
            }
            result.totalPages = Math.ceil(result.totalAds / limitNumber);
        }

        successResponse(res, result, result.ads.length > 0 ? "Ads fetched successfully." : "Oops! No ads in this category.");
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.searchAdsWithFilters = async function () {
    const { text, categoryId, adType, priceMin, priceMax, withVideo, desc, nearMe, radius, limit, page } = req.query;
    const result = { ads: [], totalAds: 0, totalPages: 0, currentPage: parseInt(page) };

    const searchQuery = {
        $or: [
            { title: { $regex: text, $options: 'i' } },
            { description: { $regex: text, $options: 'i' } },
            { 'category.name': { $regex: text, $options: 'i' } }
        ]
    }

    if (categoryId) {
        searchQuery.category = id;
    }

    if (adType === 'forsale' || adType === 'tobuy') {
        searchQuery.adType = adType;
    }

    if (priceMin) {
        searchQuery.price = { $gte: filters.priceMin };
    }
    if (priceMax) {
        searchQuery.price = { ...searchQuery.price, $lte: filters.priceMax };
    }
    if (withVideo) {
        searchQuery.video = { $ne: null, $ne: '' };
    }

    try {
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const ads = await Ad.find(searchQuery)
            .sort({ createdAt: desc == true ? 'desc' : 'asc' })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .populate('tags');
        result.ads = ads;
        result.totalAds = await Ad.countDocuments(searchQuery);
        result.totalPages = Math.ceil(result.totalAds / limitNumber)

        successResponse(res, result, "Results fetched successfully");
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.getAdsByTag = async function () { }

exports.getAdsByPriceRange = async function () { }