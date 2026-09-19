import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

import {
    ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN,

    SYSTEM_ACCESS_TOKEN_SECRET_KEY,
    SYSTEM_REFRESH_TOKEN_SECRET_KEY,

    USER_ACCESS_TOKEN_SECRET_KEY,
    USER_REFRESH_TOKEN_SECRET_KEY,
} from "../../../config/config.service.js";

import {
    UserModel,
    findOne,
} from "../../DB/index.js";

import { TokenTypeEnum, RoleEnum } from "../../common/enums/index.js";

import {
    BadRequestException,
    ConflictException,
    NotFoundException,
    UnauthorizedException,
} from "../utils/index.js";

import {
    get,
    set,
    revokeTokenKey,
} from "../services/redis.service.js";


export const generateToken = async ({
    payload = {},
    secret = USER_ACCESS_TOKEN_SECRET_KEY,
    options = {},
} = {}) => {
    return jwt.sign(payload, secret, options);
};


export const verifyToken = async ({
    token,
    secret = USER_ACCESS_TOKEN_SECRET_KEY,
    issuer,
} = {}) => {
    try {
        return jwt.verify(
            token,
            secret,
            {
                algorithms: ["HS256"],
                ...(issuer ? { issuer } : {}),
            }
        );
    } catch (error) {
        throw new UnauthorizedException(
            "Invalid or expired token",
            error
        );
    }
};


// NOTE: "System" secrets are used for the Admin role, "User" secrets for
// the User role. Naming kept as-is for backward compatibility with issued
// tokens; consider renaming to SYSTEM -> ADMIN in a future migration.
export const detectSignatureLevel = async (level) => {
    switch (level) {
        case RoleEnum.Admin:
            return {
                accessSignature: SYSTEM_ACCESS_TOKEN_SECRET_KEY,
                refreshSignature: SYSTEM_REFRESH_TOKEN_SECRET_KEY,
            };

        case RoleEnum.User:
            return {
                accessSignature: USER_ACCESS_TOKEN_SECRET_KEY,
                refreshSignature: USER_REFRESH_TOKEN_SECRET_KEY,
            };

        default:
            throw new UnauthorizedException("Invalid user role");
    }
};


export const getTokenSignature = async ({
    tokenType = TokenTypeEnum.Access,
    level,
} = {}) => {
    const { accessSignature, refreshSignature } =
        await detectSignatureLevel(level);

    switch (tokenType) {
        case TokenTypeEnum.Refresh:
            return refreshSignature;

        case TokenTypeEnum.Access:
            return accessSignature;

        default:
            throw new UnauthorizedException("Invalid token type");
    }
};



export const decodeToken = async ({
    token,
    tokenType = TokenTypeEnum.Access,
    issuer,
} = {}) => {

    const unsafeDecoded = jwt.decode(token);

    if (!unsafeDecoded || typeof unsafeDecoded !== "object") {
        throw new UnauthorizedException("Invalid token");
    }

    if (
        !Array.isArray(unsafeDecoded.aud) ||
        unsafeDecoded.aud.length < 2
    ) {
        throw new BadRequestException("Missing token audience");
    }

    const [tokenApproach, level] = unsafeDecoded.aud;

    if (!tokenApproach || !level) {
        throw new BadRequestException("Invalid token audience");
    }

    if (tokenType !== tokenApproach) {
        throw new ConflictException(
            `Unexpected token mechanism. Expected ${tokenType} while you have used ${tokenApproach}`
        );
    }

    const secret = await getTokenSignature({
        tokenType: tokenApproach,
        level,
    });

    
    const verifiedData = await verifyToken({
        token,
        secret,
        issuer,
    });

    if (!verifiedData.sub) {
        throw new BadRequestException("Missing token subject");
    }

    if (!verifiedData.jti) {
        throw new UnauthorizedException("Missing token identifier");
    }

    const revokedToken = await get({
        key: revokeTokenKey({
            userId: verifiedData.sub,
            jti: verifiedData.jti,
        }),
    });

    if (revokedToken) {
        throw new UnauthorizedException("Invalid login session");
    }

    const user = await findOne({
        model: UserModel,
        filter: {
            _id: verifiedData.sub,
        },
        select: "-password",
    });

    if (!user) {
        throw new NotFoundException("Registered account not found");
    }

    if (user.isBlocked) {
        throw new UnauthorizedException("Your account has been blocked");
    }

    // If the user's role has changed since the token was issued, the
    // token was signed with the wrong-level secret's *claims* and should
    // no longer be trusted for the role it claims. This guards against a
    // demoted/promoted user continuing to use a stale-role token.
    if (level !== user.role) {
        throw new UnauthorizedException("Invalid login session");
    }

    if (
        user.changeCredentialTime &&
        verifiedData.iat &&
        user.changeCredentialTime.getTime() >= verifiedData.iat * 1000
    ) {
        throw new UnauthorizedException("Invalid login session");
    }

    return {
        user,
        decoded: verifiedData,
    };
};


// Create Login Credentials

export const createLoginCredentials = async (user, issuer) => {

    const { accessSignature, refreshSignature } =
        await detectSignatureLevel(user.role);

    // Different JTI for each token
    const accessJti = randomUUID();
    const refreshJti = randomUUID();

    const access_token = await generateToken({
        payload: {
            sub: user._id.toString(),
        },
        secret: accessSignature,
        options: {
            issuer,
            audience: [TokenTypeEnum.Access, user.role],
            expiresIn: ACCESS_TOKEN_EXPIRES_IN,
            jwtid: accessJti,
        },
    });

    const refresh_token = await generateToken({
        payload: {
            sub: user._id.toString(),
        },
        secret: refreshSignature,
        options: {
            issuer,
            audience: [TokenTypeEnum.Refresh, user.role],
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
            jwtid: refreshJti,
        },
    });

    return {
        access_token,
        refresh_token,
    };
};


// Revoke Token

export const createRevokeToken = async ({ userId, jti, ttl }) => {
    await set({
        key: revokeTokenKey({ userId, jti }),
        value: jti,
        ttl,
    });

    return true;
};