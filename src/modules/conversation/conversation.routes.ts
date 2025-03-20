import express from 'express'
import conversationController from './conversation.controller'
import authenticateMiddleware from '../../middlewares/authenticate.middleware'

const router = express.Router()

// Apply authentication middleware to all conversation routes
router.use(authenticateMiddleware)

router.get('/', conversationController.getConversations)

router.get('/:id', conversationController.getConversationById)

// Create conversations
router.post('/direct', conversationController.createDirectConversation)
router.post('/group', conversationController.createGroupConversation)

// Update group details
router.patch('/:id', conversationController.updateGroupDetails)
router.delete('/:id', conversationController.deleteConversation)

// Participant management
router.post('/:id/participants', conversationController.addParticipant)
router.patch(
  '/:id/participants/:userId/role',
  conversationController.updateParticipantRole
)
router.delete(
  '/:id/participants/:userId',
  conversationController.removeParticipant
)

export default router
