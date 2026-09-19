import {
    BadRequestException,
    NotFoundException,
    deleteResources,
    generateSlug,
    generateUniqueSuffix,
} from "../../common/utils/index.js";

import {
    create,
    findById,
    findOne,
    findOneAndUpdate,
    paginate,
    CategoryModel,
    ProductModel,
    SubCategoryModel,
} from "../../DB/index.js";


const catalogPopulate = [
    { path: "category", select: "name slug" },
    { path: "subcategory", select: "name slug" },
];


const sortMap = {
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
    newest: { createdAt: -1 },
    rating: { ratingsAverage: -1 },
};





const ensureUniqueProductSlug = async (name, excludeId) => {

    const baseSlug = generateSlug(name);

    let candidate = baseSlug;

    while (true) {

        const existing = await findOne({
            model: ProductModel,
            filter: {
                slug: candidate,
                ...(excludeId ? { _id: { $ne: excludeId } } : {}),
            },
        });

        if (!existing) {
            return candidate;
        }

        candidate = `${baseSlug}-${generateUniqueSuffix()}`;
    }
};


const validateCategoryLink = async (categoryId, subcategoryId) => {

    const category = await findById({ model: CategoryModel, id: categoryId });

    if (!category) {
        throw new NotFoundException("Category not found");
    }

    const subcategory = await findById({ model: SubCategoryModel, id: subcategoryId });

    if (!subcategory) {
        throw new NotFoundException("Subcategory not found");
    }

    if (String(subcategory.category) !== String(categoryId)) {
        throw new BadRequestException(
            "Subcategory does not belong to the selected category"
        );
    }
};



// Admin CRUD 


export const createProduct = async (inputs) => {

    await validateCategoryLink(inputs.category, inputs.subcategory);

    const slug = await ensureUniqueProductSlug(inputs.name);

    const product =await create({
        model: ProductModel,
        data: { ...inputs, slug },
    });

    return product;
};


export const updateProduct = async (productId, inputs) => {

    const product = await findById({
        model: ProductModel,
        id: productId
    });

    if (!product || product.isDeleted) {
        throw new NotFoundException("Product not found");
    }

    const targetCategoryId =
        inputs.category ?? product.category;

    const targetSubcategoryId =
        inputs.subcategory ?? product.subcategory;

    if (inputs.category || inputs.subcategory) {
        await validateCategoryLink(
            targetCategoryId,
            targetSubcategoryId
        );
    }

    const update = { ...inputs };

    if (inputs.name) {
        update.slug = await ensureUniqueProductSlug(
            inputs.name,
            productId
        );
    }
     const oldImages = product.images || [];

    const updatedProduct = await findOneAndUpdate({
        model: ProductModel,
        filter: {
            _id: productId,
            isDeleted: false
        },
        update,
        options:{
            returnDocument: 'before'
        }
    });

    if (!updatedProduct) {
    throw new NotFoundException("Product not found");
    }
    
       if (inputs.images?.length && oldImages.length) {
        await deleteResources({
            public_ids: oldImages.map(
                image => image.public_id
            )
        });
       }
    
    return updatedProduct;
};

export const getProductByIdAdmin = async (productId) => {

    const product = await findById({
        model: ProductModel,
        id: productId,
        options: { populate: catalogPopulate },
    });

    if (!product) {
        throw new NotFoundException("Product not found");
    }

    return product;
};


export const listProductsAdmin = async ({
    page,
    size,
    category,
    subcategory,
    search,
    isActive,
    isDeleted,
}) => {

    const filter = {};

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (isActive !== undefined) filter.isActive = isActive;
    filter.isDeleted = isDeleted !== undefined ? isDeleted : false;

    if (search) {
        filter.name = { $regex: search, $options: "i" };
    }

    const productsPaginated = await paginate({
        model: ProductModel,
        filter,
        page,
        size,
        options: {
            sort: { createdAt: -1 },
            populate: catalogPopulate,
        },
    });

    return productsPaginated;
};






export const softDeleteProduct = async (productId) => {

    const product = await findOneAndUpdate({
        model: ProductModel,
        filter: { _id: productId, isDeleted: false },
        update: { isDeleted: true, isActive: false },
    });

    if (!product) {
        throw new NotFoundException("Product not found");
    }

    return product;
};





export const updateStock = async (productId, stock) => {

    const product = await findOneAndUpdate({
        model: ProductModel,
        filter: { _id: productId, isDeleted: false },
        update: { stock },
    });

    if (!product) {
        throw new NotFoundException("Product not found");
    }

    return product;
};





export const updateProductStatus = async (productId, isActive) => {

    const product = await findOneAndUpdate({
        model: ProductModel,
        filter: { _id: productId, isDeleted: false },
        update: { isActive },
    });

    if (!product) {
        throw new NotFoundException("Product not found");
    }

    return product;
};





export const updateProductFlags = async (productId, flags) => {

    const setPayload = {};

    for (const key of Object.keys(flags)) {
        setPayload[`flags.${key}`] = flags[key];
    }

    const product = await findOneAndUpdate({
        model: ProductModel,
        filter: { _id: productId, isDeleted: false },
        update: { $set: setPayload },
    });

    if (!product) {
        throw new NotFoundException("Product not found");
    }

    return product;
};





//public
export const listProducts = async ({
    page,
    size,
    category,
    subcategory,
    search,
    minPrice,
    maxPrice,
    topSales,
    newArrival,
    inStock,
    sort,
}) => {

    const filter = { isActive: true, isDeleted: false };

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (topSales !== undefined) filter["flags.topSales"] = topSales;
    if (newArrival !== undefined) filter["flags.newArrival"] = newArrival;

    if (inStock !== undefined) {
        filter.stock = inStock ? { $gt: 0 } : 0;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) filter.price.$gte = minPrice;
        if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (search) {
        filter.name = { $regex: search, $options: "i" };
    }

    const listPaginatedProduct = await paginate({
        model: ProductModel,
        filter,
        page,
        size,
        options: {
            sort: sortMap[sort] || { createdAt: -1 },
            populate: catalogPopulate,
        },
    });

    return listPaginatedProduct;
};



export const getProductBySlug = async (slug) => {

    const product = await findOne({
        model: ProductModel,
        filter: { slug, isActive: true, isDeleted: false },
        options: { populate: catalogPopulate },
    });

    if (!product) {
        throw new NotFoundException("Product not found");
    }

    return product;
};





export const getNewArrivals = async ({ size = 4 } = {}) => {

    return paginate({
        model: ProductModel,
        filter: {
            isActive: true,
            isDeleted: false,
            "flags.newArrival": true,
        },
        page: 1,
        size,
        options: {
            sort: { createdAt: -1 },
            populate: catalogPopulate,
        },
    });
};


export const getTopSales = async ({ size = 4 } = {}) => {

    return paginate({
        model: ProductModel,
        filter: {
            isActive: true,
            isDeleted: false,
            "flags.topSales": true,
        },
        page: 1,
        size,
        options: {
            sort: { ratingsAverage: -1 },
            populate: catalogPopulate,
        },
    });
};
