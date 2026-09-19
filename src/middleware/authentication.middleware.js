import { TokenTypeEnum } from "../common/enums/index.js";
import { UnauthorizedException } from "../common/utils/index.js";
import { decodeToken } from "../common/services/token.service.js";


export const authentication = (tokenType = TokenTypeEnum.Access) => {
    return async (req, res, next) => {
        try {

            const authHeader = req.headers.authorization;
 
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new UnauthorizedException(
                    "Missing authentication key or invalid approach"
                );
            }

           const credentials = authHeader.split(' ')[1];

            const { user, decoded } = await decodeToken({
                token: credentials,
                tokenType,
            });

            req.user = user;
            req.decoded = decoded;

            next();

        } catch (error) {
            next(error);
        }
    };
};