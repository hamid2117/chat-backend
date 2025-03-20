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

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })

    socket.on('sendMessage', (message) => {
      io.emit('receiveMessage', message)
    })
  })
}

export const getSocket = () => {
  if (!io) {
    throw new Error('Socket not initialized. Call initializeSocket first.')
  }
  return io
}
