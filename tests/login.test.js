const bcrypt = require('bcrypt')
const User = require('../models/user')
const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const jwt = require('jsonwebtoken')

const user_helper_exports = require('../utils/user_helper')
const { usersInDb } = user_helper_exports

const loggerExports = require('../utils/logger')
const { info, errorLogger } = loggerExports

const configExports = require('../utils/config')
const { MONGODB_URI, PORT, SECRET } = configExports

beforeEach(async () => {

    // Create an admin user and generate a token
    const adminUser = new User({
        username: 'admin',
        passwordHash: await bcrypt.hash('adminpassword', 10),
    })
    await adminUser.save()

    token = jwt.sign(
        { username: adminUser.username, id: adminUser._id },
        SECRET,
        { expiresIn: '1h' }
    )

    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
})