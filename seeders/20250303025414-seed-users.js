'use strict'
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')

const USER_IDS = {
  ADMIN: uuidv4(),
  USER1: uuidv4(),
  USER2: uuidv4(),
  USER3: uuidv4(),
}

module.exports.USER_IDS = USER_IDS

module.exports.up = async (queryInterface) => {
  const users = [
    {
      id: USER_IDS.ADMIN,
      name: 'Admin User',
      email: 'admin@mail.com',
      passwordHash: await bcrypt.hash('password123', 10),
      isVerified: true,
      profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: USER_IDS.USER1,
      name: 'user',
      email: 'user@mail.com',
      passwordHash: await bcrypt.hash('password123', 10),
      isVerified: true,
      profilePicture: 'https://randomuser.me/api/portraits/men/2.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: USER_IDS.USER2,
      name: 'Hamid',
      email: 'hamid@mail.com',
      passwordHash: await bcrypt.hash('password123', 10),
      isVerified: true,
      profilePicture: 'https://randomuser.me/api/portraits/women/1.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: USER_IDS.USER3,
      name: 'test',
      email: 'test@mail.com',
      passwordHash: await bcrypt.hash('password123', 10),
      isVerified: true,
      profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  await queryInterface.bulkInsert('Users', users, {
    ignoreDuplicates: true,
  })
}

module.exports.down = async (queryInterface) => {
  await queryInterface.bulkDelete('Users', {}, {})
}
