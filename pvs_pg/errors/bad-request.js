const { StatusCodes } = require('http-status-codes')

const CustomAPIError = require('./custom-api-error')

class BadRequest extends CustomAPIError {
  constructor(message) {
    super(message)
    this.statusCode = StatusCodes.BAD_REQUEST
    this.status = "bad_request"
  }
}

module.exports = BadRequest