import CustomAPIError from './custom-api'

class NotFoundError extends CustomAPIError {
  constructor(message: string) {
    super(message)
    this.statusCode = 404
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

export default NotFoundError
