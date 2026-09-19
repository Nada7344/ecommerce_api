import { ForbiddenException, UnauthorizedException } from "../common/utils/index.js";


export const authorization = (allowedRoles = []) => {
    return (req, res, next) => {
        try {

            if (!req.user) {
                throw new UnauthorizedException(
                    "Missing user authentication"
                );
            }

            if (!allowedRoles.includes(req.user.role)) {
                throw new ForbiddenException(
                    "Access Denied"
                );
            }

            next();

        } catch (error) {
            next(error);
        }
    };
};