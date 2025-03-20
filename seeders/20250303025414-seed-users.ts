'use strict'

import { QueryInterface, QueryOptions } from 'sequelize'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

interface BulkInsertOptions extends QueryOptions {
  ignoreDuplicates?: boolean
}

interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  isVerified: boolean
  profilePicture?: string
  createdAt: Date
  updatedAt: Date
}

// Predefined UUIDs for users to maintain relationships
const USER_IDS = {
  ADMIN: uuidv4(),
  USER1: uuidv4(),
  USER2: uuidv4(),
  USER3: uuidv4(),
}

// Export IDs for other seeders to use
export { USER_IDS }

module.exports = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const users: User[] = [
      {
        id: USER_IDS.ADMIN,
        name: 'Admin User',
        email: 'admin@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        isVerified: true,
        profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: USER_IDS.USER1,
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        isVerified: true,
        profilePicture: 'https://randomuser.me/api/portraits/men/2.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: USER_IDS.USER2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        isVerified: true,
        profilePicture: 'https://randomuser.me/api/portraits/women/1.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: USER_IDS.USER3,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        isVerified: true,
        profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await queryInterface.bulkInsert('Users', users, {
      ignoreDuplicates: true,
    } as BulkInsertOptions)
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkDelete('Users', {}, {})
  },
}
