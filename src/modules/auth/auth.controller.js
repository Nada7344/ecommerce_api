import { Router } from "express";

import {
    forgotPassword,
    login,
    logout,
    refreshToken,
    resendOtp,
    resetPassword,
    signup,
    verifyEmail,
} from "./auth.service.js";

import * as validators from "./auth.validation.js";

import {
    validation,
    authentication,
} from "../../middleware/index.js";

import {
    asyncHandler,
    successResponse,
} from "../../common/utils/index.js";

import { TokenTypeEnum } from "../../common/enums/index.js";


const router = Router();


router.post(
    "/signup",
    validation(validators.signup),
    asyncHandler(async (req, res) => {
        const user = await signup(req.body);
        return successResponse({ res, status: 201, data: { user } });
    })
);


router.patch(
    "/verify-email",
    validation(validators.verifyEmail),
    asyncHandler(async (req, res) => {
        await verifyEmail(req.body);
        return successResponse({ res, message: "Email verified successfully" });
    })
);


router.patch(
    "/resend-otp",
    validation(validators.resendOtp),
    asyncHandler(async (req, res) => {
        await resendOtp(req.body);
        return successResponse({ res, message: "OTP sent successfully" });
    })
);


router.post(
    "/forgot-password",
    validation(validators.forgotPassword),
    asyncHandler(async (req, res) => {
        await forgotPassword(req.body);
        return successResponse({ res, message: "Reset code sent successfully" });
    })
);


router.post(
    "/reset-password",
    validation(validators.resetPassword),
    asyncHandler(async (req, res) => {
        await resetPassword(req.body);
        return successResponse({ res, message: "Password reset successfully" });
    })
);


router.post(
    "/login",
    validation(validators.login),
    asyncHandler(async (req, res) => {
        const issuer = `${req.protocol}://${req.headers.host}`;
        const credentials = await login(req.body, issuer);
        return successResponse({ res, data: { ...credentials } });
    })
);


router.post(
    "/refresh-token",
    authentication(TokenTypeEnum.Refresh),
    asyncHandler(async (req, res) => {
        const issuer = `${req.protocol}://${req.headers.host}`;
        const credentials = await refreshToken({
            user: req.user,
            decoded: req.decoded,
            issuer,
        });
        return successResponse({ res, data: { ...credentials } });
    })
);


router.post(
    "/logout",
    authentication(TokenTypeEnum.Access),
    validation(validators.logout),
    asyncHandler(async (req, res) => {
        await logout({
            user: req.user,
            decoded: req.decoded,
            flag: req.body.flag,
            refresh_token: req.body.refresh_token,
        });
        return successResponse({ res, message: "Logged out successfully" });
    })
);


export default router;