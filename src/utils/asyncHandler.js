const asyncHandler = requestHandler => {
    (req, res, next) => {
    // return Promise.resolve(requestHandler(req, res, next)).catch(next);
    return Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error));
}
} // calling nested function to return the function

export { asyncHandler };















// const asyncHandler = (fn) => () => {} // generally used with promises
// const asyncHandler = (fn) => async () => {} // made the function async ,  generally used with try catch block

// const asyncHandler = fn => (req, res, next) => {
//     return Promise.resolve(fn(req, res, next)).catch(next);
// }

// const asyncHandler = fn => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         res.status(500).json({ success: false ,message: error.message }); // 500 Internal Server Error
//         next(error);
//     }
// }

// export { asyncHandler };