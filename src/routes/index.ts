import { Router } from 'express'
import authRoutes from '../modules/auth/auth.routes'
import protectedRoutes from './protected.routes'

const router = Router()

router.use('/api/v1/auth', authRoutes)

router.use('/api/v1', protectedRoutes)

export default router
