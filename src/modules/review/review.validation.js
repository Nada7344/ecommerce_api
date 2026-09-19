import joi from "joi";
import { generalValidationFields } from "../../common/utils/index.js";
import { ReviewStatusEnum } from "../../common/enums/index.js";


export const createReview = {
    body: joi.object().keys({
        productId: generalValidationFields.id.required(),
        rate: joi.number().integer().min(1).max(5).required(),
        message: joi.string().trim().min(2).max(1000).required(),
    }).required(),
};


export const listProductReviews = {
    params: joi.object().keys({
        productId: generalValidationFields.id.required(),
    }).required(),

    query: joi.object().keys({
        page: joi.alternatives().try(joi.number().min(1), joi.valid("all")),
        size: joi.number().min(1).max(100),
    }),
};


export const listMyReviews = {
    query: joi.object().keys({
        page: joi.alternatives().try(joi.number().min(1), joi.valid("all")),
        size: joi.number().min(1).max(100),
    }),
};


export const listFeaturedReviews = {
    query: joi.object().keys({
        limit: joi.number().integer().min(1).max(20),
    }),
};


export const listReviewsAdmin = {
    query: joi.object().keys({
        page: joi.alternatives().try(joi.number().min(1), joi.valid("all")),
        size: joi.number().min(1).max(100),
        status: joi.string().valid(...Object.values(ReviewStatusEnum)),
        productId: generalValidationFields.id,
    }),
};


export const updateReviewStatus = {
    params: joi.object().keys({
        reviewId: generalValidationFields.id.required(),
    }).required(),

    body: joi.object().keys({
        status: joi.string()
            .valid(ReviewStatusEnum.Approved, ReviewStatusEnum.Declined)
            .required(),
    }).required(),
};