import { User } from '../models/User.js'
import { Verification } from '../models/Verification.js'
import jwt from 'jsonwebtoken'
import { generateVerificationCode, sendVerificationEmail } from '../services/emailService.js'

// Generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export const register = async (req, res) => {
  try {
    // Get data from query parameters (since assignment requires GET)
    const { name, email, password } = req.query

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered. Please login instead.'
      })
    }

    // Create new user
    const user = new User({ name, email, password })
    await user.save()

    // Generate token
    const token = generateToken(user._id, user.email)

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    // Return success response (without password)
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error during registration'
    })
  }
}

export const login = async (req, res) => {
  try {
    // Get data from query parameters (since assignment requires GET)
    const { email, password } = req.query

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      })
    }

    // Find user and select password (it's hidden by default)
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Generate token
    const token = generateToken(user._id, user.email)

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error during login'
    })
  }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie('token')
    res.status(200).json({
      success: true,
      message: 'Logged out successfully!'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error during logout'
    })
  }
}

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching profile'
    })
  }
}

// ============ MULTI-STEP SIGNUP FLOW ============

export const sendVerificationCode = async (req, res) => {
  try {
    const { email, accountType } = req.body

    // Validate input
    if (!email || !accountType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and account type'
      })
    }

    // Validate account type
    const validTypes = ['personal', 'business', 'developer']
    if (!validTypes.includes(accountType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account type'
      })
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered. Please login instead.'
      })
    }

    // Clear any existing verification codes for this email
    await Verification.deleteMany({ email })

    // Generate 6-digit code
    const code = generateVerificationCode()

    // Store verification code (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    const verification = new Verification({
      email,
      code,
      accountType: accountType.toLowerCase(),
      expiresAt
    })
    await verification.save()

    // Send email with code
    const emailSent = await sendVerificationEmail(email, code)

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email!'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending verification code'
    })
  }
}

export const verifyEmailCode = async (req, res) => {
  try {
    const { email, code } = req.body

    // Validate input
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and verification code'
      })
    }

    // Find verification record
    const verification = await Verification.findOne({ email, code })

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      })
    }

    // Check if code expired
    if (new Date() > verification.expiresAt) {
      await verification.deleteOne()
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      })
    }

    // Code is valid - return success with account type
    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      data: {
        email,
        accountType: verification.accountType
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error verifying code'
    })
  }
}

export const completeSignup = async (req, res) => {
  try {
    const { email, code, name, password, accountType } = req.body

    // Validate input
    if (!email || !code || !name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, code, name, and password'
      })
    }

    // Verify the code first
    const verification = await Verification.findOne({ email, code })

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      })
    }

    // Check if code expired
    if (new Date() > verification.expiresAt) {
      await verification.deleteOne()
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired'
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    })
    await user.save()

    // Delete verification record
    await verification.deleteOne()

    // Generate token
    const token = generateToken(user._id, user.email)

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          accountType: verification.accountType
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error completing signup'
    })
  }
}

