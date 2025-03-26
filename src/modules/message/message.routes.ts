import express from 'express'
import * as messageController from './message.controller'
import authenticateMiddleware from '../../middlewares/authenticate.middleware'
import { uploadMiddleware } from '../..//middlewares/upload.middlware'

const router = express.Router()

router.use(authenticateMiddleware)

router.post('/', messageController.createMessage)

router.post(
  '/image',
  uploadMiddleware({
    directory: 'messages/images',
    fieldName: 'image',
    fileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 10 * 1024 * 1024,
  }),
  messageController.createMessage
)

router.post(
  '/file',
  uploadMiddleware({
    directory: 'messages/files',
    fieldName: 'file',
    maxSize: 50 * 1024 * 1024,
  }),
  messageController.createMessage
)

router.get(
  '/conversation/:conversationId',
  messageController.getConversationMessages
)

router.patch('/:messageId', messageController.updateMessageContent)

router.delete('/:messageId', messageController.deleteMessageHandler)

// emit socket event
router.post('/typing/:conversationId', messageController.notifyTypingStatus)
router.post('/read/:conversationId', messageController.markAsRead)

// for some cases
router.get('/:messageId', messageController.getMessage)
router.get('/:messageId/attachments', messageController.getMessageAttachments)

export default router
