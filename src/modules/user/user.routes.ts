import express, { Router } from 'express'
import * as userController from './user.controller'
import authenticateMiddleware from '../../middlewares/authenticate.middlware'
import authorizeMiddleware from '../../middlewares/authorize.middlware'

const router: Router = express.Router()

router.get(
  '/',
  authenticateMiddleware,
  authorizeMiddleware('manage_users'),
  userController.getAllUsers
)

router.get('/me', authenticateMiddleware, userController.showCurrentUser)
router.get('/:id', authenticateMiddleware, userController.getSingleUser)

router.patch('/:id', authenticateMiddleware, userController.updateUser)

router.post(
  '/update-password',
  authenticateMiddleware,
  userController.updateUserPassword
)

export default router
