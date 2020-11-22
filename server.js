const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')


const app = express()
app.use(cors())
connectDB()

//Init Middleware - needed to use the middleware in the user.js file for authentication
app.use(express.json({ extended: false }))

app.get('/', (req, res) => res.send('API  Running'))

app.use('/api/users', require('./routes/api/users'))
app.use('/api/posts', require('./routes/api/posts'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/auth', require('./routes/api/auth'))

// eslint-disable-next-line 
const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))