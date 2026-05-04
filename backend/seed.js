import { Crypto } from './models/Crypto.js'
import { connectDB } from './config/database.js'
import dotenv from 'dotenv'

dotenv.config()

const seedCryptos = [
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 68420.54,
    change: 2.34,
    marketCap: '1.35T'
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    price: 3724.11,
    change: 1.09,
    marketCap: '447B'
  },
  {
    name: 'Solana',
    symbol: 'SOL',
    price: 153.4,
    change: 4.71,
    marketCap: '68B'
  },
  {
    name: 'XRP',
    symbol: 'XRP',
    price: 0.63,
    change: 1.42,
    marketCap: '35B'
  },
  {
    name: 'USDC',
    symbol: 'USDC',
    price: 1.0,
    change: 0.0,
    marketCap: '34B'
  },
  {
    name: 'BNB',
    symbol: 'BNB',
    price: 612.32,
    change: -0.73,
    marketCap: '90B'
  }
]

async function seedDatabase() {
  try {
    await connectDB()
    console.log('📊 Seeding database with cryptocurrencies...')

    // Clear existing cryptos
    await Crypto.deleteMany({})
    console.log('🗑️  Cleared existing cryptos')

    // Insert new cryptos
    const inserted = await Crypto.insertMany(seedCryptos)
    console.log(`✅ Successfully seeded ${inserted.length} cryptocurrencies`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error.message)
    process.exit(1)
  }
}

seedDatabase()
