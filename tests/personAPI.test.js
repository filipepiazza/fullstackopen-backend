const { test, after, beforeEach, describe } = require('node:test')
const assert = require('assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const modelPersonExports = require('../models/person')
const { Person, getPersonsCounts } = modelPersonExports
const loggerExports = require('../utils/logger')
const { info, errorLogger } = loggerExports
const helper_exports = require('./test_helper')
const { initialPersons, nonExistingId, personsInDb } = helper_exports

// ...

beforeEach(async () => {
  await Person.deleteMany({})

  //executes promises in paralell and waits for all to finish before moving to tests
  const personObjects = helper_exports.initialPersons
    .map(person => new Person(person))
  const promiseArray = personObjects.map(person => person.save())
  await Promise.all(promiseArray)

  //if oprations need to be executed in order
  // beforeEach(async () => {
  //   await Note.deleteMany({})
  
  //   for (let note of helper.initialNotes) {
  //     let noteObject = new Note(note)
  //     await noteObject.save()
  //   }
  // })
})
// ...

const api = supertest(app)

describe('PersonAPI tests:', () => {
  test('persons are returned as json', async () => {
    await api
      .get('/api/persons')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are 4 persons', async () => {
    const response = await api.get('/api/persons')

    assert.strictEqual(response.body.length, helper_exports.initialPersons.length)
  })

  test('the first person is named robert', async () => {
    const response = await api.get('/api/persons')
    const persons = response.body
    // info(response)
    assert(Array.isArray(persons), 'Response data should be an array')
    const contents = response.body.map(e => e.name)
    assert.strictEqual(contents.includes('robert'), true)
  })

  test('a valid person can be added ', async () => {
    const newPerson = {
      name: "jefferson",
      number: "980-65765987765",
    }

    await api
      .post('/api/persons')
      .send(newPerson)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const personsAtEnd = await helper_exports.personsInDb()
    //info(personsAtEnd)
    assert.strictEqual(personsAtEnd.length, helper_exports.initialPersons.length + 1)

    const contents = personsAtEnd.map(n => n.name)

    assert(contents.includes('jefferson'))
  })

  //redundant, schema validation already fails befoore api call
  // test('person without name is not added', async () => {
  //   const newPerson = {
  //     number:  "980-65765987765",
  //   }

  //   await api
  //     .post('/api/persons')
  //     .send(newPerson)
  //     .expect(400)

  //   const response = await api.get('/api/persons')

  //   assert.strictEqual(response.body.length, helper_exports.initialPersons.length)
  // })

  test('a specific person can be viewed', async () => {
    const personsAtStart = await helper_exports.personsInDb()

    const personToView = personsAtStart[0]


    const resultPerson = await api
      .get(`/api/persons/${personToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(resultPerson.body, personToView)
  })

  test('a person can be deleted', async () => {
    const personsAtStart = await helper_exports.personsInDb()
    const personToDelete = personsAtStart[0]

    await api
      .delete(`/api/persons/${personToDelete.id}`)
      .expect(204)

    const personsAtEnd = await helper_exports.personsInDb()

    const contents = personsAtEnd.map(r => r.name)
    assert(!contents.includes(personToDelete.name))

    assert.strictEqual(personsAtEnd.length, helper_exports.initialPersons.length - 1)
  })
})

after(async () => {
  await mongoose.connection.close()
})