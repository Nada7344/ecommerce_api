import { BadRequestException } from "../exceptions/domain.exceptions.js";

export const fileFieldValidation = {
    image: ['image/jpeg', 'image/png', 'image/jpg'],
};

export const fileFilter = (validation = []) => {
    return function (req, file, cb) {

        if (!validation.includes(file.mimetype)) {
            return cb(new BadRequestException("Invalid file format"), false);
        }

        return cb(null, true);
    };
};