const app = require('./app') // the actual Express application

const configExports = require('./utils/config')
const { MONGODB_URI, PORT} = configExports

const loggerExports = require('./utils/logger')
const {info, error} = loggerExports

app.listen(PORT, () => {
  info(`Server running on port ${PORT}`)
})
