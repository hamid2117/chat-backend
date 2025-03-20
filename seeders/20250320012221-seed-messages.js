'use strict'

import { v4 as uuidv4 } from 'uuid'
import { USER_IDS } from './20250303025414-seed-users'
import { CONVERSATION_IDS } from './20250320012144-seed-conversation'

const MESSAGE_IDS = {
  IMAGE_MESSAGE: uuidv4(),
  FILE_MESSAGE: uuidv4(),
  CODE_MESSAGE: uuidv4(),
}

export { MESSAGE_IDS }

module.exports = {
  up: async (queryInterface) => {
    // Generate times for messages
    const now = Date.now()
    const days = (n) => n * 24 * 60 * 60 * 1000
    const hours = (n) => n * 60 * 60 * 1000
    const minutes = (n) => n * 60 * 1000

    const messages = [
      {
        id: uuidv4(),
        conversationId: CONVERSATION_IDS.DIRECT_1_2,
        senderId: USER_IDS.USER1,
        contentType: 'TEXT',
        textContent: 'Hey Jane, how are you doing?',
        sentAt: new Date(now - days(6) - hours(2)),
        editedAt: null,
        isEdited: false,
        isDeleted: false,
        deletedAt: null,
        createdAt: new Date(now - days(6) - hours(2)),
        updatedAt: new Date(now - days(6) - hours(2)),
      },
      {
        id: uuidv4(),
        conversationId: CONVERSATION_IDS.DIRECT_1_2,
        senderId: USER_IDS.USER2,
        contentType: 'TEXT',
        textContent:
          "Hi John! I'm doing well, thanks for asking. How about you?",
        sentAt: new Date(now - days(6) - hours(2) + minutes(5)),
        editedAt: null,
        isEdited: false,
        isDeleted: false,
        deletedAt: null,
        createdAt: new Date(now - days(6) - hours(2) + minutes(5)),
        updatedAt: new Date(now - days(6) - hours(2) + minutes(5)),
      },
      {
        id: uuidv4(),
        conversationId: CONVERSATION_IDS.DIRECT_1_2,
        senderId: USER_IDS.USER1,
        contentType: 'TEXT',
        textContent:
          "I'm good! Just working on the new project. It's coming along nicely.",
        sentAt: new Date(now - days(6) - hours(2) + minutes(8)),
        editedAt: null,
        isEdited: false,
        isDeleted: false,
        deletedAt: null,
        createdAt: new Date(now - days(6) - hours(2) + minutes(8)),
        updatedAt: new Date(now - days(6) - hours(2) + minutes(8)),
      },
      {
        id: MESSAGE_IDS.IMAGE_MESSAGE,
        conversationId: CONVERSATION_IDS.DIRECT_1_2,
        senderId: USER_IDS.USER1,
        contentType: 'IMAGE',
        textContent: 'Check out this screenshot of the new UI!',
        sentAt: new Date(now - days(3) - hours(5)),
        editedAt: null,
        isEdited: false,
        isDeleted: false,
        deletedAt: null,
        createdAt: new Date(now - days(3) - hours(5)),
        updatedAt: new Date(now - days(3) - hours(5)),
      },

      // Group chat
      {
        id: uuidv4(),
        conversationId: CONVERSATION_IDS.GROUP_CHAT,
        senderId: USER_IDS.ADMIN,
        contentType: 'TEXT',
        textContent:
          "Welcome to the project team chat everyone! Let's use this space to coordinate our work.",
        sentAt: new Date(now - days(3) - hours(1)),
        editedAt: null,
        isEdited: false,
        isDeleted: false,
        deletedAt: null,
        createdAt: new Date(now - days(3) - hours(1)),
        updatedAt: new Date(now - days(3) - hours(1)),
      },
      {
        id: uuidv4(),
        conversationId: CONVERSATION_IDS.GROUP_CHAT,
        senderId: USER_IDS.USER1,
        contentType: 'TEXT',
        textContent:
          "Thanks for setting this up! I'm excited to work on this project with all of you.",
        sentAt: new Date(now - days(3) - minutes(50)),
        editedAt: null,
        isEdited: false,
        isDeleted: false,
        deletedAt: null,
        createdAt: new Date(now - days(3) - minutes(50)),
        updatedAt: new Date(now - days(3) - minutes(50)),
      },
      {
        id: uuidv4(),
        conversationId: CONVERSATION_IDS.GROUP_CHAT,
        senderId: USER_IDS.USER2,
        contentType: 'TEXT',
        textContent:
          "Me too! I've been reviewing the requirements and have some ideas to share during our next meeting.",
        sentAt: new Date(now - days(3) - minutes(45)),
        editedAt: null,
        isEdited: false,
        isDeleted: false,
        deletedAt: null,
        createdAt: new Date(now - days(3) - minutes(45)),
        updatedAt: new Date(now - days(3) - minutes(45)),
      },
      {
        id: MESSAGE_IDS.FILE_MESSAGE,
        conversationId: CONVERSATION_IDS.GROUP_CHAT,
        senderId: USER_IDS.ADMIN,
        contentType: 'FILE',
        textContent:
          "Here's the project requirements document for everyone to review.",
        sentAt: new Date(now - days(2) - hours(6)),
        editedAt: null,
        isEdited: false,
        isDeleted: false,
        deletedAt: null,
        createdAt: new Date(now - days(2) - hours(6)),
        updatedAt: new Date(now - days(2) - hours(6)),
      },
      {
        id: MESSAGE_IDS.CODE_MESSAGE,
        conversationId: CONVERSATION_IDS.GROUP_CHAT,
        senderId: USER_IDS.USER1,
        contentType: 'CODE',
        textContent:
          "I've started working on the authentication module. Here's a snippet:",
        sentAt: new Date(now - days(1) - hours(3)),
        editedAt: null,
        isEdited: false,
        isDeleted: false,
        deletedAt: null,
        createdAt: new Date(now - days(1) - hours(3)),
        updatedAt: new Date(now - days(1) - hours(3)),
      },
      {
        id: uuidv4(),
        conversationId: CONVERSATION_IDS.GROUP_CHAT,
        senderId: USER_IDS.USER3,
        contentType: 'TEXT',
        textContent:
          "Thanks for adding me to the group! I've read through the chat history and I'm up to speed now.",
        sentAt: new Date(now - days(1) - hours(2)),
        editedAt: null,
        isEdited: false,
        isDeleted: false,
        deletedAt: null,
        createdAt: new Date(now - days(1) - hours(2)),
        updatedAt: new Date(now - days(1) - hours(2)),
      },
    ]

    await queryInterface.bulkInsert('Messages', messages, {
      ignoreDuplicates: true,
    })
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Messages', {}, {})
  },
}
