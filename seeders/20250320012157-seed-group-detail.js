'use strict'

const { v4: uuidv4 } = require('uuid')
const { CONVERSATION_IDS } = require('./20250320012144-seed-conversation')

module.exports = {
  up: async (queryInterface) => {
    const groupDetails = [
      {
        id: uuidv4(),
        conversationId: CONVERSATION_IDS.GROUP_CHAT,
        groupName: 'Project Team Chat',
        groupPicture:
          'https://placehold.co/400x400/3498db/FFFFFF/png?text=Team',
        description:
          'A group chat for our project team to discuss progress and share updates.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(),
      },
    ]

    await queryInterface.bulkInsert('GroupDetails', groupDetails, {
      ignoreDuplicates: true,
    })
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('GroupDetails', {}, {})
  },
}
