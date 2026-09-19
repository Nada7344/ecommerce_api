import joi from "joi";
import { generalValidationFields } from "../../common/utils/index.js";


export const addItem = {
    body: joi.object().keys({
        productId: generalValidationFields.id.required(),
        quantity: joi.number().integer().min(1).default(1),
    }).required(),
};


export const updateItem = {
    params: joi.object().keys({
        productId: generalValidationFields.id.required(),
    }).required(),

    body: joi.object().keys({
        quantity: joi.number().integer().min(1).required(),
    }).required(),
};


export const productIdParam = {
    params: joi.object().keys({
        productId: generalValidationFields.id.required(),
    }).required(),
};


export const syncCart = {
    body: joi.object().keys({
        products: joi.array().items(
            joi.object().keys({
                productId: generalValidationFields.id.required(),
                quantity: joi.number().integer().min(1).required(),
            })
        ).required(),
    }).required(),
};
