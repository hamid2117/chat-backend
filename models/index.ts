import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { Sequelize, Dialect } from 'sequelize'
import { dbConfig } from '../config/config'

dotenv.config()

interface DbConfig {
  database: string
  username: string
  password: string
  dialect: Dialect
  host: string
  [key: string]: any
}

interface DbInterface {
  sequelize: Sequelize
  Sequelize: typeof Sequelize
  [key: string]: any
}

const env: string = process.env.NODE_ENV || 'development'
const db: DbInterface = {} as DbInterface
const config: DbConfig =
  dbConfig[env as keyof typeof dbConfig] || dbConfig.development

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
)

// Recursive function to find all model files
function findModelFiles(dir: string, modelFiles: string[] = []): string[] {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory() && file !== 'node_modules' && file !== 'public') {
      findModelFiles(filePath, modelFiles)
    } else if (file.endsWith('.model.ts') || file.endsWith('.model.js')) {
      modelFiles.push(filePath)
    }
  }

  return modelFiles
}

const projectRoot = path.resolve(__dirname, '../src/modules')
const modelFiles = findModelFiles(projectRoot)

modelFiles.forEach((file) => {
  const modelModule = require(file)
  const model = modelModule.default || modelModule

  if (model.name) {
    db[model.name] = model
  }
})

// Set up associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

export default db
