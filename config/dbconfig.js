require('dotenv').config()

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'username',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'myapp_db',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
  },
  test: {
    username: process.env.TEST_DB_USERNAME || 'username',
    password: process.env.TEST_DB_PASSWORD || 'password',
    database: process.env.TEST_DB_NAME || 'myapp_db_test',
    host: process.env.TEST_DB_HOST || '127.0.0.1',
    dialect: 'postgres',
  },
  production: {
    username:
      process.env.PROD_DB_USERNAME || process.env.DB_USERNAME || 'username',
    password:
      process.env.PROD_DB_PASSWORD || process.env.DB_PASSWORD || 'password',
    database: process.env.PROD_DB_NAME || 'myapp_db_production',
    host: process.env.PROD_DB_HOST || '127.0.0.1',
    dialect: 'postgres',
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
