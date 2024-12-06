import { useSocket } from '@/context/socket-context'
import apiClient from '@/lib/api.client'
import { useAppStore } from '@/store'
import { HOST, UPLOAD_FILE_ROUTE } from '@/utils/constants'
import EmojiPicker from 'emoji-picker-react'
import { useEffect, useRef, useState } from 'react'
import { GrAttachment } from 'react-icons/gr'
import { IoSend } from 'react-icons/io5'
import { RiCloseFill, RiEmojiStickerLine } from 'react-icons/ri'
import { TiArrowBack } from 'react-icons/ti'

const MessageBar = () => {
	const emojiRef = useRef()
	const fileInputRef = useRef()
	const socket = useSocket()
	const {
		selectedChatType,
		selectedChatData,
		userInfo,
		setIsUploading,
		setFileUploadProgress,
		answer,
		setAnswer,
		editMessage,
		setEditMessage,
	} = useAppStore()
	const [message, setMessage] = useState('')
	const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)

	useEffect(() => {
		function handleClickOutside(event) {
			if (emojiRef.current && !emojiRef.current.contains(event.target)) {
				setEmojiPickerOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [emojiRef])

	useEffect(() => {
		setMessage(editMessage ? editMessage.content : '')
	}, [editMessage])

	const handleAddEmoji = emoji => {
		setMessage(msg => msg + emoji.emoji)
		setEmojiPickerOpen(false) // Close the emoji picker after selecting an emoji
	}

	const handleSendMessage = () => {
		if (!message.trim()) return // Prevent empty messages

		const payload = {
			answer: answer?._id,
			sender: userInfo._id,
			content: message,
			messageType: 'text',
			fileUrl: undefined,
		}

		if (selectedChatType === 'contact') {
			payload.recipient = selectedChatData._id
			socket.emit('sendMessage', payload)
		}

		setMessage('')
		setAnswer(null)
	}

	const handleAttachmentClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click()
		}
	}

	const handleEditMessage = () => {
		if (editMessage) {
			socket.emit('update-message', {
				...editMessage,
				content: message.trim() ? message : editMessage.content,
			})
			setEditMessage(null)
			setMessage('')
		}
	}

	const handleAttachmentChange = async e => {
		try {
			const file = e.target.files[0]
			if (!file) return

			const formData = new FormData()
			formData.append('file', file)

			setIsUploading(true)

			const { data, status } = await apiClient.post(
				UPLOAD_FILE_ROUTE,
				formData,
				{
					onUploadProgress: data =>
						setFileUploadProgress(Math.round((100 * data.loaded) / data.total)),
				}
			)

			if (status === 200) {
				setIsUploading(false)
				const payload = {
					answer: answer?._id,
					sender: userInfo._id,
					messageType: 'file',
					fileUrl: data.filePath,
				}

				if (selectedChatType === 'contact') {
					payload.recipient = selectedChatData._id
					socket.emit('sendMessage', payload)
				}
			}
		} catch (error) {
			console.error(error)
		} finally {
			setIsUploading(false)
			setFileUploadProgress(0)
			setAnswer(null)
		}
	}

	return (
		<div className='bg-[#1c1d25]'>
			{(answer || editMessage) && (
				<div className='flex justify-between px-8 py-5'>
					<div className='flex gap-3 items-center text-lg'>
						<TiArrowBack size={20} />
						{answer ? (
							answer.messageType === 'text' ? (
								<h2>{answer.content}</h2>
							) : (
								<img
									className='w-10 h-10 bg-center bg-cover'
									src={`${HOST}/${answer.fileUrl}`}
									alt='Attachment'
								/>
							)
						) : editMessage.messageType === 'text' ? (
							<h2>{editMessage.content}</h2>
						) : (
							<img
								className='w-10 h-10 bg-center bg-cover'
								src={`${HOST}/${editMessage.fileUrl}`}
								alt='Attachment'
							/>
						)}
					</div>
					<button
						onClick={() => (answer ? setAnswer(null) : setEditMessage(null))}
					>
						<RiCloseFill className='text-2xl text-gray-500 hover:text-white transition-all duration-300' />
					</button>
				</div>
			)}
			<div className='h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-6 gap-6'>
				<div className='flex-1 flex rounded-md items-center gap-5 bg-[#2a2b33] pr-5'>
					<input
						type='text'
						className='w-full p-5 bg-transparent rounded-md focus:border-none focus:outline-none'
						placeholder='Enter Message'
						value={message}
						onChange={e => setMessage(e.target.value)}
					/>
					<button
						onClick={handleAttachmentClick}
						className='text-neutral-500 transition-all duration-300 rounded-full'
					>
						<GrAttachment className='text-2xl' />
					</button>
					<input
						type='file'
						className='hidden'
						ref={fileInputRef}
						onChange={handleAttachmentChange}
					/>
					<div className='relative'>
						<button
							onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
							className='text-neutral-500 transition-all duration-300 rounded-full'
						>
							<RiEmojiStickerLine className='text-2xl' />
						</button>
						{emojiPickerOpen && (
							<div
								className='absolute bottom-16 sm:right-0 -right-28'
								ref={emojiRef}
							>
								<EmojiPicker
									theme='dark'
									onEmojiClick={handleAddEmoji}
									autoFocusSearch={false}
								/>
							</div>
						)}
					</div>
				</div>
				<button
					onClick={editMessage ? handleEditMessage : handleSendMessage}
					className='bg-[#8417ff] flex items-center justify-center p-5 rounded-md text-neutral-500 hover:bg-[#741bda] transition-all duration-300'
				>
					<IoSend className='text-2xl' />
				</button>
			</div>
		</div>
	)
}

export default MessageBar
