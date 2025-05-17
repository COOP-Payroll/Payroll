import catchAsync from "../utils/catch-async";
import httpStatus from "http-status";


const checkHealth = catchAsync(async (req, res) => {
    res.status(httpStatus.OK).send({message: "Ok"})
})


export default {checkHealth}
