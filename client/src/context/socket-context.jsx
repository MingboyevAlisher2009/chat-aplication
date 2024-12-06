import { useAppStore } from '@/store'
import { HOST } from '@/utils/constants'
import { createContext, useContext, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

export const useSocket = () => {
	return useContext(SocketContext)
}

export const SocketProvider = ({ children }) => {
	const socket = useRef()

	const { userInfo, setOnlineUsers, setSelectedChatMessages } = useAppStore()

	useEffect(() => {
		if (userInfo) {
			socket.current = io(HOST, {
				query: { userId: userInfo._id },
			})

			socket.current.on('connect', () => {
				console.log('Connect to server')
			})

			const handleReciveMessage = message => {
				const {
					selectedChatType,
					selectedChatData,
					addMessage,
					addContactsDminContacts,
				} = useAppStore.getState()

				addContactsDminContacts(message)
				if (
					(selectedChatType !== undefined &&
						selectedChatData._id === message.sender._id) ||
					selectedChatData._id === message.recipient._id
				) {
					addMessage(message)
					console.log(message)
				}
			}

			const handleNotification = newNotification => {
				const { directMessages, setNotification } = useAppStore.getState()

				if (directMessages.length) {
					const notifications = directMessages.flatMap(contact => {
						if (contact.messages && contact.lastMessageType === 'text') {
							return contact.messages.filter(item => !item.seen)
						}
						return []
					})

					const sortedNotifications = notifications.map(item => ({
						type: item.messageType,
						sender: item.sender,
						recipient: item.recipient,
						content: item.content,
					}))

					setNotification([...sortedNotifications, newNotification])
				}
			}

			const handleUpdateMessage = message => {
				const { selectedChatMessages, setSelectedChatMessages } =
					useAppStore.getState()

				const index = selectedChatMessages.findIndex(m => m._id === message._id)

				if (index > -1) {
					const updatedMessages = [...selectedChatMessages]
					updatedMessages[index] = message

					setSelectedChatMessages(updatedMessages)
				}
			}

			socket.current.on('getOnlineUsers', users => setOnlineUsers(users))
			socket.current.on('newNotification', handleNotification)
			socket.current.on('reciveMessage', handleReciveMessage)
			socket.current.on('deleted-message', message => {
				setSelectedChatMessages(message)
			})
			socket.current.on('updated-message', message =>
				handleUpdateMessage(message)
			)

			return () => {
				socket.current.disconnect()
			}
		}
	}, [userInfo])

	return (
		<SocketContext.Provider value={socket.current}>
			{children}
		</SocketContext.Provider>
	)
}
