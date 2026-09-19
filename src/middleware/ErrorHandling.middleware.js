export const globalErrorHandler = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;

    err.status = err.status || "error";


   
    // Handle Multer Errors
  

    if (err.name === "MulterError") {
        err.statusCode = 400;
        err.status = "fail";
        err.isOperational = true;
    }



    if (process.env.NODE_ENV === "development") {

        console.error(
            `ERROR | ${req.method} ${req.originalUrl}`,
            err
        );

        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            error: err,
            cause: err.cause,
            stack: err.stack
        });
    }


   

    if (err.isOperational) {

        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }


    console.error(
        `UNEXPECTED ERROR | ${req.method} ${req.originalUrl}`,
        err
    );

    return res.status(500).json({
        status: "error",
        message: "Something went wrong"
    });
};