import { Router } from "express";

import {
    addAddress,
    deleteAddress,
    getOrdersHistory,
    getProfile,
    getUserById,
    listUsers,
    setUserBlockedStatus,
    updateAddress,
    updatePassword,
    updateProfile,
} from "./user.service.js";

import * as validators from "./user.validation.js";
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



//User
router.get(
    "/profile",
    authentication(),
    authorization(endpoint.profile),
    asyncHandler(async (req, res) => {
        const user = await getProfile(req.user);
        return successResponse({ res, data: { user } });
    })
);


router.patch(
    "/profile",
    authentication(),
    authorization(endpoint.profile),
    validation(validators.updateProfile),
    asyncHandler(async (req, res) => {
        const user = await updateProfile(req.user, req.body);
        return successResponse({ res, data: { user } });
    })
);


router.patch(
    "/password",
    authentication(),
    authorization(endpoint.profile),
    validation(validators.updatePassword),
    asyncHandler(async (req, res) => {
        const issuer = `${req.protocol}://${req.headers.host}`;
        const credentials = await updatePassword(req.user, req.body, issuer);
        return successResponse({ res, data: { ...credentials } });
    })
);



router.post(
    "/address",
    authentication(),
    authorization(endpoint.profile),
    validation(validators.addAddress),
    asyncHandler(async (req, res) => {
        const address = await addAddress(req.user, req.body);
        return successResponse({ res, status: 201, data: { address } });
    })
);


router.patch(
    "/address/:addressId",
    authentication(),
    authorization(endpoint.profile),
    validation(validators.updateAddress),
    asyncHandler(async (req, res) => {
        const address = await updateAddress(
            req.user,
            req.params.addressId,
            req.body
        );
        return successResponse({ res, data: { address } });
    })
);


router.delete(
    "/address/:addressId",
    authentication(),
    authorization(endpoint.profile),
    validation(validators.deleteAddress),
    asyncHandler(async (req, res) => {
        const address = await deleteAddress(req.user, req.params.addressId);
        return successResponse({ res, data: { address } });
    })
);



router.get(
    "/orders",
    authentication(),
    authorization(endpoint.profile),
    asyncHandler(async (req, res) => {
        const orders = await getOrdersHistory(req.user);
        return successResponse({ res, data: { orders } });
    })
);


//Admin

router.get(
    "/admin/users",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.listUsers),
    asyncHandler(async (req, res) => {
        const result = await listUsers(req.query);
        return successResponse({ res, data: { ...result } });
    })
);


router.get(
    "/admin/users/:userId",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.userIdParam),
    asyncHandler(async (req, res) => {
        const user = await getUserById(req.params.userId);
        return successResponse({ res, data: { user } });
    })
);


router.patch(
    "/admin/users/:userId/block",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.blockUser),
    asyncHandler(async (req, res) => {
        const user = await setUserBlockedStatus(
            req.params.userId,
            req.body.isBlocked
        );
        return successResponse({ res, data: { user } });
    })
);


export default router;