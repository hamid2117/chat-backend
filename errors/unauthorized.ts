import CustomAPIError from './custom-api'

class UnauthorizedError extends CustomAPIError {
  constructor(message: string) {
    super(message)
    this.statusCode = 403
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}

export default UnauthorizedError
