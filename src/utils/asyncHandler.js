import express from "express" 

const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
    //console.error(error);   

    return res.status(500).json({
        success: false,
        message: error.message,
        //stack: error.stack
    });
}
}

export { asyncHandler }