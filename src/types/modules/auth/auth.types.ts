import User from '@/modules/user/user.model'

// Request Types
export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface VerifyEmailRequest {
  email: string
  verificationToken: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  email: string
  password: string
}

// Response Types
export interface LoginResponseData {
  email: string
  name: string
  isVarified: boolean
}

// Service Response Types
export interface LoginServiceResponse {
  user: User
}

// Auth Payload
export interface AuthPayload {
  id: string
  email: string
  name: string
}
