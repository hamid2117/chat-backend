import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { logger } from './utils'
import errorHandler from './middlewares/error.middleware'
import { env } from '../config/config'
import path from 'path'

// Import routes
import authRoutes from './modules/auth/auth.routes'
import userRoutes from './modules/user/user.routes'
import conversationRoutes from './modules/conversation/conversation.routes'
// Swagger UI setup
//import swaggerUi from 'swagger-ui-express';
//import openapiDocument from '../docs/openapi.json';

const app = express()

// Middlewares
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use(cookieParser(env.JWT_SECRET))
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')))

//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

// Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/conversation', conversationRoutes)

// 404 handler
app.use((_req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({ message: 'Not Found' })
})

// Global error handler
app.use(errorHandler)

// Start the server if not imported by tests
if (require.main === module) {
  const PORT = env.PORT || 3000
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`))
}

export default app
