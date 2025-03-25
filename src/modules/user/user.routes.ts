import express, { Router } from 'express'
import * as userController from './user.controller'
import authenticateMiddleware from '../../middlewares/authenticate.middleware'

const router: Router = express.Router()

router.get('/', authenticateMiddleware, userController.getAllUsers)

router.get('/me', authenticateMiddleware, userController.showCurrentUser)
router
  .route('/conversation')
  .get(authenticateMiddleware, userController.getUsersForConversation)
router.get('/:id', authenticateMiddleware, userController.getSingleUser)

router.patch('/:id', authenticateMiddleware, userController.updateUser)

router.post(
  '/update-password',
  authenticateMiddleware,
  userController.updateUserPassword
)

export default router
