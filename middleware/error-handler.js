const { CustomAPIError } = require('../errors')
const { StatusCodes } = require('http-status-codes')
const errorHandlerMiddleware = (err, req, res, next) => {

  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || 'Something went wrong kindly contact the system administrator'
  }

  // if (err instanceof CustomAPIError) {
  //   return res.status(err.statusCode).json({ msg: err.message })
  // }
  if (err.name == 'ValidationError') {
    customError.message = Object.values(err.errors).map(item => item.message).join(',')
    customError.statusCode = StatusCodes.BAD_REQUEST
  }

  if (err.name == 'CastError') {
    customError.message = `No item with ${err.path} equals ${err.value}`
    customError.statusCode = StatusCodes.NOT_FOUND
  }

  if (err.code && err.code == 11000) {
    customError.message = `Duplicate value entered for ${Object.keys(err.keyValue)} field, kindly use a different value`
    customError.statusCode = StatusCodes.BAD_REQUEST
  }
  // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err })
  return res.status(customError.statusCode).json({ msg : customError.message })
}

module.exports = errorHandlerMiddleware
