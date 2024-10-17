const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const morgan = require('morgan')
const githubRoutes = require('./routes/githubRoutes')

dotenv.config()
const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(morgan('dev'))
app.use(express.json())
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

app.use('/api/oauth', githubRoutes)

// Database connection
mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Database Connected'))
  .catch(err => console.error('Database connection error:', err))

app.listen(port, () => {
  console.log(`Node.js API is listening on port: ${port}`)
})
