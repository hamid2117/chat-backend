import User from '@/modules/user/user.model'

// Request Types
export interface RegisterRequest {
  displayName: string
  userName: string
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
  id: string
  email: string
  displayName: string
  userName: string
  isVerified: boolean
  profilePicture?: string
}

// Service Response Types
export interface LoginServiceResponse {
  user: User
}

// Auth Payload
export interface AuthPayload {
  id: string
  email: string
  userName: string
}
