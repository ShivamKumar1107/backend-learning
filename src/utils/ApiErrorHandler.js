class ApiErrorHandler extends Error {
    constructor(statusCode, message="Something went wrong",errors=[],stack="") {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.errors = errors;
        // this.stack = stack;
        this.success = false;// this is not necessary but this.success used for checking the success of the request 

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
};

export { ApiErrorHandler };