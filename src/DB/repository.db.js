
const applyQueryOptions = (query, {
    populate,
    lean,
    skip,
    limit
} = {}) => {

    if (populate) {
        query.populate(populate);
    }

    if (lean !== undefined) {
        query.lean(lean);
    }

    if (skip !== undefined) {
        query.skip(skip);
    }

    if (limit !== undefined) {
        query.limit(limit);
    }

    return query;
};


const buildUpdate = (update = {}) => {

    if (Array.isArray(update)) {
        return [
            ...update,
            {
                $set: {
                    __v: {
                        $add: ["$__v", 1]
                    }
                }
            }
        ];
    }

    return {
        ...update,

        $inc: {
            ...(update.$inc || {}),
            __v: 1
        }
    };
};



// FIND BY ID


export const findById = async ({
    id,
    options = {},
    select,
    model
} = {}) => {

    let query = model
        .findById(id)
        .select(select || "");

    query = applyQueryOptions(query, options);

    return query.exec();
};



// FIND ONE


export const findOne = async ({
    filter = {},
    options = {},
    select,
    model
} = {}) => {

    let query = model
        .findOne(filter)
        .select(select || "");

    query = applyQueryOptions(query, options);

    return query.exec();
};



// FIND


export const find = async ({
    filter = {},
    options = {},
    select,
    model
} = {}) => {

    let query = model
        .find(filter)
        .select(select || "");

    query = applyQueryOptions(query, options);

    return query.exec();
};



// PAGINATE


export const paginate = async ({
    filter = {},
    options = {},
    select,
    page = 1,
    size = 10,
    model,
} = {}) => {

    const currentPage = Math.max(
        1,
        Math.floor(Number(page) || 1)
    );

    const limit = Math.min(
        100,
        Math.max(
            1,
            Math.floor(Number(size) || 10)
        )
    );

    const skip = (currentPage - 1) * limit;

    const [docsCount, result] = await Promise.all([
        model.countDocuments(filter),

        find({
            model,
            filter,
            select,
            options: {
                ...options,
                skip,
                limit,
            },
        }),
    ]);

    const pages = Math.ceil(docsCount / limit);

    return {
        docsCount,
        limit,
        pages,
        currentPage,
        result,
    };
};



// CREATE


export const create = async ({
    data,
    options = {
        validateBeforeSave: true
    },
    model
} = {}) => {
 
    const [doc] = await model.create([data], options);
    return doc;
};



// INSERT MANY


export const insertMany = async ({
    data,
    options,
    model
} = {}) => {

    return model.insertMany(
        data,
        options
    );
};



// UPDATE ONE


export const updateOne = async ({
    filter = {},
    update,
    options = {},
    model
} = {}) => {

    const finalUpdate = buildUpdate(update);

    return model.updateOne(
        filter,
        finalUpdate,
        {
            ...options,
            runValidators: true
        }
    );
};



// FIND ONE AND UPDATE


export const findOneAndUpdate = async ({
    filter = {},
    update,
    options = {},
    model
} = {}) => {

    const finalUpdate = buildUpdate(update);

    return model.findOneAndUpdate(
        filter,
        finalUpdate,
        {
            new: true,
            runValidators: true,
            ...options
        }
    );
};



// FIND BY ID AND UPDATE


export const findByIdAndUpdate = async ({
    id,
    update,
    options = {},
    model
} = {}) => {

    const finalUpdate = buildUpdate(update);

    return model.findByIdAndUpdate(
        id,
        finalUpdate,
        {
            new: true,
            runValidators: true,
            ...options
        }
    );
};



// DELETE ONE


export const deleteOne = async ({
    filter = {},
    model
} = {}) => {

    return model.deleteOne(
        filter
    );
};



// DELETE MANY


export const deleteMany = async ({
    filter = {},
    model
} = {}) => {

    return model.deleteMany(
        filter
    );
};


// FIND ONE AND DELETE


export const findOneAndDelete = async ({
    filter = {},
    options = {},
    model
} = {}) => {

    return model.findOneAndDelete(
        filter,
        options
    );
};