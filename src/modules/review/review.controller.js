import { Router } from "express";

import {
    createReview,
    getFeaturedReviews,
    getMyReviews,
    getProductReviews,
    listReviewsAdmin,
    updateReviewStatusAdmin,
} from "./review.service.js";

import * as validators from "./review.validation.js";
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
    validation(validators.createReview),
    asyncHandler(async (req, res) => {
        const review = await createReview(req.user, req.body);
        return successResponse({ res, status: 201, data: { review } });
    })
);


router.get(
    "/mine",
    authentication(),
    authorization(endpoint.profile),
    validation(validators.listMyReviews),
    asyncHandler(async (req, res) => {
        const result = await getMyReviews(req.user, req.query);
        return successResponse({ res, data: { ...result } });
    })
);





router.get(
    "/admin",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.listReviewsAdmin),
    asyncHandler(async (req, res) => {
        const result = await listReviewsAdmin(req.query);
        return successResponse({ res, data: { ...result } });
    })
);


router.patch(
    "/admin/:reviewId/status",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.updateReviewStatus),
    asyncHandler(async (req, res) => {
        const review = await updateReviewStatusAdmin(
            req.params.reviewId,
            req.body.status
        );
        return successResponse({ res, data: { review } });
    })
);



router.get(
    "/featured",
    validation(validators.listFeaturedReviews),
    asyncHandler(async (req, res) => {
        const reviews = await getFeaturedReviews(req.query.limit);
        return successResponse({ res, data: { reviews } });
    })
);



router.get(
    "/:productId",
    validation(validators.listProductReviews),
    asyncHandler(async (req, res) => {
        const result = await getProductReviews(req.params.productId, req.query);
        return successResponse({ res, data: { ...result } });
    })
);


export default router;