import { SuccessResponseOptions } from "../types/types.js"
const successResponse = ({ res, status = 200, message = "done", data = undefined, token = undefined }: SuccessResponseOptions) => {
    return res.status(status).json({ message, data, token })
}

export default successResponse