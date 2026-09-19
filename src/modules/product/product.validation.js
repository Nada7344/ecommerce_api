import joi from "joi";
import { fileFieldValidation, generalValidationFields } from "../../common/utils/index.js";


const flags = joi.object().keys({
    topSales: joi.boolean(),
    newArrival: joi.boolean(),
});


export const createProduct = {
    body: joi.object().keys({
        name: joi.string().min(2).max(200).trim().required(),
        description: joi.string().min(5).max(2000).trim().required(),
        price: joi.number().min(0).required(),
        shippingPrice: joi.number().min(0).default(0),
        stock: joi.number().integer().min(0).default(0),
        isActive: joi.boolean(),
        category: generalValidationFields.id.required(),
        subcategory: generalValidationFields.id.required(),
        
        flags,
    }).required(),

    files: joi
    .array()
    .items(generalValidationFields.file(fileFieldValidation.image).required())
    .min(1)
    .max(2).required()
};


export const updateProduct = {
    params: joi.object().keys({
        productId: generalValidationFields.id.required(),
    }).required(),

    body: joi.object().keys({
        name: joi.string().min(2).max(200).trim(),
        description: joi.string().min(5).max(2000).trim(),
        price: joi.number().min(0),
        shippingPrice: joi.number().min(0),
        isActive: joi.boolean(),
        category: generalValidationFields.id,
        subcategory: generalValidationFields.id,
        
    }).min(1).required(),

     files: joi
    .array()
    .items(
        generalValidationFields.file(fileFieldValidation.image).required()
    )
    .min(1)
    .max(2)
};


export const productIdParam = {
    params: joi.object().keys({
        productId: generalValidationFields.id.required(),
    }).required(),
};


export const productSlugParam = {
    params: joi.object().keys({
        slug: joi.string().trim().required(),
    }).required(),
};


export const updateStock = {
    params: joi.object().keys({
        productId: generalValidationFields.id.required(),
    }).required(),

    body: joi.object().keys({
        stock: joi.number().integer().min(0).required(),
    }).required(),
};


export const updateStatus = {
    params: joi.object().keys({
        productId: generalValidationFields.id.required(),
    }).required(),

    body: joi.object().keys({
        isActive: joi.boolean().required(),
    }).required(),
};


export const updateFlags = {
    params: joi.object().keys({
        productId: generalValidationFields.id.required(),
    }).required(),

    body: joi.object().keys({
        flags :generalValidationFields.flags.required(),
    }).required(),
};


export const listProducts = {
    query: joi.object().keys({
        page: joi.alternatives().try(joi.number().min(1), joi.valid("all")),
        size: joi.number().min(1).max(100),
        category: generalValidationFields.id,
        subcategory: generalValidationFields.id,
        search: joi.string().trim(),
        minPrice: joi.number().min(0),
        maxPrice: joi.number().min(0),
        topSales: joi.boolean(),
        newArrival: joi.boolean(),
        inStock: joi.boolean(),
        sort: joi.string().valid("priceAsc", "priceDesc", "newest", "rating"),
    }),
};


export const listProductsAdmin = {
    query: joi.object().keys({
        page: joi.alternatives().try(joi.number().min(1), joi.valid("all")),
        size: joi.number().min(1).max(100),
        category: generalValidationFields.id,
        subcategory: generalValidationFields.id,
        search: joi.string().trim(),
        isActive: joi.boolean(),
        isDeleted: joi.boolean(),
    }),
};
