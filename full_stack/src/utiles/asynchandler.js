
// const asynchandler = (fn) => async (err, req, res, next) => {
//     try {

//     }
//     catch (error) {
//         await fn(err, req, res, next)
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }

const asyncHandler = (requesthandler) => {
    return (req, res, next) => { // FIXED
        Promise.resolve(requesthandler(req, res, next)).catch((err) => next(err))
    }
}
export { asyncHandler }
