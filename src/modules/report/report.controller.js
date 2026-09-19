import { Router } from "express";

import {
    getNewUsersReport,
    getOverview,
    getSalesReport,
    getTopProducts,
} from "./report.service.js";

import * as validators from "./report.validation.js";
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



// FR-45, FR-46 — order counts per status + total sales
router.get(
    "/overview",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.dateRangeQuery),
    asyncHandler(async (req, res) => {
        const overview = await getOverview(req.query);
        return successResponse({ res, data: { overview } });
    })
);


// FR-47, FR-48, FR-49 — sales over time (day/week/month, or a custom range)
router.get(
    "/sales",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.salesReport),
    asyncHandler(async (req, res) => {
        const sales = await getSalesReport(req.query);
        return successResponse({ res, data: { sales } });
    })
);


// FR-50 — best-selling products within a date range
router.get(
    "/top-products",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.topProducts),
    asyncHandler(async (req, res) => {
        const result = await getTopProducts(req.query);
        return successResponse({ res, data: { ...result } });
    })
);


// FR-51 — new user signups within a date range
router.get(
    "/new-users",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.newUsersReport),
    asyncHandler(async (req, res) => {
        const newUsers = await getNewUsersReport(req.query);
        return successResponse({ res, data: { newUsers } });
    })
);


export default router;
