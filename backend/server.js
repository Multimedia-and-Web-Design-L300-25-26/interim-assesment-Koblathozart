import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { connectDB } from './config/database.js'
import authRoutes from './routes/auth.js'
import cryptoRoutes from './routes/crypto.js'

dotenv.config()

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())


// CORS configuration
app.use(cors({
  origin: "https://koblathozart-crypto-app-public.netlify.app",
  credentials: true
}))
// Connect to MongoDB
await connectDB()

// Routes
app.use('/auth', authRoutes)
app.use('/crypto', cryptoRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Backend is running!' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`)
})
