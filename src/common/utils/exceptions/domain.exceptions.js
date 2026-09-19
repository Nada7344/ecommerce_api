import { ApplicationException } from "./application.exceptions.js";

export class BadRequestException extends ApplicationException {
    constructor(message = "Bad Request", cause) {
        super(message, 400, cause);
    }
}

export class ConflictException extends ApplicationException {
    constructor(message = "Conflict", cause) {
        super(message, 409, cause);
    }
}

export class NotFoundException extends ApplicationException {
    constructor(message = "Not Found", cause) {
        super(message, 404, cause);
    }
}

export class UnauthorizedException extends ApplicationException {
    constructor(message = "Unauthorized", cause) {
        super(message, 401, cause);
    }
}

export class ForbiddenException extends ApplicationException {
    constructor(message = "Forbidden", cause) {
        super(message, 403, cause);
    }
}