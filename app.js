const configExports = require('./utils/config')
const { MONGODB_URI, PORT} = configExports

const express = require('express')
const app = express()
require('express-async-errors')
const cors = require('cors')
const personsRouter = require('./controllers/persons')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const middlewareExports = require('./utils/middleware')
const {requestLogger,unknownEndpoint,errorHandler,tokenExtractor, userExtractor} = middlewareExports

const loggerExports = require('./utils/logger')
const {info, error} = loggerExports

const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

info('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    info('connected to MongoDB')
  })
  .catch((errorCaught) => {
    error('error connecting to MongoDB:', errorCaught.message)
  })

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

var morgan = require('morgan')
morgan.token('bodytype', function (req, res, next) { return req.bodyType })

app.use((req, res, next) => {
  if (req.method === 'POST') {
    req.bodyType = JSON.stringify(req.body)
  }
  next();
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :bodytype'))


app.use(tokenExtractor)
app.use('/api/persons', personsRouter)
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use(unknownEndpoint)
app.use(errorHandler)

module.exports = app