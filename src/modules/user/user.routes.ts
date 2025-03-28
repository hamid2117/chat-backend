import express, { Router } from 'express'
import * as userController from './user.controller'

const router: Router = express.Router()

router.get('/', userController.getAllUsers)

router.get('/me', userController.showCurrentUser)
router.get('conversation', userController.getUsersForConversation)
router.get('/:id', userController.getSingleUser)

router.patch('/:id', userController.updateUser)

router.post('/update-password', userController.updateUserPassword)

export default router
