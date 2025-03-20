import dotenv from 'dotenv'
import { Sequelize } from 'sequelize'
import { dbConfig } from '../../config/config'

dotenv.config()

const env = process.env.NODE_ENV || 'development'
const config = dbConfig[env as keyof typeof dbConfig] || dbConfig.development

const parseNumber = (
  value: string | undefined,
  defaultValue: number
): number => {
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

const sequelizeInstance = new Sequelize(process.env.DATABASE_URL || '', {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: parseNumber(config?.pool?.max?.toString(), 10),
    min: parseNumber(config?.pool?.min?.toString(), 0),
    acquire: parseNumber(config?.pool?.acquire?.toString(), 30000),
    idle: parseNumber(config?.pool?.idle?.toString(), 10000),
  },
  dialectOptions: {
    ssl:
      process.env.DB_SSL === 'true'
        ? { require: true, rejectUnauthorized: false }
        : false,
  },
})

export default sequelizeInstance
