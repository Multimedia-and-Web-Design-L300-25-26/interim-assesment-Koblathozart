import mongoose from 'mongoose'

const cryptoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a cryptocurrency name'],
      trim: true
    },
    symbol: {
      type: String,
      required: [true, 'Please provide a symbol'],
      uppercase: true,
      unique: true,
      minlength: [2, 'Symbol must be at least 2 characters'],
      maxlength: [10, 'Symbol must not exceed 10 characters']
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative']
    },
    change: {
      type: Number,
      required: [true, 'Please provide 24h change percentage'],
      // e.g., 2.5 for +2.5%, -1.3 for -1.3%
    },
    image: {
      type: String,
      default: null
    },
    marketCap: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
)

export const Crypto = mongoose.model('Crypto', cryptoSchema)
