import joi from "joi";
import { generalValidationFields } from "../../common/utils/index.js";


export const createCategory = {
    body: joi.object().keys({
        name: joi.string().min(2).max(100).trim().required(),
        isActive: joi.boolean(),
    }).required(),
};


export const updateCategory = {
    params: joi.object().keys({
        categoryId: generalValidationFields.id.required(),
    }).required(),

    body: joi.object().keys({
        name: joi.string().min(2).max(100).trim(),
        isActive: joi.boolean(),
    }).min(1).required(),
};


export const categoryIdParam = {
    params: joi.object().keys({
        categoryId: generalValidationFields.id.required(),
    }).required(),
};


export const listCategories = {
    query: joi.object().keys({
        page: joi.alternatives().try(joi.number().min(1), joi.valid("all")),
        size: joi.number().min(1).max(100),
        includeInactive: joi.boolean(),
    }),
};



// SubCategory


export const createSubCategory = {
    params: joi.object().keys({
        categoryId: generalValidationFields.id.required(),
    }).required(),

    body: joi.object().keys({
        name: joi.string().min(2).max(100).trim().required(),
        isActive: joi.boolean(),
    }).required(),
};


export const updateSubCategory = {
    params: joi.object().keys({
        subCategoryId: generalValidationFields.id.required(),
    }).required(),

    body: joi.object().keys({
        name: joi.string().min(2).max(100).trim(),
        isActive: joi.boolean(),
        category: generalValidationFields.id,
    }).min(1).required(),
};


export const subCategoryIdParam = {
    params: joi.object().keys({
        subCategoryId: generalValidationFields.id.required(),
    }).required(),
};
