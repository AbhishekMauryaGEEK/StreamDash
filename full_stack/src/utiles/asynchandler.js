export { asynchandler }

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

const asynchandler =(requesthandler)=>{
    (err,req,res,next)=>{
        Promise.resolve(requesthandler).catch((err)=>next(err))
    }
}