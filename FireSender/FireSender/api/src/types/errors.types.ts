export abstract class HttpError extends Error {
    constructor(public statusCode: number, public message: string) {
        super(message);
    }
}

export class BadRequestError extends HttpError {
    constructor() {
        super(400, 'Bad Request');
    }
}

export class UnauthorizedError extends HttpError {
    constructor() {
        super(401, 'Unauthorized');
    }
}

export class ForbiddenError extends HttpError {
    constructor() {
        super(403, 'Forbidden');
    }
}

export class NotFoundError extends HttpError {
    constructor() {
        super(404, 'Not Found');
    }
}

export class MethodNotAllowedError extends HttpError {
    constructor() {
        super(405, 'Method Not Allowed');
    }
}

export class NotAcceptableError extends HttpError {
    constructor() {
        super(406, 'Not Acceptable');
    }
}

export class BandwidthLimitExceededError extends HttpError {
    constructor() {
        super(509, 'Bandwidth Limit Exceeded');
    }
}

export class InternalServerError extends HttpError {
    constructor() {
        super(500, 'Internal Server Error');
    }
}