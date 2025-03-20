import express, { Router } from 'express'
import * as authController from './auth.controller'
import authenticateMiddleware from '../../middlewares/authenticate.middleware'

const router: Router = express.Router()

router.post('/register', authController.register)
router.post('/verify-email', authController.verifyEmail)
router.post('/login', authController.login)
router.post('/logout', authenticateMiddleware, authController.logout)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)

export default router
