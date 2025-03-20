#!/usr/bin/env node

// More robust ts-node registration with compiler options
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
  },
})

require('tsconfig-paths/register')
require('dotenv').config()

// Use explicit path to sequelize-cli to ensure it works with ts-node
const { resolve } = require('path')
const sequelizePath = resolve('./node_modules/.bin/sequelize')

// Forward command line arguments
const args = process.argv.slice(2)
const { spawnSync } = require('child_process')

// Use spawn instead of exec for better error handling
const result = spawnSync(sequelizePath, args, {
  stdio: 'inherit',
  shell: true,
})

process.exit(result.status)
