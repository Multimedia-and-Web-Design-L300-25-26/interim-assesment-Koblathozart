import { Crypto } from '../models/Crypto.js'

export const getAllCryptos = async (req, res) => {
  try {
    const cryptos = await Crypto.find().sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: {
        cryptos
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching cryptocurrencies'
    })
  }
}

export const getGainers = async (req, res) => {
  try {
    // Get top 10 gainers sorted by 24h change (highest first)
    const gainers = await Crypto.find().sort({ change: -1 }).limit(10)

    res.status(200).json({
      success: true,
      data: {
        cryptos: gainers
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching gainers'
    })
  }
}

export const getNewListings = async (req, res) => {
  try {
    // Get newest listings sorted by creation date (newest first)
    const newListings = await Crypto.find().sort({ createdAt: -1 }).limit(10)

    res.status(200).json({
      success: true,
      data: {
        cryptos: newListings
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching new listings'
    })
  }
}

export const addCrypto = async (req, res) => {
  try {
    const { name, symbol, price, change, image, marketCap } = req.body

    // Validate required fields
    if (!name || !symbol || price === undefined || change === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, symbol, price, and change'
      })
    }

    // Check if crypto already exists
    const existingCrypto = await Crypto.findOne({ symbol: symbol.toUpperCase() })
    if (existingCrypto) {
      return res.status(409).json({
        success: false,
        message: 'Cryptocurrency with this symbol already exists'
      })
    }

    // Create new crypto
    const crypto = new Crypto({
      name,
      symbol: symbol.toUpperCase(),
      price,
      change,
      image: image || null,
      marketCap: marketCap || null
    })

    await crypto.save()

    res.status(201).json({
      success: true,
      message: 'Cryptocurrency added successfully!',
      data: {
        crypto
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding cryptocurrency'
    })
  }
}
