import { useAppStore } from '@/store'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import ChatContainer from './components/chat-container'
import ContactsContainer from './components/contacts-ontainer'
import EmpatyChatContainer from './components/empaty-chat-container'

const Chat = () => {
	const {
		userInfo,
		selectedChatType,
		isUploading,
		isDownloading,
		fileUploadProgress,
		fileDownloadProgress,
	} = useAppStore()
	const navigate = useNavigate()

	useEffect(() => {
		if (!userInfo.profileSetup) {
			toast('Please setup profile to continue.')
			navigate('/profile')
		}
	}, [userInfo, navigate])

	return (
		<div className='flex w-full h-[100vh] text-white overflow-hidden'>
			{isUploading && (
				<div className='h-screen w-full fixed inset-0 z-50 left-0 bg-black/50 flex items-center justify-center flex-col gap-5 backdrop-blur-lg'>
					<h5 className='text-5xl animate-pulse'>Uploading file</h5>
					{fileUploadProgress.toFixed()} %
				</div>
			)}

			{isDownloading && (
				<div className='h-screen w-full fixed inset-0 z-50 left-0 bg-black/50 flex items-center justify-center flex-col gap-5 backdrop-blur-lg'>
					<h5 className='text-5xl animate-pulse'>Dawnloading file</h5>
					{fileDownloadProgress.toFixed()} %
				</div>
			)}

			<ContactsContainer />
			{selectedChatType === undefined ? (
				<EmpatyChatContainer />
			) : (
				<ChatContainer />
			)}
		</div>
	)
}

export default Chat
