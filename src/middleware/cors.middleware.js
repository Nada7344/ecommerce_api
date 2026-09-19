import cors from 'cors';
import { ForbiddenException } from '../common/utils/index.js';
import { ALLOWED_ORIGINS } from '../../config/config.service.js';



const corsOptions = {
    origin(origin, cb) {
        if (!origin) return cb(null, true);

        if (ALLOWED_ORIGINS.includes(origin)) {
            return cb(null, true);
        }

        return cb(new ForbiddenException(`CORS policy: origin ${origin} is not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

export const corsMiddleware = cors(corsOptions); 