import express from 'express'
import {
  register,
  login,
  logout,
  getProfile,
  sendVerificationCode,
  verifyEmailCode,
  completeSignup
} from '../controllers/authController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// Traditional endpoints (keeping for backward compatibility)
router.get('/register', register)
router.get('/login', login)
router.post('/logout', logout)
router.get('/profile', authMiddleware, getProfile)

// Multi-step signup flow
router.post('/send-verification-code', sendVerificationCode)
router.post('/verify-email-code', verifyEmailCode)
router.post('/complete-signup', completeSignup)

export default router
