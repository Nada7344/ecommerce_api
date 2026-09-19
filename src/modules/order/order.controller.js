import { Router } from "express";

import {
    cancelMyOrder,
    createOrder,
    getMyOrderById,
    getMyOrders,
    getOrderByIdAdmin,
    listOrdersAdmin,
    updateOrderStatusAdmin,
} from "./order.service.js";

import * as validators from "./order.validation.js";
import { endpoint } from "../../common/utils/index.js";

import {
    validation,
    authentication,
    authorization,
} from "../../middleware/index.js";

import {
    asyncHandler,
    successResponse,
} from "../../common/utils/index.js";


const router = Router();




router.post(
    "/",
    authentication(),
    authorization(endpoint.profile),
    validation(validators.createOrder),
    asyncHandler(async (req, res) => {
        const order = await createOrder(req.user, req.body);
        return successResponse({ res, status: 201, data: { order } });
    })
);


router.get(
    "/",
    authentication(),
    authorization(endpoint.profile),
    validation(validators.listMyOrders),
    asyncHandler(async (req, res) => {
        const result = await getMyOrders(req.user, req.query);
        return successResponse({ res, data: { ...result } });
    })
);





router.get(
    "/admin",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.listOrdersAdmin),
    asyncHandler(async (req, res) => {
        const result = await listOrdersAdmin(req.query);
        return successResponse({ res, data: { ...result } });
    })
);


router.get(
    "/admin/:orderId",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.orderIdParam),
    asyncHandler(async (req, res) => {
        const order = await getOrderByIdAdmin(req.params.orderId);
        return successResponse({ res, data: { order } });
    })
);


router.patch(
    "/admin/:orderId/status",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.updateOrderStatus),
    asyncHandler(async (req, res) => {
        const order = await updateOrderStatusAdmin(
            req.params.orderId,
            req.body.status
        );
        return successResponse({ res, data: { order } });
    })
);




router.get(
    "/:orderId",
    authentication(),
    authorization(endpoint.profile),
    validation(validators.orderIdParam),
    asyncHandler(async (req, res) => {
        const order = await getMyOrderById(req.user, req.params.orderId);
        return successResponse({ res, data: { order } });
    })
);


router.patch(
    "/:orderId/cancel",
    authentication(),
    authorization(endpoint.profile),
    validation(validators.orderIdParam),
    asyncHandler(async (req, res) => {
        const order = await cancelMyOrder(req.user, req.params.orderId);
        return successResponse({ res, data: { order } });
    })
);


export default router;
