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

router.patch('/:messageId', messageController.updateMessageContent)

router.delete('/:messageId', messageController.deleteMessageHandler)

// emit socket event
router.post('/typing/:conversationId', messageController.notifyTypingStatus)
router.post('/read/:conversationId', messageController.markAsRead)

// for some cases
router.get('/:messageId', messageController.getMessage)
router.get('/:messageId/attachments', messageController.getMessageAttachments)

export default router
