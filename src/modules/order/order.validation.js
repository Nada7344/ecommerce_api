import joi from "joi";
import { generalValidationFields } from "../../common/utils/index.js";
import { OrderStatusEnum } from "../../common/enums/index.js";


export const createOrder = {
    body: joi.object().keys({
        addressId: generalValidationFields.id,
        address: generalValidationFields.address,
    })
        .xor("addressId", "address")
        .required(),
};


export const orderIdParam = {
    params: joi.object().keys({
        orderId: generalValidationFields.id.required(),
    }).required(),
};


export const listMyOrders = {
    query: joi.object().keys({
        page: joi.alternatives().try(joi.number().min(1), joi.valid("all")),
        size: joi.number().min(1).max(100),
        status: joi.string().valid(...Object.values(OrderStatusEnum)),
    }),
};


export const listOrdersAdmin = {
    query: joi.object().keys({
        page: joi.alternatives().try(joi.number().min(1), joi.valid("all")),
        size: joi.number().min(1).max(100),
        status: joi.string().valid(...Object.values(OrderStatusEnum)),
        userId: generalValidationFields.id,
        from: joi.date(),
        to: joi.date().min(joi.ref("from")),
    }),
};


export const updateOrderStatus = {
    params: joi.object().keys({
        orderId: generalValidationFields.id.required(),
    }).required(),

    body: joi.object().keys({
        status: joi.string()
            .valid(...Object.values(OrderStatusEnum))
            .required(),
    }).required(),
};
