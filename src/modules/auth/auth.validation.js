import joi from "joi";
import { generalValidationFields } from "../../common/utils/index.js";


export const signup = {
    body: joi.object().keys({
        name: generalValidationFields.name.required(),
        email: generalValidationFields.email.required(),
        password: generalValidationFields.password.required(),
        phone: generalValidationFields.phone,
        gender: generalValidationFields.gender,
        DOB: generalValidationFields.DOB,
    }).required(),
};


export const verifyEmail = {
    body: joi.object().keys({
        email: generalValidationFields.email.required(),
        otp: generalValidationFields.otp.required(),
    }).required(),
};


export const resendOtp = {
    body: joi.object().keys({
        email: generalValidationFields.email.required(),
    }).required(),
};


export const login = {
    body: joi.object().keys({
        email: generalValidationFields.email.required(),
        password: joi.string().required(),
    }).required(),
};


export const logout = {
    body: joi.object().keys({
        flag: joi.number().valid(0, 1),
        refresh_token: joi.string(),
    }).required(),
};

export const forgotPassword = {
    body: joi.object().keys({
        email: generalValidationFields.email.required(),
    }).required(),
};

export const resetPassword = {
    body: joi.object().keys({
        email: generalValidationFields.email.required(),
        otp: generalValidationFields.otp.required(),
        password: generalValidationFields.password.required(),
    }).required(),
};
