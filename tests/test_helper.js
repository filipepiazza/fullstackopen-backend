const modelPersonExports = require('../models/person')
const { Person, getPersonsCounts } = modelPersonExports

const initialPersons = [
    {
        name: "robert",
        number: "23-45666789",
      },
      {
        name: "kimberly",
        number: "65-6757855876876",
      },
      {
        name: "louie",
        number: "58-5875786876876",
      },
      {
        name: "jimmy",
        number: "570-65745765765",
      }
]

const nonExistingId = async () => {
  const person = new Person({ name: 'willremovethissoon' , number: '879-765765757576'})
  await person.save()
  await person.deleteOne()

  return person._id.toString()
}

const personsInDb = async () => {
  const persons = await Person.find({})
  return persons.map(person => person.toJSON())
}

const helper_exports = {
    initialPersons, nonExistingId, personsInDb
}

module.exports = helper_exports