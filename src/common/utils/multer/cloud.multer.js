import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import multer from 'multer';
import { fileFilter } from './validation.multer.js';

export const cloudFileUpload = ({
    customPath = "general",
    validation = [],
    maxSize = 5,
} = {}) => {

    const storage = multer.diskStorage({

    });

    return multer({
        fileFilter: fileFilter(validation),
        storage,
        limits: { fileSize: maxSize * 1024 * 1024 },
    });
};