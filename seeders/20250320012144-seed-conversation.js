'use strict'

const { v4: uuidv4 } = require('uuid')
const { USER_IDS } = require('./20250303025414-seed-users')

const CONVERSATION_IDS = {
  DIRECT_1_2: uuidv4(),
  DIRECT_1_3: uuidv4(),
  GROUP_CHAT: uuidv4(),
}

module.exports.CONVERSATION_IDS = CONVERSATION_IDS
module.exports.up = async (queryInterface) => {
  const conversations = [
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
  })
}
module.exports.down = async (queryInterface) => {
  await queryInterface.bulkDelete('Conversations', {}, {})
}
