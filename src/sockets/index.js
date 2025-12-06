import { Server } from 'socket.io'
import { Message } from '../models'
import { getAllUsersWithMetadata, getMessageHistory, saveMessageToDB } from '~/services/socket.service'



let users = [];          // Danh sách người dùng (theo name)
let adminSockets = [];   // Danh sách socket của admin

export const initSocketServer = (io) => {
    io.on('connection', (socket) => {
        console.log('✅ New socket connected:', socket.id)

        // 🔹 Admin kết nối
        socket.on('adminConnect', () => {
            socket.role = 'admin'
            adminSockets.push(socket)
            socket.join('admin')
            console.log('📥 Admin connected')
            io.emit('userList', users)
        })

        // 🔹 Người dùng đăng ký
        socket.on('register', (user) => {
            const { name, service, message } = user
            const newUser = {
                id: socket.id,
                name,
                service,
                message
            }

            users = users.filter(u => u.name !== name) // tránh trùng tên
            users.push(newUser)

            socket.join(name) // Mỗi người join room riêng theo `name`

            io.emit('userList', users)
        })

        // 🔹 Lấy danh sách người dùng
        socket.on('getUserList', async () => {
            const users = await getAllUsersWithMetadata()
            io.emit('userList', users)
        })

        // 🔹 Tham gia phòng chat
        socket.on('joinConversation', (name) => {
            socket.join(name)
        })

        // 🔹 Gửi tin nhắn
        socket.on('sendMessage', async (msg) => {
            const { from, to, content, timestamp } = msg

            // Gửi cho người nhận
            io.to(to).emit('newMessage', msg)

            // Gửi lại cho admin
            adminSockets.forEach(adminSocket => {
                adminSocket.emit('newMessage', msg)
            })

            // Lưu DB
            await saveMessageToDB(from, to, content, timestamp)
        })

        // 🔹 Admin lấy lịch sử chat theo tên người dùng
        socket.on('getMessages', async (name) => {
            const messages = await getMessageHistory(name)
            socket.emit('messageHistory', messages)
        })

        // 🔹 Ngắt kết nối
        socket.on('disconnect', () => {
            console.log('❌ Socket disconnected:', socket.id)
            users = users.filter(u => u.id !== socket.id)
            adminSockets = adminSockets.filter(adminSocket => adminSocket.id !== socket.id)

            io.emit('userList', users)
        })
    })
}