import { TransportOptions } from 'nodemailer'

export interface EnvironmentConfig {
  NODE_ENV: string
  PORT: number
  ORIGIN: string
  SALT_ROUNDS: number
  JWT_SECRET: string
  JWT_LIFETIME: string
  LOG_LEVEL: string
  EMAIL_HOST?: string
  EMAIL_PORT: number
  EMAIL_USER?: string
  EMAIL_PASSWORD?: string
  EMAIL_FROM: string
}

export interface DbConfigOptions {
  username: string
  password: string
  database: string
  host: string
  dialect: 'postgres'
  logging: boolean | ((sql: string) => void)
  pool?: {
    max: number
    min: number
    acquire: number
    idle: number
  }
  dialectOptions?: {
    ssl:
      | boolean
      | {
          require: boolean
          rejectUnauthorized: boolean
        }
  }
}

export interface DatabaseConfig {
  development: DbConfigOptions
  test: DbConfigOptions
  production: DbConfigOptions
}

export interface EmailConfig extends TransportOptions {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string | undefined
    pass: string | undefined
  } | null
}
