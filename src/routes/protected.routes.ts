import { Router } from 'express'
import { authenticateUser } from '../middlewares/authenticate.middleware'
import userRoutes from '../modules/user/user.routes'
import conversationRoutes from '../modules/conversation/conversation.routes'
import messageRoutes from '../modules/message/message.routes'

const router = Router()

router.use(authenticateUser)

router.use('/user', userRoutes)
router.use('/conversation', conversationRoutes)
router.use('/message', messageRoutes)

export default router
