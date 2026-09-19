export class ApplicationException extends Error {


    constructor(message, statusCode, cause) {

        super(message, { cause });

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.status =
            `${statusCode}`.startsWith('4')
                ? 'fail'
                : 'error';

        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}