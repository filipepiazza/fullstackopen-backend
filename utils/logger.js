const info = (...params) => {
   //if (process.env.NODE_ENV !== 'test') {
        console.log(...params)
    //}
}

const errorLogger = (...params) => {
    if (process.env.NODE_ENV !== 'test') {
        console.error(...params)
    }
}

const loggerExports = {
    info, errorLogger
}

module.exports = loggerExports