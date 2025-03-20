interface SuccessResponse<T = any> {
  success: true
  message: string
  data: T
}

interface ErrorResponse {
  success: false
  message: string
}

export const successResponse = <T = any>(
  data: T,
  message: string = 'Success'
): SuccessResponse<T> => ({
  success: true,
  message,
  data,
})

export const errorResponse = (message: string = 'Error'): ErrorResponse => ({
  success: false,
  message,
})
