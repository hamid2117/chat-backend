import { Server } from 'socket.io'

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

    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`)
      console.log(`User joined conversation: ${conversationId}`)
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
