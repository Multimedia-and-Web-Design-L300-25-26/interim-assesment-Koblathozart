import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) => {
  try {
    // Get token from HTTP-only cookie
    const token = req.cookies.token

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token found. Please login first.'
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // Attach user data to request
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    })
  }
}
