'use strict'

import { QueryInterface, QueryOptions } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { MESSAGE_IDS } from './20250320012221-seed-messages'

interface BulkInsertOptions extends QueryOptions {
  ignoreDuplicates?: boolean
}

interface Attachment {
  id: string
  messageId: string
  fileUrl: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedAt: Date
  createdAt: Date
  updatedAt: Date
}

module.exports = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const attachments: Attachment[] = [
      // Image attachment
      {
        id: uuidv4(),
        messageId: MESSAGE_IDS.IMAGE_MESSAGE,
        fileUrl:
          'https://placehold.co/800x600/e74c3c/FFFFFF/png?text=UI+Screenshot',
        fileName: 'ui-screenshot.png',
        fileType: 'image/png',
        fileSize: 245000, // 245 KB
        uploadedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // PDF Document attachment
      {
        id: uuidv4(),
        messageId: MESSAGE_IDS.FILE_MESSAGE,
        fileUrl:
          'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'project-requirements.pdf',
        fileType: 'application/pdf',
        fileSize: 1250000, // 1.25 MB
        uploadedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Code file attachment
      //{
      //  id: uuidv4(),
      //  messageId: MESSAGE_IDS.CODE_MESSAGE,
      //  fileUrl: 'https://example.com/files/auth-service.ts',
      //  fileName: 'auth-service.ts',
      //  fileType: 'text/typescript',
      //  fileSize: 34500, // 34.5 KB
      //  uploadedAt: new Date(),
      //  createdAt: new Date(),
      //  updatedAt: new Date(),
      //},
    ]

    await queryInterface.bulkInsert('Attachments', attachments, {
      ignoreDuplicates: true,
    } as BulkInsertOptions)
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkDelete('Attachments', {}, {})
  },
}
