import CustomAPIError from './custom-api'

class UnauthenticatedError extends CustomAPIError {
  constructor(message: string) {
    super(message)
    this.statusCode = 401
    Object.setPrototypeOf(this, UnauthenticatedError.prototype)
  }
}

export default UnauthenticatedError
