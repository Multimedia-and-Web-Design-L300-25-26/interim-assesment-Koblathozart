import mongoose from 'mongoose'

const verificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    code: {
      type: String,
      required: true
    },
    accountType: {
      type: String,
      enum: ['personal', 'business', 'developer'],
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // Auto-delete after expiration
    }
  },
  { timestamps: true }
)

export const Verification = mongoose.model('Verification', verificationSchema)
