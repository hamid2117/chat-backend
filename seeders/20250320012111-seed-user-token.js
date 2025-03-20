'use strict'

import { QueryInterface } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { USER_IDS } from './20250303025414-seed-users'
import crypto from 'crypto'

// Define custom interfaces for seeder options

module.exports = {
  up: async (queryInterface) => {
    const userTokens = [
      {
        id: uuidv4(),
        userId: USER_IDS.ADMIN,
        verificationToken: null,
        verificationExpiresAt: null,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        userId: USER_IDS.USER1,
        verificationToken: null,
        verificationExpiresAt: null,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        userId: USER_IDS.USER2,
        verificationToken: null,
        verificationExpiresAt: null,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        userId: USER_IDS.USER3,
        verificationToken: crypto.randomBytes(40).toString('hex'),
        verificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await queryInterface.bulkInsert('UserTokens', userTokens, {
      ignoreDuplicates: true,
    })
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('UserTokens', {}, {})
  },
}
