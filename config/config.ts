import dotenv from 'dotenv'
import {
  DatabaseConfig,
  EmailConfig,
  EnvironmentConfig,
} from '../src/types/config/config'

dotenv.config()

const env: EnvironmentConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  ORIGIN: process.env.ORIGIN || 'http://localhost:3000',
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS || '10', 10),

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'top_secret',
  JWT_LIFETIME: process.env.JWT_LIFETIME || '7d',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Email
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@example.com',
}

// Database configuration for sequelize-cli
const dbConfig: DatabaseConfig = {
  development: {
    username: process.env.DB_USERNAME || 'username',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'myapp_db',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    logging: console.log,
  },
  test: {
    username: process.env.TEST_DB_USERNAME || 'username',
    password: process.env.TEST_DB_PASSWORD || 'password',
    database: process.env.TEST_DB_NAME || 'myapp_db_test',
    host: process.env.TEST_DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username:
      process.env.PROD_DB_USERNAME || process.env.DB_USERNAME || 'username',
    password:
      process.env.PROD_DB_PASSWORD || process.env.DB_PASSWORD || 'password',
    database: process.env.PROD_DB_NAME || 'myapp_db_production',
    host: process.env.PROD_DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    logging: false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      min: parseInt(process.env.DB_POOL_MIN || '0'),
      acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000'),
      idle: parseInt(process.env.DB_POOL_IDLE || '10000'),
    },
    dialectOptions: {
      ssl:
        process.env.DB_SSL === 'true'
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : false,
    },
  },
}

// Email configuration
const emailConfig: EmailConfig = {
  host:
    env.NODE_ENV === 'production'
      ? env.EMAIL_HOST || 'smtp.example.com'
      : 'localhost',
  port: env.NODE_ENV === 'production' ? env.EMAIL_PORT : 1025,
  secure: env.NODE_ENV === 'production',
  auth:
    env.NODE_ENV === 'production'
      ? {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASSWORD,
        }
      : null, // No auth needed for MailHog
}

export { env, dbConfig, emailConfig }

export default dbConfig
