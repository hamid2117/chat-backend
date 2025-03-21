import express from 'express'
import * as messageController from './message.controller'
import authenticateMiddleware from '../../middlewares/authenticate.middleware'

const router = express.Router()

// Apply authentication middleware to all conversation routes
router.use(authenticateMiddleware)

router.post('/', messageController.createMessage)

router.get(
  '/conversation/:conversationId',
  messageController.getConversationMessages
)

router.get('/:messageId', messageController.getMessage)

router.patch('/:messageId', messageController.updateMessageContent)

router.delete('/:messageId', messageController.deleteMessageHandler)

router.get('/:messageId/attachments', messageController.getMessageAttachments)

// emit socket event
router.post('/typing/:conversationId', messageController.notifyTypingStatus)
router.post('/read/:conversationId', messageController.markAsRead)

export default router
