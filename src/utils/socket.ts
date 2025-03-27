import { Server } from 'socket.io'
import conversationService from '../modules/conversation/conversation.service'
import { env } from '../../config/config'
let io: Server

export const initializeSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id)

    socket.on('join_user', async (data) => {
      const { userId } = data
      if (!userId) {
        console.log('User not authenticated for join_user event')
        return
      }
      socket.join(`user:${userId}`)
    })
    socket.on('conversation_open', async (data) => {
      const { conversationId } = data
      socket.join(`conversation:${conversationId}`)
      if (!data.userId) {
        console.log('User not authenticated for conversation_open event')
        return
      }
      console.log('User opened conversation:', data)

      try {
        await conversationService.markConversationSeen(
          conversationId,
          data.userId
        )

        socket.emit('unread_count_update', {
          conversationId,
          unreadCount: 0,
        })
      } catch (error) {
        console.error('Error marking conversation as seen:', error)
      }
    })

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`)
      console.log(`User left conversation: ${conversationId}`)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })
}

export const getSocket = () => {
  if (!io) {
    throw new Error('Socket not initialized. Call initializeSocket first.')
  }
  return io
}
