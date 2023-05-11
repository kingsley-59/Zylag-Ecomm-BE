

exports.filterFillableFields = (fillableFields = []) => {
    // const fillableFields = ['title', 'description', 'category', /* Add other fillable fields */];

    return function (req, res, next) {
        for (const field in req.body) {
            if (!fillableFields.includes(field)) {
                delete req.body[field];
            }
        }

        next();
    }
};

exports.removeProtectedFields = (protectedFields = []) => {
    return function (req, res, next) {
        for (const field in req.body) {
            if (protectedFields.includes(field)) {
                delete req.body[field];
            }
        }

        next();
    }
}
