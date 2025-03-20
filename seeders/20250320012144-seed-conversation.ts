'use strict'

import { QueryInterface, QueryOptions } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { USER_IDS } from './20250303025414-seed-users'

// Define custom interfaces for seeder options
interface BulkInsertOptions extends QueryOptions {
  ignoreDuplicates?: boolean
}

interface Conversation {
  id: string
  type: 'DIRECT' | 'GROUP'
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// Predefined UUIDs for conversations
const CONVERSATION_IDS = {
  DIRECT_1_2: uuidv4(),
  DIRECT_1_3: uuidv4(),
  GROUP_CHAT: uuidv4(),
}

export { CONVERSATION_IDS }

module.exports = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const conversations: Conversation[] = [
      {
        id: CONVERSATION_IDS.DIRECT_1_2,
        type: 'DIRECT',
        createdBy: USER_IDS.USER1,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(),
      },
      {
        id: CONVERSATION_IDS.DIRECT_1_3,
        type: 'DIRECT',
        createdBy: USER_IDS.USER2,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(),
      },
      {
        id: CONVERSATION_IDS.GROUP_CHAT,
        type: 'GROUP',
        createdBy: USER_IDS.ADMIN,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(),
      },
    ]

    await queryInterface.bulkInsert('Conversations', conversations, {
      ignoreDuplicates: true,
    } as BulkInsertOptions)
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkDelete('Conversations', {}, {})
  },
}
