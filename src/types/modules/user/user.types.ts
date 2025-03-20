export interface UserUpdateRequest {
  name?: string
  email?: string
  roleId?: number
}

export interface PasswordUpdateRequest {
  oldPassword: string
  newPassword: string
}

export interface UserQueryParams {
  page?: number
  limit?: number
  search?: string
  role?: string
  sort?: string
}
