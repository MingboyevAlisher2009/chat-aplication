import { readdirSync, rmdirSync, unlinkSync } from 'fs'
import path from 'path'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import Message from './models/messages.modal.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
console.log(__dirname)

const deleteFileAndEmptyFolder = filePath => {
	try {
		unlinkSync(filePath)

		const folderPath = path.dirname(filePath)

		const deleteDirectoryRecursively = dirPath => {
			try {
				const files = readdirSync(dirPath)
				files.forEach(file => {
					const filePath = path.join(dirPath, file)
					if (statSync(filePath).isDirectory()) {
						deleteDirectoryRecursively(filePath)
					} else {
						unlinkSync(filePath)
					}
				})
				rmdirSync(dirPath)
			} catch (err) {
				console.error('Error deleting directory:', err)
			}
		}

		const files = readdirSync(folderPath)
		if (files.length === 0) {
			deleteDirectoryRecursively(folderPath)
		}
	} catch (error) {
		console.error('Error deleting file or folder:', error)
	}
}

const setupSocket = server => {
	const io = new Server(server, {
		cors: {
			methods: ['GET', 'POST', 'PUT', 'DELETE'],
			credentials: true,
		},
	})

	const userSocketMap = new Map()

	const disconnect = socket => {
		console.log(`Disconnect user ${socket.id}`)
		for (const [userId, socketId] of userSocketMap.entries()) {
			if (socket.id === socketId) {
				userSocketMap.delete(userId)
				break
			}
		}
		io.emit('getOnlineUsers', Array.from(userSocketMap.keys()))
	}

	const sendMessage = async message => {
		try {
			const senderSocketIds = userSocketMap.get(message.sender) || []
			const recipientSocketIds = userSocketMap.get(message.recipient) || []
			console.log(senderSocketIds)

			const createMessage = await Message.create(message)

			const messageData = await Message.findById(createMessage._id)
				.populate('sender', 'id email firstName lastName image color')
				.populate('recipient', 'id email firstName lastName image color')
				.populate('answer')

			if (recipientSocketIds.length) {
				recipientSocketIds.forEach(socketId => {
					io.to(socketId).emit('reciveMessage', messageData)

					io.to(socketId).emit('newNotification', {
						_id: messageData._id,
						type: messageData.messageType,
						content:
							messageData.messageType === 'text'
								? messageData.content
								: messageData.fileUrl,
						sender: messageData.sender._id,
						senderInfo: messageData.sender,
						recipientInfo: messageData.recipient,
						recipient: messageData.recipient._id,
					})
				})
			}

			if (senderSocketIds.length) {
				senderSocketIds.forEach(socketId => {
					io.to(socketId).emit('reciveMessage', messageData)

					io.to(socketId).emit('newNotification', {
						_id: messageData._id,
						type: messageData.messageType,
						content:
							messageData.messageType === 'text'
								? messageData.content
								: messageData.fileUrl,
						sender: messageData.sender._id,
						recipient: messageData.recipient._id,
					})
				})
			}
		} catch (error) {
			console.error('Error sending message:', error)
		}
	}

	const deleteMessage = async message => {
		try {
			const { id } = message

			const data = await Message.findByIdAndDelete(id)
			if (!data) {
				console.error('Message not found for deletion')
				return
			}

			const messages = await Message.find({
				$or: [
					{ sender: data.sender, recipient: data.recipient },
					{ sender: data.recipient, recipient: data.sender },
				],
			}).populate('answer')

			const senderSocketId = userSocketMap.get(data.sender.toString())
			const recipientSocketId = userSocketMap.get(data.recipient?.toString())

			if (senderSocketId) {
				io.to(senderSocketId).emit('deleted-message', messages)
			}

			if (recipientSocketId) {
				io.to(recipientSocketId).emit('deleted-message', messages)
			}

			if (!message) res.status(404).json({ error: 'Message not found' })

			if (data.messageType === 'file') {
				const parts = data.fileUrl.split('/')
				const filePath = path.resolve(__dirname, ...parts)

				deleteFileAndEmptyFolder(filePath)
			}
		} catch (error) {
			console.error('Error deleting message:', error)
		}
	}

	const handleUpdateMessage = async message => {
		const senderSocketId = userSocketMap.get(message.sender)
		const recipientSocketId = userSocketMap.get(message.recipient)

		const updateMessage = await Message.findByIdAndUpdate(
			message._id,
			message,
			{ new: true }
		).populate('answer')

		if (senderSocketId) {
			io.to(senderSocketId).emit('updated-message', updateMessage)
		}
		if (recipientSocketId) {
			io.to(recipientSocketId).emit('updated-message', updateMessage)
		}
	}

	io.on('connection', socket => {
		const userId = socket.handshake.query.userId

		if (userId) {
			if (!userSocketMap.has(userId)) {
				userSocketMap.set(userId, [])
			}
			userSocketMap.get(userId).push(socket.id)
			console.log(`User connected: ${userId} with socket ID ${socket.id}`)
		}
		console.log(Array.from(userSocketMap.keys()))

		io.emit('getOnlineUsers', Array.from(userSocketMap.keys()))

		socket.on('sendMessage', sendMessage)
		socket.on('delete-message', deleteMessage)
		socket.on('update-message', handleUpdateMessage)
		socket.on('disconnect', () => disconnect(socket))
	})
}

export default setupSocket
