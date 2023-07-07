const { default: mongoose } = require("mongoose");
const { badRequestResponse, successResponse, errorResponse, notFoundResponse, unauthorizedResponse, forbiddenResponse } = require("../helpers/apiResponse");
const Ad = require("../models/AdModel");
const Category = require("../models/CategoryModel");

const NEW_ITEM_DAYS_LIMIT = 7

/**
 * 
 * @param {Date} date 
 * @param {Number} limitInDays 
 * @returns Boolean
 */
function isNew(date, limitInDays) {
    const today = new Date();
    const limitDate = new Date(today.getTime() - limitInDays * 24 * 60 * 60 * 1000);

    return date >= limitDate;
}

exports.getAllAds = async function (req, res) {
    const result = { ads: [], totalAds: 0, totalPages: 0, currentPage: 0, };

    try {
        const pageNumber = parseInt(req.query?.page || 1);
        const limitNumber = parseInt(req.query?.limit || 10);

        const ads = await Ad.find({ status: 'active' })
            .sort({ createdAt: req.query?.desc == false ? 'asc' : 'desc' })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .populate('category subCategory createdBy');

        // mark results as new
        let adsWithNewFlag = ads.map(ad => ({ ...ad.toObject(), isNew: isNew(new Date(ad.createdAt), NEW_ITEM_DAYS_LIMIT) }))

        result.ads = adsWithNewFlag;
        result.totalAds = await Ad.countDocuments({});
        result.totalPages = Math.ceil(result.totalAds / limitNumber)
        result.currentPage = pageNumber;

        successResponse(res, result, "Ads fetched successfully");
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.getAdsByCategory = async function (req, res) {
    const { categoryId } = req.params;
    const result = { ads: [], totalAds: 0, totalPages: 0, currentPage: 0, };

    try {
        const pageNumber = parseInt(req.query?.page || 1);
        const limitNumber = parseInt(req.query?.limit || 10);

        const category = await Category.findById(categoryId).lean();
        if (!category) return badRequestResponse(res, 'This category does not exist');

        if (category.parent) {
            result.ads = await Ad.find({ subCategory: category._id })
                .sort({ createdAt: req.query?.desc == false ? 'asc' : 'desc' })
                .skip((pageNumber - 1) * limitNumber)
                .limit(limitNumber)
                .populate('category');
            result.totalAds = await Ad.countDocuments({ subCategory: category._id });
            result.totalPages = Math.ceil(result.totalAds / limitNumber);
        } else {
            result.ads = await Ad.find({ category: category._id })
                .sort({ createdAt: req.query?.desc == false ? 'asc' : 'desc' })
                .skip((pageNumber - 1) * limitNumber)
                .limit(limitNumber)
                .populate('category');
            result.totalAds = await Ad.countDocuments({ category: category._id });
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
            .populate('category');
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
    const tags = req.query?.tags?.split(',')
    const result = { ads: [], totalAds: 0, totalPages: 0, currentPage: 0 };

    try {
        const pageNumber = parseInt(req.query?.page || 1);
        const limitNumber = parseInt(req.query?.limit || 10);
        const adsWithTag = await Ad.find({ tags: { $in: [tags] } })
            .sort({ createdAt: req.query?.desc == false ? 'asc' : 'desc' })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)

        result.ads = adsWithTag;
        result.totalAds = await Ad.countDocuments({ tags: { $in: [tags] } })
        result.totalPages = Math.ceil(result.totalAds / limitNumber);
        result.currentPage = pageNumber;

        successResponse(res, result, "Success");
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.getAdById = async function (req, res) {
    const { adId } = req.params;

    try {
        const ad = await Ad.findById(adId).populate('category subCategory createdBy');
        if (!ad) return notFoundResponse(res, 'Product not found');

        successResponse(res, ad?.toObject(), 'Ad fetched successfully');
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.createAd = async function (req, res, next) {
    const { id } = req.user;
    const photos = req.files.photos;
    if (!Array.isArray(photos) || photos?.length < 3) return badRequestResponse(res, "At least 3 photos are required.");

    try {
        // check if ad exists
        if (await Ad.findOne({ title: { $regex: req.body.title, $options: 'i' } })) {
            return badRequestResponse(res, 'Ad with this title already exists');
        }
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

exports.deleteAd = async function (req, res) {
    const { id, role } = req.user;
    const { adId } = req.params;

    try {
        const ad = await Ad.findById(adId);
        if (!ad) return notFoundResponse(res, 'This ad no longer exist');

        if (ad.createdBy?.toString() === id) {
            await Ad.findByIdAndDelete(adId);
            return successResponse(res, null, 'Ad deleted successfully');
        } else if (ad.createdBy?.toString() !== id && (role === 'admin' || role === 'superadmin')) {
            await Ad.findByIdAndDelete(adId);
            return successResponse(res, null, 'Ad deleted successfully');
        } else {
            return forbiddenResponse(res, 'You cannot delete this ad!');
        }
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.createCategory = async function (req, res) {
    const { name, subCategories } = req.body;

    try {
        let parentCategory;
        if (!name) return badRequestResponse(res, "category name is required");

        // Check if the parent category exists
        parentCategory = await Category.findOne({ name: { $regex: name.trim(), $options: 'i' } });
        if (!parentCategory) {
            parentCategory = new Category({ name: name.trim(), level: 1 });
            await parentCategory.save();
        }

        // Save subcategories
        let existing = [];
        if (Array.isArray(subCategories) && subCategories.length) {
            const promises = subCategories.map(async category => {
                const existingCategory = await Category.findOne({ name: { $regex: category.trim(), $options: 'i' } });
                if (existingCategory) {
                    existing.push(category);
                } else {
                    await Category.create({ name: category.trim(), parent: parentCategory._id, level: 2 });
                }
            });

            await Promise.all(promises);
        }

        let responseMessage;
        if (existing.length) {
            responseMessage = `Some categories saved. ${existing.join(", ")} categories already exist.`;
        } else {
            responseMessage = 'All categories saved successfully!';
        }

        return successResponse(res, null, responseMessage);
    } catch (error) {
        errorResponse(res, error.message);
    }

}

exports.addSubcategory = async function (req, res) {
    const { parentId } = req.params;
    const { name } = req.body

    try {
        if (!name) return badRequestResponse(res, "category name is required");

        // check if category exists
        if (await Category.findOne({ name: { $regex: name.trim(), $options: 'i' } })) {
            return badRequestResponse(res, 'Category already exists');
        }

        const newSubcategory = new Category({ name: name.trim(), parent: parentId, level: 2 })
        await newSubcategory.save();

        return successResponse(res, null, 'Subcategory added successfully!');
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.getAllCategories = async function (req, res) {
    try {
        let categories = [];
        const parentCategories = await Category.find({ level: 1 }).select('-createdAt -updatedAt -__v').sort({ name: 1 });
        if (!parentCategories || parentCategories.length < 1) {
            return successResponse(res, { categories }, 'No categories yet');
        }

        for (let c of parentCategories) {
            let subCategories = await Category.find({ parent: c._id }).select('-createdAt -updatedAt -__v').sort({ name: 1 }).lean();
            let category = { ...c.toObject(), subCategories }
            categories.push(category);
        }

        successResponse(res, { count: await Category.estimatedDocumentCount({}), categories, raw: await Category.find({}).select('_id name parent') }, "Success");
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.updateCategory = async function (req, res) {
    const { categoryId } = req.params;
    const { name } = req.body;

    try {
        const category = await Category.findByIdAndUpdate(categoryId, { name }, { new: true });
        if (!category) return badRequestResponse(res, 'Category not found');

        return successResponse(res, category.toObject(), "Update successful");
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.deleteCategory = async function (req, res) {
    const { categoryId } = req.params;

    try {
        const subcategories = await Category.find({ parent: categoryId });
        if (subcategories.length) {
            return badRequestResponse(res, `This category has subcategories. Delete the subcategories first`);
        }
        await Category.findByIdAndDelete(categoryId);

        return successResponse(res, null, 'Category deleted successfully');
    } catch (error) {
        errorResponse(res, error.message);
    }
}