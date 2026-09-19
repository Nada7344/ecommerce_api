import { BadRequestException } from "../common/utils/index.js";


export const validation = (schema = {}) => {
    return (req, res, next) => {
        try {

            const errors = [];

            for (const key of Object.keys(schema)) {

                const validationResult = schema[key].validate(
                    req[key],
                    { abortEarly: false }
                );

                if (validationResult.error) {
                    errors.push({
                        key,
                        details: validationResult.error.details.map((detail) => ({
                            path: detail.path,
                            message: detail.message,
                        })),
                    });
                }
            }

            if (errors.length) {
                throw new BadRequestException(
                    "Validation error",
                    errors
                );
            }

            next();

        } catch (error) {
            next(error);
        }
    };
};