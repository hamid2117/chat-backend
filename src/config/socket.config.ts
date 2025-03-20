import { Server } from 'socket.io'
import http from 'http'

const socketConfig = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id)

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })

    socket.on('sendMessage', (message) => {
      io.emit('receiveMessage', message)
    })

    socket.on('joinRoom', (room) => {
      socket.join(room)
      console.log(`User ${socket.id} joined room: ${room}`)
    })

    socket.on('leaveRoom', (room) => {
      socket.leave(room)
      console.log(`User ${socket.id} left room: ${room}`)
    })
  })

  return io
}

export default socketConfig
