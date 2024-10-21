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

//...

let token

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

describe('when there is initially one user in db', () => {

    test('users are returned as json', async () => {
        const response = await api
            .get('/api/users')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        info('response: ', response.body)
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await user_helper_exports.usersInDb()
        info('usersatstart: ', usersAtStart)
        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .set('Authorization', `Bearer ${token}`)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await user_helper_exports.usersInDb()
        info('usersAtEnd: ', usersAtEnd)
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        assert(usernames.includes(newUser.username))
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await user_helper_exports.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await user_helper_exports.usersInDb()
        info("error: ", result.body.error)
        assert(result.body.error.includes('Username must be unique'))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })


    test('creation fails with proper statuscode and message if username is too short', async () => {
        const usersAtStart = await user_helper_exports.usersInDb()
        const newUser = {
            username: 'te',
            name: 'Test User',
            password: 'password123',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        info("error: ", result.body.error)
        assert(result.body.error.includes('at least 3 characters long'))
        const usersAtEnd = await user_helper_exports.usersInDb()

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
})

after(async () => {
    await mongoose.connection.close()
})