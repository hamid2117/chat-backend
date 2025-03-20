'use strict'

import { QueryInterface, QueryOptions } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { CONVERSATION_IDS } from './20250320012144-seed-conversation'

// Define custom interfaces for seeder options
interface BulkInsertOptions extends QueryOptions {
  ignoreDuplicates?: boolean
}

interface GroupDetail {
  id: string
  conversationId: string
  groupName: string
  groupPicture?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

module.exports = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const groupDetails: GroupDetail[] = [
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
    } as BulkInsertOptions)
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkDelete('GroupDetails', {}, {})
  },
}
