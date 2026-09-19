import joi from "joi";
import { Types } from "mongoose";
import { GenderEnum ,AddressEnum } from "../../enums/index.js";

export const generalValidationFields = {

   
    name: joi.string().min(2).max(100).trim(),
 
    email: joi.string().email({
        minDomainSegments: 2,
        maxDomainSegments: 3,
        tlds: { allow: ["com", "net", "org"] },
    }),
 
    password: joi
        .string()
        .min(6)
        .pattern(new RegExp(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/)),

 
    phone: joi
        .string()
        .pattern(new RegExp(/^(\+201|00201|01)(0|1|2|5)\d{8}$/)),
 
    gender: joi.string().valid(...Object.values(GenderEnum)),
 
    DOB: joi.date().less("now"),
 
    otp: joi.string().pattern(new RegExp(/^\d{6}$/)),
 
    id: joi.string().custom((value, helper) => {
        return Types.ObjectId.isValid(value)
            ? true
            : helper.message("Invalid objectId");
    }),
 
    address: joi.object().keys({
        label: joi.string().valid(...Object.values(AddressEnum)),
        street: joi.string().trim().required(),
        city: joi.string().trim().required(),
        state: joi.string().trim(),
        country: joi.string().trim(),
        postalCode: joi.string().trim(),
        building: joi.string().trim(),
        apartment: joi.string().trim(),
        phone: joi.string().trim(),
        isDefault: joi.boolean(),
    }),
    

    otp: joi.string().pattern(new RegExp(/^\d{6}$/)),

    id: joi.string().custom((value, helper) => {
        return Types.ObjectId.isValid(value)
            ? true
            : helper.message("Invalid objectId");
    }),

    flags : joi
    .object({
        topSales: joi.boolean(),
        newArrival: joi.boolean(),
    })
    .min(1)
    .unknown(false)
    .required(),

    file: (allowedMimeTypes) =>
        joi.object().keys({
            fieldname: joi.string().required(),
            originalname: joi.string().required(),
            encoding: joi.string().required(),
            mimetype: joi
                .string()
                .valid(...Object.values(allowedMimeTypes))
                .required(),
            destination: joi.string().required(),
            filename: joi.string().required(),
            path: joi.string().required(),
            size: joi.number().required(),
        }),
};