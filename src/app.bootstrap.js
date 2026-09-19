import express from 'express'
import { port } from "../config/config.service.js"
import { corsMiddleware, globalErrorHandler } from './middleware/index.js';
import { connectDB } from './DB/index.js';
import { connectRedis } from './DB/index.js';
import { NotFoundException } from './common/utils/index.js';
import { authRouter, cartRouter, categoryRouter, orderRouter, productRouter, reportRouter, reviewRouter, userRouter } from './modules/index.js';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';


async function bootstrap() {
    const app = express()

    app.use(corsMiddleware);
    
    //convert buffer data
    app.use( helmet(),express.json());


 
    
    
    //DB 
    await connectDB();
    await connectRedis();

    //application routing
    app.get('/', (req, res) => res.send('E-Commerce API is running'))
    app.use('/auth', authRouter);
    app.use('/user', userRouter);
    app.use('/category', categoryRouter);
    app.use("/products", productRouter);
    app.use("/cart", cartRouter);
    app.use("/orders", orderRouter);
    app.use("/reviews", reviewRouter);
    app.use("/reports", reportRouter);


    //invalid routing
    app.use((req, res, next) => {
        next(new NotFoundException(
            `can't find ${req.method} ${req.originalUrl}`
        ));
    });

    //error-handling
    app.use(globalErrorHandler);


    app.listen(port, () => console.log(`Server listening on port ${port} ✌️`))
}
export default bootstrap