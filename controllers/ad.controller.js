const { default: mongoose } = require("mongoose");
const { badRequestResponse, successResponse, errorResponse } = require("../helpers/apiResponse");
const Ad = require("../models/AdModel");
const Category = require("../models/CategoryModel");



exports.getAdsByCategory = async function (req, res) {
    const { categoryId } = req.params;
    const result = { ads: [], totalAds: 0, totalPages: 0, currentPage: 0, };

    try {
        const pageNumber = parseInt(req.query?.page || 1);
        const limitNumber = parseInt(req.query?.limit || 10);

        const category = await Category.findById(categoryId).lean();
        if (!category) return badRequestResponse(res, 'This category does not exist');

        if (category.parent) {
            result.ads = await Ad.find({ category: category._id })
                .sort({ createdAt: req.query?.desc == false ? 'asc' : 'desc' })
                .skip((pageNumber - 1) * limitNumber)
                .limit(limitNumber)
                .populate('tags');
            result.totalAds = await Ad.countDocuments({ category: category._id });
            result.totalPages = Math.ceil(result.totalAds / limitNumber);
        } else {
            const childCategories = await Category.find({ parent: categoryId }).lean();
            for (let c of childCategories) {
                let ads = await Ad.find({ category: c._id })
                    .sort({ createdAt: req.query?.desc == false ? 'asc' : 'desc' })
                    .skip((pageNumber - 1) * limitNumber)
                    .limit(limitNumber)
                    .populate('tags');
                result.ads.push(...ads);
                result.totalAds += await Ad.countDocuments({ category: c._id });
            }
            result.totalPages = Math.ceil(result.totalAds / limitNumber);
        }

        result.currentPage = pageNumber;
        successResponse(res, result, result.ads.length > 0 ? "Ads fetched successfully." : "Oops! No ads in this category.");
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.searchAdsWithFilters = async function (req, res) {
    const { text, categoryId, adType, priceMin, priceMax, withVideo, desc, nearMe, radius, } = req.query;
    if (!text) return badRequestResponse(res, 'text is a required query param');
    const result = { ads: [], totalAds: 0, totalPages: 0, currentPage: 0 };

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
        const pageNumber = parseInt(req.query?.page || 1);
        const limitNumber = parseInt(req.query?.limit || 10);

        const ads = await Ad.find(searchQuery)
            .sort({ createdAt: desc == false ? 'asc' : 'desc' })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .populate('tags category');
        result.ads = ads;
        result.totalAds = await Ad.countDocuments(searchQuery);
        result.totalPages = Math.ceil(result.totalAds / limitNumber)
        result.currentPage = pageNumber;

        successResponse(res, result, "Results fetched successfully");
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.getAdsByTag = async function (req, res) {
    const { tagId } = req.params;
    const result = { ads: [], totalAds: 0, totalPages: 0, currentPage: 0 };

    try {
        const pageNumber = parseInt(req.query?.page || 1);
        const limitNumber = parseInt(req.query?.limit || 10);
        const adsWithTag = await Ad.find({ tags: { $in: [tagId] } })
            .sort({ createdAt: req.query?.desc == false ? 'asc' : 'desc' })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .populate('tags');

        result.ads = adsWithTag;
        result.totalAds = await Ad.countDocuments({ tags: { $in: [tagId] } })
        result.totalPages = Math.ceil(result.totalAds / limitNumber);
        result.currentPage = pageNumber;

        successResponse(res, result, "Success");
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.createAd = async function (req, res, next) {
    const { id } = req.user;
    const photos = req.files;
    if (!Array.isArray(photos) || photos?.length < 4) return badRequestResponse(res, "At least 4 photos are required.");

    try {
        const newAd = new Ad({
            ...req.body,
            photos: photos.map(photo => photo.path),
            createdBy: id
        });
        await newAd.save();

        successResponse(res, newAd.toObject(), "Ad posted successfully.");
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return next(error);
        }
        errorResponse(res, error.message);
    }
}

exports.createCategory = async function (req, res) {
    const { name, description, parent, image, icon } = req.body;

    try {
        if (!name) return badRequestResponse(res, "category name is required");

        // check if category exists
        if (await Category.findOne({name: {$regex: name, $options: 'i'}})) {
            return badRequestResponse(res, 'Category already exists');
        }
        if (parent) {
            const parentExists = await Category.findById(parent);
            if (!parentExists) return badRequestResponse(res, "Parent category with this id no longer exists");
        }

        const newCategory = new Category({
            name, description, image, parent,
            level: parent ? 2 : 1
        })
        await newCategory.save();

        return successResponse(res, null, 'Category saved successfully!')
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.getAllCategories = async function (req, res) {
    try {
        let categories = [];
        const parentCategories = await Category.find({ level: 1 }).select('-createdAt -updatedAt -__v').sort({createdAt: 'desc'});
        if (!parentCategories || parentCategories.length < 1) {
            return successResponse(res, { categories }, 'No categories yet');
        }

        for (let c of parentCategories) {
            let subCategories = await Category.find({parent: c._id}).select('-createdAt -updatedAt -__v').sort({createdAt: 'desc'}).lean();
            let category = { ...c.toObject(), subCategories }
            categories.push(category);
        }

        successResponse(res, categories, "Success");
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.updateCategory = async function (req, res) {
    const { categoryId } = req.params;
    const { name, description, image, icon } = req.body;

    try {
        const category = await Category.findByIdAndUpdate(categoryId, { name, description, image }, { new: true });
        if (!category) return badRequestResponse(res, 'Category not found');

        return successResponse(res, category.toObject(), "Update successful");
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.deleteCategory = async function (req, res) {
    const { categoryId } = req.params;

    try {
        await Category.findByIdAndDelete(categoryId);

        return successResponse(res, null, 'Category deleted successfully');
    } catch (error) {
        errorResponse(res, error.message);
    }
}