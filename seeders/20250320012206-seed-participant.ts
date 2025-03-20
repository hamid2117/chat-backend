'use strict'

import { QueryInterface, QueryOptions } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { USER_IDS } from './20250303025414-seed-users'
import { CONVERSATION_IDS } from './20250320012144-seed-conversation'

interface BulkInsertOptions extends QueryOptions {
  ignoreDuplicates?: boolean
}

interface Participant {
  id: string
  conversationId: string
  userId: string
  role: 'ADMIN' | 'MEMBER'
  joinedAt: Date
  isRemoved: boolean
  removedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

module.exports = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const participants: Participant[] = [
      // Direct chat between User1 and User2
      {
        id: uuidv4(),
        conversationId: CONVERSATION_IDS.DIRECT_1_2,
        userId: USER_IDS.USER1,
        role: 'ADMIN',
        joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        isRemoved: false,
        removedAt: null,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        conversationId: CONVERSATION_IDS.DIRECT_1_2,
        userId: USER_IDS.USER2,
        role: 'MEMBER',
        joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        isRemoved: false,
        removedAt: null,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },

      // Direct chat between User2 and User3
      {
        id: uuidv4(),
        conversationId: CONVERSATION_IDS.DIRECT_1_3,
        userId: USER_IDS.USER2,
        role: 'ADMIN',
        joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        isRemoved: false,
        removedAt: null,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        conversationId: CONVERSATION_IDS.DIRECT_1_3,
        userId: USER_IDS.USER3,
        role: 'MEMBER',
        joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        isRemoved: false,
        removedAt: null,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },

      // Group chat with all users
      {
        id: uuidv4(),
        conversationId: CONVERSATION_IDS.GROUP_CHAT,
        userId: USER_IDS.ADMIN,
        role: 'ADMIN',
        joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        isRemoved: false,
        removedAt: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        conversationId: CONVERSATION_IDS.GROUP_CHAT,
        userId: USER_IDS.USER1,
        role: 'MEMBER',
        joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        isRemoved: false,
        removedAt: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        conversationId: CONVERSATION_IDS.GROUP_CHAT,
        userId: USER_IDS.USER2,
        role: 'MEMBER',
        joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        isRemoved: false,
        removedAt: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        conversationId: CONVERSATION_IDS.GROUP_CHAT,
        userId: USER_IDS.USER3,
        role: 'MEMBER',
        joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (joined later)
        isRemoved: false,
        removedAt: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ]

    await queryInterface.bulkInsert('Participants', participants, {
      ignoreDuplicates: true,
    } as BulkInsertOptions)
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkDelete('Participants', {}, {})
  },
}
