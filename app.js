import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import AuthRoutes from './routes/auth.routes.js' // Correct path
import ContactsRoutes from './routes/contact.routes.js'
import MessagesRoute from './routes/messages.routes.js'
import setupSocket from './socket.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const database_url = process.env.DATABASE_URL

app.use(
	cors({
		// origin: process.env.ORIGN,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
		credentials: true,
	})
)

app.use('/uploads/profiles', express.static('uploads/profiles'))
app.use('/uploads/files', express.static('uploads/files'))

app.use(cookieParser())
app.use(express.json())

app.use('/api/auth', AuthRoutes)
app.use('/api/contacts', ContactsRoutes)
app.use('/api/messages', MessagesRoute)

const server = app.listen(PORT, () => {
	console.log(`Server running on port: http://localhost:${PORT}`)
})

setupSocket(server)

mongoose
	.connect(database_url, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log('Connected to MongoDB'))
	.catch(error => console.log(error))
