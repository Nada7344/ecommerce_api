import joi from "joi";
import { generalValidationFields } from "../../common/utils/index.js";
import { AddressEnum } from "../../common/enums/index.js";


export const updateProfile = {
    body: joi.object().keys({
        name: generalValidationFields.name,
        gender: generalValidationFields.gender,
        phone: generalValidationFields.phone,
        DOB: generalValidationFields.DOB,
    }).min(1).required(),
};


export const updatePassword = {
    body: joi.object().keys({
        oldPassword: generalValidationFields.password.required(),
        password:
            generalValidationFields.password
                .invalid(joi.ref("oldPassword"))
                .required(),
        
    }).required(),
};


export const addAddress = {
    body: generalValidationFields.address.required(),
};


export const updateAddress = {
    params: joi.object().keys({
        addressId: generalValidationFields.id.required(),
    }).required(),

    body: joi.object().keys({
        label: joi.string().valid(...Object.values(AddressEnum)),
        street: joi.string().trim(),
        city: joi.string().trim(),
        state: joi.string().trim(),
        country: joi.string().trim(),
        postalCode: joi.string().trim(),
        building: joi.string().trim(),
        apartment: joi.string().trim(),
        phone: joi.string().trim(),
        isDefault: joi.boolean(),
    }).min(1).required(),
};


export const deleteAddress = {
    params: joi.object().keys({
        addressId: generalValidationFields.id.required(),
    }).required(),
};


export const userIdParam = {
    params: joi.object().keys({
        userId: generalValidationFields.id.required(),
    }).required(),
};


export const blockUser = {
    params: joi.object().keys({
        userId: generalValidationFields.id.required(),
    }).required(),

    body: joi.object().keys({
        isBlocked: joi.boolean().required(),
    }).required(),
};


export const listUsers = {
    query: joi.object().keys({
        page: joi.alternatives().try(joi.number().min(1), joi.valid("all")),
        size: joi.number().min(1).max(100),
    }),
};