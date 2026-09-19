import { Router } from "express";

import {
    addToCart,
    clearCart,
    getCart,
    removeCartItem,
    syncCart,
    updateCartItem,
} from "./cart.service.js";

import * as validators from "./cart.validation.js";
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



router.get(
    "/",
    authentication(),
    authorization(endpoint.profile),
    asyncHandler(async (req, res) => {
        const cart = await getCart(req.user);
        return successResponse({ res, data: { cart } });
    })
);


router.post(
    "/",
    authentication(),
    authorization(endpoint.profile),
    validation(validators.addItem),
    asyncHandler(async (req, res) => {
        const cart = await addToCart(req.user, req.body);
        return successResponse({ res, status: 201, data: { cart } });
    })
);


router.post(
    "/sync",
    authentication(),
    authorization(endpoint.profile),
    validation(validators.syncCart),
    asyncHandler(async (req, res) => {
        const result = await syncCart(req.user, req.body.products);
        return successResponse({ res, data: { ...result } });
    })
);


router.patch(
    "/:productId",
    authentication(),
    authorization(endpoint.profile),
    validation(validators.updateItem),
    asyncHandler(async (req, res) => {
        const cart = await updateCartItem(
            req.user,
            req.params.productId,
            req.body.quantity
        );
        return successResponse({ res, data: { cart } });
    })
);


router.delete(
    "/:productId",
    authentication(),
    authorization(endpoint.profile),
    validation(validators.productIdParam),
    asyncHandler(async (req, res) => {
        const cart = await removeCartItem(req.user, req.params.productId);
        return successResponse({ res, data: { cart } });
    })
);


router.delete(
    "/",
    authentication(),
    authorization(endpoint.profile),
    asyncHandler(async (req, res) => {
        const cart = await clearCart(req.user);
        return successResponse({ res, data: { cart } });
    })
);


export default router;
