import CustomAPIError from './custom-api'

class BadRequestError extends CustomAPIError {
  constructor(message: string) {
    super(message)
    this.statusCode = 400
    Object.setPrototypeOf(this, BadRequestError.prototype)
  }
}

export default BadRequestError
