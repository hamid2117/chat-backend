'use strict'
const { v4: uuidv4 } = require('uuid')
const { USER_IDS } = require('./20250303025414-seed-users')
const { CONVERSATION_IDS } = require('./20250320012144-seed-conversation')

module.exports = {
  up: async (queryInterface) => {
    const participants = [
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
    })
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Participants', {}, {})
  },
}
